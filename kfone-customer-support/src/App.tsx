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
