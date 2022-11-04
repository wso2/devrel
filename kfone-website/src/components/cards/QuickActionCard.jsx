import React from 'react';

const QuickActionCard = ({ children }) => {
  return (
    <div className="grid md:grid-rows-2 gap-2 justify-items-center hover:text-primary-200 cursor-pointer">
      {children}
    </div>
  );
};

export default QuickActionCard;
