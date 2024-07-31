import { IonSkeletonText } from "@ionic/react";
import React from "react";

interface Props {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export const PlaceholderText: React.FC<Props> = ({
  width,
  height,
  children,
}) => {
  return children != null && children !== undefined ? (
    children
  ) : (
    <IonSkeletonText
      style={{ width: `${width}px`, height: `${height}px` }}
      animated={true}
    />
  );
};
