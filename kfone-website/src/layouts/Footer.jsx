import React from 'react';
import { GiCrossedAirFlows, GiRadioTower } from 'react-icons/gi';
import { TbHeartHandshake } from 'react-icons/tb';
import {
  AiOutlineFacebook,
  AiOutlineTwitter,
  AiOutlineInstagram,
  AiOutlineYoutube,
  AiOutlineSlack,
  AiOutlineShopping,
  AiOutlineInfoCircle
} from 'react-icons/ai';

const FooterLink = ({ text }) => {
  return (
    <a href="/" className="hover:underline py-2">
      {text}
    </a>
  );
};

const Footer = () => {
  return (
    <footer className="bg-light mt-10 text-secondary-900 pt-10">
      <div className="grid grid-cols-1 md:grid-cols-4 py-4 px-8 gap-4 text-sm">
        <div>
          <h3 className="flex items-center uppercase font-semibold mb-4">
            <AiOutlineShopping className="mr-2" size={18} />
            Shop
          </h3>
          <div className="flex flex-col justify-evenly">
            <FooterLink text={'Plans & bundles'} />
            <FooterLink text={'Smart Phones'} />
            <FooterLink text={'Internet & WiFi'} />
            <FooterLink text={'Smart TV'} />
            <FooterLink text={'Home Appliances'} />
          </div>
        </div>
        <div>
          <h3 className="flex items-center uppercase font-semibold mb-4">
            <TbHeartHandshake className="mr-2" size={18} />
            Services
          </h3>
          <div className="flex flex-col justify-evenly">
            <FooterLink text={'Personal Plans'} />
            <FooterLink text={'Business Plans'} />
            <FooterLink text={'Locate Branches'} />
            <FooterLink text={'Manage Your Account'} />
          </div>
        </div>
        <div>
          <h3 className="flex items-center uppercase font-semibold mb-4">
            <GiRadioTower className="mr-2" size={18} />
            Company
          </h3>
          <div className="flex flex-col justify-evenly">
            <FooterLink text={'Careers'} />
            <FooterLink text={'Financing'} />
            <FooterLink text={'Annual Reports'} />
            <FooterLink text={'Investors'} />
            <FooterLink text={'Ethics & Compliances'} />
          </div>
        </div>
        <div>
          <h3 className="flex items-center uppercase font-semibold mb-4">
            <AiOutlineInfoCircle className="mr-2" size={18} />
            About
          </h3>
          <div className="flex flex-col justify-evenly">
            <FooterLink text={'Newsroom'} />
            <FooterLink text={'Leadership'} />
            <FooterLink text={'Coverage Map'} />
            <FooterLink text={'Events'} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 py-4 px-8 gap-4 justify-center items-center bg-secondary-900">
        <div>
          <h1 className="flex justify-center md:justify-start items-center w-full text-primary text-xl font-title">
            <GiCrossedAirFlows size={30} />
            <div className="ml-2">Kfone</div>
          </h1>
        </div>
        <div className="col-span-2 text-slate-400 grid grid-cols-1 md:grid-cols-4 gap-2 text-[12px] justify-items-center">
          <FooterLink text={'Ad Choices'} />
          <FooterLink text={'Web Terms of Service'} />
          <FooterLink text={'Privacy Policy'} />
          <FooterLink text={'Credits'} />
        </div>
        <div className="flex justify-center gap-4 items-center text-slate-400">
          <a href="" className="hover:text-primary">
            <AiOutlineFacebook size={20} />
          </a>
          <a href="" className="hover:text-primary">
            <AiOutlineTwitter size={20} />
          </a>
          <a href="" className="hover:text-primary">
            <AiOutlineInstagram size={20} />
          </a>
          <a href="" className="hover:text-primary">
            <AiOutlineSlack size={20} />
          </a>
          <a href="" className="hover:text-primary">
            <AiOutlineYoutube size={20} />
          </a>
        </div>
      </div>
      <div className="flex justify-center items-center bg-black">
        <h6 className="text-secondary-100 font-light text-[10px] py-2">
          Copyright &copy; {new Date().getFullYear()} Kfone Telecommunications Inc. All rights
          reserved.
        </h6>
      </div>
    </footer>
  );
};

export default Footer;
