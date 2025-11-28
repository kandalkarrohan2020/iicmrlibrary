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
    department: "",
    yearofstudy: "",
    designation: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
  });

  //Single Image Upload
  const [selectedImage, setSelectedImage] = useState(null);

  const imageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
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
      //console.log(data);
      setCities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const showDetails = async () => {
    try {
      const response = await fetch(`${URI}/admin/readers/get/${userid}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Project Partner!");
      const data = await response.json();
      setUserData(data);
      console.log(data);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // === Validation ===
    if (!selectedImage && !userData.idcardimage) {
      alert("Please select a Identity Card Image.");
      return;
    }

    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxFileSize = 1 * 1024 * 1024; // 1 MB

    // Validate file
    if (selectedImage) {
      if (!allowedImageTypes.includes(selectedImage.type)) {
        alert("Only JPG, PNG, WEBP image are allowed for Id Card Image.");
        return;
      }
      if (selectedImage.size > maxFileSize) {
        alert("Id card Image size must be less than 1MB.");
        return;
      }
    }

    const formData = new FormData();

    // Append user data
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });

    if (selectedImage) formData.append("idcardimage", selectedImage);

    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/readers/edit/${userData.id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        alert("Data Successfully Sent For KYC!");
        alert("Login Again!");
        navigate("/", { replace: true });
      } else {
        throw new Error(
          `Failed to save KYC Details. Status: ${response.status}`
        );
      }
    } catch (err) {
      console.error("Error saving KYC Detail:", err);
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
    <div className="w-full mx-auto max-w-4xl h-screen bg-white py-8 px-4 sm:px-8 border border-[#cfcfcf33] rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-semibold">Enter Your Details</h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full p-1 pb-10 max-h-[85vh] overflow-scroll scrollbar-hide"
      >
        <div className="w-full grid gap-4 place-items-center grid-cols-1 md:grid-cols-2 mb-4">
          <input
            type="hidden"
            value={userData.id || ""}
            onChange={(e) => setUserData({ ...userData, id: e.target.value })}
          />
          <div className="w-full">
            <label
              className={`${
                userData.fullname ? "text-green-600" : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Full Name<span className="text-red-600">*</span>
            </label>

            <input
              type="text"
              required
              disabled
              value={userData.fullname}
              onChange={(e) => {
                setUserData({
                  ...userData,
                  fullname: e.target.value,
                });
              }}
              className="w-full mt-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] placeholder:text-black"
            />
          </div>
          <div className="w-full">
            <label
              className={`${
                userData.department ? "text-green-600" : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Department <span className="text-red-600">*</span>
            </label>

            <select
              required
              value={userData.department}
              onChange={(e) =>
                setUserData({ ...userData, department: e.target.value })
              }
              className="w-full mt-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] appearance-none"
            >
              <option value="">Select Department</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
            </select>
          </div>

          {userData.role === "Teacher" && (
            <div className="w-full">
              <label
                className={`${
                  userData.designation ? "text-green-600" : "text-[#00000066]"
                } block text-sm leading-4 font-medium`}
              >
                Designation <span className="text-red-600">*</span>
              </label>

              <input
                type="text"
                required
                placeholder="Enter Designation"
                value={userData.designation}
                onChange={(e) =>
                  setUserData({ ...userData, designation: e.target.value })
                }
                className="w-full mt-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] placeholder:text-black"
              />
            </div>
          )}

          {userData.role === "Student" && (
            <div className="w-full">
              <label
                className={`${
                  userData.yearofstudy ? "text-green-600" : "text-[#00000066]"
                } block text-sm leading-4 font-medium`}
              >
                Year of Study <span className="text-red-600">*</span>
              </label>

              <select
                required
                value={userData.yearofstudy}
                onChange={(e) =>
                  setUserData({ ...userData, yearofstudy: e.target.value })
                }
                className="w-full mt-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] appearance-none"
              >
                <option value="">Select Year</option>
                <option value="First Year">First Year</option>
                <option value="Last Year">Last Year</option>
              </select>
            </div>
          )}

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
              className="w-full mt-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] appearance-none bg-transparent placeholder:text-black"
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
              className="w-full mt-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] appearance-none bg-transparent placeholder:text-black"
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
              className="w-full mt-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] placeholder:text-black"
            />
          </div>
          <div className="w-full md:col-span-2">
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
              className="w-full mt-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#0BB501] placeholder:text-black"
            />
          </div>
        </div>

        <div className="w-full grid gap-4 place-items-center grid-cols-1 md:grid-cols-2 mb-4">
          {/* Business Logo Image Upload */}
          <div className="w-full">
            {userData?.idcardimage && (
              <div className="relative mb-3">
                <img
                  onClick={() => {
                    window.open(URI + userData?.idcardimage, "_blank");
                  }}
                  src={URI + userData?.idcardimage}
                  alt="Old Image"
                  className="w-full max-w-[100px] object-cover rounded-lg border border-gray-300 cursor-pointer"
                />
              </div>
            )}
            <label
              className={`${
                selectedImage || userData?.idcardimage
                  ? "text-green-600"
                  : "text-[#00000066]"
              } block text-sm leading-4 font-medium`}
            >
              Upload Id Card Image{" "}
              <span className="sm:ml-2 text-red-600 text-xs">
                ( Max Image size 1MB )
              </span>
            </label>

            <div className="w-full mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const allowedTypes = [
                      "image/jpeg",
                      "image/png",
                      "image/webp",
                    ];
                    const maxSize = 1 * 1024 * 1024;

                    if (!allowedTypes.includes(file.type)) {
                      alert("Only JPG, PNG, or WEBP files are allowed.");
                      e.target.value = "";
                      return;
                    }

                    if (file.size > maxSize) {
                      alert("File size must be less than 1MB.");
                      e.target.value = "";
                      return;
                    }

                    setSelectedImage(file);
                  }
                }}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
              >
                <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                  Upload Image
                </span>
                <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                  Browse
                </div>
              </label>
            </div>

            {/* Preview Section */}
            {selectedImage && (
              <div className="grid grid-cols-1 mt-3">
                <div className="relative flex items-end justify-end">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Logo Preview"
                    className="w-full max-w-[350px] object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-red-500 text-white text-sm px-2 py-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
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
            Cancel
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
