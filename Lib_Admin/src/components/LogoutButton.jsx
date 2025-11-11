import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../store/auth";

function LogoutButton() {
  const navigate = useNavigate();
  const { delTokenInCookie, URI } = useAuth();
  const userLogout = async () => {
    try {
      await axios.post(
        URI+"/guest-user/logout",
        {},
        { withCredentials: true }
      );
      delTokenInCookie();
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };

  return (
    <div
      onClick={userLogout}
      className="logoutBtn px-2 md:w-[79px] h-[28px] flex gap-6 items-center justify-center border-[1px] border-[#FF4646] rounded-[8px] text-[#FF4646] text-[16px] active:scale-95 cursor-pointer"
    >
      <p className="hidden md:block">Logout</p>
      <FaSignOutAlt className="md:hidden block" />
    </div>
  );
}

export default LogoutButton;
