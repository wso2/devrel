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

import { Link, useLocation } from 'react-router-dom'

const SideBarMenuItem = ({ menuItem }: any) => {
  const location = useLocation();

  return (
    <>
      <li className="mt-0.5 w-full">
        <Link
          className={`p-3 bg-blue-500/13 text-md
            ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap rounded-lg 
            px-4 transition-colors
                  ${menuItem?.url === location?.pathname ? "bg-slate-200 font-semibold text-slate-700" : "font-base text-slate-700"}`}
          to={menuItem?.url}
        >
          <div className="xl:p-2">{menuItem?.icon}</div>
          <span>{menuItem?.name}</span>
        </Link>
      </li>
    </>
  );
};

export default SideBarMenuItem;
