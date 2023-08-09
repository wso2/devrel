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

import React, { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { useLocation, useHistory } from 'react-router-dom';
import BusinessPlansSection from '../layouts/BusinessPlansSection';
import DealsSection from '../layouts/DealsSection';
import EntertainmentSection from '../layouts/EntertainmentSection';
import Hero from '../layouts/Hero';
import QuickActionsSection from '../layouts/QuickActionsSection';
import UnlimitedPlansSection from '../layouts/UnlimitedPlansSection';
import GeneralTemplate from '../templates/GeneralTemplate';
import Loading from '../layouts/Loading';

const HomePage = () => {
  const { state, signIn, getDecodedIDPIDToken, trySignInSilently } = useAuthContext();
  const query = new URLSearchParams(useLocation().search);
  const reRenderCheckRef = useRef(false);
  const history = useHistory();

  const [showAutoLoginLoader, setShowAutoLoginLoader] = useState(false);

  useEffect(() => {
    reRenderCheckRef.current = true;

    (async () => {
      try {
        const now = Math.floor(Date.now() / 1000);
        const decodedIDtoken = await getDecodedIDPIDToken();
        const expiration = decodedIDtoken?.exp;
        if (now < expiration && !query.get('code')) {
          await signIn();
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  /**
   * This is a workaround to trigger a login request when users come
   * from the Sign Up path with auto login enabled.
   */
  useEffect(() => {
    const shouldAutoLogin = query.get('autologin');

    if (shouldAutoLogin) {
      setShowAutoLoginLoader(true);
      signIn();
    }
  }, [query]);

  const handleLogin = () => {
    if (state?.isAuthenticated) {
      history.push('/my-kfone');
      return;
    }

    trySignInSilently()
      .then((response) => {
        if (!response) {
          signIn();
        }
      })
      .catch(() => {
        signIn();
      });
  };

  if (showAutoLoginLoader) {
    return <Loading />;
  }

  return (
    <GeneralTemplate handleLogin={handleLogin} state={state}>
      <Hero />
      <QuickActionsSection />
      <DealsSection />
      <UnlimitedPlansSection />
      <BusinessPlansSection />
      <EntertainmentSection />
    </GeneralTemplate>
  );
};

export default HomePage;
