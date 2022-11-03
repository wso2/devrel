import { SecureRoute, useAuthContext } from '@asgardeo/auth-react';

export const SecureRouteWithRedirect = (props) => {
  const { component, path } = props;
  const { signIn, trySignInSilently } = useAuthContext();

  const callback = () => {
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

  return <SecureRoute exact path={path} component={component} callback={callback} />;
};
