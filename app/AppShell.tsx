import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import Tabs from "./components/Tabs";
import { DataServiceProvider } from "./services/data";

setupIonicReact({});

const AppShell = () => {
  return (
    <DataServiceProvider>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet id="main">
            <Route path="/tabs" render={() => <Tabs />} />
            <Route
              path="/"
              render={() => <Redirect to="/tabs/feed" />}
              exact={true}
            />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </DataServiceProvider>
  );
};

export default AppShell;
