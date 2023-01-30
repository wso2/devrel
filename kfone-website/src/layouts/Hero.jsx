/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { TypeAnimation } from 'react-type-animation';
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
        <TypeAnimation
          className="text-primary text-2xl font-light"
          sequence={['#fast', 1000, '#reliable', 1000, '#futuristic', 1000]}
          speed={50} // Custom Speed from 1-99 - Default Speed: 40
          wrapper="span" // Animation will be rendered as a <span>
          repeat={Infinity} // Repeat this Animation Sequence infinitely
        />
        connections with Kfone.
      </p>

      <h1 className="text-secondary text-2xl font-bold">Disruptive Telecommunication Solutions</h1>
    </header>
  );
};

export default Hero;
