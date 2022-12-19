import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAccessToken } from '../../api';
import Spinner from '../../components/loaders/spinner';
import { IoClose } from 'react-icons/io5';
import { HiOutlineExternalLink, HiOutlineDownload } from 'react-icons/hi';
import { RiFilePaperLine } from 'react-icons/ri';

import whitepaper from '../../assets/images/business/whitepaper.png';
import Notification from '../../components/notification';
import { downloadURL, validateEmail } from '../../utils';

const WhitepaperSection = () => {
  const [loading, setLoading] = useState(false);
  const [whitepaperEmailEmpty, setWhitePaperEmailEmpty] = useState(false);
  const [whitepaperEmailError, setWhitepaperEmailError] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [showNotification]);

  const sendNotification = (type, title, message) => {
    setNotificationType(type);
    setNotificationTitle(title);
    setNotificationMessage(message);
    setShowNotification(true);
  };

  const handleWhitePaperDownload = async (e) => {
    e.preventDefault();

    setWhitePaperEmailEmpty(false);
    setWhitepaperEmailError(false);

    const email = e.target.email.value;
    const isWebinarAlert = e.target.subscribed.checked;

    if (!email) {
      setWhitePaperEmailEmpty(true);
      return;
    }

    if (!validateEmail(email)) {
      setWhitepaperEmailError(true);
      return;
    }

    setLoading(true);
    const modalToggle = document.getElementById('whitepaper-modal');

    Promise.resolve(getAccessToken())
      .then((res) => {
        if (res.status === 200) {
          return res.data.access_token;
        } else {
          throw new Error('Error retrieving access token');
        }
      })
      .then((token) => {
        axios
          .post(
            // eslint-disable-next-line no-undef
            `${process.env.REACT_APP_BASE_API_ENDPOINT}/hvwp/white-paper-download/1.0.0/whitePaperDownload`,
            {
              email,
              isWebinarAlert
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
          .then(() => {
            setLoading(false);
            downloadURL(
              'https://github.com/chaminjay/FileCloud/raw/main/kfone/kfone-whitepaper.pdf',
              'kfone whitepaper.pdf'
            );
            e.target.email.value = '';
            e.target.subscribed.checked = false;
            modalToggle.checked = false;
            sendNotification('success', 'Thank you!', 'Keep in touch with us for more resources.');
          })
          .catch((err) => {
            setLoading(false);
            sendNotification('error', 'An error occurred', err.message);
          });
      })
      .catch((err) => {
        setLoading(false);
        sendNotification('error', 'An error occurred', err.message);
      });
  };

  return (
    <section>
      {/* whitepaper */}
      <div className="container mx-auto">
        <div className="p-8 my-8 rounded-md bg-secondary-900 text-gray-200">
          <h1 className="flex items-center text-3xl font-semibold text-gray-100">
            <RiFilePaperLine size={36} className="text-secondary-200 mr-4" />
            White Papers
          </h1>
          <div className="grid gap-6 my-10 px-4 lg:grid-cols-12">
            <div className="lg:col-span-4 flex lg:justify-end items-center">
              <img
                className="flex-shrink-0 object-cover w-44 border-transparent rounded outline-none bg-gray-500"
                src={whitepaper}
                alt="kfone whitepaper"
              />
            </div>
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <h6 className="font-medium text-xl">5G Enabled Digital Acceleration</h6>
                <p className="font-light text-sm text-gray-400">
                  We look forward to helping shape your digital transformation roadmap and
                  implementation with 5G enabled, next generation networking, cloud and security
                  based on data from a global survey of security, IT, and business leaders, new
                  market research, and insights from leading security vendors.
                </p>
              </div>
              <div>
                <small className="font-bold text-xs text-gray-500 p-1 block">
                  <span className="font-title">Kfone</span> works closely with some of the
                  world&apos;s most respected consultants and industry analysts to understand
                  customer requirements, improve our product portfolio and help predict future
                  trends.
                </small>
                <label
                  type="button"
                  htmlFor="whitepaper-modal"
                  className="px-8 py-3 mt-4 inline-flex items-center rounded bg-primary-600 text-gray-100 hover:-translate-y-1 transition duration-500 cursor-pointer">
                  Read more
                  <HiOutlineExternalLink className="ml-2" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* whitepaper modal */}
      <input type="checkbox" id="whitepaper-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative w-11/12 max-w-5xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Download White Paper</h3>
            <label htmlFor="whitepaper-modal" className="btn btn-sm btn-circle">
              <IoClose />
            </label>
          </div>
          <div className="divider"></div>
          <div className="grid gap-6 my-10 px-4 lg:grid-cols-12">
            <div className="lg:col-span-4 flex lg:justify-end items-center">
              <img
                className="flex-shrink-0 object-cover w-64 shadow-md border-transparent rounded outline-none bg-gray-500"
                src={whitepaper}
                alt="kfone whitepaper"
              />
            </div>
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <h6 className="font-medium text-xl">5G Enabled Digital Acceleration</h6>
                <p className="font-light text-sm text-gray-400">
                  We look forward to helping shape your digital transformation roadmap and
                  implementation with 5G enabled, next generation networking, cloud and security
                  based on data from a global survey of security, IT, and business leaders, new
                  market research, and insights from leading security vendors.
                </p>
              </div>
              <div className="form-control w-full max-w-xs mt-10">
                <form onSubmit={handleWhitePaperDownload} noValidate>
                  <label htmlFor="whitepaper-email" className="label">
                    <span className="label-text">
                      Company email <span className="text-red-800">*</span>
                    </span>
                  </label>
                  <input
                    id="whitepaper-email"
                    type="email"
                    name="email"
                    placeholder="johndoe@company.com"
                    className="input input-bordered w-full max-w-xs focus:ring-secondary-100 focus:border-secondary-100 focus:outline-none"
                  />
                  <label className="label">
                    <span
                      hidden={!whitepaperEmailError}
                      className="label-text-alt font-light text-red-800">
                      Please enter a valid email.
                    </span>
                    <span
                      hidden={!whitepaperEmailEmpty}
                      className="label-text-alt font-light text-red-800">
                      This field is required.
                    </span>
                  </label>
                  <label className="cursor-pointer my-2">
                    <input
                      name="subscribed"
                      type="checkbox"
                      className="text-primary focus:ring-0 focus:border-secondary focus:outline-none"
                    />
                    <span className="label-text ml-2">
                      Send me future <span className="font-title">kfone</span> updates
                    </span>
                  </label>
                  <button
                    disabled={loading}
                    type="submit"
                    className="btn btn-outline btn-primary mt-4 mb-1">
                    Download White Paper
                    {loading ? (
                      <span className="ml-2">
                        <Spinner />
                      </span>
                    ) : (
                      <HiOutlineDownload size={24} className="ml-2" />
                    )}
                  </button>
                  <small className="text-[10px] text-gray-600 px-1 block">
                    By clicking the <span className="font-bold">Download</span> button you agree to
                    our&nbsp;
                    <Link
                      className="text-primary hover:underline"
                      to="/privacy-policy"
                      target="_blank">
                      Privacy Policy
                    </Link>
                    .
                  </small>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Notification
        showNotification={showNotification}
        type={notificationType}
        title={notificationTitle}
        message={notificationMessage}
        handleClose={() => setShowNotification(false)}
      />
    </section>
  );
};

export default WhitepaperSection;
