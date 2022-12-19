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
import ErrorTemplate from '../templates/ErrorTemplate';

const NotFoundErrorPage = () => {
  return (
    <ErrorTemplate>
      <h1 className="text-6xl font-extrabold mb-2">4&nbsp;0&nbsp;4</h1>
      <h4 className="text-4xl font-light mb-4">Page not found.</h4>
    </ErrorTemplate>
  );
};

export default NotFoundErrorPage;
