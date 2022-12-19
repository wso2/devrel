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
import { BsArrowRightShort } from 'react-icons/bs';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import two_people_with_phone from '../assets/images/people/two_people_with_phone.jpg';
import background_waves from '../assets/images/background-waves.svg';
import PrimaryButton from '../components/buttons/PrimaryButton';
import HeaderTitle from '../components/headers/HeaderTitle';

const UnlimitedPlansSection = () => {
  return (
    <section
      className="md:px-10 grid grid-cols-1 md:grid-cols-2 gap-2 items-start bg-white mt-10 p-4"
      style={{
        backgroundImage: `url(${background_waves})`
      }}>
      <div className="py-2 flex items-center justify-center">
        <img
          src={two_people_with_phone}
          className="h-60 md:h-96"
          alt="Cheerful multiracial couple sharing smartphone on city street"
        />
      </div>
      <div className="flex flex-col h-full justify-between text-secondary text-left">
        <div className="py-2">
          <HeaderTitle>Explore Our Unlimited Plans</HeaderTitle>
          <h6 className="text-lg font-light text-secondary-600">
            Pick the perfect plan for you with flexible options
          </h6>
          <ul className="mt-4">
            <li className="mb-4 flex items-center">
              <IoIosCheckmarkCircleOutline size={20} className="mr-2 text-primary" />
              Unlimited talk & text
            </li>
            <li className="mb-4 flex items-center">
              <IoIosCheckmarkCircleOutline size={20} className="mr-2 text-primary" />
              Unlimited 5G ultra wideband & 4G LTE
            </li>
            <li className="mb-4 flex items-center">
              <IoIosCheckmarkCircleOutline size={20} className="mr-2 text-primary" />
              <span className="font-title">Kfone&nbsp;</span> rewards in every month
            </li>
          </ul>
        </div>
        <div className="py-4">
          <p className="mb-10">
            Enjoy unlimited talk and text. Customers who bring their own device get free shipping
            with all orders and a free SIM.
          </p>
          <PrimaryButton text={'Shop Unlimited'} endIcon={<BsArrowRightShort size={28} />} />
        </div>
      </div>
    </section>
  );
};

export default UnlimitedPlansSection;
