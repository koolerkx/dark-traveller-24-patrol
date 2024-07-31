import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
  IonText,
  useIonRouter,
} from "@ionic/react";
import {
  ellipsisHorizontal,
  ellipsisVertical,
  star,
  starOutline,
} from "ionicons/icons";
import { useCallback } from "react";
import { useAuth } from "../contexts/auth";
import { User } from "../repository/user";
import { PlaceholderText } from "./PlaceholderText";
import "./ProfileInfoCard.css";
import { getAttackPower } from "../utils/attackPower";

export const ProfileInfoCardHeaderButton: React.FC<{ className: string }> = ({
  className,
}) => {
  const { logout } = useAuth();
  const { push } = useIonRouter();

  const onLogoutButtonClick = useCallback(async () => {
    await logout();
    push("/login", "none", "replace");
  }, [logout, push]);

  return (
    <div className={className}>
      <IonButton
        shape="round"
        size="small"
        color={"dark"}
        id="profile-card-popover-button"
      >
        <IonIcon
          slot="icon-only"
          ios={ellipsisHorizontal}
          md={ellipsisVertical}
        />
      </IonButton>
      <IonPopover
        trigger="profile-card-popover-button"
        dismissOnSelect={true}
        alignment="center"
        side="bottom"
        showBackdrop={false}
      >
        <IonContent>
          <IonList>
            <IonItem button={true} detail={false} onClick={onLogoutButtonClick}>
              登出
            </IonItem>
          </IonList>
        </IonContent>
      </IonPopover>
    </div>
  );
};

interface ContainerProps {
  user?: User | null;
  rank?: number | null;
}

const ProfileInfoCard: React.FC<ContainerProps> = ({ user, rank }) => {
  const maximumLevel = 5;

  const capturedPointCount =
    user?.capturedPoints.filter((it) => !it.expiredAt).length ?? null;

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          <PlaceholderText width={120} height={24}>
            {user?.name}
          </PlaceholderText>
        </IonCardTitle>
        <IonCardSubtitle>隊伍名稱</IonCardSubtitle>
      </IonCardHeader>

      <ProfileInfoCardHeaderButton className="profile-card-button" />

      <IonCardContent>
        <div className="profile-data-list">
          <IonText color="medium" className="profile-data-item">
            <h3 className="profile-data-title">等級</h3>
            <div className="profile-data-datum">
              <PlaceholderText width={30} height={22}>
                {user?.level}
              </PlaceholderText>
            </div>
            <h3 className="profile-data-unit">
              {[...Array(user?.level).keys()].map((_elm, idx) => (
                <IonIcon aria-hidden="true" icon={star} key={`star${idx}`} />
              ))}
              {[...Array(maximumLevel - (user?.level ?? 0)).keys()].map(
                (_elm, idx) => (
                  <IonIcon
                    aria-hidden="true"
                    icon={starOutline}
                    key={`star-outline${idx}`}
                  />
                )
              )}
            </h3>
          </IonText>

          <span className="profile-data-list-separator"></span>

          <IonText color="medium" className="profile-data-item">
            <h3 className="profile-data-title">攻擊力</h3>
            <div className="profile-data-datum">
              <PlaceholderText width={30} height={22}>
                {!!user ? getAttackPower(user.capturedPoints) : null}
              </PlaceholderText>
            </div>
            <h3 className="profile-data-unit">/秒</h3>
          </IonText>

          <span className="profile-data-list-separator"></span>

          <IonText color="medium" className="profile-data-item">
            <h3 className="profile-data-title">排名</h3>
            <div className="profile-data-datum">
              <PlaceholderText width={30} height={22}>
                {rank}
              </PlaceholderText>
            </div>
            <h3 className="profile-data-unit">位</h3>
          </IonText>

          <span className="profile-data-list-separator"></span>

          <IonText color="medium" className="profile-data-item">
            <h3 className="profile-data-title">現時佔領</h3>
            <div className="profile-data-datum">
              <PlaceholderText width={30} height={22}>
                {capturedPointCount}
              </PlaceholderText>
            </div>
            <h3 className="profile-data-unit">個點</h3>
          </IonText>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default ProfileInfoCard;
