import React from 'react';
import Typed from 'react-typed';
import { GiCrossedAirFlows } from 'react-icons/gi';
import connections from '../assets/images/connections.svg';
import background_waves from '../assets/images/background-waves.svg';

const Hero = () => {
  return (
    <header
      className="h-[80%] md:h-[60%] w-full flex flex-col justify-center items-center text-center p-8 bg-no-repeat"
      style={{
        backgroundImage: `url(${background_waves})`
      }}>
      <img className="w-80 md:w-64 lg:w-72" src={connections} alt="connections image" />
      <h1 className="flex justify-center items-center w-full text-secondary text-2xl font-title">
        <GiCrossedAirFlows size={30} />
        <div className="ml-2">Kfone</div>
      </h1>
      <p className="text-secondary text-l font-thin mb-4">Anywhere • Anytime</p>

      <p className="text-secondary text-xl font-thin py-2">
        <Typed
          className="text-primary text-2xl font-light"
          strings={['#fast', '#reliable', '#secure', '#futuristic']}
          typeSpeed={120}
          backSpeed={140}
          loop
        />
        connections with Kfone.
      </p>

      <h1 className="text-secondary text-2xl font-bold">Disruptive Telecommunication Solutions</h1>
    </header>
  );
};

export default Hero;
