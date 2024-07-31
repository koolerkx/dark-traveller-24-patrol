import {
  IonContent,
  IonHeader,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
  RefresherEventDetail,
  useIonToast,
  useIonViewDidEnter,
} from "@ionic/react";
import { checkmarkCircle, close } from "ionicons/icons";
import { useCallback, useState } from "react";
import RankingTable from "../components/RankingTable";
import { useRepository } from "../contexts/repository";
import { User, UserForRanking } from "../repository/user";
import "./Ranking.css";

const Ranking: React.FC = () => {
  const headerTitle = "排行榜";

  const { userRepository } = useRepository();
  const [rankedUsers, setRankedUsers] = useState<UserForRanking[] | null>(null);
  const [presentToast, dismissToast] = useIonToast();

  const fetchRanking = (cb?: () => void) => {
    userRepository
      ?.getRanking()
      .then((users) => {
        setRankedUsers(users);
      })
      .then(() => {
        if (cb) cb();
      })
      .catch((error) => {
        console.error(error);
        presentToast({
          message: "出錯了！無法獲取排行榜資料。",
          duration: 1500,
          icon: checkmarkCircle,
          position: "bottom",
          color: "warning",
          swipeGesture: "vertical",
          buttons: [
            {
              icon: close,
              role: "cancel",
            },
          ],
        });
      });
  };

  const handleRefresh = useCallback(
    (event: CustomEvent<RefresherEventDetail>) => {
      fetchRanking(() => {
        event.detail.complete();
      });
    },
    []
  );

  useIonViewDidEnter(() => {
    fetchRanking();
  });

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>{headerTitle}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{headerTitle}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {!!rankedUsers ? (
          <RankingTable users={rankedUsers} />
        ) : (
          <div className="ranking-table-loading">
            <IonSpinner name="dots" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Ranking;
