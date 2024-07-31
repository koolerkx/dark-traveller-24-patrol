import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  bicycleOutline,
  colorWandOutline,
  personOutline,
  warningOutline,
} from "ionicons/icons";

export const Home: React.FC = () => {
  const headerTitle = "單車定向（Petrol）";

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>{headerTitle}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonHeader collapse="condense">
        <IonToolbar>
          <IonTitle size="large">{headerTitle}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>
          <IonIcon icon={bicycleOutline}></IonIcon>
          <span>你是Petrol，你的任務是</span>
        </p>
        <ul>照顧參加者</ul>
        <ul>控制遊戲平衡</ul>
        <ul>控制遊戲速度</ul>
        <p>
          <IonIcon icon={personOutline}></IonIcon>
          <span>參加者會</span>
        </p>
        <ul>佔領攻擊點獲取分數</ul>
        <ul>足夠分數將會完成遊戲</ul>
        <p>
          <IonIcon icon={colorWandOutline}></IonIcon>
          <span>你可以</span>
        </p>
        <ul>
          <IonText color="primary">
            <span>清除</span>
          </IonText>
          參加者控制的攻擊點
        </ul>
        <ul>
          針對某強隊，
          <IonText color="primary">
            <span>防止遊戲進行過快</span>
          </IonText>
        </ul>
        <p>
          <IonIcon icon={warningOutline}></IonIcon>
          <span>注意</span>
        </p>
        <ul>
          佔領後5分鐘是
          <IonText color="danger">
            <span>保護時間</span>
          </IonText>
        </ul>
        <ul>
          <IonText color="danger">
            <span>5分鐘後</span>
          </IonText>
          才可以進行清除
        </ul>
      </IonContent>
    </IonPage>
  );
};
