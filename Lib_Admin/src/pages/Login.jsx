import { useState, useEffect } from "react";
import ReparvMainLogo from "../assets/layout/reparvMainLogo.svg";
import LoginLeftIMG from "../assets/login/LoginLeftIMG.svg";
import LoginLine from "../assets/login/LoginLine.png";
import { FaUser, FaLock } from "react-icons/fa";
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
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const userLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!emailOrUsername || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${URI}/guest-user/login`,
        { emailOrUsername, password },
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
        {/* if (response.data.user.adharId != null) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate(`/kyc/${response.data.user.id}`, { replace: true });
        }*/}
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

  return (
    <div className="w-full h-screen bg-white flex flex-col md:flex-row items-center justify-center">
      {/* Left Section */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center md:px-8">
        <div className="relative md:-left-[40px] top-[20px] md:top-[30px]">
          <img src={ReparvMainLogo} alt="Reparv Logo" className="w-[180px]" />
        </div>
        <img
          src={LoginLeftIMG}
          alt="Login Left"
          className="mt-4 md:w-[400px]"
        />
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0BB501] to-[#076300] rounded-t-[20px] md:rounded-l-[20px] relative p-4">
        <div className="w-full max-w-[364px] bg-white shadow-md rounded-[12px] py-[24px] px-[32px] flex flex-col items-start gap-[22px]">
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

          {/* Username or Email Input */}
          <div className="group w-full max-w-[300px] h-[60px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#0BB501]">
            <FaUser className="text-black/20 w-[20px] h-[20px] mr-[10px] group-focus-within:text-[#0BB501]" />
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
          <div className="group w-full max-w-[300px] h-[60px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#0BB501]">
            <FaLock className="text-black/20 w-[20px] h-[20px] group-focus-within:text-[#0BB501]" />
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
            className="w-full max-w-[300px] h-[53px] bg-[#0BB501] text-white rounded-full text-[16px] font-semibold transition hover:text-[#fffcfc] active:scale-95"
          >
            Login
          </button>

          {/* Forgot Password */}
          <p className="w-full max-w-[300px] text-[14px] text-black/70 leading-[17px] cursor-pointer text-left">
            Don't have an account? {"  "}
            <Link to="/register" className="text-[#0BB501] font-medium">
              {" "}
              Register{" "}
            </Link>
          </p>
        </div>

        <img
          src={LoginLine}
          alt="Login Line"
          className="absolute bottom-0 right-0 w-[100px] md:w-[200px]"
        />
      </div>
    </div>
  );
}

export default Login;
