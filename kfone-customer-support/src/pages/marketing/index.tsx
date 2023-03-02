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
import { IoIosArrowForward } from "react-icons/io";
import Layout from "../../components/Layout";
import Loader from "../../components/Loader";
import Button from "../../components/Button";

type Category = {
  id: string;
  name: string;
};

type User = {
  email: string;
  smartphoneVisits: number;
  iotDevicesVisits: number;
  mobileSubscriptionVisits: number;
  tvSubscriptionVisits: number;
  interactionScore: number;
};

const marketingTableHeaderTitles: string[] = [
  "Email",
  "Smartphone Visits",
  "IOT Devices Visits",
  "Mobile Subscription Visits",
  "TV Subscription Visits",
  "Interaction Score",
];

const categories: Category[] = [
  { id: "smartphone_visits", name: "Smartphone Visits" },
  { id: "iot_devices_visits", name: "IOT Device Visits" },
  { id: "mobile_subscription_visits", name: "Mobile Subscription Visits" },
  { id: "tv_subscription_visits", name: "TV subscription Visits" },
];

const Marketing = () => {
  const { state, httpRequest } = useAuthContext();
  const [userInfo, setUserInfo] = useState<User[]>();
  const [isUserInfoLoading, setIsUserInfoLoading] = useState<boolean>(false);
  const [isUserInfoError, setIsUserInfoError] = useState<boolean>();
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [isAllUsersChecked, setIsAllUsersChecked] = useState<boolean>();
  const [checkedState, setCheckedState] = useState(new Array<boolean>().fill(true));
  const [isSentEmail, setIsSentEmail] = useState(false);

  const retrieveInteractions = async () => {
    try {
      setIsUserInfoLoading(true);
      setIsUserInfoError(false);
      const res = await httpRequest({
        url: `${process.env.REACT_APP_BASE_API_ENDPOINT}/user-interactions-api/1.0.0/interactionsByCategory?category=${selectedCategory?.id}`,
      });
      setUserInfo(res?.data);
      setCheckedState(new Array(res?.data?.length).fill(true));
      setIsUserInfoLoading(false);
      setIsAllUsersChecked(true);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        // Temp fix when token gets expired
        sessionStorage.clear();
        window.location.reload();
      }
      setIsUserInfoLoading(false);
      setIsUserInfoError(true);
    }
  };

  const sendEmail = async () => {
    let audience: User[] = [];
    checkedState.map((item, index) => {
      if (item === true && userInfo) {
        const user = userInfo[index];
        user && audience.push(user);
      }
    });

    // Send marketing email
    const audienceEmails = audience.map(
      (user) => `emails=${encodeURIComponent(user.email)}`
    );
    const emailsQueryString = audienceEmails.join("&");

    await httpRequest({
      url: `${process.env.REACT_APP_BASE_API_ENDPOINT}/marketing-campaign-api-2/1.0.0/sendMarketingMail?${emailsQueryString}`,
      method: "POST",
    });

    setIsSentEmail(true);
    setTimeout(() => setIsSentEmail(false), 3000);
  };

  const handleOnChange = (position: number) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);

    let checkedCounter = 0;
    updatedCheckedState.map((checkBoxValue) => {
      if (checkBoxValue === true) {
        checkedCounter += 1;
      }
    });

    setIsAllUsersChecked(checkedCounter === userInfo?.length);
  };

  return (
    <>
      {state.isAuthenticated && !state.isLoading ? (
        <Layout>
          <div className="mt-3 mb-10">
            <div className="flex justify-between">
              <div className="flex">
                <div className="relative inline-block text-left w-58 mr-5">
                  <button
                    type="button"
                    className="inline-flex w-60 justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() =>
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                    }
                  >
                    {selectedCategory?.name ?? "Select the interested area"}
                    <svg
                      className="-mr-1 ml-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>

                  {isCategoryDropdownOpen && (
                    <div
                      className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="menu-button"
                    >
                      <div className="py-1" role="none">
                        {categories.map((category) => (
                          <span
                            key={category.id}
                            className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setIsCategoryDropdownOpen(false);
                              setSelectedCategory(category);
                            }}
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  classNames="right-2.5 bottom-2.5"
                  isDisabled={false}
                  onButtonClick={retrieveInteractions}
                >
                  {isUserInfoLoading && (
                    <svg
                      role="status"
                      className="inline mr-3 w-4 h-4 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  Search Users
                </Button>
              </div>

              <Button
                isDisabled={isUserInfoLoading || isUserInfoError || !userInfo}
                onButtonClick={sendEmail}
              >
                Send Email <IoIosArrowForward size={20} />
              </Button>
            </div>
          </div>

          {isUserInfoLoading && (
            <div className="absolute right-1/2 bottom-1/2  transform translate-x-1/2 translate-y-1/2 ">
              <div className="border-t-transparent border-primary animate-spin  rounded-full border-blue-400 border-8 h-48 w-48"></div>
            </div>
          )}

          {isSentEmail && (
            <div
              className="absolute right-5 bottom-10 flex items-center p-4 space-x-4 w-full max-w-xs text-gray-500 bg-white 
            rounded-lg divide-x divide-gray-500 shadow-lg 
            space-x"
              role="alert"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-blue-600"
                focusable="false"
                data-prefix="fas"
                data-icon="paper-plane"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M511.6 36.86l-64 415.1c-1.5 9.734-7.375 18.22-15.97 23.05c-4.844 2.719-10.27 4.097-15.68 4.097c-4.188 0-8.319-.8154-12.29-2.472l-122.6-51.1l-50.86 76.29C226.3 508.5 219.8 512 212.8 512C201.3 512 192 502.7 192 491.2v-96.18c0-7.115 2.372-14.03 6.742-19.64L416 96l-293.7 264.3L19.69 317.5C8.438 312.8 .8125 302.2 .0625 289.1s5.469-23.72 16.06-29.77l448-255.1c10.69-6.109 23.88-5.547 34 1.406S513.5 24.72 511.6 36.86z"
                ></path>
              </svg>
              <div className="pl-4 text-sm font-normal">
                Emails sent successfully.
              </div>
            </div>
          )}

          {isUserInfoError ? (
            <div
              className="bg-red-100 rounded-lg py-5 px-6 mb-3 text-base text-red-700 inline-flex items-center w-full"
              role="alert"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="times-circle"
                className="w-4 h-4 mr-2 fill-current"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"
                ></path>
              </svg>
              {`Couldn't find any customers with interests to ${selectedCategory?.name}`}
            </div>
          ) : (
            !isUserInfoLoading &&
            userInfo &&
            userInfo?.length > 0 && (
              <div className="flex flex-col">
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden ">
                      <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="p-4">
                              <div className="flex items-center">
                                <input
                                  id="checkbox-all"
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                                  checked={isAllUsersChecked}
                                  onChange={() => {
                                    setIsAllUsersChecked(!isAllUsersChecked);

                                    setCheckedState(
                                      new Array(userInfo.length).fill(
                                        !isAllUsersChecked
                                      )
                                    );
                                  }}
                                />
                                <label className="sr-only">checkbox</label>
                              </div>
                            </th>
                            {marketingTableHeaderTitles.map((headerTitle) => (
                              <th
                                scope="col"
                                className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase"
                              >
                                {headerTitle}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userInfo &&
                            userInfo.map((user, index) => (
                              <tr className="hover:bg-gray-100">
                                <td className="p-4 w-4">
                                  <div className="flex items-center">
                                    <input
                                      id="checkbox-table-1"
                                      type="checkbox"
                                      className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                                      checked={checkedState[index]}
                                      onChange={() => handleOnChange(index)}
                                    />
                                    <label className="sr-only">checkbox</label>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {user?.email}
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap">
                                  {user?.smartphoneVisits}
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {user?.iotDevicesVisits}
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {user?.mobileSubscriptionVisits}
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {user?.tvSubscriptionVisits}
                                </td>
                                <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  {user?.interactionScore}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </Layout>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Marketing;
