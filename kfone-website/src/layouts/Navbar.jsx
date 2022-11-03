import React, { useState, useEffect } from 'react';
import { AiOutlineLogin } from 'react-icons/ai';
import { HiMenuAlt3 } from 'react-icons/hi';
import { GiCrossedAirFlows } from 'react-icons/gi';
import { GrClose } from 'react-icons/gr';
import RoundedIconButton from '../components/buttons/RoundedIconButton';

const Navbar = (props) => {
  const { handleLogin, state } = props;

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [buttonText, setButtonText] = useState('Sign in');

  useEffect(() => {
    if (!state?.isAuthenticated) {
      return;
    }

    setButtonText('My Kfone');
  }, [state.isAuthenticated]);

  const handleNavMenuButton = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <nav className="flex justify-between items-center h-20 px-6 max-w-[1440px] mx-auto">
      <div className="flex justify-start items-center">
        <h1 className="flex items-center w-full text-primary text-4xl font-title">
          <GiCrossedAirFlows size={60} />
          <div className="ml-2">Kfone</div>
        </h1>
        <ul className="hidden md:flex ml-4">
          <li className="px-4">Products</li>
          <li className="px-4">Services</li>
          <li className="px-4">Support</li>
          <li className="px-4">Store</li>
        </ul>
      </div>
      <ul className="flex justify-end items-center">
        <li className="px-4">
          <RoundedIconButton
            handleLogin={handleLogin}
            icon={<AiOutlineLogin />}
            text={buttonText}
          />
        </li>
        <li onClick={handleNavMenuButton} className="text-secondary block md:hidden">
          {mobileNavOpen ? <GrClose size={24} /> : <HiMenuAlt3 size={24} />}
        </li>
      </ul>
      <div
        className={
          mobileNavOpen
            ? 'fixed left-0 top-0 w-[60%] h-full bg-secondary text-white ease-in-out duration-500'
            : 'fixed left-[-100%]'
        }>
        <h1 className="flex items-center w-full text-white text-4xl font-title m-4">
          <GiCrossedAirFlows size={60} />
          <div className="ml-2">Kfone</div>
        </h1>
        <ul className="p-4">
          <li className="p-4">Products</li>
          <li className="p-4">Services</li>
          <li className="p-4">Support</li>
          <li className="p-4">Store</li>
          {/* <li className="p-4">
            <RoundedIconButton icon={<FaUserAlt />} text="hello" />
          </li> */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
