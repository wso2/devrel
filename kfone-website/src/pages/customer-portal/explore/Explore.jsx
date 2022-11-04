import React from 'react';
import CustomerPortal from '../../../templates/CustomerPortal';
import { Carousel } from './Carousel';
import { MobilePlans } from './MobilePlans';
import { Phones } from './Phones';
import { IOTDevices } from './IOTDevices';
import { TVPlans } from './TVPlans';

const Explore = () => {
  return (
    <CustomerPortal>
      <Carousel />
      <MobilePlans />
      <Phones />
      <TVPlans />
      <IOTDevices />
    </CustomerPortal>
  );
};

export default Explore;
