import React from 'react';
import { GiCrossedAirFlows } from 'react-icons/gi';
import login_background from '../assets/images/people/login_background_overlay.jpeg';

const AuthTemplate = (props) => {
  const { children } = props;

  return (
    <>
      <main className="grid grid-cols-1 md:grid-cols-3 font-body">
        <div
          className="col-span-2 hidden md:block md:min-h-screen bg-right bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${login_background})`
          }}></div>
        <div className="flex flex-col h-screen w-full justify-center items-center">
          <div className="text-center">
            <h1 className="flex items-center w-full text-primary text-4xl font-title">
              <GiCrossedAirFlows size={60} />
            </h1>
          </div>
          <div className="mt-2 flex flex-col justify-center items-center w-full">{children}</div>
        </div>
      </main>
    </>
  );
};

export default AuthTemplate;
