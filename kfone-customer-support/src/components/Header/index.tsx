import { useAuthContext } from "@asgardeo/auth-react";
import { useState } from "react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, state } = useAuthContext();

  const handleLogout = () => {
    signOut();
  };

  const getTimeOfDay = () => {
    const date = new Date();
    const hours = date.getHours();
    let timeOfDay = "";

    if (hours < 12) {
      timeOfDay = "Morning";
    } else if (hours < 18) {
      timeOfDay = "Afternoon";
    } else {
      timeOfDay = "Evening";
    }

    return timeOfDay;
  };

  return (
    <header className="fixed bg-secondary-800 items-center h-20 w-full xl:w-[calc(100%-250px)] z-[999]">
      <div className="flex h-full px-3">
        <div className="justify-end space-x-4 items-center pl-2 flex w-full lg:max-w-68 sm:pr-2 sm:ml-0">
          {state?.displayName && state?.displayName.split(" ") && (
            <h1 className="text-xl font-semibold text-slate-100">
              Good {getTimeOfDay()}, {state?.displayName.split(" ")[0]}
            </h1>
          )}

          <div className="relative">
            <button
              id="dropdownDefault"
              data-dropdown-toggle="dropdown"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="avatar online placeholder">
                <div className="bg-primary text-gray-50 rounded-full w-16">
                  <span className="text-xl">
                    {/* @ts-ignore - false positive type checking */}
                    {state?.displayName?.split(" ") && (state?.displayName.split(" ").shift().charAt(0) + state?.displayName.split(" ").pop().charAt(0)).toUpperCase()}
                  </span>
                </div>
              </div> 
            </button>

            {isOpen && (
              <div
                id="dropdown"
                className=" absolute right-1 z-10 w-44 bg-white rounded-lg divide-y divide-gray-100 shadow"
              >
                <ul
                  className="py-1 text-sm text-gray-700"
                  aria-labelledby="dropdownDefault"
                >
                  <li>
                    <span
                      onClick={handleLogout}
                      className="block py-2 px-4 hover:bg-gray-100 cursor-pointer"
                    >
                      Sign out
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
