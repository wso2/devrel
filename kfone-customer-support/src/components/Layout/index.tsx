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

import SideBar from "../../components/SideBar";
import Header from "../Header";

const Layout = ({ children }: any) => {
  return (
    <div className="font-body text-base font-normal bg-gray-50 text-slate-500">
      <SideBar />
      <div className="xl:ml-[250px] min-h-screen">
        <Header />
        <div className="pt-28 container mx-auto px-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
