import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { FaEye } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { IoMdClose } from "react-icons/io";
import FormatPrice from "../components/FormatPrice";
import itemImage from "../assets/items/image.webp";
import Loader from "../components/Loader";

function Dashboard() {
  const {
    URI,
    user,
    setLoading,
    showItem,
    setShowItem,
    showCustomer,
    setShowCustomer,
    showIssueForm,
    setShowIssueForm,
  } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState({});
  const [customer, setCustomer] = useState({});
  const [customers, setCustomers] = useState([]);
  const [overviewData, setOverviewData] = useState([]);
  const [overviewCountData, setOverviewCountData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [issueId, setIssueId] = useState(null);
  const [issue, setIssue] = useState({
    prnno: "",
    status: "",
  });

  // click on the card then scroll down
  const scrollToTable = () => {
    const element = document.getElementById("#table");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchCountData = async () => {
    try {
      const response = await fetch(
        `${URI}/${
          user?.role === "Admin" ? "admin" : "frontend"
        }/dashboard/count`,
        {
          method: "GET", 
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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
    setLoading(true);
    try {
      const response = await fetch(
        `${URI}/${user?.role === "Admin" ? "admin" : "frontend"}/issue`,
        {
          method: "GET",
          credentials: "include", //  Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch Customers.");
      const data = await response.json();
      console.log(data);
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching :", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Item Data
  const viewItem = async (id) => {
    try {
      const response = await fetch(URI + `/admin/items/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch item.");
      const data = await response.json();

      setItem(data);
      setShowItem(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const viewCustomer = async (id) => {
    try {
      const response = await fetch(`${URI}/admin/issue/get/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch Issue.");
      const data = await response.json();
      setCustomer(data);
      console.log(data);
      setShowCustomer(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  const updateIssueStatus = async () => {
    try {
      const response = await fetch(`${URI}/admin/issue/status/${issueId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(issue),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update issue status");
      }

      alert(data.message);
      // Refresh issue list / dashboard
      fetchData();
    } catch (error) {
      console.error("Error updating issue status:", error.message);
      alert(error.message);
    }
  };

  const deleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      const response = await fetch(`${URI}/admin/issue/delete/${issueId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete issue");
      }

      alert(data.message);

      // Refresh issue list
      fetchData();
    } catch (error) {
      console.error("Error deleting issue:", error.message);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCountData();
  }, []);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = customers?.filter((item) => {
    const matchesSearch =
      item.prnno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role?.toLowerCase().includes(searchTerm.toLowerCase());

    let startDate = range[0].startDate;
    let endDate = range[0].endDate;

    if (startDate) startDate = new Date(startDate.setHours(0, 0, 0, 0));
    if (endDate) endDate = new Date(endDate.setHours(23, 59, 59, 999));

    const itemDate = parse(
      item.created_at,
      "dd MMM yyyy | hh:mm a",
      new Date()
    );

    const matchesDate =
      (!startDate && !endDate) ||
      (startDate && endDate && itemDate >= startDate && itemDate <= endDate);

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
        position: "sticky",
        top: 0,
        zIndex: 10,
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
            className={`min-w-6 flex items-center justify-center px-2 py-1 bg-[#EAFBF1] text-[#0BB501] rounded-md cursor-pointer `}
          >
            {index + 1}
          </span>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Item",
      cell: (row) => {
        let imageSrc = URI + row.image;
        return (
          <div className="w-[60px] h-[70px] overflow-hidden flex items-center justify-center">
            <img
              src={row.image ? imageSrc : itemImage}
              alt="Item"
              onClick={() => {
                viewItem(row?.itemId);
              }}
              className="w-full h-[100%] object-cover cursor-pointer"
            />
          </div>
        );
      },
      omit: false,
      width: "130px",
    },
    {
      name: "View",
      cell: (row) => (
        <FaEye
          onClick={() => {
            viewCustomer(row.issueId);
          }}
          className="w-5 h-5 text-blue-600 ml-2 cursor-pointer"
        />
      ),
      width: "100px",
    },
    {
      name: "Status",
      cell: (row) => (
        <span className="px-3 py-1 text-green-700 bg-green-100 rounded-lg">
          {row.issueStatus}
        </span>
      ),
      minWidth: "150px",
    },
    {
      name: "PRN NO",
      cell: (row) => (
        <span className="px-3 py-1 text-green-700 bg-green-100">
          {row.prnno}
        </span>
      ),
      sortable: true,
      minWidth: "120px",
    },

    { name: "Date & Time", selector: (row) => row.created_at, width: "200px" },

    {
      name: "Full Name",
      selector: (row) => row.fullname,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Contact",
      selector: (row) => row.contact,
      minWidth: "150px",
    },
    {
      name: "Fine",
      selector: (row) => <FormatPrice price={row.fine || 0} />,
      minWidth: "150px",
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex gap-2">
          <FaEdit
            onClick={() => {
              setShowIssueForm(true);
              setIssueId(row.issueId);
            }}
            className="w-5 h-5 text-[#076506] ml-2 cursor-pointer"
          />
          <MdDelete
            onClick={() => {
              deleteIssue(row.issueId);
            }}
            className="w-5 h-5 text-red-500 ml-2 cursor-pointer"
          />
        </div>
      ),
      omit: user?.role !== "Admin",
      width: "150px",
    },
  ];

  useEffect(() => {
    fetchCountData();
  }, []);

  return (
    <div className="overview overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start">
      <div className="overview-card-container gap-2 sm:gap-3 w-full grid place-items-center grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 my-5">
        {[
          {
            label: "Total Fine",
            value: overviewCountData?.totalFine || "00",
            view: true,
          },
          {
            label: "Readers",
            value: overviewCountData?.totalReaders || "00",
            view: user?.role === "Admin",
            to: "/readers",
          },
          {
            label: "Items",
            value: overviewCountData?.totalItems || "00",
            view: true,
            to: "/items",
          },
        ]
          .filter((card) => card.view) // show only view=true
          .map((card, index) => (
            <div
              key={index}
              onClick={() => {
                if (card.label === "Total Fine") {
                  scrollToTable();
                } else if (card.to) {
                  navigate(card.to);
                }
              }}
              className="overview-card w-full max-w-[190px] sm:max-w-[290px]
                 flex flex-col items-center justify-center gap-2
                 rounded-lg sm:rounded-[16px] p-4 sm:p-6
                 border-2 hover:border-[#0BB501]
                 bg-white cursor-pointer"
            >
              <div
                className="upside w-full sm:max-w-[224px]
                      h-[30px] sm:h-[40px]
                      flex items-center justify-between
                      text-xs sm:text-base font-semibold"
              >
                <p>{card.label}</p>
                <p className="flex items-center justify-center text-xl">
                  {card.label === "Total Fine" && <FaRupeeSign />}
                  {card.value}
                </p>
              </div>
            </div>
          ))}
      </div>
      <div
        id="#table"
        className="overview-table w-full h-[70vh] flex flex-col p-4 md:p-6 gap-4 bg-white md:rounded-[24px]"
      >
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
          {/* <DashboardFilter counts={propertyCounts} /> */}
        </div>
        <h2 className="text-[16px] ml-1 font-semibold">Reservation List</h2>
        <div className="overflow-scroll scrollbar-hide">
          <DataTable
            className="scrollbar-hide"
            customStyles={customStyles}
            columns={columns}
            data={filteredData}
            fixedHeader
            fixedHeaderScrollHeight="50vh"
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

      <div
        className={`${
          showIssueForm ? "flex" : "hidden"
        } z-[61] roleForm overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[500px] max-h-[70vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Issue Item</h2>
            <IoMdClose
              onClick={() => {
                setShowIssueForm(false);
                setIssue({ prnno: "", status: "" });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={updateIssueStatus}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={setIssue.issueId || ""}
                onChange={(e) =>
                  setIssue({ ...issue, issueId: e.target.value })
                }
              />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Enter PRN NO
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter PRN NO"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] placeholder:text-black focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={issue.prnno}
                  onChange={(e) =>
                    setIssue({ ...issue, prnno: e.target.value })
                  }
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Status
                </label>
                <select
                  value={issue.status}
                  onChange={(e) =>
                    setIssue({ ...issue, status: e.target.value })
                  }
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none "
                >
                  <option value="">Issue Status</option>
                  <option value="New">New</option>
                  <option value="Issued">Issued</option>
                  <option value="Return">Return</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowIssueForm(false);
                  setIssue({ prnno: "", status: "" });
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Save
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* View item and item List */}
      <div
        className={`${
          showItem ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[550px] max-h-[80vh] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Item</h2>

            <IoMdClose
              onClick={() => {
                setShowItem(false);
                setItem({});
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          {/* item Image and Info */}

          <div className="w-full flex gap-4 items-center">
            <div>
              <img
                src={`${URI}${item?.image}`}
                alt="item"
                className="w-[100px] h-[120px] object-cover rounded-md border"
              />
            </div>

            <div className="w-[250px] flex flex-col space-y-2">
              <h2 className="ml-2 text-base font-semibold text-gray-800">
                {item?.title}
              </h2>

              <p className="bg-gray-100 px-2 py-[2px] text-xs text-gray-700 font-semibold rounded break-words whitespace-pre-wrap">
                {item?.description?.slice(0, 50) +
                  (item?.description?.length > 50 ? "..." : "")}
              </p>
            </div>
          </div>

          {/* Item View */}
          <div className="w-full flex items-center justify-between">
            <h1 className="my-3 text-base font-semibold">Book Details</h1>
            <h1 className="my-3 text-base font-semibold">
              {item?.total_copies} Copies
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="w-full p-3 border rounded-xl bg-white shadow-sm space-y-3">
              {/* Created Date */}
              <div className="w-full flex">
                <span className="bg-gray-100 text-gray-700 text-[12px] font-semibold px-3 py-0.5 rounded">
                  Added on: {item?.created_at}
                </span>
              </div>

              {/* Book Details */}
              <div className="grid p-2 grid-cols-2 md:grid-cols-3 gap-4 text-sm font-semibold text-gray-700">
                <div>
                  <p className="font-medium text-xs text-gray-400">Author</p>
                  <p className="font-semibold">{item?.author_name || "N/A"}</p>
                </div>

                <div>
                  <p className="font-medium text-xs text-gray-400">Publisher</p>
                  <p className="font-semibold">{item?.publisher || "N/A"}</p>
                </div>

                <div>
                  <p className="font-medium text-xs text-gray-400">Category</p>
                  <p className="font-semibold">{item?.category || "N/A"}</p>
                </div>

                <div>
                  <p className="font-medium text-xs text-gray-400">ISBN</p>
                  <p className="font-semibold">{item?.isbn}</p>
                </div>

                <div>
                  <p className="font-medium text-xs text-gray-400">Edition</p>
                  <p className="font-semibold">{item?.edition || "N/A"}</p>
                </div>

                <div>
                  <p className="font-medium text-xs text-gray-400">Language</p>
                  <p className="font-semibold">{item?.language || "N/A"}</p>
                </div>

                <div>
                  <p className="font-medium text-xs text-gray-400">
                    Publication Year
                  </p>
                  <p className="font-semibold">{item?.publication_year}</p>
                </div>

                <div>
                  <p className="font-medium text-xs text-gray-400">
                    Shelf Location
                  </p>
                  <p className="font-semibold">{item?.shelf_location}</p>
                </div>

                <div>
                  <p className="font-medium text-xs text-gray-400">
                    Availability
                  </p>
                  <p
                    className={`font-semibold ${
                      item?.available_copies > 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {item?.available_copies} out of {item?.total_copies} copies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show Customer Info */}
      <div
        className={`${
          showCustomer ? "flex" : "hidden"
        } z-[61] property-form overflow-scroll scrollbar-hide w-[400px] h-[70vh] md:w-[700px] fixed`}
      >
        <div className="w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Reader Details</h2>
            <IoMdClose
              onClick={() => {
                setShowCustomer(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form>
            <div className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2">
              <div className="w-full col-span-1 lg:col-span-2">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Item Name
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.title}
                  readOnly
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  PRN No
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.prnno}
                  readOnly
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Status
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.issueStatus}
                  readOnly
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.fullname}
                  readOnly
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Contact
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.contact}
                  readOnly
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Department
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.department}
                  readOnly
                />
              </div>

              <div className={`${customer?.yearofstudy ? "block" : "hidden"}`}>
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Year Of Study
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.yearofstudy}
                  readOnly
                />
              </div>

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Email
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full mt-[4px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={customer.email}
                  readOnly
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
