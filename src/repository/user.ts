import { differenceInSeconds } from "date-fns";
import {
  Firestore,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  CapturedPointAlreadyCapturedError,
  CapturedPointInCooldownError,
  MaximumLevelAchievedError,
  UpgradePointAlreadyAppliedError,
} from "../error";
import { CapturedPoint, UpgradedPoint, pointConverter } from "./point";
import { FirestoreRepository } from "./repository";
import { getBossInfo } from "../utils/boss";

// 5 minutes
export const CAPTURED_POINT_COOLDOWN_SECONDS = 60;
export const USER_MAXIMUM_LEVEL = 5;

export interface User {
  id: string;
  email: string;
  level: number;
  name: string;
  capturedPoints: CapturedPoint[];
  upgradedPoints: UpgradedPoint[];
}

export interface UserForRanking extends User {
  activePoints: CapturedPoint[];
}

const parseCapturedPoint = {
  fromFirestore: (point: CapturedPoint): CapturedPoint => ({
    ...point,
    createdAt: new Date(point.createdAt),
    expiredAt: point.expiredAt ? new Date(point.expiredAt) : null,
  }),
  toFirestore: (
    point: Omit<CapturedPoint, "id">
  ): Record<
    keyof Omit<CapturedPoint, "id">,
    string | number | boolean | null
  > => ({
    pointId: point.pointId,
    pointName: point.pointName,
    userId: point.userId,
    userName: point.userName,
    level: point.level,
    createdAt: point.createdAt.toISOString(),
    expiredAt: point.expiredAt ? point.expiredAt.toISOString() : null,
  }),
};

export const userConverter = {
  toFirestore: (user: User) => {
    return {
      email: user.email,
      level: user.level,
      name: user.name,
      capturedPoints: user.capturedPoints.map(parseCapturedPoint.toFirestore),
      upgradedPoints: user.upgradedPoints,
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<User, Omit<User, "id">>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    return {
      ...data,
      capturedPoints: data.capturedPoints.map(parseCapturedPoint.fromFirestore),
      level: data.upgradedPoints.length + 1,
      id: snapshot.id,
    };
  },
};

class UserRepository extends FirestoreRepository {
  private userRef = collection(this.db, "users").withConverter(userConverter);
  private pointsRef = collection(this.db, "points").withConverter(
    pointConverter
  );

  constructor(db: Firestore) {
    super(db);
  }

  public async getUser(email: string): Promise<User> {
    const _query = query(this.userRef, where("email", "==", email), limit(1));
    const querySnapshot = await getDocs(_query);

    const users = await querySnapshot.docs.map((it) => it.data());

    return users[0];
  }

  public async upgradeUser(user: User, upgradePointId: string): Promise<void> {
    const userRef = doc(this.userRef, user.email);

    if (user.level >= USER_MAXIMUM_LEVEL) {
      throw new MaximumLevelAchievedError(user.level);
    }

    if (user.upgradedPoints.find((it) => it === upgradePointId)) {
      throw new UpgradePointAlreadyAppliedError(upgradePointId);
    }

    await updateDoc(userRef, {
      upgradedPoints: [...user.upgradedPoints, upgradePointId],
    });
  }

  public async capturePoint(
    user: User,
    pointId: string
  ): Promise<CapturedPoint> {
    const capturedPoint = await runTransaction(this.db, async (transaction) => {
      const now = new Date();

      const usersQuerySnapshot = await getDocs(this.userRef);
      // get point by id
      const targetPointInfo = (
        await getDoc(
          doc(this.db, "points", pointId).withConverter(pointConverter)
        )
      ).data();

      if (!targetPointInfo) {
        throw new Error(`Point not found, id: ${pointId}`);
      }

      // Clear last captured point
      const users = await usersQuerySnapshot.docs.map((it) => it.data());

      const allCapturedPoints = users.flatMap((it) => it.capturedPoints);
      const lastCapturedPoint = allCapturedPoints
        .filter((it) => it.pointId === pointId)
        .find((it) => it.expiredAt === null);

      // Check same user and same level
      if (
        !!lastCapturedPoint &&
        lastCapturedPoint.userId === user.id &&
        lastCapturedPoint.level === user.level
      ) {
        throw new CapturedPointAlreadyCapturedError(lastCapturedPoint.pointId);
      }

      // Check last captured point is captured over 300 seconds
      const secondsSinceCaptured = differenceInSeconds(
        now,
        lastCapturedPoint?.createdAt ? lastCapturedPoint?.createdAt : 0
      );

      const isLastCaptureExpired =
        secondsSinceCaptured > CAPTURED_POINT_COOLDOWN_SECONDS;

      if (!isLastCaptureExpired) {
        throw new CapturedPointInCooldownError(secondsSinceCaptured);
      }

      if (!!lastCapturedPoint && lastCapturedPoint.userId !== user.id) {
        // Clear other user last captured point
        const lastCapturedPointUserSnapshot = usersQuerySnapshot.docs.find(
          (it) => it.id === lastCapturedPoint.userId
        );

        if (!!lastCapturedPointUserSnapshot) {
          const updatedCapturedPoint = lastCapturedPointUserSnapshot
            .data()
            .capturedPoints.map((it) =>
              it.pointId === lastCapturedPoint.pointId
                ? { ...it, expiredAt: now }
                : it
            )
            .map(parseCapturedPoint.toFirestore);

          transaction.update(lastCapturedPointUserSnapshot.ref, {
            capturedPoints: updatedCapturedPoint,
          });
        }
      }

      // Insert New Captured Point (and clear self last captured point)
      const currentUserSnapshot = usersQuerySnapshot.docs.find(
        (it) => it.id === user.id
      );

      if (!currentUserSnapshot) throw new Error("User not found");

      const newCapturedPoint = {
        pointId: pointId,
        pointName: targetPointInfo.point,
        userId: user.id,
        userName: user.name,
        level: user.level,
        createdAt: now,
        expiredAt: null,
      };

      transaction.update(currentUserSnapshot.ref, {
        capturedPoints: [
          ...currentUserSnapshot
            .data()
            .capturedPoints.map((it) => {
              return it.pointId === lastCapturedPoint?.pointId
                ? { ...it, expiredAt: now }
                : it;
            })
            .map(parseCapturedPoint.toFirestore),
          parseCapturedPoint.toFirestore(newCapturedPoint),
        ],
      });

      return newCapturedPoint;
    });

    return capturedPoint;
  }

  // ascending order of rank, descending order of attackedPower
  public async getRanking(): Promise<UserForRanking[]> {
    const now = new Date();

    const usersQuerySnapshot = await getDocs(this.userRef);
    const users = usersQuerySnapshot.docs.map((it) => it.data());

    const ranking = users
      .map((it) => ({
        ...it,
        bossInfo: getBossInfo(it.capturedPoints),
      }))
      .sort((a, b) => b.bossInfo.attackedPower - a.bossInfo.attackedPower)
      .map((it) => ({
        ...it,
        activePoints: it.capturedPoints.filter((it) => it.expiredAt == null),
      }));

    return ranking;
  }
}

export default UserRepository;
