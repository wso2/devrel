import React, { useEffect, useRef } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { useLocation, useHistory } from 'react-router-dom';
import BusinessPlansSection from '../layouts/BusinessPlansSection';
import DealsSection from '../layouts/DealsSection';
import EntertainmentSection from '../layouts/EntertainmentSection';
import Hero from '../layouts/Hero';
import QuickActionsSection from '../layouts/QuickActionsSection';
import UnlimitedPlansSection from '../layouts/UnlimitedPlansSection';
import GeneralTemplate from '../templates/GeneralTemplate';

const HomePage = () => {
  const { state, signIn, getDecodedIDPIDToken, trySignInSilently } = useAuthContext();
  const query = new URLSearchParams(useLocation().search);
  const reRenderCheckRef = useRef(false);
  const history = useHistory();

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
