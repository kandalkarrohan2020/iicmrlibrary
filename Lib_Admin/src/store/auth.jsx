import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(Cookies.get("accessToken"));

  let isLoggedIn = !!accessToken;

  const storeTokenInCookie = (token) => {
    Cookies.set("accessToken", token);
    setAccessToken(Cookies.get("accessToken"));
  };
  const delTokenInCookie = () => {
    setAccessToken();
    Cookies.remove("accessToken");
  };

  const URI = "http://localhost:3000";
  //const URI = "https://api.reparv.in";

  const [loading, setLoading] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState("Booked");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [action, setAction] = useState("Save Details");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [showAdditionalInfoForm, setShowAdditionalInfoForm] = useState(false);
  const [showPropertyInfo, setShowPropertyInfo] = useState(false);
  const [showUpdateImagesForm, setShowUpdateImagesForm] = useState(false);
  const [showVideoUploadForm, setShowVideoUploadForm] = useState(false);
  const [showPropertyLocationForm, setShowPropertyLocationForm] =
    useState(false);

  return (
    <AuthContext.Provider
      value={{
        URI,
        loading,
        setLoading,
        isLoggedIn,
        storeTokenInCookie,
        delTokenInCookie,
        accessToken,
        setAccessToken,
        dashboardFilter,
        setDashboardFilter,
        showProfile,
        setShowProfile,
        isActive,
        setIsActive,
        action,
        setAction,
        showPropertyForm,
        setShowPropertyForm,
        user,
        setUser,
        showAdditionalInfoForm,
        setShowAdditionalInfoForm,
        showPropertyInfo,
        setShowPropertyInfo,
        showUpdateImagesForm,
        setShowUpdateImagesForm,
        showVideoUploadForm,
        setShowVideoUploadForm,
        showPropertyLocationForm,
        setShowPropertyLocationForm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
