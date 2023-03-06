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

import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useAuthContext } from '@asgardeo/auth-react';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { initiatePhoneVerify, verifyPhone } from '../../api';
import AuthTemplate from '../../templates/AuthTemplate';

const PhoneVerification = () => {
  const history = useHistory();
  const location = useLocation();
  const { httpRequest } = useAuthContext();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({});
  const [phase, setPhase] = useState('PHONE_INPUT');

  useEffect(() => {
    if (!location.state) {
      history.push('/');
      return;
    }

    if (location.state) {
      const decodedIDToken = location.state;
      if (decodedIDToken?.mobileNumberVerified || sessionStorage.getItem('verified')) {
        history.push('/my-kfone');
      }
      setEmail(decodedIDToken?.email);
      setPhone(decodedIDToken?.phone_number);
      return;
    }
  }, []);

  useEffect(() => {
    setContent(resolveContent(phase));
  }, [phase]);

  const addNumber = async () => {
    setLoading(true);
    const res = await initiatePhoneVerify(email, phone, httpRequest);
    sessionStorage.setItem('otp', res.otp);
    setPhase('OTP_INPUT');
    setLoading(false);
  };

  const validateUserInput = (code) => {
    if (typeof code !== 'string') {
      return false;
    }

    const num = Number(code);

    if (Number.isInteger(num) && num > 0 && code.length === 6) {
      return true;
    }

    return false;
  };

  const handleVerify = async () => {
    setLoading(true);
    setTimeout(() => {
      if (!validateUserInput(otp)) {
        console.log('user input error');
        // TODO: handle error
        setLoading(false);
      } else if (otp !== sessionStorage.getItem('otp')) {
        setPhase('OTP_INVALID');
        // TODO: handle error
        setLoading(false);
      } else {
        verifyPhone(email, phone, httpRequest)
          .then((res) => {
            console.log(res);
            setLoading(false);
            sessionStorage.setItem('verified', true);
            history.push('/my-kfone');
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }, 1000);
  };

  const resolveContent = (phase) => {
    if (phase === 'PHONE_INPUT') {
      return {
        title: 'Add Your Mobile',
        label: 'Please enter your mobile number',
        error: '',
        button: 'Add number',
        loadingButton: 'Adding number...',
        helperText: ''
      };
    } else if (phase === 'OTP_INVALID') {
      return {
        title: 'Verify Your Mobile',
        label: `We sent a verification code to your phone ending with ${phone.substring(
          phone?.length - 4,
          phone?.length
        )}`,
        error: 'The OTP enetered is invalid!',
        button: 'Verify',
        loadingButton: 'Verifying...',
        helperText: 'Not received the code yet?'
      };
    } else {
      return {
        title: 'Verify Your Mobile',
        label: `We sent a verification code to your phone ending with ${phone.substring(
          phone?.length - 4,
          phone?.length
        )}`,
        error: '',
        button: 'Verify',
        loadingButton: 'Verifying...',
        helperText: 'Not received the code yet?'
      };
    }
  };

  return (
    <AuthTemplate>
      <h3 className="text-2xl my-3">{content.title}</h3>
      <div className="mt-4 w-[60%]">
        <div className="py-2 flex flex-col items-start w-full">
          <label className="mb-1 text-sm" htmlFor="otp">
            {content.label}
          </label>
          <label className="mb-1 text-sm" htmlFor="otp" style={{ color: 'red' }}>
            {content.error}
          </label>
          {phase === 'PHONE_INPUT' ? (
            <PhoneInput placeholder="Enter phone number" value={phone} onChange={setPhone} />
          ) : (
            <input
              className="border border-secondary-100 rounded p-2 w-full focus-visible:outline-primary-50"
              type="text"
              name="otp"
              id="otp"
              placeholder="xxxxxx"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoFocus
            />
          )}
        </div>
      </div>
      <div className="mt-4 w-[60%]">
        <PrimaryButton
          text={loading ? content.loadingButton : content.button}
          disabled={loading}
          styles="w-full justify-center"
          onClick={phase === 'PHONE_INPUT' ? addNumber : handleVerify}
        />
        <p className="text-sm mt-2">
          {content.helperText}
          {phase === 'OTP_INPUT' ? (
            <a
              className="cursor-pointer hover:underline text-secondary-500 hover:text-primary-400"
              onClick={addNumber}>
              &nbsp;Request again
            </a>
          ) : null}
        </p>
      </div>
    </AuthTemplate>
  );
};

export default PhoneVerification;
