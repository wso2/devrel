import React from 'react';

const RoundedIconButton = (props) => {
  const { icon, text, handleLogin } = props;
  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-between border bg-white border-primary text-primary hover:shadow hover:shadow-secondary hover:border-secondary hover:bg-secondary hover:text-white rounded-lg drop-shadow px-4 py-2">
      {icon && icon}
      {text && <div className="ml-2">{text}</div>}
    </button>
  );
};

export default RoundedIconButton;
