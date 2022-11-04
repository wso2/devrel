import { Link, useLocation } from 'react-router-dom'

const SideBarMenuItem = ({ menuItem }: any) => {
  const location = useLocation();

  return (
    <>
      <li className="mt-0.5 w-full">
        <Link
          className={`p-3 bg-blue-500/13 text-md
            ease-nav-brand my-0 mx-2 flex items-center whitespace-nowrap rounded-lg 
            px-4 transition-colors
                  ${menuItem?.url === location?.pathname ? "bg-slate-200 font-semibold text-slate-700" : "font-base text-slate-700"}`}
          to={menuItem?.url}
        >
          <div className="xl:p-2">{menuItem?.icon}</div>
          <span>{menuItem?.name}</span>
        </Link>
      </li>
    </>
  );
};

export default SideBarMenuItem;
