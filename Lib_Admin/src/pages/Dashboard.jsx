import { useState, useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { FaChartArea } from "react-icons/fa";
import { IoArrowRedo } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import DashboardFilter from "../components/dashboard/DashboardFilter";
import { parse } from "date-fns";

function Dashboard() {
  const { URI, dashboardFilter } = useAuth();
  const navigate = useNavigate();
  const [overviewData, setOverviewData] = useState([]);
  const [overviewCountData, setOverviewCountData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const getPropertyCounts = (data) => {
    return data.reduce(
      (acc, item) => {
        if (item.enquiryStatus === "Enquired") {
          acc.Enquired++;
        } else if (item.enquiryStatus === "Booked") {
          acc.Booked++;
        }
        return acc;
      },
      { Enquired: 0, Booked: 0 }
    );
  };

  const propertyCounts = getPropertyCounts(overviewData);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = overviewData?.filter((item) => {
    // Text search filter
    const matchesSearch =
      item.propertyName?.toLowerCase().includes(searchTerm) ||
      item.company_name?.toLowerCase().includes(searchTerm) ||
      item.propertyCategory?.toLowerCase().includes(searchTerm) ||
      item.city?.toLowerCase().includes(searchTerm);

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

    // Enquiry filter logic: New, Alloted, Assign
    const getProperty = () => {
      if (item.enquiryStatus === "Booked") return "Booked";
      if (item.enquiryStatus === "Enquired") return "Enquired";
      return "";
    };

    const matchesProperty =
      !dashboardFilter || getProperty() === dashboardFilter;

    // Final return
    return matchesSearch && matchesDate && matchesProperty;
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
                ? "bg-[#E3FFDF] text-[#0BB501]"
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
      name: "Name",
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
    { name: "Type", selector: (row) => row.propertyCategory, sortable: true },
    {
      name: "City",
      selector: (row) => row.city,
      sortable: true,
      width: "120px",
    },
    { name: "Pin Code", selector: (row) => row.pincode, width: "120px" },
    {
      name: "Total Price",
      selector: (row) => row.totalOfferPrice,
      sortable: true,
    },
  ];

  const fetchCountData = async () => {
    try {
      const response = await fetch(`${URI}/guest-user/dashboard/count`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Count.");
      const data = await response.json();
      //console.log(data);
      setOverviewCountData(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Fetch Data
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/guest-user/dashboard/properties", {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch properties.");
      const data = await response.json();
      setOverviewData(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  useEffect(() => {
    fetchCountData();
    fetchData();
  }, []);

  return (
    <div className="overview overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start">
      <div className="overview-card-container px-4 md:px-0 gap-2 sm:gap-5 w-full grid place-items-center grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 my-5">
        {[
          {
            label: "Properties",
            value: overviewCountData?.totalProperty || "00",
            icon: <IoArrowRedo className="text-[#29bc1e] hover:text-[#0bb501] sm:w-6 sm:h-6" />,
            to: "/properties",
          },
        ].map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.to)}
            className="overview-card w-full max-w-[200px] sm:max-w-[280px] h-[85px] sm:h-[132px] flex flex-col items-center justify-center gap-2 rounded-lg sm:rounded-[16px] p-4 sm:p-6 border-2 hover:border-[#0BB501] bg-white cursor-pointer"
          >
            <div className="upside w-full sm:max-w-[224px] h-[30px] sm:h-[40px] flex items-center justify-between gap-2 sm:gap-3 text-xs sm:text-base font-medium text-black">
              <p>{card.label}</p>
              <div className={`${card.icon ? "block" : "hidden"}`}>
                {card.icon}
              </div>
            </div>
            <div className="downside w-full h-[30px] sm:max-w-[224px] sm:h-[40px] flex items-center text-xl sm:text-[28px] font-semibold text-black">
              <p className="flex items-center justify-center">
                <FaRupeeSign
                  className={`${
                    card.label === "Self Earning" ? "block" : "hidden"
                  }`}
                />
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="properties-table w-full h-[60vh] flex flex-col p-4 md:p-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="w-full flex items-center justify-between md:justify-end gap-1 sm:gap-3">
          <p className="block md:hidden text-lg font-semibold">Dashboard</p>
        </div>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A] border">
            <CiSearch />
            <input
              type="text"
              placeholder="Search"
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
          </div>
        </div>
        <div className="filterContainer w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <DashboardFilter counts={propertyCounts} />
        </div>

        <h2 className="text-[16px] ml-1 font-semibold">Property List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={columns}
            data={filteredData}
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
  );
}

export default Dashboard;
