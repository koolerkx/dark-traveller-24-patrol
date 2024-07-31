import { differenceInSeconds, isAfter } from "date-fns";
import {
  Firestore,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  getDocs,
  query,
} from "firebase/firestore";
import { FirestoreRepository } from "./repository";
import { CAPTURED_POINT_COOLDOWN_SECONDS, User, userConverter } from "./user";

export interface Point {
  id: string;
  point: string;
  description: string;
  heroImage: string | null;
  location: {
    lat: number;
    long: number;
  };
  isPublic: boolean;
}

export enum PointStatus {
  NEW = "new",
  CAPTURED = "captured",
  EXPIRED = "expired",
  CLEARED = "cleared",
}

export interface PointWithStatus extends Point {
  status: PointStatus;
  capturedInfo: {
    capturedAt: Date | null;
    capturedByUser: User | null;
    expiredAt: Date | null;
  } | null;
}

export interface CapturedPoint {
  pointId: string;
  pointName: string;
  userId: string;
  userName: string;
  level: number;
  createdAt: Date;
  expiredAt: Date | null;
}

const parsePointStatus = (point: CapturedPoint | null): PointStatus => {
  if (!point) return PointStatus.NEW;

  if (!!point.expiredAt) return PointStatus.CLEARED;

  const secondsSinceCaptured = differenceInSeconds(new Date(), point.createdAt);

  const isInCooldown = secondsSinceCaptured < CAPTURED_POINT_COOLDOWN_SECONDS;

  if (isInCooldown) return PointStatus.CAPTURED;

  return PointStatus.EXPIRED;
};

export type UpgradedPoint = string;

export const pointConverter = {
  toFirestore: (point: Point) => {
    return {
      point: point.point,
      description: point.description,
      heroImage: point.heroImage,
      location: point.location,
      isPublic: point.isPublic,
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<Point, Omit<Point, "id">>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    return { ...data, id: snapshot.id };
  },
};

class PointRepository extends FirestoreRepository {
  private userRef = collection(this.db, "users").withConverter(userConverter);
  private pointsRef = collection(this.db, "points").withConverter(
    pointConverter
  );

  constructor(db: Firestore) {
    super(db);
  }

  public async getPoints(): Promise<Point[]> {
    const _query = await query(this.pointsRef);
    const querySnapshot = await getDocs(_query);

    const points = querySnapshot.docs.map((it) => it.data());
    return points;
  }

  public async getPointsWithCapturedInfo(): Promise<PointWithStatus[]> {
    const _userQuery = await query(this.userRef);
    const usersQuerySnapshot = await getDocs(_userQuery);
    const users = usersQuerySnapshot.docs.map((it) => it.data());
    // make user map by id
    const userMap = users.reduce<Record<string, User>>((acc, cur) => {
      return { ...acc, [cur.id]: cur };
    }, {});

    const capturedPoint = users
      .flatMap((it) => it.capturedPoints)
      .reduce<Record<string, CapturedPoint>>((acc, cur) => {
        const isOverride = isAfter(cur.createdAt, acc[cur.pointId]?.createdAt);

        return {
          ...acc,
          [cur.pointId]:
            isOverride || !acc[cur.pointId] ? cur : acc[cur.pointId],
        };
      }, {});

    const _pointQuery = await query(this.pointsRef);
    const pointsQuerySnapshot = await getDocs(_pointQuery);
    const points = pointsQuerySnapshot.docs.map((it) => it.data());

    const result = points.map((it) => {
      return {
        ...it,
        status: parsePointStatus(capturedPoint[it.id]),
        capturedInfo: !!capturedPoint[it.id]
          ? {
              capturedAt: capturedPoint[it.id].createdAt,
              capturedByUser: userMap[capturedPoint[it.id].userId],
              expiredAt: capturedPoint[it.id].expiredAt,
            }
          : null,
      };
    });

    return result;
  }
}

export default PointRepository;
