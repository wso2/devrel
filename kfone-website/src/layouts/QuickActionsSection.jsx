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
import { GiAerialSignal } from 'react-icons/gi';
import { BsPhone, BsWifi, BsTv } from 'react-icons/bs';
import QuickActionCard from '../components/cards/QuickActionCard';

const QuickActionsSection = () => {
  return (
    <section className="flex justify-center mx-2 mb-[-48px] relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center bg-secondary rounded-lg text-center text-white p-4 w-full md:w-[75%]">
        <QuickActionCard>
          <BsPhone size={30} />
          <p>Phones & devices</p>
        </QuickActionCard>
        <QuickActionCard>
          <BsWifi size={30} />
          <p>Wireless</p>
        </QuickActionCard>
        <QuickActionCard>
          <GiAerialSignal size={30} />
          <p>Internet</p>
        </QuickActionCard>
        <QuickActionCard>
          <BsTv size={30} />
          <p>TV</p>
        </QuickActionCard>
      </div>
    </section>
  );
};

export default QuickActionsSection;
