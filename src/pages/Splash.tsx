import { IonContent, IonImg, IonPage, useIonRouter } from "@ionic/react";
import React, { useEffect } from "react";
import { useAuth } from "../contexts/auth";

import "./Splash.css";

const Splash: React.FC = () => {
  const { push } = useIonRouter();
  const { isAuthed, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthed) {
      push("/home", "root", "replace");
    } else {
      push("/login", "root", "replace");
    }
  }, [isAuthed, isLoading]);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="splash-loading-container">
          <IonImg
            src="/favicon/icon-512x512.png"
            alt="Event logo"
            className="splash-loading-logo"
          />
          <p className="splash-loading-text">載入中...</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Splash;
