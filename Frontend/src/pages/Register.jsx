import { useState, useEffect } from "react";
import LoginBackground from "../assets/login/LoginBackground.png";
import {
  FaUser,
  FaPhoneAlt,
  FaUserTie,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserCog,
  FaStore,
} from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../store/auth";
import Loader from "../components/Loader";

function Register() {
  const { storeTokenInCookie, URI, setLoading, loading } = useAuth();

  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("");
  const [fullname, setFullname] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
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
      const activeRoles = data.filter(
        (item) => item.status === "Active" && item.registration === "Yes"
      );
      setRoles(activeRoles);
      //console.log(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const userRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validation
    if (!role || !fullname || !contact || !email) {
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
        `${URI}/admin/register`,
        { role, fullname, contact, email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 201) {
        console.log("Registration Successful", response.data);
        // Optionally: show a success message or redirect to login
        alert(
          "Registration Successfull, Username and Password Sent on your Email"
        );
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
      className="w-full h-screen bg-white flex flex-col md:flex-row items-center justify-center"
    >
      <div className="w-full h-full flex flex-col items-center justify-center relative p-4">
        <div className="w-full max-w-[364px] bg-white shadow-md rounded-[12px] py-[24px] px-[32px] flex flex-col items-start gap-[12px] border-2 border-blue-950">
          <div className="w-full flex items-center justify-between gap-2">
            <h2 className="text-[26px] font-bold text-black">Register</h2>
            {loading && <Loader />}
          </div>

          {/* Show Error Message */}
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          {/* Role Input */}
          <div className="group w-full max-w-[300px] h-[45px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#2361ff]">
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

          {/* Full Name Input */}
          <div className="group w-full max-w-[300px] h-[45px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#2361ff]">
            <FaUser className="text-black/20 w-[16px] h-[16px] mr-[10px] group-focus-within:text-[#2361ff]" />
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              type="text"
              placeholder="Full Name"
              className="w-full border-none outline-none text-[14px]"
            />
          </div>

          {/* Contact Input */}
          <div className="group w-full max-w-[300px] h-[45px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#2361ff]">
            <FaPhoneAlt className="text-black/20 w-[16px] h-[16px] mr-[10px] group-focus-within:text-[#2361ff]" />
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
          <div className="group w-full max-w-[300px] h-[45px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#2361ff]">
            <IoMail className="text-black/20 w-[18px] h-[18px] mr-[10px] group-focus-within:text-[#2361ff]" />
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
            className="w-full max-w-[300px] h-[45px] bg-[#2361ff] text-white rounded-full text-[16px] font-semibold transition hover:text-[#fffcfc] active:scale-95"
          >
            Register
          </button>

          {/* Already have an account */}
          <p className="w-full max-w-[300px] text-[14px] text-black/70 leading-[17px] text-left">
            Already have an account?{" "}
            <Link to="/login" className="text-[#2361ff] font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
