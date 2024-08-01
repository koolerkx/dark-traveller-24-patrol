import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
  RefresherEventDetail,
  useIonModal,
  useIonToast,
  useIonViewDidEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { PlaceholderText } from "../components/PlaceholderText";
import { UserForRanking } from "../repository/user";
import "./Team.css";
import { useRepository } from "../contexts/repository";
import { checkmarkCircle, close } from "ionicons/icons";
import { getBossInfo } from "../utils/boss";
import { ActivityLog } from "../types/activitylog";

const TeamInfoModal: React.FC<{
  team: UserForRanking | null;
  dismiss: () => void;
}> = ({ team, dismiss }) => {
  const { userRepository } = useRepository();
  const [logs, setLogs] = useState<ActivityLog[] | null>(null);

  useEffect(() => {
    if (logs == null && !!userRepository) {
      userRepository.getActivityLog().then((log) => {
        const filteredLogs = log
          .filter(
            (it) =>
              it.type == "USER_UPGRADE" ||
              it.type == "CAPTURE_POINT" ||
              it.type == "CLEAR_POINT"
          )
          .filter((it) => {
            if (it.type == "USER_UPGRADE" || it.type == "CLEAR_POINT")
              return it.user.email == team?.email;
            return it.point.userId == team?.email;
          })
          .sort(
            (a, b) =>
              new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
          );

        setLogs(filteredLogs);
        console.log(filteredLogs);
      });
    }
  }, [userRepository]);

  const levelUpNameMap: Record<string, string> = {
    _: "NA",
    "1": "屏欣苑",
    "2": "銀座",
    "3": "流浮山消防局",
    "4": "天瑞街市",
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>活動記錄</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => dismiss()} strong={true}>
              關閉
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList inset={true}>
          <IonListHeader>
            <IonLabel>{team?.name}</IonLabel>
          </IonListHeader>
          {logs ? (
            logs.map((it, idx) => {
              const hours = new Date(it.datetime).getHours();
              const minutes = new Date(it.datetime).getMinutes();

              return (
                <IonItem key={`${idx}|log`}>
                  {it.type == "USER_UPGRADE" ? (
                    <div className="activity-item">
                      <IonChip color={"success"}>升級</IonChip>
                      <span className="activity-item-title">
                        {levelUpNameMap[it.point]}
                      </span>
                      <span className="activity-item-time">{`${hours}:${minutes}`}</span>
                    </div>
                  ) : it.type == "CAPTURE_POINT" ? (
                    <div className="activity-item">
                      <IonChip color={"warning"}>佔領</IonChip>
                      <span className="activity-item-title">
                        {it.point.pointName}
                      </span>
                      <span className="activity-item-time">{`${hours}:${minutes}`}</span>
                    </div>
                  ) : it.type == "CLEAR_POINT" ? (
                    <div className="activity-item">
                      <IonChip color={"tertiary"}>清除</IonChip>
                      <span className="activity-item-title">
                        {it.point.pointName}
                      </span>
                      <span className="activity-item-time">{`${hours}:${minutes}`}</span>
                    </div>
                  ) : null}
                </IonItem>
              );
            })
          ) : (
            <div className="ranking-table-loading">
              <IonSpinner name="dots" />
            </div>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

const TeamInfoItem: React.FC<{
  onItemClick: (user: UserForRanking) => void;
  user: UserForRanking;
  rank: number;
}> = ({ onItemClick, user, rank }) => {
  const bossInfo = useMemo(
    () => (!!user?.capturedPoints ? getBossInfo(user.capturedPoints) : null),
    [user.capturedPoints]
  );

  const progress = useMemo(
    () => (bossInfo ? bossInfo.hp.remain / bossInfo.hp.total : 1),
    [bossInfo]
  );
  const hpText = useMemo(
    () =>
      !!bossInfo
        ? `HP: ${
            bossInfo.hp.remain > 0
              ? Math.round(bossInfo.hp.remain * 100) / 100
              : 0
          } / ${bossInfo.hp.total}`
        : null,
    [bossInfo]
  );

  return (
    <IonItem
      className="team-info-item"
      button={true}
      onClick={() => onItemClick(user)}
    >
      <IonLabel>
        <div className="team-info-item-title">
          <h2>{`${rank}. ${user.name}`}</h2>
        </div>
        <div className="team-info-item-data-container">
          <IonChip color="dark">
            <PlaceholderText width={100} height={20}>
              {`${hpText}`}
            </PlaceholderText>
          </IonChip>
          {bossInfo && bossInfo.hp.remain < 0 ? (
            <IonChip color="success">
              <PlaceholderText width={100} height={20}>
                {`溢出傷害：${Math.abs(
                  Math.round(bossInfo.hp.remain * 100) / 100
                )}`}
              </PlaceholderText>
            </IonChip>
          ) : null}
        </div>
        <IonProgressBar value={progress} buffer={1}></IonProgressBar>
      </IonLabel>
    </IonItem>
  );
};

const Team: React.FC = () => {
  const headerTitle = "隊伍資料";

  const { userRepository } = useRepository();
  const [selectedUser, setSelectedUser] = useState<UserForRanking | null>(null);

  const [presentModal, dismissModal] = useIonModal(TeamInfoModal, {
    team: selectedUser,
    dismiss: () => dismissModal(),
  });
  const [presentToast, dismissToast] = useIonToast();

  const [rankedUsers, setRankedUsers] = useState<UserForRanking[] | null>(null);

  const fetchRanking = useCallback(
    (cb?: () => void) => {
      if (!userRepository) {
        if (cb) cb();
      }

      userRepository
        ?.getRanking()
        .then((users) => {
          setRankedUsers(users);
          console.log(users);
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
    },
    [userRepository, presentToast]
  );

  useEffect(() => {
    if (!rankedUsers) {
      fetchRanking();
    }
  }, [fetchRanking]);

  const handleRefresh = useCallback(
    (event: CustomEvent<RefresherEventDetail>) => {
      fetchRanking(() => {
        event.detail.complete();
      });
    },
    [fetchRanking]
  );

  useIonViewDidEnter(() => {
    fetchRanking();
  });

  const onItemClick = useCallback((user: UserForRanking) => {
    setSelectedUser(user);
    presentModal({
      // initialBreakpoint: 0.8,
      // breakpoints: [0.8],
      // backdropDismiss: true,
      // backdropBreakpoint: 0.2,
      canDismiss: true,
    });
  }, []);

  useIonViewWillLeave(() => {
    dismissModal();
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
        {!!true ? (
          <IonList inset={true}>
            {!!rankedUsers ? (
              rankedUsers.map((it, idx) => {
                return (
                  <TeamInfoItem
                    onItemClick={onItemClick}
                    user={it}
                    rank={idx + 1}
                    key={`${idx}|${it.name}`}
                  />
                );
              })
            ) : (
              <div className="ranking-table-loading">
                <IonSpinner name="dots" />
              </div>
            )}
          </IonList>
        ) : (
          <div className="ranking-table-loading">
            <IonSpinner name="dots" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Team;
