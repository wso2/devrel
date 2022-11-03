import React from 'react';
import { GiCrossedAirFlows } from 'react-icons/gi';

const Loading = () => {
  return (
    <div className="animate-pulse flex w-screen h-screen justify-center items-center">
      <h1 className="flex items-center text-primary text-2xl font-title">
        <GiCrossedAirFlows size={30} />
        <div className="ml-2">Kfone</div>
      </h1>
    </div>
  );
};

export default Loading;
