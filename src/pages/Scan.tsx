import {
  IonContent,
  IonPage,
  useIonAlert,
  useIonLoading,
  useIonRouter,
  useIonViewDidEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import { useCallback, useState } from "react";
import QRScanner from "../components/QRScanner";
import { useAuth } from "../contexts/auth";
import { useRepository } from "../contexts/repository";
import {
  CapturedPointAlreadyCapturedError,
  CapturedPointInCooldownError,
  UpgradePointAlreadyAppliedError,
} from "../error";
import { CAPTURED_POINT_COOLDOWN_SECONDS } from "../repository/user";
import "./Home.css";

const Scan: React.FC = () => {
  const headerTitle = "佔領攻擊點";

  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [presentLoading, dismissLoading] = useIonLoading();
  const [presentAlert] = useIonAlert();
  const router = useIonRouter();

  const { userRepository } = useRepository();
  const { user: authedUser } = useAuth();

  useIonViewDidEnter(() => {
    setIsCameraActive(true);
  });

  useIonViewWillLeave(() => {
    setIsCameraActive(false);
  });

  const onScan = useCallback(
    async (result: string) => {
      if (isLoading) return;
      if (!authedUser?.email) return;

      setIsLoading(true);
      setIsCameraActive(false);
      presentLoading({
        message: "請稍候片刻...",
      });

      const key = {
        point: "pt",
        upgrade: "up",
      };

      const urlObj = new URL(result);
      const params = new URLSearchParams(urlObj.search);
      const pointParam = params.get(key.point);
      const upgradeParam = params.get(key.upgrade);

      let resetOnDismiss = false;

      try {
        if (!userRepository) throw new Error("userRepository not found");
        const user = await userRepository.getUser(authedUser.email);

        if (!!pointParam) {
          const capturedPoint = await userRepository.capturePoint(
            user,
            pointParam
          );

          resetOnDismiss = true;

          await presentAlert({
            header: `佔領成功！`,
            subHeader: `佔領了【${capturedPoint.pointName}】`,
            buttons: ["關閉訊息"],
            onDidDismiss: () => {
              router.push("/profile", "none", "push");
            },
          });
        } else if (!!upgradeParam) {
          await userRepository.upgradeUser(user, upgradeParam);

          resetOnDismiss = true;

          await presentAlert({
            header: `升級成功！`,
            buttons: ["關閉訊息"],
            onDidDismiss: () => {
              router.push("/profile", "none", "push");
            },
          });
        }
      } catch (error) {
        resetOnDismiss = true;

        if (error instanceof CapturedPointInCooldownError) {
          presentAlert({
            header: "攻擊點處於保護狀態",
            subHeader: `剩餘時間：${error.secondsSincecaptured} / ${CAPTURED_POINT_COOLDOWN_SECONDS}秒`,
            message: `攻擊點被佔領後5分鐘內，無法被佔領、升級及清除。你可以先到其他攻擊點進行佔領！`,
            buttons: ["關閉訊息"],
            onDidDismiss: () => {
              setIsCameraActive(true);
              setIsLoading(false);
            },
          });
        } else if (error instanceof UpgradePointAlreadyAppliedError) {
          presentAlert({
            header: "已經升級了",
            message: `你已經在這個升級點進行升級，你可以尋找其他升級點進行升級！`,
            buttons: ["關閉訊息"],
            onDidDismiss: () => {
              setIsCameraActive(true);
              setIsLoading(false);
            },
          });
        } else if (error instanceof CapturedPointAlreadyCapturedError) {
          presentAlert({
            header: "已經佔領了",
            message: `你已經佔領了這個攻擊點，升級後再佔領！或者先到其他攻擊點進行佔領！`,
            buttons: ["關閉訊息"],
            onDidDismiss: () => {
              setIsCameraActive(true);
              setIsLoading(false);
            },
          });
        } else {
          presentAlert({
            header: "出現錯誤",
            message: `請稍後再試，數次都不成功請聯絡管理員。`,
            buttons: ["關閉訊息"],
            onDidDismiss: () => {
              setIsCameraActive(true);
              setIsLoading(false);
            },
          });
        }

        console.error(error);
      } finally {
        dismissLoading();
        if (resetOnDismiss) return;
        setIsCameraActive(true);
        setIsLoading(false);
      }
    },
    [userRepository, authedUser, router]
  );

  return (
    <IonPage>
      <IonContent
        fullscreen
        scrollX={false}
        scrollY={false}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <QRScanner pause={!isCameraActive} onScan={onScan} />
      </IonContent>
    </IonPage>
  );
};

export default Scan;
