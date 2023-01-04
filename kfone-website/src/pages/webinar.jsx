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

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HiMenuAlt3 } from 'react-icons/hi';
import { GiCrossedAirFlows } from 'react-icons/gi';
import { GrClose } from 'react-icons/gr';
import Footer from '../layouts/Footer';
import WebinarForm from '../layouts/user-interactions/forms/webinar-form';
import { validateEmail } from '../utils';

const WebinarRegisterPage = () => {
  const params = new URLSearchParams(useLocation().search);

  const [email, setEmail] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useState(() => {
    window.scroll(0, 0);

    let ref = '';
    let decodedValue = '';

    if (params.has('ref')) {
      ref = params.get('ref');
      try {
        decodedValue = atob(ref);
      } catch (error) {
        console.log(error.message);
      }
      if (validateEmail(decodedValue)) {
        setEmail(decodedValue);
      }
    }
  }, []);

  const handleNavMenuButton = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <div className="min-h-screen font-body text-black scroll-smooth">
      <nav className="flex justify-between items-center h-20 px-6 max-w-[1440px] mx-auto">
        <div className="flex justify-start items-center">
          <h1 className="flex items-center w-full text-primary text-3xl font-title">
            <GiCrossedAirFlows size={56} />
            <div className="ml-2 flex flex-col justify-start">
              <div>Kfone</div>
              <div className="font-display font-medium text-secondary text-sm">Enterprise</div>
            </div>
          </h1>
          <ul className="hidden md:flex ml-4">
            <li className="px-4">Products</li>
            <li className="px-4">Services</li>
            <li className="px-4">Support</li>
          </ul>
        </div>
        <ul className="flex justify-end items-center">
          {/* <li className="px-4">
            <RoundedIconButton icon={<AiOutlineLogin />} text="Sign in" />
          </li> */}
          <li onClick={handleNavMenuButton} className="text-secondary block md:hidden">
            {mobileNavOpen ? <GrClose size={24} /> : <HiMenuAlt3 size={24} />}
          </li>
        </ul>
        <div
          className={
            mobileNavOpen
              ? 'fixed left-0 top-0 w-[60%] h-full bg-secondary text-white ease-in-out duration-500'
              : 'fixed left-[-100%]'
          }>
          <h1 className="flex items-center w-full text-white text-3xl font-title m-4">
            <GiCrossedAirFlows size={56} />
            <div className="ml-2 flex flex-col justify-start">
              <div>Kfone</div>
              <div className="font-display font-medium text-secondary-100 text-sm">Enterprise</div>
            </div>
          </h1>
          <ul className="p-4">
            <li className="p-4">Products</li>
            <li className="p-4">Services</li>
            <li className="p-4">Support</li>
          </ul>
        </div>
      </nav>
      <div className="p-6 space-y-8">
        <main>
          <div className="container mx-auto space-y-16">
            <section className="mt-16">
              <span className="block mb-2 text-xs font-medium tracking-widest uppercase lg:text-center text-secondary-900">
                Grow Your Business with <span className="font-title">Kfone</span> • Exclusive
                Webinar Series
              </span>
              <h2 className="text-4xl lg:text-center text-secondary-700">
                Register Now for Upcoming Webinar!
              </h2>
            </section>
            <WebinarForm closeModal={() => {}} encodedEmail={email} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default WebinarRegisterPage;
