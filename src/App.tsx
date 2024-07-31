import {
  IonApp,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route } from "react-router-dom";
import Home from "./pages/Home";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

// import '@ionic/react/css/palettes/dark.always.css';
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import { home, map, podium, qrCode } from "ionicons/icons";
import "./theme/variables.css";

import { useAuth } from "./contexts/auth";
import Map from "./pages/Map";
import Ranking from "./pages/Ranking";
import Scan from "./pages/Scan";
import "./theme/global.css";

setupIonicReact();

const App: React.FC = () => {
  const tabBarButtonConfig = [
    {
      name: "home",
      icon: home,
      label: "主頁",
    },
    {
      name: "map",
      icon: map,
      label: "地圖",
    },
    {
      name: "scan",
      icon: qrCode,
      label: "掃描QR碼",
      accent: true,
    },
    {
      name: "ranking",
      icon: podium,
      label: "排行榜",
    },
  ];

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/" render={() => <Home />}></Route>
            <Route exact path="/home" render={() => <Home />}></Route>
            <Route exact path="/map" render={() => <Map />}></Route>
            <Route exact path="/ranking" render={() => <Ranking />}></Route>
            <Route exact path="/scan" render={() => <Scan />}></Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            {tabBarButtonConfig.map((config, index) => (
              <IonTabButton
                key={index}
                tab={config.name}
                href={"/" + config.name}
              >
                {config.accent ? (
                  <IonFab>
                    <IonFabButton>
                      <IonIcon icon={config.icon} style={{ color: "white" }} />
                    </IonFabButton>
                  </IonFab>
                ) : (
                  <>
                    <IonIcon aria-hidden="true" icon={config.icon} />
                    <IonLabel>{config.label}</IonLabel>
                  </>
                )}
              </IonTabButton>
            ))}
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
