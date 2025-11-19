import { useState, useEffect } from "react";
import LoginBackground from "../assets/login/LoginBackground.png";
import {
  FaUser,
  FaLock,
  FaUserTie,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserCog,
  FaStore,
} from "react-icons/fa";
import { IoEye } from "react-icons/io5";
import { IoMdEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../store/auth";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";

function Login() {
  const { storeTokenInCookie, URI, user, setLoading } = useAuth();

  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  // **Fetch Roles **
  const fetchRoles = async () => {
    try {
      const response = await fetch(URI + "/admin/roles", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch roles.");
      const data = await response.json();
      // Filter only Active roles
      const activeRoles = data.filter((item) => item.status === "Active");
      setRoles(activeRoles);
      //console.log(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const userLogin = async (e) => {
    e.preventDefault();
    //navigate("/dashboard");
    setErrorMessage("");

    if (!role || !emailOrUsername || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${URI}/admin/login`,
        { role, emailOrUsername, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.token) {
        console.log("Login Successful", response.data);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        storeTokenInCookie(response.data.token);
        navigate("/dashboard", { replace: true });
        {
          /* if (response.data.user.adharId != null) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate(`/kyc/${response.data.user.id}`, { replace: true });
        }*/
        }
      } else {
        setErrorMessage("Invalid login credentials.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div
      style={{
        backgroundImage: `url(${LoginBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="w-full h-screen flex flex-col md:flex-row items-center justify-center"
    >
      <div className="w-full h-full flex flex-col items-center justify-center relative p-4 ">
        <div className="w-full max-w-[364px] bg-white shadow-2xl rounded-[12px] py-[24px] px-[32px] flex flex-col items-start gap-[12px] border-2 border-blue-950 ">
          <div className="w-full flex items-center justify-between gap-2">
            <h2 className="text-[26px] font-bold text-black">Login..!</h2>
            <Loader />
          </div>
          <p className="text-[18px] font-normal text-black">
            Enter Your Login Credentials
          </p>

          {/* Show Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          {/* Role Input */}
          <div className="group w-full max-w-[300px] h-[50px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#2361ff]">
            {/* Dynamic Icon */}
            <span className="text-black/20 w-[16px] h-[16px] mr-[10px] group-focus-within:text-[#2361ff]">
              {role === "Admin" && <FaUserTie />}
              {role === "Student" && <FaUserGraduate />}
              {role === "Teacher" && <FaChalkboardTeacher />}
              {role === "Staff" && <FaUserCog />}
              {role === "Vendor" && <FaStore />}
              {!role && <FaUserTie />} {/* Default icon */}
            </span>

            {/* Select Dropdown */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full border-none outline-none text-[14px] bg-transparent"
            >
              <option value="" disabled>
                Select Role
              </option>

              {/* Dynamic Roles from API */}
              {roles
                ?.filter((item) => item.status === "Active") // Only Active roles
                .map((item, index) => (
                  <option key={index} value={item.role}>
                    {item.role}
                  </option>
                ))}
            </select>
          </div>

          {/* Username or Email Input */}
          <div className="group w-full max-w-[300px] h-[50px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#2361ff]">
            <FaUser className="text-black/20 w-[16px] h-[16px] mr-[10px] group-focus-within:text-[#2361ff]" />
            <input
              value={emailOrUsername}
              required
              onChange={(e) => setEmailOrUsername(e.target.value)}
              type="text"
              placeholder="Email Address OR Username"
              className="w-full border-none outline-none text-[14px]"
            />
          </div>

          {/* Password Input */}
          <div className="group w-full max-w-[300px] h-[50px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#2361ff]">
            <FaLock className="text-black/20 w-[16px] h-[16px] group-focus-within:text-[#2361ff]" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={isPasswordShow ? "text" : "password"}
              required
              placeholder="Password"
              className="w-full border-none mx-[10px] outline-none text-[14px]"
            />
            {isPasswordShow ? (
              <IoMdEyeOff
                onClick={() => setIsPasswordShow(false)}
                className="text-black/20 text-[20px] ml-[10px] cursor-pointer"
              />
            ) : (
              <IoEye
                onClick={() => setIsPasswordShow(true)}
                className="text-black/20 text-[20px] ml-[10px] cursor-pointer"
              />
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={userLogin}
            className="w-full max-w-[300px] h-[50px] bg-[#2361ff] text-white rounded-full text-[16px] font-semibold transition hover:text-[#fffcfc] active:scale-95"
          >
            Login
          </button>

          {/* Forgot Password */}
          <p
            className={`w-full max-w-[300px] text-[14px] text-black/70 leading-[17px] cursor-pointer text-left`}
          >
            Don't have an account? {"  "}
            <Link to="/register" className="text-[#2361ff] font-medium">
              {" "}
              Register{" "}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
