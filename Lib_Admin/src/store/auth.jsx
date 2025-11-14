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

  const [loading, setLoading] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [action, setAction] = useState("Save Details");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [showBookForm, setShowBookForm] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [showReaderForm, setShowReaderForm] = useState(false);

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
        dashboardFilter,
        setDashboardFilter,
        showProfile,
        setShowProfile,
        isActive,
        setIsActive,
        action,
        setAction,
        showBookForm,
        setShowBookForm,
        showReader,
        setShowReader,
        showReaderForm,
        setShowReaderForm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
