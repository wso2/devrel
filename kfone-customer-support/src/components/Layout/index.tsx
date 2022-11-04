import SideBar from "../../components/SideBar";
import Header from "../Header";

const Layout = ({ children }: any) => {
  return (
    <div className="font-body text-base font-normal bg-gray-50 text-slate-500 py-8">
      <SideBar />
      <div className="xl:ml-72 xl:mr-11 h-screen">
        <Header />
        <div className="pt-28 px-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
