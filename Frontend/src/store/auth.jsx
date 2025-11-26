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

  const URI = "http://localhost:8080";
  //const URI = "https://api-iicmrlibrary.onrender.com"

  const [loading, setLoading] = useState(false);
  const [giveAccess, setGiveAccess] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [action, setAction] = useState("Save Details");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [showRole, setShowRole] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showAssignTaskForm, setShowAssignTaskForm] = useState(false);
  const [showItem, setShowItem] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [showReaderForm, setShowReaderForm] = useState(false);
  const [showFinePaymentForm, setShowFinePaymentForm] = useState(false);
  const [readerPaymentStatus, setReaderPaymentStatus] = useState("Paid");

  return (
    <AuthContext.Provider
      value={{
        URI,
        user,
        setUser,
        loading,
        setLoading,
        isLoggedIn,
        storeTokenInCookie,
        delTokenInCookie,
        accessToken,
        setAccessToken,
        giveAccess,
        setGiveAccess,
        dashboardFilter,
        setDashboardFilter,
        showProfile,
        setShowProfile,
        isActive,
        setIsActive,
        action,
        setAction,
        showRole,
        setShowRole,
        showRoleForm,
        setShowRoleForm,
        showItem,
        setShowItem,
        showItemForm,
        setShowItemForm,
        showReader,
        setShowReader,
        showReaderForm,
        setShowReaderForm,
        showAssignTaskForm,
        setShowAssignTaskForm,
        giveAccess,
        setGiveAccess,
        showFinePaymentForm,
        setShowFinePaymentForm,
        readerPaymentStatus, setReaderPaymentStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
