import { IonChip } from "@ionic/react";
import React from "react";

export const levelColor: Record<string, string> = {
  "1": "medium",
  "2": "success",
  "3": "primary",
  "4": "tertiary",
  "5": "danger",
};

export const LevelChip: React.FC<{ level?: number }> = ({ level }) => {
  return (
    <IonChip
      color={levelColor[level?.toString() ?? "1"]}
      style={{
        pointerEvents: "none",
      }}
    >
      等級 {level}
    </IonChip>
  );
};
