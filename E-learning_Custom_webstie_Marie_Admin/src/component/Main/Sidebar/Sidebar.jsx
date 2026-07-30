/* eslint-disable react/prop-types */
import { useState } from "react";
import { IoIosLogOut } from "react-icons/io";
import { IoDocumentTextOutline, IoMapOutline, IoSchoolOutline, IoSettingsSharp } from "react-icons/io5";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "/public/logo/main_logo.jpg";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../redux/features/auth/authSlice";
import { MdDashboard } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { RiDashboardHorizontalLine, RiFileEditLine, RiFocus2Line } from "react-icons/ri";
import { CiCreditCard1, CiUser, CiWallet } from "react-icons/ci";
import { BsCalendarPlus } from "react-icons/bs";
import { LuDollarSign } from "react-icons/lu";
import { FaRegUserCircle } from "react-icons/fa";
import { SlDirections } from "react-icons/sl";
import { AiOutlineQuestionCircle } from "react-icons/ai";

const sidebarItems = [
  {
    path: "/",
    name: "Overview",
    icon: <RiDashboardHorizontalLine className="size-4" />,
  },
  {
    path: "/users",
    name: "All Users",
    icon: <CiUser className="size-4" />,
  },
  // {
  //   path: "/mentees",
  //   name: "Mentees",
  //   icon: <RiFocus2Line className="size-4" />,
  // },
  // {
  //   path: "/mentors",
  //   name: "Mentors",
  //   icon: <IoSchoolOutline className="size-6" />,
  // },
  {
    path: "/booking-list",
    name: "Booking list",
    icon: <BsCalendarPlus className="size-4" />,
  },
  {
    path: "/free-questionnaire",
    name: "Free Questionnaire",
    icon: <RiFileEditLine className="size-4" />,
  },
  {
    path: "/expedition-journey",
    name: "Expedition Journey",
    icon: <IoMapOutline className="size-4" />,
  },

  {
    path: "/individual-capsules",
    name: "Individual Capsules",
    icon: <RiDashboardHorizontalLine className="size-4" />,
  },

  {
    path: "/subscriptions",
    name: "Subscriptions",
    icon: <CiCreditCard1 className="size-4" />,
  },

  // {
  //   path: "/capsules",
  //   name: "Capsules",
  //   icon: <LuDollarSign className="size-4" />,
  // },

  {
    path: "/wallet",
    name: "Wallet",
    icon: <CiWallet className="size-4" />,
  },


  {
    path: "/privacy-policy",
    name: "Privacy Policy",
    icon: <IoDocumentTextOutline className="size-4" />,
  },
  {
    path: "/terms-conditions",
    name: "Terms & Conditions",
    icon: <SlDirections className="size-4" />,
  },
  {
    path: "/faq",
    name: "FAQ",
    icon: <AiOutlineQuestionCircle className="size-4" />,
  },
  {
    path: "/my-account",
    name: "My Account",
    icon: <FaRegUserCircle className="size-4" />,
  },


  //? Start here


  // {
  //   path: "/settings",
  //   name: "Settings",
  //   icon: <IoSettingsSharp className="size-6" />,
  // },
];

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div className="relative">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col w-full md:w-[200px] lg:w-[250px] xl:w-[280px] h-screen border-r border-[#ebebeb] fixed shadow-lg bg-white">
        <Link to={"/"} className="flex flex-col justify-center items-center pt-5 gap-2 shrink-0">
          <img src={logo} alt="logo" className="w-2/3 rounded mb-5 " />
        </Link>

        <ul className="flex flex-col gap-1 mt-2 flex-1 overflow-y-auto pb-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `w-[80%] mx-auto px-5 py-2 flex justify-start items-center gap-3 rounded text-black ${isActive ? "bg-[#2d2a71] !text-white " : ""
                }`
              }
            >
              {item?.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </ul>

        <div className="shrink-0 border-t border-[#ebebeb] py-3">
          <button
            onClick={() => setShowModal(true)}
            className="w-[80%] mx-auto px-5 py-2 flex justify-start items-center gap-3 rounded text-red-500 hover:bg-red-50 transition-colors"
          >
            <IoIosLogOut className="size-5 shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 w-64 h-full bg-[#2d2a71] shadow-lg transform flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div onClick={toggleSidebar} className="absolute top-0 right-0 p-4 z-10">
          <RxCross1 className="size-6 text-white" />
        </div>
        <div className="flex flex-col justify-center items-center pt-5 gap-2 shrink-0">
          <img src={logo} alt="logo" className=" w-20 h-20 rounded shadow mb-5" />
        </div>

        <ul className="flex flex-col gap-3 mt-4 flex-1 overflow-y-auto pb-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `w-[80%] mx-auto px-5 py-2 flex items-center gap-3 text-white rounded ${isActive ? "bg-white/10" : ""
                }`
              }
            >
              {item?.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </ul>

        <div className="shrink-0 border-t border-white/20 py-3">
          <button
            onClick={() => {
              setShowModal(true);
              toggleSidebar();
            }}
            className="w-[80%] mx-auto px-5 py-2 flex items-center gap-3 text-red-300 hover:bg-white/10 rounded transition-colors"
          >
            <IoIosLogOut className="size-5 shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">Confirm Logout</h3>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-between">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
