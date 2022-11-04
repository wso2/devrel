import React from 'react';
import { AuthProvider } from '@asgardeo/auth-react';
import { TokenExchangePlugin } from '@asgardeo/token-exchange-plugin';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Config from './config.json';
import HomePage from './pages/HomePage';
import PhoneVerification from './pages/customer-portal/PhoneVerification';
import NotFoundErrorPage from './pages/404';
import MyPlan from './pages/customer-portal/MyPlan';
import Discover from './pages/customer-portal/explore/Explore';
import { SecureRouteWithRedirect } from './components';
import BusinessPage from './pages/BusinessPage';

const App = () => {
  return (
    <AuthProvider
      config={{ ...Config.auth, storage: Storage.WebWorker }}
      plugin={TokenExchangePlugin.getInstance()}>
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/enterprise" component={BusinessPage} />
          <SecureRouteWithRedirect exact path="/my-kfone" component={MyPlan} />
          <SecureRouteWithRedirect exact path="/my-kfone/explore" component={Discover} />
          <SecureRouteWithRedirect exact path="/my-kfone/verify" component={PhoneVerification} />
          <Route path="*" component={NotFoundErrorPage} />
        </Switch>
      </Router>
    </AuthProvider>
  );
};

export default App;
