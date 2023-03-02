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

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { AsgardeoAuthException, useAuthContext } from "@asgardeo/auth-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FcCancel, FcOk } from "react-icons/fc";
import Layout from "../../components/Layout";
import Loader from "../../components/Loader";
import { PastBillingCycle, UserInfo } from "./types";

ChartJS.register(ArcElement, Tooltip, Legend);

// Create our number formatter.
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const CustomerInfo = () => {
  const { state, signIn, getDecodedIDPIDToken, httpRequest } = useAuthContext();
  const query = new URLSearchParams(useLocation().search);
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [isUserInfoLoading, setIsUserInfoLoading] = useState<boolean>(false);
  const [isUserInfoError, setIsUserInfoError] = useState<boolean>();
  const [mobileNumber, setMobileNumber] = useState<string>();
  const [billingHistory, setBillingHistory] = useState<PastBillingCycle[]>();

  const dataUsageData = useMemo(() => {
    if (
      !userInfo?.subscriptionUsage?.usage ||
      !userInfo?.subscriptionUsage?.usage[0]
    ) {
      return {};
    }

    return {
      labels: ["Used", "Remaining"],
      datasets: [
        {
          label: "Data Usage",
          data: [
            userInfo?.subscriptionUsage?.usage[0].allocatedDataUsage,
            (userInfo?.subscriptionUsage?.subscription?.freeDataGB ?? 0) -
              (userInfo?.subscriptionUsage?.usage[0].allocatedDataUsage ?? 0),
          ],
          backgroundColor: ["rgb(230, 0, 0)", "rgb(101, 143, 241)"],
          hoverOffset: 4,
        },
      ],
    };
  }, [userInfo]);

  const callUsageData = useMemo(() => {
    if (
      !userInfo?.subscriptionUsage?.usage ||
      !userInfo?.subscriptionUsage?.usage[0]
    ) {
      return {};
    }

    return {
      labels: ["Used", "Remaining"],
      datasets: [
        {
          label: "Call Usage",
          data: [
            userInfo?.subscriptionUsage?.usage[0].allocatedMinutesUsage,
            (userInfo?.subscriptionUsage?.subscription?.freeCallMinutes ?? 0) -
              (userInfo?.subscriptionUsage?.usage[0].allocatedMinutesUsage ??
                0),
          ],
          backgroundColor: ["rgb(230, 0, 0)", "rgb(101, 143, 241)"],
          hoverOffset: 4,
        },
      ],
    };
  }, [userInfo]);

  const retrieveUserInfo = async () => {
    try {
      setIsUserInfoLoading(true);
      setIsUserInfoError(false);
      const res = await httpRequest({
        url: `${process.env.REACT_APP_BASE_API_ENDPOINT}/kfone-customer-360/1.0.0/customer?mobile=${mobileNumber}`,
      });
      setUserInfo(res?.data);
      setBillingHistory(res?.data?.billingData?.pastBillingCycles?.reverse());
      setIsUserInfoLoading(false);
    } catch (error) {
      setIsUserInfoLoading(false);
      setIsUserInfoError(true);
      // Temp fix when token gets expired
      // @ts-ignore
      if (error?.response?.status === 401) {
        // Temp fix when token gets expired
        sessionStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <>
      {state.isAuthenticated && !state.isLoading ? (
        <Layout>
          <div className="mt-3 mb-10">
            <label className="mb-2 text-sm font-medium text-gray-900 sr-only">
              Search
            </label>

            <div className="relative">
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 text-gray-500 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search via mobile"
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
              <button
                className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                onClick={retrieveUserInfo}
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
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-wrap">
            {isUserInfoLoading && (
              <div className="absolute right-1/2 bottom-1/2  transform translate-x-1/2 translate-y-1/2 ">
                <div className="border-t-transparent border-primary animate-spin  rounded-full border-blue-400 border-8 h-48 w-48"></div>
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
                Invalid Home, Mobile or Coporate Connection
              </div>
            ) : userInfo ? (
              <>
                {userInfo?.connectionStatus && (
                  <div className="w-full md:w-1/2 lg:w-1/3 pr-4 pb-4">
                    <div className="shadow-lg rounded-lg p-4 bg-white w-full">
                      <div className="flex justify-between mb-6">
                        <div className="flex items-center">
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-black ml-2">
                              Connection Status
                            </span>
                            {(userInfo?.connectionStatus?.status).toUpperCase() ===
                            "ACTIVE" ? (
                              <div className="rounded-lg border border-green-600 bg-white m-3 p-2 w-2/3">
                                <div className="flex m-auto">
                                  <p className="text-xl font-bold text-green-600 mr-1">
                                    Active
                                  </p>
                                  <FcOk size={25} />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="rounded-lg border border-red-600 bg-white m-3 p-2">
                                  <div className="flex m-auto">
                                    <p className="text-xl font-bold text-red-600 mr-1">
                                      Inactive
                                    </p>
                                    <FcCancel size={25} />
                                  </div>
                                </div>

                                <span className="text-red-600 text-sm">
                                  Reason: {userInfo?.connectionStatus?.reason}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userInfo?.personalDetails && (
                  <div className="w-full md:w-1/2 lg:w-1/3 pr-4 pb-4">
                    <div className="shadow-lg rounded-lg p-4 bg-white w-full">
                      <div className="flex justify-between mb-6">
                        <div className="flex items-center">
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-black ml-2">
                              Customer Information
                            </span>
                            {userInfo?.personalDetails?.phoneNumbers?.length >
                              0 && (
                              <span className="mt-4 text-sm text-gray-500 ml-2">
                                Mobile Number :{" "}
                                {
                                  userInfo?.personalDetails?.phoneNumbers[0]
                                    ?.value
                                }
                              </span>
                            )}
                            <span className="mt-2 text-sm text-gray-500 ml-2">
                              Name :{" "}
                              {`${userInfo?.personalDetails?.name?.givenName} ${userInfo?.personalDetails?.name?.familyName}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userInfo?.billingData?.currentBillingCycle && (
                  <div className="w-full max-w-full mb-4 pr-3 lg:w-1/3 lg:flex-none">
                    <div className="shadow-lg rounded-lg p-4 bg-white relative overflow-hidden">
                      <p className="text-gray-800 text-lg font-medium mb-2">
                        Billing
                      </p>
                      <div className="flex justify-between mt-4">
                        <p className="text-sm text-gray-500">Outstanding</p>
                        <p className="text-primary text-sm font-medium">
                          {currency.format(
                            userInfo?.billingData?.currentBillingCycle?.amount
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-gray-500">Billing month</p>
                        <p className="ext-gray-500 text-sm font-medium">
                          {userInfo?.billingData?.currentBillingCycle?.month}
                        </p>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="ext-gray-500 text-sm font-medium">
                          {userInfo?.billingData?.currentBillingCycle?.due}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="w-full md:w-1/2 lg:w-1/3 pr-4 pb-4">
                  <div className="shadow-lg rounded-lg p-4 bg-white relative overflow-hidden">
                    <p className="text-gray-800 text-lg font-bold mb-2">
                      Data Usage
                    </p>
                    {userInfo?.subscriptionUsage?.usage &&
                    userInfo?.subscriptionUsage?.usage[0] &&
                    userInfo?.subscriptionUsage?.usage[0].allocatedDataUsage ? (
                      <>
                        <p className="text-gray-500 text-md font-base my-4">
                          <span className="font-medium">
                            {`${userInfo?.subscriptionUsage?.usage[0].allocatedDataUsage} GB`}
                          </span>{" "}
                          used of{" "}
                          <span className="font-medium">
                            {`${userInfo?.subscriptionUsage?.subscription?.freeDataGB} GB`}
                          </span>
                        </p>
                        <div className="px-8">
                          {/* @ts-ignore */}
                          {userInfo && <Doughnut data={dataUsageData} />}
                        </div>
                      </>
                    ) : (
                      <span className="font-medium">
                        No data packages are activated
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-1/2 lg:w-1/3 pr-4 pb-4">
                  <div className="shadow-lg rounded-lg p-4 bg-white relative overflow-hidden">
                    <p className="text-gray-800 text-lg font-bold mb-2">
                      Call Usage
                    </p>
                    {userInfo?.subscriptionUsage?.usage &&
                    userInfo?.subscriptionUsage?.usage[0] &&
                    userInfo?.subscriptionUsage?.usage[0]
                      .allocatedMinutesUsage ? (
                      <>
                        <p className="text-gray-500 text-md font-base my-4">
                          <span className="font-medium">
                            {`${userInfo?.subscriptionUsage?.usage[0].allocatedMinutesUsage} Mins`}
                          </span>{" "}
                          used of{" "}
                          <span className="font-medium">
                            {`${userInfo?.subscriptionUsage?.subscription?.freeCallMinutes} Mins`}
                          </span>
                        </p>
                        <div className="px-8">
                          <Doughnut data={callUsageData as any} />
                        </div>
                      </>
                    ) : (
                      <span className="font-medium">
                        No voice packages are activated
                      </span>
                    )}
                  </div>
                </div>

                {userInfo?.billingData?.pastBillingCycles?.length > 0 && (
                  <div className="w-full md:w-1/2 lg:w-1/3 pr-4 pb-4">
                    <div className="relative flex flex-col h-full min-w-0 break-words bg-white border-0 border-transparent border-solid shadow-xl rounded-lg bg-clip-border">
                      <div className="p-4 pb-0 mb-0 border-b-0 border-b-solid rounded-t-2xl border-b-transparent">
                        <div className="flex flex-wrap -mx-3">
                          <div className="flex items-center flex-none w-1/2 max-w-full px-3">
                            <span className="font-bold text-lg text-black ml-2">
                              Billing History
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-auto p-4 pb-0">
                        <ul className="flex flex-col pl-0 mb-0 rounded-lg">
                          {billingHistory &&
                            billingHistory.map((billingRecord, index) => (
                              // TODO: add random key over the index
                              <li key={index} className="relative flex justify-between px-4 py-2 pl-0 mb-2 border-0 rounded-t-inherit text-inherit rounded-lg">
                                <div className="flex flex-col">
                                  <h6 className="mb-1 text-sm font-semibold leading-normal text-slate-700">
                                    {`${billingRecord?.month} / ${billingRecord?.year}`}
                                  </h6>
                                  <span className="text-xs leading-tight">
                                    {billingRecord?.status}
                                  </span>
                                </div>
                                <div
                                  className={`flex items-center text-sm leading-normal ${
                                    billingRecord?.status === "PENDING"
                                      ? "text-primary"
                                      : ""
                                  }`}
                                >
                                  {currency.format(billingRecord?.amount)}
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </Layout>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default CustomerInfo;
