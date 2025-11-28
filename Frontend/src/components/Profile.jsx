import { FaArrowLeft } from "react-icons/fa6";
import { useAuth } from "../store/auth";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import { IoMdClose } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";

const Profile = () => {
  const { showProfile, setShowProfile, setLoading, URI } = useAuth();
  const [user, setUser] = useState({
    fullname: "",
    username: "",
    email: "",
    contact: "",
    role: "",
    userimage: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [newUser, setNewUser] = useState({
    fullname: "",
    username: "",
    email: "",
    contact: "",
  });

  // Profile Image Upload
  const [selectedImage, setSelectedImage] = useState(null);

  const singleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const removeSingleImage = () => {
    setSelectedImage(null);
  };

  // fetch data
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${URI}/admin/profile`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok)
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json(); // Ensure it's JSON
      setNewUser(data);
      setUser(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const editProfile = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullname", newUser.fullname);
    formData.append("username", newUser.username);
    formData.append("email", newUser.email);
    formData.append("contact", newUser.contact);
    formData.append("image", selectedImage);

    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/profile/edit`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        setLoading(false);
        alert("Profile Updated Successfully!");
      }

      // Reset after upload
      setSelectedImage(null);
      setShowEditProfile(false);
      setNewUser({
        fullname: "",
        username: "",
        email: "",
        contact: "",
      });
      await fetchProfile();
    } catch (err) {
      console.error("Error Updating Profile", err);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    // Ensure state variables exist
    if (!currentPassword || !newPassword) {
      setErrorMessage("Both current and new passwords are required.");
      return;
    }

    try {
      setLoading(true); // Show loading state before the request

      const response = await fetch(`${URI}/admin/profile/changepassword`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Get error message from response
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();
      alert("Password Changed Successfully!");

      // Update user state
      fetchProfile();
      setNewUser(data);
      setUser(data);
      setShowChangePass(false);
      setErrorMessage("");
    } catch (err) {
      console.error("Error changing password:", err);
      setErrorMessage(
        err.message || "Password change failed. Please try again."
      );
    } finally {
      setLoading(false);
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div
      className={`ProfileContainer fixed z-[1001] w-full h-screen bg-[#4242428b] flex items-center justify-end `}
    >
      <div className="Profile w-full md:w-[384px] h-screen overflow-scroll scrollbar-hide bg-[#F5F5F6] flex flex-col items-center justify-start gap-3 px-8 py-14 ">
        <div className="arrow w-[320px] h-[30px] px-3 flex justify-between">
          <FaArrowLeft
            onClick={() => {
              setShowProfile(false);
            }}
            className="w-6 h-6 cursor-pointer active:scale-95"
          />
        </div>
        <div className="profileImgContainer w-[320px] h-[300px] bg-[#FFFFFF] flex flex-col items-center justify-center p-5 gap-3 rounded-[20px] shadow-[#0000001A] ">
          <img
            src={`${URI}${user?.userimage}`}
            alt=""
            className="w-[120px] h-[120px] rounded-[50%]"
          />
          <h2 className="text-[18px] leading-5 font-semibold text-[#076300]">
            {user?.fullname}
          </h2>
          <h3 className="text-sm leading-4 font-medium text-[#000000]">
            {user?.role}
          </h3>
        </div>

        <Link
          to={`/kyc/${user?.id}`}
          className={`${user?.role === "Student" || user?.role === "Student" ? "block" : "hidden"} userOtherDetails cursor-pointer text-[#076300] active:scale-95 w-[320px] h-[40px] bg-[#FFFFFF] hover:bg-[#00760c] hover:text-[#FFFFFF] flex flex-col items-center justify-center p-5 gap-3 rounded-[20px] shadow-[#0000001A] `}
        >
          <h2 className="text-[16px] leading-5 font-semibold flex gap-2 items-center justify-center">
            <span>KYC Details</span>{" "}
            <IoCheckmarkDoneCircleSharp
              className={`${
                user?.status === "Active" ? "block" : "hidden"
              } w-5 h-5`}
            />
          </h2>
        </Link>

        {/* Upload Profile Image */}
        <div className={` ${showEditProfile ? "flex" : "hidden"}  w-[320px] `}>
          <div className="w-[330px] sm:w-[500px] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-[20px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold">Edit Profile</h2>
              <IoMdClose
                onClick={() => {
                  setShowEditProfile(false);
                }}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
            <form
              onSubmit={editProfile}
              className="w-full grid gap-4 place-items-center grid-cols-1"
            >
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  value={newUser.fullname}
                  onChange={(e) => {
                    setNewUser({
                      ...newUser,
                      fullname: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Your UserName
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter UserName"
                  value={newUser.username}
                  onChange={(e) => {
                    setNewUser({
                      ...newUser,
                      username: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Contact Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Contact Number"
                  value={newUser.contact}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) {
                      // Allows only up to 10 digits
                      setNewUser({ ...newUser, contact: input });
                    }
                  }}
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter Email"
                  value={newUser.email}
                  onChange={(e) => {
                    setNewUser({
                      ...newUser,
                      email: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <div className="w-full mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={singleImageChange}
                    className="hidden"
                    id="addImage"
                  />
                  <label
                    htmlFor="addImage"
                    className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
                  >
                    <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                      Select Image
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>

                {/* Preview Section */}
                {selectedImage && (
                  <div className="relative mt-2 flex items-end justify-end">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Uploaded preview"
                      className="w-[100%] object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeSingleImage}
                      className="absolute top-1 right-1 bg-red-500 text-white text-sm px-2 py-1 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-1">
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
                >
                  Update Your Profile
                </button>
                <Loader />
              </div>
            </form>
          </div>
        </div>

        {/* Upload Profile Image */}
        <div className={` ${showChangePass ? "flex" : "hidden"}  w-[320px] `}>
          <div className="w-[330px] sm:w-[500px] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-[20px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold">Password Change</h2>
              <IoMdClose
                onClick={() => {
                  setShowChangePass(false);
                }}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
            <form
              onSubmit={changePassword}
              className="w-full grid gap-4 place-items-center grid-cols-1"
            >
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Current Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Current Password"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter New Password"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              {/* Show Error Message */}
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
                >
                  Change Password
                </button>
                <Loader />
              </div>
            </form>
          </div>
        </div>

        <div
          className={`${
            !showEditProfile && !showChangePass ? "flex" : "hidden"
          } profileInfoContainer pt-12 pb-7 w-[320px] h-[495px] bg-[#FFFFFF] flex flex-col px-10 gap-5 rounded-[20px] shadow-[#0000001A] `}
        >
          <div className="w-full flex items-center justify-between gap-4">
            <h2 className="text-[18px] leading-5 font-semibold text-[#00000066] ">
              User Information
            </h2>
            <FaEdit
              onClick={() => {
                fetchProfile();
                setShowEditProfile(true);
              }}
              className="text-[#076300] w-5 leading-5 font-semibold cursor-pointer active:scale-95"
            />
          </div>
          <h3 className="text-[16px] text-[#000000] leading-5 ">
            Name:{" "}
            <b className="text-[16px] text-[#000000] leading-5 font-semibold ">
              {" "}
              {user?.fullname}
            </b>
          </h3>
          <h3 className="text-[16px] text-[#000000] leading-5 ">
            UserName:{" "}
            <b className="text-[16px] text-[#000000] leading-5 font-semibold ">
              {" "}
              {user?.username}
            </b>
          </h3>
          <h3 className="text-[16px] text-[#000000] leading-5 ">
            Email:{" "}
            <b className="text-[16px] text-[#000000] leading-5 font-semibold ">
              {" "}
              {user?.email}
            </b>
          </h3>
          <h3 className="text-[16px] text-[#000000] leading-5 ">
            Phone:{" "}
            <b className="text-[16px] text-[#000000] leading-5 font-semibold ">
              {" "}
              {user?.contact}
            </b>
          </h3>
          <h3 className="text-[16px] text-[#000000] leading-5 ">
            Role:{" "}
            <b className="text-[16px] text-[#000000] leading-5 font-semibold ">
              {" "}
              {user?.role}
            </b>
          </h3>
          <h3
            className="text-[16px] text-[#000000] leading-5 "
            onClick={() => {
              setShowChangePass(true);
            }}
          >
            <b className="text-[16px] text-[#076300] leading-5 font-semibold cursor-pointer">
              {" "}
              Change password
            </b>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Profile;
