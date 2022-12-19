import SideBar from "../../components/SideBar";
import Header from "../Header";

const Layout = ({ children }: any) => {
  return (
    <div className="font-body text-base font-normal bg-gray-50 text-slate-500">
      <SideBar />
      <div className="xl:ml-[250px] h-screen">
        <Header />
        <div className="pt-28 container mx-auto px-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
