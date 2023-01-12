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

import { GiCrossedAirFlows } from "react-icons/gi";
import {
  FcComboChart,
  FcManager,
  FcViewDetails,
  FcSalesPerformance,
  FcPortraitMode,
  FcBusinessman
} from "react-icons/fc";
import SideBarMenuItem from "../SideBarMenuItem";

const personalMenuItems = [
  { name: "Dashboard", icon: <FcComboChart size={20} />, url: "/" },
  { name: "Cases", icon: <FcViewDetails size={20} />, url: "/cases" },
  {
    name: "Customers",
    icon: <FcManager size={20} />,
    url: "/customers",
  },
  {
    name: "Marketing",
    icon: <FcSalesPerformance size={20} />,
    url: "/marketing",
  }
];

const enterpriseMenuItems = [
  {
    name: "Prospects",
    icon: <FcPortraitMode size={20} />,
    url: "/prospects",
  },
  {
    name: "Customers",
    icon: <FcBusinessman size={20} />,
    url: "",
  }
];

const SideBar = () => {
  return (
    <div
      className="w-[250px] fixed inset-y-0 antialiased transition-transform duration-200 -translate-x-full xl:translate-x-0 bg-white shadow-xl z-990"
      aria-expanded="false"
    >
      <div className="h-20 flex justify-center items-center bg-secondary-800">
        <h1 className="flex justify-center items-center w-full text-primary text-3xl font-title">
          <GiCrossedAirFlows size={56} />
          <div className="ml-2 flex flex-col justify-start">
            <div>Kfone</div>
            <div className="font-display font-medium  text-gray-50 text-sm">Customer Support Portal</div>
          </div>
        </h1>
      </div>

      <div className="divider text-sm pt-8">Personal</div> 
      <ul className="flex flex-col">
        {personalMenuItems.map((menuItem) => (
          <SideBarMenuItem key={menuItem?.name} menuItem={menuItem} />
        ))}
      </ul>
      <div className="divider text-sm">Enterprise</div> 
      <ul className="flex flex-col">
        {enterpriseMenuItems.map((menuItem) => (
          <SideBarMenuItem key={menuItem?.name} menuItem={menuItem} />
        ))}
      </ul>
    </div>
  );
};

export default SideBar;
