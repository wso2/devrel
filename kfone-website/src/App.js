/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { AuthProvider } from '@asgardeo/auth-react';
import { TokenExchangePlugin } from '@asgardeo/token-exchange-plugin';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import appConfig from './config';
import HomePage from './pages/HomePage';
import PhoneVerification from './pages/customer-portal/PhoneVerification';
import NotFoundErrorPage from './pages/404';
import MyPlan from './pages/customer-portal/MyPlan';
import Discover from './pages/customer-portal/explore/Explore';
import { SecureRouteWithRedirect } from './components';
import BusinessPage from './pages/BusinessPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Webinar from './pages/webinar';
import { MdErrorOutline } from 'react-icons/md';

const App = () => {
  if (
    !(
      appConfig.baseUrl &&
      appConfig.clientID &&
      appConfig.myaccountURL &&
      appConfig.resourceServerURLs &&
      appConfig.stsConfig.client_id &&
      appConfig.stsConfig.orgHandle
    )
  ) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <p className="w-[400px] flex flex-col items-center">
          <MdErrorOutline color="red" size={36} />
          <span className="text-lg my-4 text-center">
            One or more values are missing from <code>.env</code> file. Please check and restart the
            app.
          </span>
          <br />
          <a
            href="https://github.com/wso2/devrel/blob/Kubecon-demos/kfone-website/README.md#lets-setup-the-environment-variables"
            target="_blank"
            rel="noreferrer"
            className="text-blue-800 underline text-sm">
            Learn more
          </a>
        </p>
      </div>
    );
  }

  return (
    <AuthProvider
      config={{ ...appConfig, storage: Storage.WebWorker }}
      plugin={TokenExchangePlugin.getInstance()}>
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/enterprise" component={BusinessPage} />
          <Route exact path="/enterprise/webinar" component={Webinar} />
          <SecureRouteWithRedirect exact path="/my-kfone" component={MyPlan} />
          <SecureRouteWithRedirect exact path="/my-kfone/explore" component={Discover} />
          <SecureRouteWithRedirect exact path="/my-kfone/verify" component={PhoneVerification} />
          <Route exact path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="*" component={NotFoundErrorPage} />
        </Switch>
      </Router>
    </AuthProvider>
  );
};

export default App;
