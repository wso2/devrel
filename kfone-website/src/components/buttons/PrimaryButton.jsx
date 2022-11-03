import React from 'react';

const PrimaryButton = (props) => {
  const { startIcon, text, endIcon, onClick, styles, disabled } = props;

  return (
    <button
      className={
        disabled
          ? `bg-slate-200 text-slate-400 rounded-lg px-4 py-2 ${styles} cursor-wait`
          : `transition ease-in-out duration-300 rounded-lg px-4 py-2 bg-primary text-light hover:bg-secondary-600 flex items-center ${styles}`
      }
      onClick={onClick}
      disabled={disabled}>
      {startIcon}
      <h5>{text}</h5>
      {endIcon}
    </button>
  );
};

export default PrimaryButton;
