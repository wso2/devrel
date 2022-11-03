import React from 'react';
import { GiAerialSignal } from 'react-icons/gi';
import { BsPhone, BsWifi, BsTv } from 'react-icons/bs';
import QuickActionCard from '../components/cards/QuickActionCard';

const QuickActionsSection = () => {
  return (
    <section className="flex justify-center mx-2 mb-[-48px] relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center bg-secondary rounded-lg text-center text-white p-4 w-full md:w-[75%]">
        <QuickActionCard>
          <BsPhone size={30} />
          <p>Phones & devices</p>
        </QuickActionCard>
        <QuickActionCard>
          <BsWifi size={30} />
          <p>Wireless</p>
        </QuickActionCard>
        <QuickActionCard>
          <GiAerialSignal size={30} />
          <p>Internet</p>
        </QuickActionCard>
        <QuickActionCard>
          <BsTv size={30} />
          <p>TV</p>
        </QuickActionCard>
      </div>
    </section>
  );
};

export default QuickActionsSection;
