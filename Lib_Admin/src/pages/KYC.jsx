import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";

export default function KYC() {
  const { userid } = useParams();
  const navigate = useNavigate();
  const { URI, setLoading } = useAuth();

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [userData, setUserData] = useState({
    fullname: "",
    contact: "",
    email: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    experience: "",
    adharno: "",
    panno: "",
    ifsc: "",
    bankname: "",
    accountnumber: "",
    accountholdername: "",
  });

  // State: each category stores an array of files
  const [imageFiles, setImageFiles] = useState({
    adharImage: [],
    panImage: [],
    reraImage: [],
  });

  // Handle multiple file selection
  const handleImageChange = (event, category) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setImageFiles((prev) => ({
      ...prev,
      [category]: [...prev[category], ...files], // append new files
    }));
  };

  // Remove a specific image by index
  const removeImage = (category, index) => {
    setImageFiles((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  // **Fetch States from API**
  const fetchStates = async () => {
    try {
      const response = await fetch(URI + "/admin/states", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch States.");
      const data = await response.json();
      setStates(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // **Fetch States from API**
  const fetchCities = async () => {
    try {
      const response = await fetch(`${URI}/admin/cities/${userData?.state}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Cities.");
      const data = await response.json();
      console.log(data);
      setCities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const showDetails = async () => {
    try {
      const response = await fetch(URI + `/admin/guestuser/${userid}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch User!");
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (imageFiles.adharImage.length !== 2) {
      alert("Please Add Aadhaar Front & Back Images for KYC");
      return;
    }
    if (imageFiles.panImage.length !== 2) {
      alert("Please Add PAN Front & Back Images for KYC");
      return;
    }

    const formData = new FormData();

    // Append user data
    Object.entries(userData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Append Aadhaar images
    if (imageFiles.adharImage.length > 1) {
      imageFiles.adharImage.forEach((file, index) => {
        formData.append("adharImage", file);
      });
    }

    // Append PAN images
    if (imageFiles.panImage.length > 1) {
      imageFiles.panImage.forEach((file, index) => {
        formData.append("panImage", file);
      });
    }

    // Append RERA images (optional)
    if (imageFiles.reraImage.length > 0) {
      imageFiles.reraImage.forEach((file, index) => {
        formData.append("reraImage", file);
      });
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${URI}/admin/guestuser/edit/${userData.id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (response.ok) {
        alert("Data Successfully Sent For KYC!");
        alert("Login Again!");
        navigate("/", { replace: true });
        setUserData({
          fullname: "",
          contact: "",
          email: "",
          address: "",
          state: "",
          city: "",
          pincode: "",
          experience: "",
          adharno: "",
          panno: "",
          rerano: "",
          ifsc: "",
          bankname: "",
          accountnumber: "",
          accountholdername: "",
        });
        setImageFiles({ adharImage: [], panImage: [], reraImage: [] });
      } else {
        throw new Error(`Failed to save kyc data. Status: ${response.status}`);
      }
    } catch (err) {
      console.error("Error saving Partner:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    showDetails();
    fetchStates();
  }, []);

  useEffect(() => {
    if (userData.state != "") {
      fetchCities();
    }
  }, [userData.state]);

  return (
    <div className="w-full h-screen bg-white py-8 px-4 sm:px-8 border border-[#cfcfcf33] rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-semibold">
          Enter Details to Start Your Journey
        </h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full p-1 pb-10 max-h-[85vh] overflow-scroll scrollbar-hide"
      >
        <h2 className="text-[15px] font-semibold mb-2">
          Step: 1 Address Details
        </h2>
        <div className="w-full grid gap-4 place-items-center grid-cols-1 md:grid-cols-3 xl:grid-cols-4 mb-4">
          <input
            type="hidden"
            value={userData.partnerid || ""}
            onChange={(e) =>
              setUserData({ ...userData, partnerid: e.target.value })
            }
          />
          <div className="w-full">
            <label
              className={`${
                userData.address ? "text-green-600" : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Address <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter Address"
              value={userData.address}
              onChange={(e) => {
                setUserData({
                  ...userData,
                  address: e.target.value,
                });
              }}
              className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] placeholder:text-black"
            />
          </div>

          {/* State Select Input */}
          <div className="w-full">
            <label
              className={`${
                userData.state ? "text-green-600" : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Select State <span className="text-red-600">*</span>
            </label>
            <select
              required
              className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] appearance-none bg-transparent placeholder:text-black"
              style={{ backgroundImage: "none" }}
              value={userData.state}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  state: e.target.value,
                })
              }
            >
              <option value="">Select Your State</option>
              {states.map((state, index) => (
                <option key={index} value={state.state}>
                  {state.state}
                </option>
              ))}
            </select>
          </div>

          {/* City Select Input */}
          <div className="w-full">
            <label
              className={`${
                userData.city ? "text-green-600" : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Select City <span className="text-red-600">*</span>
            </label>
            <select
              required
              className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] appearance-none bg-transparent placeholder:text-black"
              style={{ backgroundImage: "none" }}
              value={userData.city}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  city: e.target.value,
                })
              }
            >
              <option value="">Select Your City</option>
              {cities.map((city, index) => (
                <option key={index} value={city.city}>
                  {city.city}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label
              className={`${
                userData.pincode ? "text-green-600" : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Pin-Code <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              required
              placeholder="Enter Pin-Code"
              value={userData.pincode}
              onChange={(e) => {
                const input = e.target.value;
                if (/^\d{0,6}$/.test(input)) {
                  setUserData({ ...userData, pincode: input });
                }
              }}
              className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] placeholder:text-black"
            />
          </div>
        </div>

        <h2 className="flex flex-wrap items-center gap-2 text-[15px] font-semibold pb-4">
          <span>Step: 2 Other Details & Proof of Documents</span>{" "}
          <span className="sm:ml-2 text-red-600 text-xs">
            ( Max Image size 100kb )
          </span>
        </h2>
        <div className="w-full grid gap-4 place-items-center grid-cols-1 md:grid-cols-3 xl:grid-cols-4 mb-4">
          <div className="w-full">
            <label
              className={`${
                userData.adharno ? "text-green-600" : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Adhar Card Number <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              required
              placeholder="Enter Adhar Number"
              value={userData.adharno}
              onChange={(e) => {
                const input = e.target.value;
                if (/^\d{0,12}$/.test(input)) {
                  setUserData({ ...userData, adharno: input });
                }
              }}
              className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] placeholder:text-black"
            />
          </div>

          <div className="w-full">
            <label
              className={`${
                userData.panno ? "text-green-600" : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Pan Card Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter Pan Number"
              value={userData.panno}
              onChange={(e) => {
                const input = e.target.value.toUpperCase(); // Convert to uppercase
                if (/^[A-Z0-9]{0,10}$/.test(input)) {
                  setUserData({ ...userData, panno: input });
                }
              }}
              className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] placeholder:text-black"
            />
          </div>

          <div className="w-full">
            <label
              className={`${
                userData.experience ? "text-green-600" : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Experience <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter Experience"
              value={userData.experience}
              onChange={(e) => {
                setUserData({
                  ...userData,
                  experience: e.target.value,
                });
              }}
              className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] placeholder:text-black"
            />
          </div>
          <div></div>

          {/* Aadhaar Image Upload */}
          <div className="w-full">
            <label
              className={`${
                imageFiles.adharImage.length > 0
                  ? "text-green-600"
                  : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Aadhaar Front & Back Images{" "}
              <span className="text-red-600">*</span>
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageChange(e, "adharImage")}
              className="hidden"
              id="adharImageUpload"
            />

            <label
              htmlFor="adharImageUpload"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer mt-2"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>

            {/* Preview Aadhaar Images */}
            {imageFiles.adharImage.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {imageFiles.adharImage.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Aadhaar"
                      className="w-full max-w-[120px] object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("adharImage", index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAN Image Upload */}
          <div className="w-full">
            <label
              className={`${
                imageFiles.panImage.length > 0
                  ? "text-green-600"
                  : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              PAN Card Front & Back Images{" "}
              <span className="text-red-600">*</span>
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageChange(e, "panImage")}
              className="hidden"
              id="panImageUpload"
            />

            <label
              htmlFor="panImageUpload"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer mt-2"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>

            {/* Preview Section */}
            {imageFiles.panImage.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {imageFiles.panImage.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="PAN Preview"
                      className="w-full max-w-[120px] object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("panImage", index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex mt-8 md:mt-8 justify-end gap-6">
          <button
            type="button"
            onClick={() => {
              navigate(-1);
            }}
            className="px-6 py-3 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-white bg-[#076300] rounded active:scale-[0.98]"
          >
            Save
          </button>
          <Loader />
        </div>
      </form>
    </div>
  );
}
