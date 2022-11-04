import React from 'react';
import { BsArrowLeft } from 'react-icons/bs';
import { Link } from 'react-router-dom';

const ErrorTemplate = ({ children }) => {
  return (
    <div className="font-body flex flex-col justify-center items-center h-screen">
      {children}
      <Link
        to="/"
        className="flex items-center hover:underline hover:text-secondary text-primary m-5">
        <BsArrowLeft size={24} className="mr-2" />
        Go back to home
      </Link>
    </div>
  );
};

export default ErrorTemplate;
