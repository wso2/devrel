import { BsDisplay } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { HiOutlineExternalLink } from 'react-icons/hi';

import webinar from '../../assets/images/business/webinar.png';
import WebinarForm from './forms/webinar-form';

const WebinarSection = () => {
  const closeModal = () => {
    const modalToggle = document.getElementById('webinar-modal');
    modalToggle.checked = false;
  };

  return (
    <section>
      {/* webinar */}
      <div className="container mx-auto">
        <div className="p-8 my-8 rounded-md bg-secondary-900 text-gray-200">
          <h1 className="flex items-center text-3xl font-semibold text-gray-100">
            <BsDisplay size={36} className="text-secondary-200 mr-4" />
            Webinars
          </h1>
          <div className="grid gap-6 my-10 lg:grid-cols-12">
            <div className="lg:col-span-4 flex lg:justify-end items-center">
              <img
                className="flex-shrink-0 object-cover w-44 border-transparent rounded outline-none bg-gray-500"
                src={webinar}
                alt="kfone webinar"
              />
            </div>
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <h6 className="font-medium text-xl">Cybersecurity and Your Remote Workforce</h6>
                <p className="font-light text-sm text-gray-400">
                  A guide to help protect your data, your business and your employees, for your
                  remote workforce, now and in the future Asia Pacific Edition. Kfone conducted a
                  survey of 500 cybersecurity experts in Hong Kong, Singapore and Australia,
                  designed to identify their views on issues including cyber threats and how their
                  role has changed as a result of COVID-19. It also looks at four steps you can take
                  to help reduce vulnerability to cyber attacks.
                </p>
              </div>
              <div>
                <small className="font-bold text-xs text-gray-500 p-1 block">
                  Need to know more? Join our live webinar!
                </small>
                <label
                  type="button"
                  htmlFor="webinar-modal"
                  className="px-8 py-3 mt-4 inline-flex items-center rounded bg-primary-600 text-gray-100 hover:-translate-y-1 transition duration-500 cursor-pointer">
                  Save my free spot
                  <HiOutlineExternalLink className="ml-2" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* webinar modal */}
      <input type="checkbox" id="webinar-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative w-11/12 max-w-5xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Download White Paper</h3>
            <label htmlFor="webinar-modal" className="btn btn-sm btn-circle">
              <IoClose />
            </label>
          </div>
          <div className="divider"></div>
          <WebinarForm closeModal={closeModal} />
        </div>
      </div>
    </section>
  );
};

export default WebinarSection;
