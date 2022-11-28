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
import iphone_14_1 from '../assets/images/devices/iphone_14_1.jpg';
import pixel_7 from '../assets/images/devices/pixel_7.webp';
import VerticalCard from '../components/cards/VerticalCard';
import HeaderTitle from '../components/headers/HeaderTitle';

const DealsSection = () => {
  return (
    <div className="md:px-10 grid grid-cols-1 md:grid-cols-2 gap-2 items-center bg-light p-4">
      <div className="text-secondary md:col-span-2 text-left mt-10">
        <div className="p-4">
          <HeaderTitle>Our Latest Deals</HeaderTitle>
          <p className="text-lg font-light text-secondary-600">
            Our best deals on cutting-edge devices are available to everyone
          </p>
        </div>
      </div>
      <VerticalCard
        title="iPhone 14 Pro"
        subTitle="Pro.Beyond"
        image={iphone_14_1}
        description="Learn how new and existing customers get up to $800 off with eligible trade-in."
        action={
          <a className="font-extralight text-xs underline text-secondary-50" href="/">
            See offer details
          </a>
        }
        styles="text-white bg-black rounded-lg m-4 shadow-slate-600 shadow-lg transition ease-in-out delay-150 hover:scale-105 duration-300"
      />
      <VerticalCard
        title="Pixel 7 & Pixel 7 Pro"
        subTitle="Google's most advanced phones yet."
        image={pixel_7}
        description="Get up to $750 off any Pixel 7 phone with qualifying trade-in."
        action={
          <a className="font-extralight text-xs underline text-secondary-600" href="/">
            Learn more
          </a>
        }
        styles="text-black bg-[#E9E3DB] rounded-lg m-4 shadow-brown-300 shadow-lg transition ease-in-out delay-150 hover:scale-105 duration-300"
      />
    </div>
  );
};

export default DealsSection;
