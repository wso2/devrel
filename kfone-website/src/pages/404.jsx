import React from 'react';
import ErrorTemplate from '../templates/ErrorTemplate';

const NotFoundErrorPage = () => {
  return (
    <ErrorTemplate>
      <h1 className="text-6xl font-extrabold mb-2">4&nbsp;0&nbsp;4</h1>
      <h4 className="text-4xl font-light mb-4">Page not found.</h4>
    </ErrorTemplate>
  );
};

export default NotFoundErrorPage;
