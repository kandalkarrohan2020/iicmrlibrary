import { useState, useEffect } from "react";
import LeafletCityMap from "../components/map/LeafletCityMap";
import { useAuth } from "../store/auth";
import DataTable from "react-data-table-component";
import Select from "react-select";
import propertyPicture from "../assets/propertyPicture.svg";
import FormatPrice from "../components/FormatPrice";

const Map = () => {
  const { URI, setLoading } = useAuth();
  const [properties, setProperties] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  // Convert cities to options
  const cityOptions = cities?.map((city) => ({
    value: city,
    label: city,
  }));
  const customStyles = {
    control: (base, state) => ({
      ...base,
      fontSize: "0.75rem", // text-xs
      padding: 0,
      cursor: "pointer",
      borderColor: state.isFocused ? "#00C42B" : base.borderColor,
      boxShadow: state.isFocused ? "0 0 0 1px #00C42B" : "none",
      "&:hover": {
        borderColor: "#00C42B",
      },
    }),
  };

  // *Fetch Data from API*
  const fetchAllCity = async () => {
    try {
      const response = await fetch(URI + "/guest-user/map/properties/cities", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch cities.");

      const data = await response.json();
      //console.log(data);
      setCities(data); // Sets the cities array
      // Select By Default City
      setSelectedCity(data[0]);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  //Fetch Data
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${URI}/guest-user/map/properties/get/${selectedCity}`,
        {
          method: "GET",
          credentials: "include", //  Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch properties.");
      const data = await response.json();
      //console.log(data);
      setProperties(data);
    } catch (err) {
      console.error("Error fetching :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCity();
    fetchProperties();
  }, [selectedCity]);

  const customDesign = {
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
      name: "Image",
      cell: (row) => {
        let imageSrc = propertyPicture;

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
                  "https://www.reparv.in/property-info/" + row.seoSlug,
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
      cell: (row, index) => (
        <div className="relative group flex items-center w-full">
          {/* Property Name */}
          <span
            className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer`}
          >
            {row.propertyName}
          </span>

          {/* Tooltip */}
          <div
            className={`${
              row.commissionAmount ? "-top-[150px]" : "-top-[80px]"
            } absolute w-full min-w-[250px] text-center left-[80px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:flex flex-col gap-1 transition`}
          >
            <h2 className="text-[14px] font-semibold text-[#0bb501]">
              {row.propertyName}
            </h2>
            <div className="w-full flex items-center justify-between">
              <span>Total Price :</span>
              <FormatPrice price={parseFloat(row.totalOfferPrice)} />
            </div>
            {row.commissionAmount ? (
              <>
                <div className="w-full flex items-center justify-between">
                  <span>Reparv Commission :</span>
                  <FormatPrice
                    price={parseFloat(
                      row.commissionAmount && (row.commissionAmount * 40) / 100
                    )}
                  />
                </div>
                <div className="w-full flex items-center justify-between">
                  <span>Sales Commission :</span>
                  <FormatPrice
                    price={parseFloat(
                      row.commissionAmount && (row.commissionAmount * 40) / 100
                    )}
                  />
                </div>
                <div className="w-full flex items-center justify-between">
                  <span>Territory Commission :</span>
                  <FormatPrice
                    price={parseFloat(
                      row.commissionAmount && (row.commissionAmount * 20) / 100
                    )}
                  />
                </div>
                <div className="w-full flex items-center justify-between">
                  <span>Total Commission :</span>
                  <FormatPrice price={parseFloat(row.commissionAmount)} />
                </div>
              </>
            ) : (
              <div className="w-full text-red-500 text-[13px] flex items-center justify-between">
                <span>Commission Not Added</span>
              </div>
            )}
          </div>
        </div>
      ),
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Builder",
      selector: (row) => row.company_name,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Category",
      selector: (row) => row.propertyCategory,
      width: "150px",
    },
    {
      name: "Location",
      selector: (row) => row.location,
      minWidth: "200px",
    },
  ];

  return (
    <div className="map overflow-scroll scrollbar-hide w-full max-h-[85vh] flex flex-col items-start justify-start">
      <div className="map w-full max-h-[80vh] flex flex-col p-4 sm:p-6 gap-4 my-[10px] bg-white rounded-[24px]">
        <div className="w-full lg:w-1/2 flex gap-2 flex-col sm:flex-row align-center justify-end">
          {/* Mobile City Selector */}
          <div className="selectCity w-full relative inline-block">
            <Select
              className="w-full max-w-[200px] text-xs font-medium p-0 cursor-pointer z-[1001]"
              styles={customStyles}
              options={cityOptions}
              value={
                cityOptions?.find((opt) => opt.value === selectedCity) || null
              }
              onChange={(selectedOption) => {
                const value = selectedOption?.value || "";
                setSelectedCity(value);
                //navigate("/properties");
              }}
              placeholder="Select City"
              isClearable={false}
            />
          </div>
          <div className="w-full hidden flex-wrap gap-2 lg:gap-5 items-center justify-end">
            <div className="search-bar w-full sm:max-w-[300px] h-[36px] flex border border-[#00000033] rounded-[8px] items-center justify-center ">
              <input
                type="text"
                placeholder="Enter Complate Address"
                className="address-input w-full h-[36px] py-[8px] px-[12px] text-sm text-black bg-transparent border-none outline-none"
              />
            </div>

            <div className="w-full sm:w-auto flex gap-4">
              <div className="search-bar w-full sm:w-[150px] h-[36px] flex border border-[#00000033] rounded-[8px] items-center justify-center ">
                <input
                  type="text"
                  placeholder="Enter Pin Code"
                  className="pincode-input w-full h-[36px] text-sm text-black bg-transparent border-none outline-none py-[8px] px-[12px]"
                />
              </div>

              <div className="searchBtn w-[71px] h-[36px] text-white bg-[#076300] flex items-center justify-center text-sm py-[8px] px-[12px] border border-[#00000033] rounded-[8px]">
                <p>Search</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`mapContainer  overflow-scroll scrollbar-hide w-full h-[70vh] flex flex-col lg:flex-row bg-cover rounded-[8px]`}
        >
          <div className="w-full lg:w-1/2 h-[100%]">
            <LeafletCityMap
              properties={properties}
              selectedCity={selectedCity}
            />
          </div>
          <div className="PropertiesTable w-full lg:w-1/2 py-4 lg:px-4 lg:py-0 overflow-scroll scrollbar-hide">
            <div className="overflow-scroll scrollbar-hide">
              <DataTable
                className="scrollbar-hide"
                customStyles={customDesign}
                columns={columns}
                data={properties}
                pagination
                paginationPerPage={10}
                paginationComponentOptions={{
                  rowsPerPageText: "Rows per page:",
                  rangeSeparatorText: "of",
                  selectAllRowsItem: true,
                  selectAllRowsItemText: "All",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
