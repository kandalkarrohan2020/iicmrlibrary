import React from "react";
import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import FilterData from "../components/FilterData";
import AddButton from "../components/AddButton";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import MultiStepForm from "../components/propertyForm/MultiStepForm";
import UpdateImagesForm from "../components/propertyForm/UpdateImagesForm";
import { IoMdClose } from "react-icons/io";
import Loader from "../components/Loader";

const Properties = () => {
  const {
    setShowPropertyForm,
    URI,
    setLoading,
    showUpdateImagesForm,
    setShowUpdateImagesForm,
    showVideoUploadForm,
    setShowVideoUploadForm,
    showPropertyLocationForm,
    setShowPropertyLocationForm,
  } = useAuth();
  const [datas, setDatas] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [builderData, setBuilderData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyKey, setPropertyKey] = useState("");

  // Property Location Latitude & Longitude
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [newProperty, setPropertyData] = useState({
    builderid: "",
    projectBy: "",
    possessionDate: "",
    propertyCategory: "",
    propertyApprovedBy: "",
    propertyName: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    location: "",
    distanceFromCityCenter: "",
    latitude: "",
    longitude: "",
    totalSalesPrice: "",
    totalOfferPrice: "",
    stampDuty: "",
    registrationFee: "",
    gst: "",
    advocateFee: "",
    msebWater: "",
    maintenance: "",
    other: "",
    tags: "",
    propertyType: "",
    builtYear: "",
    ownershipType: "",
    builtUpArea: "",
    carpetArea: "",
    parkingAvailability: "",
    totalFloors: "",
    floorNo: "",
    loanAvailability: "",
    propertyFacing: "",
    reraRegistered: "",
    furnishing: "",
    waterSupply: "",
    powerBackup: "",
    locationFeature: "",
    sizeAreaFeature: "",
    parkingFeature: "",
    terraceFeature: "",
    ageOfPropertyFeature: "",
    amenitiesFeature: "",
    propertyStatusFeature: "",
    smartHomeFeature: "",
    securityBenefit: "",
    primeLocationBenefit: "",
    rentalIncomeBenefit: "",
    qualityBenefit: "",
    capitalAppreciationBenefit: "",
    ecofriendlyBenefit: "",
  });

  // For Update images
  const [propertyImageData, setPropertyImageData] = useState({});
  const [imageFiles, setImageFiles] = useState({
    frontView: [],
    sideView: [],
    kitchenView: [],
    hallView: [],
    bedroomView: [],
    bathroomView: [],
    balconyView: [],
    nearestLandmark: [],
    developedAmenities: [],
  });

  // for Uploade Brochure and Video
  const [videoUpload, setVideoUpload] = useState({
    brochureFile: "",
    videoFile: "",
  });

  //Single Image Upload
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

  // **Fetch Authorities from API**
  const fetchAuthorities = async () => {
    try {
      const response = await fetch(URI + "/admin/authorities", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Authorities.");
      const data = await response.json();
      setAuthorities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
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
      const response = await fetch(
        `${URI}/admin/cities/${newProperty?.state}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch cities.");
      const data = await response.json();
      console.log(data);
      setCities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Fetch Builder
  const fetchBuilder = async () => {
    try {
      const response = await fetch(URI + "/guest-user/builders/active", {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch builders.");
      const data = await response.json();
      setBuilderData(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Fetch Data
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/guest-user/properties", {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch properties.");
      const data = await response.json();
      setDatas(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/guest-user/properties/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch property.");
      const data = await response.json();
      setPropertyData(data);
      setShowPropertyForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const fetchImages = async (id) => {
    try {
      const response = await fetch(URI + `/admin/properties/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch property.");
      const data = await response.json();
      setPropertyImageData(data);
      //console.log(data);
      setShowUpdateImagesForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //fetch data on form
  const fetchPropertyLocation = async (id) => {
    try {
      const response = await fetch(
        URI + `/admin/properties/location/get/${id}`,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch property location.");
      const data = await response.json();
      setLatitude(data.latitude);
      setLongitude(data.longitude);
      setShowPropertyLocationForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Update Property Loaction Latitude and Longitude
  const updatePropertyLocation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/properties/location/edit/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude,
            longitude,
          }),
        }
      );
      const data = await response.json();
      //console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setShowPropertyLocationForm(false);
      setLatitude("");
      setLongitude("");
      await fetchData();
    } catch (error) {
      console.error("Error adding property Location:", error);
    } finally {
      setLoading(false);
    }
  };

  //fetch Brochure and Video Data From Property
  const showBrochure = async (id) => {
    try {
      const response = await fetch(URI + `/admin/properties/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch property.");
      const data = await response.json();
      setVideoUpload({
        ...videoUpload,
        brochureFile: data.brochureFile,
        videoFile: data.videoFile,
      });
      setShowVideoUploadForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const uploadVideo = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Image or PDF
    if (selectedImage) {
      formData.append("brochureFile", selectedImage);
    }

    // Video
    if (videoUpload?.videoFile) {
      formData.append("videoFile", videoUpload.videoFile);
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${URI}/admin/properties/brochure/upload/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }

      setShowVideoUploadForm(false);
      setSelectedImage(null);
      setVideoUpload({ videoFile: null });
      await fetchData();
    } catch (error) {
      console.error("Error Uploading Brochure Or Video:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStates();
    fetchBuilder();
    fetchAuthorities();
  }, []);

  useEffect(() => {
    if (newProperty.state != "") {
      fetchCities();
    }
  }, [newProperty.state]);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = datas.filter((item) => {
    // Text search filter
    const matchesSearch =
      item.propertyName?.toLowerCase().includes(searchTerm) ||
      item.company_name?.toLowerCase().includes(searchTerm) ||
      item.propertyCategory?.toLowerCase().includes(searchTerm) ||
      item.state?.toLowerCase().includes(searchTerm) ||
      item.city?.toLowerCase().includes(searchTerm) ||
      item.approve?.toLowerCase().includes(searchTerm) ||
      item.status?.toLowerCase().includes(searchTerm);

    // Date range filter
    let startDate = range[0].startDate;
    let endDate = range[0].endDate;

    if (startDate) startDate = new Date(startDate.setHours(0, 0, 0, 0));
    if (endDate) endDate = new Date(endDate.setHours(23, 59, 59, 999));

    // Parse item.created_at (format: "26 Apr 2025 | 06:28 PM")
    const itemDate = parse(
      item.created_at,
      "dd MMM yyyy | hh:mm a",
      new Date()
    );

    const matchesDate =
      (!startDate && !endDate) || // no filter
      (startDate && endDate && itemDate >= startDate && itemDate <= endDate);

    // Final return
    return matchesSearch && matchesDate;
  });

  const customStyles = {
    rows: {
      style: {
        padding: "5px 0px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#111827",
      },
    },
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "600",
        backgroundColor: "#F9FAFB",
        backgroundColor: "#00000007",
        color: "#374151",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
        color: "#1F2937",
      },
    },
  };

  const columns = [
    {
      name: "SN",
      cell: (row, index) => (
        <div className="relative group flex items-center w-full">
          {/* Serial Number Box */}
          <span
            className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer ${
              row.status === "Active"
                ? "bg-[#EAFBF1] text-[#0BB501]"
                : "bg-[#FFEAEA] text-[#ff2323]"
            }`}
          >
            {index + 1}
          </span>

          {/* Tooltip */}
          <div className="absolute w-[65px] text-center -top-12 left-[30px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
            {row.status === "Active" ? "Active" : "Inactive"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Image",
      cell: (row) => {
        let imageSrc = "default.jpg";

        try {
          const parsed = JSON.parse(row.frontView);
          if (Array.isArray(parsed) && parsed[0]) {
            imageSrc = `${URI}${parsed[0]}`;
          }
        } catch (e) {
          console.warn("Invalid or null frontView:", row.frontView);
        }

        return (
          <div className="w-[130px] h-14 overflow-hidden flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Property"
              onClick={() => {
                window.open(
                  "https://www.reparv.in/property-info/" + row.propertyid,
                  "_blank"
                );
              }}
              className="w-full h-[100%] object-cover cursor-pointer"
            />
          </div>
        );
      },
      width: "130px",
    },
    {
      name: "Property Name",
      selector: (row) => row.propertyName,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Builder",
      selector: (row) => row.company_name,
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "Type",
      selector: (row) => row.propertyCategory,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Address",
      selector: (row) => row.address,
      sortable: true,
      minWidth: "200px",
    },
    { name: "Pin Code", selector: (row) => row.pincode, width: "120px" },
    { name: "Area", selector: (row) => row.builtUpArea, sortable: true },
    {
      name: "Total Price",
      selector: (row) => row.totalOfferPrice,
      sortable: true,
    },
    {
      name: "Approve",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.approve === "Approved"
              ? "bg-[#EAFBF1] text-[#0BB501]"
              : row.approve === "Rejected"
              ? "bg-[#FBE9E9] text-[#FF0000]"
              : "bg-[#E9F2FF] text-[#0068FF]"
          }`}
        >
          {row.approve}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "Reject Reason",
      selector: (row) => row.rejectreason || "-- No Reason --",
      minWidth: "150px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
    },
  ];

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, propertyid, propertyType) => {
      switch (action) {
        case "view":
          window.open(
            "https://www.reparv.in/property-info/" + propertyid,
            "_blank"
          );
          break;
        case "update":
          edit(propertyid);
          break;
        case "updateLocation":
          setPropertyKey(propertyid);
          fetchPropertyLocation(propertyid);
          break;
        case "updateImages":
          setPropertyKey(propertyid);
          fetchImages(propertyid);
          break;
        case "videoUpload":
          setPropertyKey(propertyid);
          showBrochure(propertyid);
          break;
        default:
          console.log("Invalid action");
      }
    };

    return (
      <div className="relative inline-block w-[120px]">
        <div className="flex items-center justify-between p-2 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span className=" text-[12px]">{selectedAction || "Action"}</span>
          <FiMoreVertical className="text-gray-500" />
        </div>
        <select
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          value={selectedAction}
          onChange={(e) => {
            const action = e.target.value;
            handleActionSelect(action, row.propertyid, row.propertytypeid);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View</option>
          <option value="update">Update</option>
          <option value="updateImages">Update Images</option>
          <option value="videoUpload">Brochure & Video</option>
          <option value="updateLocation">Latitude & Longitude</option>
        </select>
      </div>
    );
  };

  return (
    <div className="properties overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start">
      <div className="properties-table w-full h-[578px] flex flex-col p-4 md:p-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="w-full flex items-center justify-between md:justify-end gap-1 sm:gap-3">
          <p className="block md:hidden text-lg font-semibold">Properties</p>
          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <AddButton label={"Add "} func={setShowPropertyForm} />
          </div>
        </div>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Property"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <div className="flex flex-wrap items-center justify-end gap-3 px-2">
              <div className="block">
                <CustomDateRangePicker range={range} setRange={setRange} />
              </div>
            </div>
            <div className="hidden xl:flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
              <AddButton label={"Add "} func={setShowPropertyForm} />
            </div>
          </div>
        </div>

        <h2 className="text-[16px] font-semibold">Properties List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={15}
            paginationComponentOptions={{
              rowsPerPageText: "Rows per page:",
              rangeSeparatorText: "of",
              selectAllRowsItem: true,
              selectAllRowsItemText: "All",
            }}
          />
        </div>
      </div>

      {/* Add Property Multi Step Form */}
      <MultiStepForm
        fetchData={fetchData}
        newProperty={newProperty}
        setPropertyData={setPropertyData}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
        builderData={builderData}
        authorities={authorities}
        states={states}
        cities={cities}
      />

      {/* Upload Images Form */}
      <UpdateImagesForm
        fetchImages={fetchImages}
        fetchData={fetchData}
        propertyId={propertyKey}
        setPropertyId={setPropertyKey}
        newProperty={propertyImageData}
        setPropertyData={setPropertyImageData}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
      />

      {/* ADD Property Location Latitude & Longitude Form */}
      <div
        className={` ${
          !showPropertyLocationForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Update Latitude & Longitude
            </h2>
            <IoMdClose
              onClick={() => {
                setShowPropertyLocationForm(false);
                setLatitude(null);
                setLongitude(null);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={updatePropertyLocation}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-1">
              <input
                type="hidden"
                value={propertyKey || ""}
                onChange={(e) => setPropertyKey(e.target.value)}
              />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Enter Latitude"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={latitude ?? ""}
                  onChange={(e) =>
                    setLatitude(
                      e.target.value === "" ? null : parseFloat(e.target.value)
                    )
                  }
                />
              </div>

              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium ">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Enter Longitude"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={longitude ?? ""}
                  onChange={(e) =>
                    setLongitude(
                      e.target.value === "" ? null : parseFloat(e.target.value)
                    )
                  }
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowPropertyLocationForm(false);
                  setLatitude("");
                  setLongitude("");
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Update
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* ADD Brochure and Video Upload Form */}
      <div
        className={` ${
          !showVideoUploadForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide  w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[450px] max-h-[80vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Brochure & Video</h2>
            <IoMdClose
              onClick={() => {
                setShowVideoUploadForm(false);
                setSelectedImage(null);
                setVideoUpload({ videoFile: null });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={uploadVideo}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-1">
              <input
                type="hidden"
                value={propertyKey || ""}
                onChange={(e) => setPropertyKey(e.target.value)}
              />

              <div className={`w-full`}>
                {videoUpload?.brochureFile && (
                  <div className="relative mb-3">
                    <img
                      onClick={() => {
                        window.open(URI + videoUpload?.brochureFile, "_blank");
                      }}
                      src={URI + videoUpload?.brochureFile}
                      alt="Old Image"
                      className="w-full max-w-[100px] object-cover rounded-lg border border-gray-300 cursor-pointer"
                    />
                  </div>
                )}
                <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
                  Brochure Image
                </label>
                <div className="w-full mt-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={singleImageChange}
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
                  <div className="relative mt-2">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Uploaded preview"
                      className="w-full max-w-[400px] object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeSingleImage}
                      className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#0000007b] font-medium">
                  Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  className="w-full mt-[8px] text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const maxSize = 50 * 1024 * 1024; // 50MB limit
                      if (file.size > maxSize) {
                        alert("Video must be less than 50MB");
                        e.target.value = "";
                        return;
                      }
                      setVideoUpload({
                        ...videoUpload,
                        videoFile: file,
                      });
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowVideoUploadForm(false);
                  setSelectedImage(null);
                  setVideoUpload({ videoFile: null });
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Upload
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Properties;
