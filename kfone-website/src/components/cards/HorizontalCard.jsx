import React from 'react';

const VerticalCard = (props) => {
  const { title, subTitle, image, description, action, styles } = props;
  return (
    <div className={`flex items-center justify-between ${styles}`}>
      <div className="px-2 text-left">
        <h1 className="font-light text-lg">{title}</h1>
        <h4 className="font-thin">{subTitle}</h4>
      </div>
      <div className="p-2 my-2">
        <img className="h-72" src={image} alt="card image" />
      </div>
      <div className="p-4">
        <p className="font-light text-sm">{description}</p>
        {action}
      </div>
    </div>
  );
};

export default VerticalCard;
