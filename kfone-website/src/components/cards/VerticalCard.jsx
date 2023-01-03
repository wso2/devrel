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

const VerticalCard = (props) => {
  const { title, subTitle, image, description, action, styles } = props;
  return (
    <div className={`flex flex-col items-center justify-between ${styles}`}>
      <div className="py-2 text-center">
        <h1 className="font-light text-lg">{title}</h1>
        <h4 className="font-thin">{subTitle}</h4>
      </div>
      <div className="p-2 my-2">
        <img className="h-72" src={image} alt="card image" />
      </div>
      <div className="p-4">
        <p className="font-light text-sm">{description}</p>
        {action}
      </div>
    </div>
  );
};

export default VerticalCard;
