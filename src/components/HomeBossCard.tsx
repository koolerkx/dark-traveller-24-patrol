import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonProgressBar,
} from "@ionic/react";
import "./HomeBossCard.css";
import { BossInfo } from "../utils/boss";
import { useMemo } from "react";
import { PlaceholderText } from "./PlaceholderText";

interface ContainerProps {
  boss?: BossInfo | null;
}

const HomeBossCard: React.FC<ContainerProps> = ({ boss }) => {
  const progress = useMemo(
    () => (boss ? boss.hp.remain / boss.hp.total : 1),
    [boss]
  );
  const hpText = useMemo(
    () => (!!boss ? `HP: ${boss.hp.remain} / ${boss.hp.total}` : null),
    [boss]
  );

  return (
    <IonCard className="boss-card">
      <div className="boss-card-title">
        <IonCardHeader>
          <IonCardTitle>敵人血量</IonCardTitle>
          <IonCardSubtitle>Boss HP</IonCardSubtitle>
        </IonCardHeader>
        <IonCardHeader>
          <IonChip color="dark">
            <PlaceholderText width={100} height={20}>
              {hpText}
            </PlaceholderText>
          </IonChip>
        </IonCardHeader>
      </div>

      <IonCardContent>
        <IonProgressBar value={progress} buffer={1}></IonProgressBar>
      </IonCardContent>
    </IonCard>
  );
};

export default HomeBossCard;
