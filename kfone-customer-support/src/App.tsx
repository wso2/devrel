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

import { RouterProvider } from "react-router-dom";
import {
  BasicUserInfo,
  useAuthContext,
  AuthProvider,
} from "@asgardeo/auth-react";
import { TokenExchangePlugin } from "@asgardeo/token-exchange-plugin";
import { router } from "./router/router";
import "./App.css";
import authConfig from "./config/auth";
import { useEffect } from "react";
import Loader from "./components/Loader";
import { MdErrorOutline } from "react-icons/md";

const App = () => {
  if (
    !(
      authConfig.signInRedirectURL &&
      authConfig.baseUrl &&
      authConfig.clientID &&
      authConfig.resourceServerURLs &&
      authConfig.stsTokenEndpoint &&
      authConfig.stsConfig.client_id &&
      authConfig.stsConfig.orgHandle
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
            href="https://github.com/wso2/devrel/blob/Kubecon-demos/kfone-customer-support/README.md#lets-setup-the-environment-variables"
            target="_blank"
            rel="noreferrer"
            className="text-blue-800 underline text-sm"
          >
            Learn more
          </a>
        </p>
      </div>
    );
  }
  
  return (
    <AuthProvider
      config={authConfig as any}
      plugin={TokenExchangePlugin.getInstance()}
    >
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { state, trySignInSilently, signIn } = useAuthContext();

  useEffect(() => {
    if (state.isAuthenticated || state.isLoading) {
      return;
    }

    trySignInSilently()
      .then((response: boolean | BasicUserInfo) => {
        if (!response) {
          signIn();
        }
      })
      .catch(() => {
        signIn();
      });
  }, [state.isAuthenticated, state.isLoading]);

  return (
    <>
      {state.isAuthenticated && !state.isLoading ? (
        <RouterProvider router={router} />
      ) : (
        <Loader />
      )}
    </>
  );
};

export default App;
