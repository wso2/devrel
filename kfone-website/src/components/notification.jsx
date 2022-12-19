import { useState, useEffect } from 'react';
import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const Notification = ({ showNotification, type, title, message, handleClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (showNotification) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [showNotification]);

  if (show) {
    return (
      <div className="z-[1000] top-12 right-5 flex items-center rounded shadow-md overflow-hidden min-w-[360px] max-w-xl fixed bg-light text-gray-800">
        <div
          className={`self-stretch flex items-center px-3 flex-shrink-0 bg-secondary-800 ${
            type === 'success' ? 'text-green-500' : 'text-orange-500'
          } `}>
          {type === 'success' ? <HiOutlineCheck size={32} /> : <HiOutlineX size={32} />}
        </div>
        <div className="p-4 flex-1">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 mb-2 text-[10px] font-extralight">
          Dismiss
        </button>
      </div>
    );
  } else {
    return null;
  }
};

export default Notification;
