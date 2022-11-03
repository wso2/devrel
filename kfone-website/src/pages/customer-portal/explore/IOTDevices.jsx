import { useRef } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { recordUserInteractions } from '../../../api';
import AmazonAlexa from '../../../assets/images/explore/shop/amazon-alexa.png';
import DLinkModem from '../../../assets/images/explore/shop/dlink-modem.png';
import USBConnect from '../../../assets/images/explore/shop/usb-connectt.png';
import SmartSwitch from '../../../assets/images/explore/shop/smart-switch.webp';

export const IOTDevices = () => {
  const { state, httpRequest } = useAuthContext();
  const iotDeviceVisitsCounter = useRef(0);

  const devices = [
    {
      id: 1,
      name: 'USB Connect 4G',
      brand: 'Huawei',
      imageSrc: USBConnect,
      price: '23.00'
    },
    {
      id: 2,
      name: 'Echo Dot 4th Gen',
      brand: 'Amazon',
      imageSrc: AmazonAlexa,
      price: '30.00'
    },
    {
      id: 3,
      name: 'Wifi Router',
      brand: 'TP-LINK',
      imageSrc: DLinkModem,
      price: '46.00'
    },
    {
      id: 4,
      name: 'Smart Home Control',
      brand: 'Brilliant',
      imageSrc: SmartSwitch,
      price: '59.99'
    }
  ];

  const recordInteraction = () => {
    iotDeviceVisitsCounter.current++;

    recordUserInteractions(
      state.email,
      {
        iotDevicesVisits: iotDeviceVisitsCounter.current
      },
      httpRequest
    );
  };

  return (
    <section>
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            IoT devices
          </h2>
          <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">
            Our devices are designed to work specifically on our IoT SIMs and deliver unique
            capabilities that will allow you to scale quickly, save money and deploy globally with
            confidence.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {devices.map((device) => (
            <div key={device.id} className="w-80 flex justify-center items-center">
              <div className="w-full p-4">
                <div className="card flex flex-col justify-center p-10 bg-white rounded-lg border border-gray-100 shadow hover:shadow-2xl">
                  <div className="prod-title">
                    <p className="text-sm text-gray-400">{device.brand}</p>
                    <p className="text-md text-gray-900 font-bold">{device.name}</p>
                  </div>
                  <div className="prod-img p-5">
                    <img
                      style={{ height: '160px' }}
                      src={device.imageSrc}
                      className="w-full object-cover object-center"
                    />
                  </div>
                  <div className="device-price">
                    <div className="text-xs text-gray-400">Starting from</div>
                    <div>
                      <span className="text-2xl text-gray-900 font-bold">$</span>
                      <span className="text-4xl text-gray-900 font-bold">{device.price}</span>
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
