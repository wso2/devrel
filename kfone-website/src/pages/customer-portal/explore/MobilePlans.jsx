import { useRef } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { recordUserInteractions } from '../../../api';
import { MdCheck } from 'react-icons/md';

export const MobilePlans = () => {
  const { state, httpRequest } = useAuthContext();
  const mobileSubscriptionVisitsCounter = useRef(0);

  const recordInteraction = () => {
    mobileSubscriptionVisitsCounter.current++;

    recordUserInteractions(
      state.email,
      {
        mobileSubscriptionVisits: mobileSubscriptionVisitsCounter.current
      },
      httpRequest
    );
  };

  return (
    <section>
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Our Mobile Plans
          </h2>
          <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">
            Here at <span className="text-primary-500 font-medium font-title">Kfone</span> we offer
            you flexible 5G Ready plans at no extra cost
          </p>
        </div>
        <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
          <div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
            <h3 className="mb-4 text-5xl font-light text-primary-200">50GB</h3>
            <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">
              Max Speed data Lite Plan
            </p>
            <div className="my-8">
              <span className="text-gray-500 dark:text-gray-400">Starting from</span>
              <div className="flex justify-center items-baseline">
                <span className="mr-2 text-5xl">$35</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
            </div>
            <ul role="list" className="mb-8 space-y-4 text-left">
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>
                  50 GB Max Speed data then infinite data speeds up to&nbsp;
                  <span className="font-semibold">2Mbps</span>&nbsp;
                </span>
              </li>
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>
                  <span className="font-semibold">1000</span> minutes of standard national calls
                </span>
              </li>
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>5G Ready at no extra cost</span>
              </li>
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>
                  <span className="font-semibold">Unlimited</span> texts
                </span>
              </li>
            </ul>
            <a
              onClick={recordInteraction}
              className="text-white bg-primary hover:bg-primary-600 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900">
              See Full Plan
            </a>
          </div>
          <div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
            <h3 className="mb-4 text-5xl font-light text-primary-200">80GB</h3>
            <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">
              Max Speed data Super Plan
            </p>
            <div className="my-8">
              <span className="text-gray-500 dark:text-gray-400">Starting from</span>
              <div className="flex justify-center items-baseline">
                <span className="mr-2 text-5xl">$45</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
            </div>
            <ul role="list" className="mb-8 space-y-4 text-left">
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>
                  80 GB Max Speed data then infinite data speeds up to&nbsp;
                  <span className="font-semibold">10Mbps</span>&nbsp;
                </span>
              </li>
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>
                  <span className="font-semibold">1800</span> minutes of standard national calls
                </span>
              </li>
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>5G Ready at no extra cost</span>
              </li>
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>
                  <span className="font-semibold">Unlimited</span> texts
                </span>
              </li>
            </ul>
            <a
              onClick={recordInteraction}
              className="text-white bg-primary hover:bg-primary-600 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900">
              See Full Plan
            </a>
          </div>
          <div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
            <h3 className="mb-4 text-5xl font-light text-primary-200">Unlimited</h3>
            <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">
              Max Speed data Ultra Plan
            </p>
            <div className="my-8">
              <span className="text-gray-500 dark:text-gray-400">Starting from</span>
              <div className="flex justify-center items-baseline">
                <span className="mr-2 text-5xl">$60</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
            </div>
            <ul role="list" className="mb-8 space-y-4 text-left">
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>Unlimited Max Speed data on our 5G network</span>
              </li>
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>
                  <span className="font-semibold">Unlimited</span> minutes of standard national
                  calls
                </span>
              </li>
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>5G Ready at no extra cost</span>
              </li>
              <li className="flex items-center text-sm">
                <MdCheck className="inline text-emerald-400 mr-2" size={18} />
                <span>
                  <span className="font-semibold">Unlimited</span> texts
                </span>
              </li>
            </ul>
            <a
              onClick={recordInteraction}
              className="text-white bg-primary hover:bg-primary-600 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900">
              See Full Plan
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
