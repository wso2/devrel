import React from 'react';
import { Link } from 'react-router-dom';
import HeaderTitle from '../components/headers/HeaderTitle';
import office_people from '../assets/images/people/office_people.jpg';
import { RiSignalTowerFill, RiPieChart2Line } from 'react-icons/ri';
import { BsHddNetwork, BsCloud, BsPeople, BsArrowRightShort } from 'react-icons/bs';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { MdOutlineDevices } from 'react-icons/md';

const IconPill = ({ icon, text }) => {
  return (
    <div className="grid grid-cols-3 gap-2 items-center justify-between border text-light border-secondary-50 rounded-lg p-4 hover:shadow-sm hover:shadow-light h-full">
      <div className="mr-4">{icon}</div>
      <div className="font-light text-left col-span-2">
        <h2>{text}</h2>
      </div>
    </div>
  );
};

const BusinessPlansSection = () => {
  return (
    <section className="md:px-10 grid grid-cols-1 md:grid-cols-2 gap-2 items-center bg-secondary-900 px-4 py-10 text-light my-4">
      <div className="md:col-span-2 text-left md:mt-4">
        <HeaderTitle>Solutions Tailored to Fit Your Business</HeaderTitle>
        <h6 className="text-lg font-light text-secondary-100">
          We partner with you to create custom combinations of tech products and services that drive
          the outcomes your business needs.
        </h6>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center justify-center py-10">
          <IconPill
            icon={<RiSignalTowerFill size={36} className="text-light" />}
            text={'Connectivity'}
          />
          <IconPill icon={<BsPeople size={36} className="text-light" />} text={'Collaboration'} />
          <IconPill
            icon={<BsCloud size={36} className="text-light" />}
            text={'Cloud & Colocation'}
          />
          <IconPill
            icon={<BsHddNetwork size={36} className="text-light" />}
            text={'Business Networks'}
          />
          <IconPill
            icon={<MdOutlineDevices size={36} className="text-light" />}
            text={'Phones & Devices'}
          />
          <IconPill
            icon={<RiPieChart2Line size={36} className="text-light" />}
            text={'Data Insights'}
          />
        </div>
      </div>
      <div className="flex flex-col justify-between h-full py-5 md:py-10">
        <div>
          <p className="text-sm">
            Partner with <span className="font-title">Kfone</span> to deliver robust and reliable
            global voice, data and internet solutions to solve your customers&apos; challenges. We
            meet your organization on its own terms, with solutions tailored to pair seamlessly with
            your existing systems.
          </p>
          <ul className="mt-10">
            <li className="mb-4 flex items-center">
              <IoIosCheckmarkCircleOutline size={20} className="mr-2 text-primary" />
              Small Business
            </li>
            <li className="mb-4 flex items-center">
              <IoIosCheckmarkCircleOutline size={20} className="mr-2 text-primary" />
              Enterprise & medium business
            </li>
            <li className="mb-4 flex items-center">
              <IoIosCheckmarkCircleOutline size={20} className="mr-2 text-primary" />
              Public Sector
            </li>
          </ul>
        </div>
        <div>
          <Link
            to="/enterprise"
            className="transition ease-in-out duration-300 rounded-lg px-4 py-2 bg-primary text-light hover:bg-secondary-600 flex w-[150px] items-center">
            Learn more
            <BsArrowRightShort size={28} />
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <img
          src={office_people}
          className="h-60 md:h-96"
          alt="Man Walking on Sidewalk Near People Standing and Sitting Beside Curtain-wall Building"
        />
      </div>
    </section>
  );
};

export default BusinessPlansSection;
