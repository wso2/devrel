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

import { useAuthContext } from "@asgardeo/auth-react";
import { useState } from "react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, state } = useAuthContext();

  const handleLogout = () => {
    signOut();
  };

  const getTimeOfDay = () => {
    const date = new Date();
    const hours = date.getHours();
    let timeOfDay = "";

    if (hours < 12) {
      timeOfDay = "Morning";
    } else if (hours < 18) {
      timeOfDay = "Afternoon";
    } else {
      timeOfDay = "Evening";
    }

    return timeOfDay;
  };

  return (
    <header className="fixed mt-4 m-auto ml-3 xl:ml-5 w-11/12 xl:w-3/4 shadow-lg bg-white items-center h-16 rounded-lg z-[999]">
      <div className="flex h-full px-3">
        <div className="justify-between items-center pl-2 flex w-full lg:max-w-68 sm:pr-2 sm:ml-0">
          {state?.displayName && state?.displayName.split(" ") && (
            <h1 className="text-xl font-semibold text-slate-700">
              Good {getTimeOfDay()}, {state?.displayName.split(" ")[0]}
            </h1>
          )}

          <div className="relative">
            <button
              id="dropdownDefault"
              data-dropdown-toggle="dropdown"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="45px"
                height="45px"
                viewBox="0 0 64 64"
                version="1.1"
              >
                <circle
                  fill="#E60000"
                  width="64"
                  height="64"
                  cx="32"
                  cy="32"
                  r="32"
                />
                <text
                  x="50%"
                  y="50%"
                  style={{
                    color: "#ffffff",
                    lineHeight: "1",
                  }}
                  alignment-baseline="middle"
                  text-anchor="middle"
                  font-size="26"
                  font-weight="400"
                  dy=".1em"
                  dominant-baseline="middle"
                  fill="#ffffff"
                >
                  {/* @ts-ignore - false positive type checking */}
                  {state?.displayName?.split(" ") && (state?.displayName.split(" ").shift().charAt(0) + state?.displayName.split(" ").pop().charAt(0)).toUpperCase()}
                </text>
              </svg>
            </button>

            {isOpen && (
              <div
                id="dropdown"
                className=" absolute right-1 z-10 w-44 bg-white rounded-lg divide-y divide-gray-100 shadow"
              >
                <ul
                  className="py-1 text-sm text-gray-700"
                  aria-labelledby="dropdownDefault"
                >
                  <li>
                    <span
                      onClick={handleLogout}
                      className="block py-2 px-4 hover:bg-gray-100 cursor-pointer"
                    >
                      Sign out
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
