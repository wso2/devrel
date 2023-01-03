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

const App = () => {
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
