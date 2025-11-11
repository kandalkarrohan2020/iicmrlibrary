import { useState, useEffect } from "react";
import ReparvMainLogo from "../assets/layout/reparvMainLogo.svg";
import LoginLeftIMG from "../assets/login/LoginLeftIMG.svg";
import LoginLine from "../assets/login/LoginLine.png";
import { FaUser, FaPhoneAlt } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../store/auth";
import Loader from "../components/Loader";

function Register() {
  const { storeTokenInCookie, URI, setLoading, loading } = useAuth();

  const [fullname, setFullname] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const userRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validation
    if (!fullname || !contact || !email) {
      setErrorMessage("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(contact)) {
      setErrorMessage("Please enter a valid 10-digit contact number.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${URI}/guest-user/register`,
        { fullname, contact, email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 201) {
        console.log("Registration Successful", response.data);
        // Optionally: show a success message or redirect to login
        alert("Registration Successfull, Username and Password Sent on your Email");
        navigate("/login", { replace: true });
      } else {
        setErrorMessage(response.data?.message || "Registration failed.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
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
        <div className="w-full max-w-[364px] bg-white shadow-md rounded-[12px] py-[24px] px-[32px] flex flex-col items-start gap-[15px]">
          <div className="w-full flex items-center justify-between gap-2">
            <h2 className="text-[26px] font-bold text-black">Register</h2>
            {loading && <Loader />}
          </div>

          {/* Show Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          {/* Full Name Input */}
          <div className="group w-full max-w-[300px] h-[60px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#0BB501]">
            <FaUser className="text-black/20 w-[20px] h-[20px] mr-[10px] group-focus-within:text-[#0BB501]" />
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              type="text"
              placeholder="Full Name"
              className="w-full border-none outline-none text-[14px]"
            />
          </div>

          {/* Contact Input */}
          <div className="group w-full max-w-[300px] h-[60px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#0BB501]">
            <FaPhoneAlt className="text-black/20 w-[20px] h-[20px] mr-[10px] group-focus-within:text-[#0BB501]" />
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              type="text"
              placeholder="Contact Number"
              className="w-full border-none outline-none text-[14px]"
              maxLength="10"
            />
          </div>

          {/* Email Input */}
          <div className="group w-full max-w-[300px] h-[60px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#0BB501]">
            <IoMail className="text-black/20 w-[24px] h-[24px] mr-[10px] group-focus-within:text-[#0BB501]" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="Email Address"
              className="w-full border-none outline-none text-[14px]"
            />
          </div>

          {/* Register Button */}
          <button
            onClick={userRegister}
            className="w-full max-w-[300px] h-[53px] bg-[#0BB501] text-white rounded-full text-[16px] font-semibold transition hover:text-[#fffcfc] active:scale-95"
          >
            Register
          </button>

          {/* Already have an account */}
          <p className="w-full max-w-[300px] text-[14px] text-black/70 leading-[17px] text-left">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0BB501] font-medium">
              Login
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

export default Register;
