import React from 'react';
// import { AuthenticationFailure } from './pages/AuthenticationFailure';
// import { InvalidSystemTimePage } from './pages/InvalidSystemTime';

export const ErrorBoundary = (props) => {
  const { error, children } = props;
  if (error?.code === 'JS-CRYPTO_UTILS-IVIT-IV02') {
    return <p>InvalidSystemTimePage</p>;
  } else if (error?.code === 'SPA-MAIN_THREAD_CLIENT-SI-SE01') {
    return <p>AuthenticationFailure</p>;
  }
  return children;
};
