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
