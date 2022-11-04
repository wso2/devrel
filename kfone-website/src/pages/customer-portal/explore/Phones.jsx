import { useRef } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { recordUserInteractions } from '../../../api';
import iPhone14ProMaxDeepPurple from '../../../assets/images/explore/shop/iphone-14-pro-max-deep-purple-feature1-m.jpeg';
import SamsungGalaxyZFold45G from '../../../assets/images/explore/shop/samsung-galaxy-z-fold4-greygreen-01-m.jpeg';
import GooglePixel7Pro from '../../../assets/images/explore/shop/google-pixel-7-pro-hazel-01-m.jpeg';
import OPPOReno85G from '../../../assets/images/explore/shop/oppo-reno8-5g-shimmer-black-front-m.jpeg';
import iPhoneSE from '../../../assets/images/explore/shop/iphone-se-midnight-blue-feature1-m.jpeg';
import MotorolaMotog62 from '../../../assets/images/explore/shop/motorola-moto-g62-5g-midnight-grey-front-m.jpeg';
import MotorolaEdge from '../../../assets/images/explore/shop/motorola-edge-30-grey-front-m.jpeg';
import SamsungGalaxyA134G from '../../../assets/images/explore/shop/samsung-galaxy-a13-black-front-m.jpeg';

export const Phones = () => {
  const { state, httpRequest } = useAuthContext();
  const mobileDeviceVisitsCounter = useRef(0);

  const phones = [
    {
      id: 1,
      name: 'iPhone 14 Pro Max',
      brand: 'Apple',
      imageSrc: iPhone14ProMaxDeepPurple,
      price: '53.00'
    },
    {
      id: 2,
      name: 'Samsung Galaxy Z Fold4',
      brand: 'Samsung',
      imageSrc: SamsungGalaxyZFold45G,
      price: '67.50'
    },
    {
      id: 3,
      name: 'Google Pixel 7 Pro',
      brand: 'Google',
      imageSrc: GooglePixel7Pro,
      price: '36.00'
    },
    {
      id: 4,
      name: 'OPPO Reno8 5G',
      brand: 'Oppo',
      imageSrc: OPPOReno85G,
      price: '26.50'
    },
    {
      id: 5,
      name: 'iPhone SE (3rd gen)',
      brand: 'Apple',
      imageSrc: iPhoneSE,
      price: '20.00'
    },
    {
      id: 6,
      name: 'Motorola moto g62 5G',
      brand: 'Motorola',
      imageSrc: MotorolaMotog62,
      price: '12.50'
    },
    {
      id: 7,
      name: 'Motorola edge 30 5G',
      brand: 'Motorola',
      imageSrc: MotorolaEdge,
      price: '14.00'
    },
    {
      id: 8,
      name: 'Samsung Galaxy A13 4G',
      brand: 'Samsung',
      imageSrc: SamsungGalaxyA134G,
      price: '11.00'
    }
  ];

  const recordInteraction = () => {
    mobileDeviceVisitsCounter.current++;

    recordUserInteractions(
      state.email,
      {
        smartPhoneVisits: mobileDeviceVisitsCounter.current
      },
      httpRequest
    );
  };

  return (
    <section>
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Choose your mobile phone
          </h2>
          <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">
            With <span className="text-primary-500 font-medium">Kfone</span>, you can pay for your
            new phone interest free over 12, 24 or 36 months.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {phones.map((phone) => (
            <div key={phone.id} className="w-80 flex justify-center items-center">
              <div className="w-full p-4">
                <div className="card flex flex-col justify-center p-10 bg-white rounded-lg border border-gray-100 shadow hover:shadow-2xl">
                  <div className="prod-title">
                    <p className="text-sm text-gray-400">{phone.brand}</p>
                    <p className="text-md text-gray-900 font-bold">{phone.name}</p>
                  </div>
                  <div className="prod-img p-5">
                    <img
                      height="166"
                      src={phone.imageSrc}
                      className="w-full object-cover object-center"
                    />
                  </div>
                  <div className="device-price">
                    <div className="text-xs text-gray-400">Starting from</div>
                    <div>
                      <span className="text-2xl text-gray-900 font-bold">$</span>
                      <span className="text-4xl text-gray-900 font-bold">{phone.price}</span>
                      <span className="text-sm ml-1 text-gray-400">per month</span>
                    </div>
                  </div>
                  <div className="mt-5">
                    <button
                      onClick={recordInteraction}
                      className="w-full px-6 py-2 transition ease-in duration-200 uppercase rounded-full hover:bg-gray-800 hover:text-white border-2 border-gray-900 focus:outline-none">
                      See More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
