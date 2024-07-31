import {
  IonContent,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonText,
} from "@ionic/react";
import React, { useMemo } from "react";
import "./MapPointModal.css";
import { PlaceholderText } from "./PlaceholderText";
import { PointStatus, PointWithStatus } from "../repository/point";
import { differenceInMinutes } from "date-fns";
import { PlaceholderImage } from "./PlaceholderImage";

const InfoItem: React.FC<{
  title: string;
  value: string | null;
  color: string;
}> = ({ title, value, color = "medium" }) => {
  return (
    <IonText color="medium" className="map-point-info-item">
      <h3 className="map-point-info-title">{title}</h3>
      <div className="map-point-info-datum">
        <IonText color={color}>
          <PlaceholderText width={30} height={22}>
            {value}
          </PlaceholderText>
        </IonText>
      </div>
    </IonText>
  );
};

interface ContainerProps {
  point: PointWithStatus | null;
}

const MapPointModal: React.FC<ContainerProps> = ({ point }) => {
  const capturedBy = useMemo(
    () =>
      !!point
        ? !!point.capturedInfo &&
          point.capturedInfo.capturedByUser &&
          point.capturedInfo.expiredAt == null
          ? point.capturedInfo.capturedByUser.name
          : "無"
        : null,
    [point]
  );

  const statusTextMap = {
    [PointStatus.NEW]: "未被佔領",
    [PointStatus.CAPTURED]: "受保護",
    [PointStatus.EXPIRED]: "佔領中",
    [PointStatus.CLEARED]: "可佔領",
  };

  const statusText = useMemo(
    () => (!!point ? statusTextMap[point.status] : null),
    [point]
  );

  const statusColorMap = {
    [PointStatus.NEW]: "primary",
    [PointStatus.CAPTURED]: "danger",
    [PointStatus.EXPIRED]: "success",
    [PointStatus.CLEARED]: "success",
  };

  const statusColor = useMemo(
    () => (!!point ? statusColorMap[point.status] : "medium"),
    [point]
  );

  return (
    <IonPage className="map-modal">
      <IonContent scrollX={false} scrollY={false}>
        <div className="ion-padding">
          <h1>
            <PlaceholderText width={120} height={32}>
              {point?.point}
            </PlaceholderText>
          </h1>
          <IonText color="medium" className="map-point-info-subtitle">
            攻擊點
          </IonText>
          <div className="map-point-info-container">
            <InfoItem title="狀態" value={statusText} color={statusColor} />
            <span className="map-point-info-separator"></span>
            <InfoItem title="佔領者" value={capturedBy} color="primary" />
          </div>
          {!!point && !point.heroImage ? null : (
            <div className="map-point-image-container">
              <PlaceholderImage
                src={point?.heroImage ?? ""}
                width={"100%"}
                aspectRatio={16 / 9}
                imageClassName="map-point-image"
              />
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MapPointModal;
