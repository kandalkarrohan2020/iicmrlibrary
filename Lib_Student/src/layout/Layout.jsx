import React, { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { FaSwatchbook } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";
import libraryLogo from "../assets/layout/libraryLogo.png";
import { Outlet } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import Profile from "../components/Profile";
import { useAuth } from "../store/auth";
import LogoutButton from "../components/LogoutButton";
import { FaUserCircle } from "react-icons/fa";

function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShortBar, setIsShortbar] = useState(false);
  const [heading, setHeading] = useState(localStorage.getItem("head"));
  const {
    URI,
    showProfile,
    setShowProfile,
    showLibraryForm,
    setShowLibraryForm,
    isLoggedIn,
  } = useAuth();

  const overlays = [
    { state: showLibraryForm, setter: setShowLibraryForm },
  ];

  const getNavLinkClass = (path) => {
    return location.pathname === path ? "font-semibold text-[#163c9d]" : "";
  };

  const getNavLinkClassForSidebar = (path) => {
    return location.pathname === path
      ? "font-semibold bg-[#E3FFDF] shadow-[0px_1px_0px_0px_rgba(0,_0,_0,_0.1)]"
      : "";
  };

  const getHeading = (label) => {
    setHeading(label);
    localStorage.setItem("head", label);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-[#F5F5F6]">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center justify-between px-5 py-3 bg-white">
        <div className="navLogo flex items-center justify-center">
          <img src={libraryLogo} alt="Library Logo" className="w-[50px] mr-4" />
          <h1 className="text-xl font-semibold">Library</h1>
        </div>
        <div className="ButtonContainer flex gap-4 items-center justify-center">
          <FaUserCircle
            onClick={() => {
              //setShowProfile("true");
            }}
            className="w-8 h-8 text-[#163c9d]"
          />
          <LogoutButton />
          <button
            className="text-black hover:text-[#076300] active:scale-95"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen === false ? (
              <IoMenu size={40} />
            ) : (
              <IoMdClose size={40} />
            )}
          </button>
        </div>
      </div>

      {/* Navbar */}
      <div className="navbar hidden w-full h-[80px] md:flex items-center justify-center border-b-2">
        <div className="navLogo w-[300px] h-[80px] flex items-center justify-center">
          <img src={libraryLogo} alt="Library Logo" className="w-[70px] mr-4" />
          <h1 className="text-2xl font-semibold">Library</h1>
        </div>

        <div className="navHeading w-full h-16 flex items-center justify-between text-lg font-semibold">
          <div className="TabLinks flex gap-6">
            {/* Navigation Links */}
            {[
              {
                to: "/books",
                icon: <FaSwatchbook className="w-5 h-5"  />,
                label: "Books",
              },
              {
                to: "/history",
                icon: <FaHistory className="w-5 h-5" />,
                label: "History",
              },
            ].map(({ to, icon, label }) => (
              <NavLink
                onClick={() => {
                  setIsSidebarOpen(false);
                  getHeading(label);
                }}
                key={to}
                //to={isLoggedIn === true ? to : "/"}
                to={to}
                className={`flex items-center gap-3 w-full p-3 rounded-[20px] transition-all duration-300 ${getNavLinkClass(
                  to
                )}`}
              >
                <span className={`text-sm md:text-lg`}>{label}</span>
                {icon}
              </NavLink>
            ))}
          </div>
          <div className="right-heading w-[135px] h-[40px] flex items-center justify-between mr-8">
            <FaUserCircle
              onClick={() => {
                //setShowProfile("true");
              }}
              className="w-8 h-8 rounded-full text-[#163c9d]"
            />
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex overflow-y-scroll scrollbar-hide">
        <div
          className={`w-64 h-full fixed md:hidden overflow-y-scroll scrollbar-hide bg-white shadow-md md:shadow-none md:static top-0 left-0 z-20 md:bg-[#F5F5F6] transition-transform duration-300 transform ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex flex-col items-center gap-2 p-4 md:gap-2">
            <div className="navLogo md:hidden flex items-center justify-center mb-2">
              <img
                src={libraryLogo}
                alt="Library Logo"
                className="w-[40px] mr-4"
              />
              <h1 className="text-xl font-semibold">Library</h1>
            </div>
            {/* Navigation Links */}
            {[
              {
                to: "/books",
                icon: <FaSwatchbook className="w-5 h-5"/>,
                label: "Books",
              },
              {
                to: "/history",
                icon: <FaHistory className="w-5 h-5" />,
                label: "History",
              },
            ].map(({ to, icon, label }) => (
              <NavLink
                onClick={() => {
                  setIsSidebarOpen(false);
                  getHeading(label);
                }}
                key={to}
                //to={isLoggedIn === true ? to : "/"}
                to={to}
                className={`flex items-center gap-3 w-full p-3 pl-6 rounded-[20px] transition-all duration-300 text-black ${getNavLinkClassForSidebar(
                  to
                )}`}
              >
                {icon}
                <span className={`text-base md:text-lg`}>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 md:p-4 overflow-scroll scrollbar-hide"
          onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
        >
          <Outlet />
        </div>
      </div>
      {showProfile && <Profile />}

      {overlays.map(({ state, setter }, index) =>
        state ? (
          <div
            key={index}
            className="w-full h-screen z-[60] fixed bg-[#767676a0]"
            onClick={() => setter(false)}
          ></div>
        ) : null
      )}
    </div>
  );
}

export default Layout;
