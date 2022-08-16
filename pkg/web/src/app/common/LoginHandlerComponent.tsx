import { Alert, AlertActionLink } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import React, { useEffect } from 'react';
import { useLocation, Redirect, useHistory } from 'react-router-dom';
import { PATH_PREFIX } from './constants';
import { ICurrentUser, useNetworkContext } from './context/NetworkContext';

interface ILoginError {
  message?: string;
  type?: string;
  errno?: string;
  code?: string;
}

export const LoginHandlerComponent: React.FunctionComponent = () => {
  const { saveLoginToken } = useNetworkContext();
  const history = useHistory();
  const searchParams = new URLSearchParams(useLocation().search);
  const userStr = searchParams.get('user');
  const errorStr = searchParams.get('error');
  let user: ICurrentUser | null;
  let loginError: ILoginError | null;
  try {
    user = userStr ? (JSON.parse(userStr) as ICurrentUser | null) : null;
    loginError = errorStr && JSON.parse(errorStr);
  } catch (error) {
    user = null;
    loginError = null;
  }

  useEffect(() => {
    if (loginError) {
      console.log('Authentication error: ', loginError);
    } else if (user) {
      saveLoginToken(user, history); // Will cause a redirect to "/"
    }
  }, [loginError, user, history, saveLoginToken]);

  if (user) return null;
  if (loginError) {
    return (
      <Alert
        variant="danger"
        title="Cannot log in"
        className={spacing.mLg}
        actionLinks={
          <AlertActionLink onClick={() => history.replace(`${PATH_PREFIX}/`)}>Try again</AlertActionLink>
        }
      >
        {loginError.message}
      </Alert>
    );
  }

  return <Redirect to="/" />;
};
