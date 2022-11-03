import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { useHistory } from 'react-router-dom';
import CustomerPortal from '../../templates/CustomerPortal';
import { BsCheck } from 'react-icons/bs';
import { getUsageData, getPackageRecommendation } from '../../api';
import { getMonthString } from '../../utils';
import { SectionLoader as Loader } from './SectionLoader';

const currentYear = new Date().getFullYear();

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0
});

const MyPlan = () => {
  const history = useHistory();
  const { state, getBasicUserInfo, getIDToken, getDecodedIDToken, httpRequest } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState();
  const [usage, setUsage] = useState();
  const [currentUsage, setCurrentUsage] = useState();
  const [decodedIDTokenPayload, setDecodedIDTokenPayload] = useState();
  const [recommendation, setRecommendation] = useState();
  const [activeDataTab, setActiveDataTab] = useState(1);
  const [activeTalkTab, setActiveTalkTab] = useState(1);
  const [activeUsageTab, setActiveUsageTab] = useState(1);

  useEffect(() => {
    if (!state?.isAuthenticated) {
      return;
    }

    (async () => {
      const basicUserInfo = await getBasicUserInfo();
      const idToken = await getIDToken();
      const decodedIDToken = await getDecodedIDToken();

      const derivedState = {
        authenticateResponse: basicUserInfo,
        idToken: idToken?.split('.'),
        decodedIdTokenHeader: JSON.parse(atob(idToken?.split('.')[0])),
        decodedIDTokenPayload: decodedIDToken
      };

      if (decodedIDToken?.mobileNumberVerified) {
        sessionStorage.setItem('verified', true);
      }

      console.log(derivedState);
      setDecodedIDTokenPayload(decodedIDToken);
    })();
  }, [state.isAuthenticated]);

  useEffect(() => {
    if (!decodedIDTokenPayload) {
      return;
    }

    if (!sessionStorage.getItem('verified')) {
      history.push('/my-kfone/verify', decodedIDTokenPayload);
      return;
    }

    getUsageData(decodedIDTokenPayload?.userid || decodedIDTokenPayload?.sub, httpRequest)
      .then((data) => {
        setCurrentPlan(data?.data?.subscription);
        setUsage(data?.data?.usage?.reverse());
        data?.data?.usage?.length > 0 && setCurrentUsage(data?.data?.usage[0]);
      })
      .catch(() => {
        const data = {
          userId: '4f833566-6758-4f5a-b43f-31d7d9b0b87f',
          subscription: {
            id: 2,
            price: 120,
            connectionType: 'postpaid',
            freeCallMinutes: 150,
            freeDataGB: 60,
            name: 'Kfone Lite'
          },
          usage: [
            {
              month: 10,
              year: 2022,
              allocatedMinutesUsage: 0,
              allocatedDataUsage: 0,
              additionalPurchases: []
            }
          ]
        };

        setCurrentPlan(data?.subscription);
        setUsage(data?.usage);
        data?.usage?.length > 0 && setCurrentUsage(data?.usage[data?.usage?.length - 1]);
      })
      .finally(() => {
        setLoading(false);
      });

    getPackageRecommendation(
      decodedIDTokenPayload?.userid || decodedIDTokenPayload?.sub,
      httpRequest
    )
      .then((data) => {
        setRecommendation(data.recommendation);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [decodedIDTokenPayload]);

  const renderPlanRecommendation = (recommendation) => {
    if (!recommendation) {
      return null;
    }

    return (
      <div
        id="alert-additional-content-5"
        className="bg-blue-100 p-4 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
        role="alert">
        <div className="flex items-center">
          <svg
            aria-hidden="true"
            className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"></path>
          </svg>
          <span className="sr-only">Info</span>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            It&apos;s time to upgrade!
          </h3>
        </div>
        <div className="mt-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
          We believe that you could benefit from a plan upgrade since you&apos;ve exceeded the
          existing plan thresholds continuously during past couple of months.
        </div>
        <div>
          <span className="font-small">
            We recommend the following {recommendation.name} package:
          </span>
          <ul className="mt-1.5 ml-4 text-gray-500 list-disc list-inside text-sm">
            <li>Free Talk Time Minutes: {recommendation.freeCallMinutes}</li>
            <li>Free Data: {recommendation.freeDataGB} GB</li>
            <li>Connection Type: {recommendation.connectionType}</li>
            <li>Price: {currency.format(recommendation.price)}</li>
          </ul>
        </div>
        <div className="flex mt-6">
          <button
            type="button"
            className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium text-sm rounded-lg px-3 py-1.5 mr-2 text-center inline-flex items-center dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-600">
            Upgrade
          </button>
        </div>
      </div>
    );
  };

  const renderPlanContent = () => (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:gap-4 my-4">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8">
          <h3 className="text-xl leading-none font-bold text-gray-900 mb-10">My Plan</h3>
          {currentPlan ? (
            <>
              <div className="p-4">
                <div className="flex items-baseline font-light w-full">
                  <h1 className="text-4xl text-primary">{currentPlan?.name}</h1>
                  <h6 className="mx-2 py-1 px-2 bg-primary text-light rounded-lg text-[8px]">
                    {currentPlan?.connectionType}
                  </h6>
                </div>
                <table className="items-center bg-transparent border-collapse w-full">
                  <tbody className="divide-y divide-gray-100">
                    <tr className="text-gray-500">
                      <th className="border-t-0 px-4 align-middle text-sm font-normal whitespace-nowrap p-4 text-left">
                        <BsCheck className="inline text-emerald-400 mr-2" size={24} />
                        {currentPlan?.freeDataGB} GB, high speed anytime data
                      </th>
                    </tr>
                    <tr className="text-gray-500">
                      <th className="border-t-0 px-4 align-middle text-sm font-normal whitespace-nowrap p-4 text-left">
                        <BsCheck className="inline text-emerald-400 mr-2" size={24} />
                        {currentPlan?.freeCallMinutes} minutes of standard national calls
                      </th>
                    </tr>
                    <tr className="text-gray-500">
                      <th className="border-t-0 px-4 align-middle text-sm font-normal whitespace-nowrap p-4 text-left">
                        <BsCheck className="inline text-emerald-400 mr-2" size={24} />
                        Monthly plan charge {currency.format(currentPlan?.price)}
                      </th>
                    </tr>
                  </tbody>
                </table>
              </div>
              {renderPlanRecommendation(recommendation)}
            </>
          ) : (
            <Loader />
          )}
        </div>
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8">
          <div id="usage-main-tab" className="tabs">
            <button
              className={`tab tab-bordered w-[50%] ${activeUsageTab === 1 ? 'tab-active' : ''}`}
              onClick={() => handleUsageTabNav(1)}>
              <span
                className={`text-xl font-bold${
                  activeUsageTab === 1 ? 'text-black' : 'text-slate-400'
                }`}>
                Data Usage
              </span>
            </button>
            <button
              className={`tab tab-bordered w-[50%] ${activeUsageTab === 2 ? 'tab-active' : ''}`}
              onClick={() => handleUsageTabNav(2)}>
              <span
                className={`text-xl font-bold${
                  activeUsageTab === 2 ? 'text-black' : 'text-slate-400'
                }`}>
                Talk Time Usage
              </span>
            </button>
          </div>
          {activeUsageTab === 1 ? (
            <div className="p-4 sm:p-6 xl:p-8 h-full">
              {currentUsage ? (
                <>
                  <div id="data-tab" className="tabs tabs-boxed">
                    <button
                      className={`tab w-[50%] ${
                        activeDataTab === 1 ? 'tab-active bg-teal-500' : ''
                      }`}
                      onClick={() => handleDataTabNav(1)}>
                      <span className={`text-sm ${activeDataTab === 1 ? 'text-light' : ''}`}>
                        Data Bundle
                      </span>
                    </button>
                    <button
                      className={`tab w-[50%] ${
                        activeDataTab === 2 ? 'tab-active bg-teal-500' : ''
                      }`}
                      onClick={() => handleDataTabNav(2)}>
                      <span className={`text-sm ${activeDataTab === 2 ? 'text-light' : ''}`}>
                        Additional Data
                      </span>
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-evenly p-4 lg:p-8 space-y-4  h-full">
                    <div
                      className="radial-progress text-teal-400 shadow-md"
                      style={{
                        '--value': `${
                          activeDataTab === 1
                            ? currentPlan?.freeDataGB !== 0
                              ? Number(
                                  (
                                    ((currentPlan?.freeDataGB - currentUsage?.allocatedDataUsage) /
                                      currentPlan?.freeDataGB) *
                                    100
                                  ).toFixed()
                                )
                              : 0
                            : currentUsage?.additionalPurchases?.length > 0
                            ? currentUsage?.additionalPurchases[0]?.additionalData !== 0
                              ? Number(
                                  (
                                    ((currentUsage?.additionalPurchases[0]?.additionalData -
                                      currentUsage?.additionalPurchases[0]?.additionalDataUsage) /
                                      currentUsage?.additionalPurchases[0]?.additionalData) *
                                    100
                                  ).toFixed()
                                )
                              : 0
                            : 0
                        }`,
                        '--size': '12rem',
                        '--thickness': '1rem'
                      }}>
                      <span className="text-4xl font-extralight text-slate-500">
                        {activeDataTab === 1
                          ? currentPlan?.freeDataGB !== 0
                            ? Number(
                                (
                                  ((currentPlan?.freeDataGB - currentUsage?.allocatedDataUsage) /
                                    currentPlan?.freeDataGB) *
                                  100
                                ).toFixed()
                              )
                            : 0
                          : currentUsage?.additionalPurchases?.length > 0
                          ? currentUsage?.additionalPurchases[0]?.additionalData !== 0
                            ? Number(
                                (
                                  ((currentUsage?.additionalPurchases[0]?.additionalData -
                                    currentUsage?.additionalPurchases[0]?.additionalDataUsage) /
                                    currentUsage?.additionalPurchases[0]?.additionalData) *
                                  100
                                ).toFixed()
                              )
                            : 0
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl font-semibold">
                        {activeDataTab === 1
                          ? Number(currentPlan?.freeDataGB - currentUsage?.allocatedDataUsage)
                          : currentUsage?.additionalPurchases?.length > 0
                          ? currentUsage?.additionalPurchases[0].additionalData -
                            currentUsage?.additionalPurchases[0].additionalDataUsage
                          : 0}
                      </span>
                      /
                      {activeDataTab === 1
                        ? Number(currentPlan?.freeDataGB)
                        : currentUsage?.additionalPurchases?.length > 0
                        ? currentUsage?.additionalPurchases[0].additionalData
                        : 0}
                      GB remaining
                      <br />
                      <span className="text-sm font-light">
                        as of {new Date().toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <Loader />
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-6 xl:p-8 h-full">
              {currentUsage ? (
                <>
                  <div id="talk-tab" className="tabs tabs-boxed">
                    <button
                      className={`tab w-[50%] ${
                        activeTalkTab === 1 ? 'tab-active bg-sky-500' : ''
                      }`}
                      onClick={() => handleTalkTabNav(1)}>
                      <span className={`text-sm ${activeTalkTab === 1 ? 'text-light' : ''}`}>
                        Talk Time
                      </span>
                    </button>
                    <button
                      className={`tab w-[50%] ${
                        activeTalkTab === 2 ? 'tab-active bg-sky-500' : ''
                      }`}
                      onClick={() => handleTalkTabNav(2)}>
                      <span className={`text-sm ${activeTalkTab === 2 ? 'text-light' : ''}`}>
                        Additional Talk Time
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-evenly p-4 lg:p-8 space-y-4 h-full">
                    <div
                      className="radial-progress text-sky-400 shadow-md"
                      style={{
                        '--value': `${
                          activeTalkTab === 1
                            ? currentUsage?.freeCallMinutes !== 0
                              ? Number(
                                  (
                                    ((currentPlan?.freeCallMinutes -
                                      currentUsage?.allocatedMinutesUsage) /
                                      currentPlan?.freeCallMinutes) *
                                    100
                                  ).toFixed()
                                )
                              : 0
                            : currentUsage?.additionalPurchases?.length > 0
                            ? currentUsage?.additionalPurchases[0]?.additionalMinutes !== 0
                              ? Number(
                                  (
                                    ((currentUsage?.additionalPurchases[0]?.additionalMinutes -
                                      currentUsage?.additionalPurchases[0]
                                        ?.additionalMinutesUsage) /
                                      currentUsage?.additionalPurchases[0]?.additionalMinutes) *
                                    100
                                  ).toFixed()
                                )
                              : 0
                            : 0
                        }`,
                        '--size': '12rem',
                        '--thickness': '1rem'
                      }}>
                      <span className="text-4xl font-extralight text-slate-500">
                        {activeTalkTab === 1
                          ? currentUsage?.freeCallMinutes !== 0
                            ? Number(
                                (
                                  ((currentPlan?.freeCallMinutes -
                                    currentUsage?.allocatedMinutesUsage) /
                                    currentPlan?.freeCallMinutes) *
                                  100
                                ).toFixed()
                              )
                            : 0
                          : currentUsage?.additionalPurchases?.length > 0
                          ? currentUsage?.additionalPurchases[0]?.additionalMinutes !== 0
                            ? Number(
                                (
                                  ((currentUsage?.additionalPurchases[0]?.additionalMinutes -
                                    currentUsage?.additionalPurchases[0]?.additionalMinutesUsage) /
                                    currentUsage?.additionalPurchases[0]?.additionalMinutes) *
                                  100
                                ).toFixed()
                              )
                            : 0
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl font-semibold">
                        {activeTalkTab === 1
                          ? `${currentPlan?.freeCallMinutes - currentUsage?.allocatedMinutesUsage}`
                          : currentUsage?.additionalPurchases?.length > 0
                          ? currentUsage?.additionalPurchases[0].additionalMinutes -
                            currentUsage?.additionalPurchases[0].additionalMinutesUsage
                          : 0}
                        Mins
                      </span>
                      /
                      {activeTalkTab === 1
                        ? `${currentPlan?.freeCallMinutes}`
                        : currentUsage?.additionalPurchases?.length > 0
                        ? currentUsage?.additionalPurchases[0].additionalMinutes
                        : 0}
                      Mins remaining
                      <br />
                      <span className="text-sm font-light">
                        as of {new Date().toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <Loader />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full grid grid-cols-1 xl:gap-4 my-4">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8 ">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Usage History</h3>
            </div>
          </div>
          {usage ? (
            <div className="flex flex-col mt-8">
              <div className="overflow-x-auto rounded-lg">
                <div className="align-middle inline-block min-w-full">
                  <div className="shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data Usage
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Talk Time Usage
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Additional Data Purchases
                          </th>
                          <th
                            scope="col"
                            className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Additional Talk Time Purchases
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {usage?.map((el, key) => (
                          <tr key={key}>
                            <td className="p-4 whitespace-nowrap text-sm font-normal text-gray-500">
                              {getMonthString(el?.month)}&nbsp;{el?.year}
                            </td>
                            <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {el?.allocatedDataUsage} GB
                            </td>
                            <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {el?.allocatedMinutesUsage} Mins
                            </td>
                            <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {el?.additionalPurchases?.length > 0 ? (
                                el?.additionalPurchases?.map((el2, subKey) => (
                                  <span
                                    key={subKey}
                                    className="bg-light rounded border border-secondary-50 inline-block p-1 mr-1">
                                    {`${el2.additionalData} GB`}
                                  </span>
                                ))
                              ) : (
                                <span>-</span>
                              )}
                            </td>
                            <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {el?.additionalPurchases?.length > 0 ? (
                                el?.additionalPurchases?.map((el2, subKey) =>
                                  el2?.additionalMinutes === 0 ? (
                                    <span>-</span>
                                  ) : (
                                    <span
                                      key={subKey}
                                      className="bg-light rounded border border-secondary-50 inline-block p-1 mr-1">
                                      {`${el2.additionalMinutes} Mins`}
                                    </span>
                                  )
                                )
                              ) : (
                                <span>-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Loader />
          )}
        </div>
      </div>
      <div className="w-full grid grid-cols-1 xl:grid-cols-2 xl:gap-4 my-4">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8 ">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recent Payments</h3>
            </div>
            <div className="flex-shrink-0">
              <a
                href="#"
                className="text-sm font-medium text-primary hover:underline rounded-lg p-2">
                View all
              </a>
            </div>
          </div>
          <div className="flex flex-col mt-8">
            <div className="overflow-x-auto rounded-lg">
              <div className="align-middle inline-block min-w-full">
                <div className="shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th
                          scope="col"
                          className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr>
                        <td className="p-4 whitespace-nowrap text-sm font-normal text-gray-500">
                          Aug 23 ,{currentYear}
                        </td>
                        <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          $590
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-4 whitespace-nowrap text-sm font-normal text-gray-500">
                          Jul 20 ,{currentYear}
                        </td>
                        <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          $2300
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 whitespace-nowrap text-sm font-normal text-gray-500">
                          May 18 ,{currentYear}
                        </td>
                        <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          $234
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8">
          <h3 className="text-xl leading-none font-bold text-gray-900 mb-10">
            Buy Data Addons & Subscriptions
          </h3>
          <table className="items-center w-full bg-transparent border-collapse">
            <tbody className="divide-y divide-gray-100">
              <tr className="text-gray-500">
                <th className="border-t-0 px-4 align-middle text-sm font-normal whitespace-nowrap p-4 text-left">
                  Additional data purchase
                </th>
              </tr>
              <tr className="text-gray-500">
                <th className="border-t-0 px-4 align-middle text-sm font-normal whitespace-nowrap p-4 text-left">
                  Buy data addons
                </th>
              </tr>
              <tr className="text-gray-500">
                <th className="border-t-0 px-4 align-middle text-sm font-normal whitespace-nowrap p-4 text-left">
                  Kfone Flex TV subscriptions
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const handleDataTabNav = (tab) => {
    setActiveDataTab(tab);
  };
  const handleTalkTabNav = (tab) => {
    setActiveTalkTab(tab);
  };
  const handleUsageTabNav = (tab) => {
    setActiveUsageTab(tab);
  };

  return (
    <CustomerPortal>
      <section className="flex flex-col items-start justify-start">
        {loading ? (
          <div className="content-spinner-wrapper w-full">
            <div className="animate-pulse flex justify-center h-screen w-full items-center">
              <div className="text-center">
                <div role="status">
                  <svg
                    className="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          renderPlanContent()
        )}
      </section>
    </CustomerPortal>
  );
};

export default MyPlan;
