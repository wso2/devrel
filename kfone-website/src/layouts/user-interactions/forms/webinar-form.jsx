import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAccessToken } from '../../../api';
import Spinner from '../../../components/loaders/spinner';
import { BsCalendarPlus } from 'react-icons/bs';
import webinar from '../../../assets/images/business/webinar.png';
import Notification from '../../../components/notification';
import { validateEmail } from '../../../utils';

const WebinarForm = ({ closeModal, encodedEmail }) => {
  const [loading, setLoading] = useState(false);
  const [firstNameEmpty, setFirstNameEmpty] = useState(false);
  const [lastNameEmpty, setLastNameEmpty] = useState(false);
  const [companyEmpty, setCompanyEmpty] = useState(false);
  const [webinarEmailEmpty, setWebinarEmailEmpty] = useState(false);
  const [webinarEmailError, setWebinarEmailError] = useState(false);
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

  const handleWebinarRegistration = async (e) => {
    e.preventDefault();

    setFirstNameEmpty(false);
    setLastNameEmpty(false);
    setWebinarEmailEmpty(false);
    setWebinarEmailError(false);
    setCompanyEmpty(false);

    const firstName = e.target.firstName.value;
    const lastName = e.target.lastName.value;
    const email = e.target.email.value;
    const company = e.target.company.value;

    if (!firstName) {
      setFirstNameEmpty(true);
      return;
    }
    if (!lastName) {
      setLastNameEmpty(true);
      return;
    }
    if (!email) {
      setWebinarEmailEmpty(true);
      return;
    }
    if (!company) {
      setCompanyEmpty(true);
      return;
    }

    if (!validateEmail(email)) {
      setWebinarEmailError(true);
      return;
    }

    setLoading(true);

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
            `${process.env.REACT_APP_BASE_API_ENDPOINT}/hvwp/webinar-registration-tsw/1.0.0/trackWebinarRegistration`,
            {
              company: company,
              email: email,
              firstname: firstName,
              lastname: lastName
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
          .then(() => {
            e.target.firstName.value = '';
            e.target.lastName.value = '';
            e.target.email.value = '';
            e.target.company.value = '';
            sendNotification(
              'success',
              'Thank you!',
              'We will send you more details to your email.'
            );
            setLoading(false);
            closeModal();
          })
          .catch((err) => {
            setLoading(false);
            sendNotification('error', 'An error occurred', err.message);
          });
      })
      .catch((err) => {
        sendNotification('error', 'An error occurred', err.message);
        setLoading(false);
      });
  };

  return (
    <section>
      {/* webinar form */}
      <div className="grid gap-6 my-10 px-4 lg:grid-cols-12">
        <div className="lg:col-span-4 flex lg:justify-end items-center">
          <img
            className="flex-shrink-0 object-cover w-64 shadow-md border-transparent rounded outline-none bg-gray-500"
            src={webinar}
            alt="kfone webinar"
          />
        </div>
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <h6 className="font-medium text-xl">Cybersecurity and Your Remote Workforce</h6>
            <p className="font-light text-sm text-gray-400">
              A guide to help protect your data, your business and your employees, for your remote
              workforce, now and in the future Asia Pacific Edition. Kfone conducted a survey of 500
              cybersecurity experts in Hong Kong, Singapore and Australia, designed to identify
              their views on issues including cyber threats and how their role has changed as a
              result of COVID-19. It also looks at four steps you can take to help reduce
              vulnerability to cyber attacks.
            </p>
          </div>
          <div className="form-control w-full max-w-lg mt-10">
            <form onSubmit={handleWebinarRegistration} noValidate>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="label">
                    <span className="label-text">
                      First name <span className="text-red-800">*</span>
                    </span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    className="input input-bordered w-full max-w-xs focus:ring-secondary-100 focus:border-secondary-100 focus:outline-none"
                  />
                  <label className="label">
                    <span
                      hidden={!firstNameEmpty}
                      className="label-text-alt font-light text-red-800">
                      This field is required.
                    </span>
                  </label>
                </div>
                <div>
                  <label htmlFor="lastName" className="label">
                    <span className="label-text">
                      Last name <span className="text-red-800">*</span>
                    </span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    className="input input-bordered w-full max-w-xs focus:ring-secondary-100 focus:border-secondary-100 focus:outline-none"
                  />
                  <label className="label">
                    <span
                      hidden={!lastNameEmpty}
                      className="label-text-alt font-light text-red-800">
                      This field is required.
                    </span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="webinar-email" className="label">
                    <span className="label-text">
                      Company email <span className="text-red-800">*</span>
                    </span>
                  </label>
                  {encodedEmail ? (
                    <input
                      id="webinar-email"
                      type="email"
                      name="email"
                      value={encodedEmail}
                      disabled
                      className="input input-bordered w-full max-w-xs focus:ring-secondary-100 focus:border-secondary-100 focus:outline-none"
                    />
                  ) : (
                    <input
                      id="webinar-email"
                      type="email"
                      name="email"
                      placeholder="johndoe@company.com"
                      className="input input-bordered w-full max-w-xs focus:ring-secondary-100 focus:border-secondary-100 focus:outline-none"
                    />
                  )}
                  <label className="label">
                    <span
                      hidden={!webinarEmailError}
                      className="label-text-alt font-light text-red-800">
                      Please enter a valid email.
                    </span>
                    <span
                      hidden={!webinarEmailEmpty}
                      className="label-text-alt font-light text-red-800">
                      This field is required.
                    </span>
                  </label>
                </div>
                <div>
                  <label htmlFor="company" className="label">
                    <span className="label-text">
                      Company <span className="text-red-800">*</span>
                    </span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    name="company"
                    placeholder="Company name"
                    className="input input-bordered w-full max-w-xs focus:ring-secondary-100 focus:border-secondary-100 focus:outline-none"
                  />
                  <label className="label">
                    <span hidden={!companyEmpty} className="label-text-alt font-light text-red-800">
                      This field is required.
                    </span>
                  </label>
                </div>
              </div>
              <button
                disabled={loading}
                type="submit"
                className="btn btn-outline btn-primary mt-4 mb-1">
                Join Webinar
                {loading ? (
                  <span className="ml-2">
                    <Spinner />
                  </span>
                ) : (
                  <BsCalendarPlus size={24} className="ml-2" />
                )}
              </button>
              <small className="text-[10px] text-gray-600 px-1 block">
                By clicking the <span className="font-bold">Join Webinar</span> button you agree to
                our&nbsp;
                <Link className="text-primary hover:underline" to="/privacy-policy" target="_blank">
                  Privacy Policy
                </Link>
                .
              </small>
            </form>
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

export default WebinarForm;
