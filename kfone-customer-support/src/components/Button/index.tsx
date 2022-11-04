import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  isDisabled: boolean;
  onButtonClick: () => any;
  classNames?: string;
};
const Button = ({ children, isDisabled, onButtonClick, classNames }: ButtonProps) => {
  return (
    <button
      className={`flex text-white right-2.5 bottom-2.5 bg-primary focus:ring-4 
                focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 
                py-2
                ${isDisabled ? `opacity-50` : `opacity-100`} ${classNames}`}
      onClick={onButtonClick}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};

export default Button;
