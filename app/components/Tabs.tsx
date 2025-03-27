import { Redirect, Route } from "react-router-dom";
import {
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { cog, flash, list, server } from "ionicons/icons";

import Home from "./Feed";
import Lists from './Lists';
import ListDetail from './ListDetail';
import Settings from './Settings';
import dynamic from 'next/dynamic';

// 动态导入数据服务页面，避免SSR问题
const DataServicePage = dynamic(() => import('@/app/data-service/page'), {
  ssr: false,
});

const Tabs = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/tabs/feed" render={() => <Home />} exact={true} />
        <Route path="/tabs/lists" render={() => <Lists />} exact={true} />
        <Route path="/tabs/lists/:listId" render={() => <ListDetail />} exact={true} />
        <Route path="/tabs/settings" render={() => <Settings />} exact={true} />  
        <Route path="/tabs/data-service" render={() => <DataServicePage />} exact={true} />  
        <Route
          path="/tabs"
          render={() => <Redirect to="/tabs/feed" />}
          exact={true}
        />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="tab1" href="/tabs/feed">
          <IonIcon icon={flash} />
          <IonLabel>Feed</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href="/tabs/lists">
          <IonIcon icon={list} />
          <IonLabel>Lists</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab3" href="/tabs/settings">
          <IonIcon icon={cog} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab4" href="/tabs/data-service">
          <IonIcon icon={server} />
          <IonLabel>数据服务</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
