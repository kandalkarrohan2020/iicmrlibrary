import React from "react";
import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import AddButton from "../components/AddButton";
import FilterData from "../components/FilterData";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import Loader from "../components/Loader";
import readerFilter from "../components/ReaderFilter";
import { RxCross2 } from "react-icons/rx";
import { MdDone } from "react-icons/md";
import DownloadCSV from "../components/DownloadCSV";
import FormatPrice from "../components/FormatPrice";

const Readers = () => {
  const {
    showReaderForm,
    setShowReaderForm,
    URI,
    setLoading,
    giveAccess,
    setGiveAccess,
    showFinePaymentForm,
    setShowFinePaymentForm,
    showReader,
    setShowReader,
    showFollowUpList,
    setShowFollowUpList,
    readerStatus,
    setReaderStatus,
  } = useAuth();

  const [readers, setReaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [readerId, setReaderId] = useState(null);
  const [reader, setReader] = useState({});
  const [selectedReader, setSelectedReader] = useState("Select Reader");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [newReader, setNewReader] = useState({
    role: "",
    fullname: "",
    contact: "",
    email: "",
    state: "",
    city: "",
  });

  const [finePayment, setFinePayment] = useState("");

  const [followUp, setFollowUp] = useState("");
  const [followUpText, setFollowUpText] = useState("");
  const [followUpList, setFollowUpList] = useState([]);

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
      const response = await fetch(`${URI}/admin/cities/${newReader?.state}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch cities.");
      const data = await response.json();
      console.log(data);
      setCities(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(`${URI}/admin/readers/${selectedReader}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch Readers.");

      const result = await response.json();
      //console.log("Fetched Project reader Data:", result);

      // Set the table data
      setReaders(result);
    } catch (err) {
      console.error("Error fetching Reader data:", err);
    }
  };

  const add = async (e) => {
    e.preventDefault();

    const endpoint = newReader.id ? `edit/${newReader.id}` : "add";

    try {
      setLoading(true);
      const response = await fetch(`${URI}/admin/readers/${endpoint}`, {
        method: newReader.id ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReader),
      });

      if (response.status === 409) {
        alert("Reader all ready exists!");
      } else if (!response.ok) {
        throw new Error(`Failed to save reader. Status: ${response.status}`);
      } else {
        alert(
          newReader.id
            ? "Reader updated successfully!"
            : "Reader added successfully!"
        );

        setNewReader({
          role: "",
          fullname: "",
          contact: "",
          email: "",
          state: "",
          city: "",
          intrest: "",
        });

        setShowReaderForm(false);
        await fetchData();
      }
    } catch (err) {
      console.error("Error saving Reader:", err);
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/readers/get/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Reader.");
      const data = await response.json();
      console.log(data);
      setNewReader(data);
      setShowReaderForm(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  //fetch data on form
  const viewReader = async (id) => {
    try {
      const response = await fetch(URI + `/admin/readers/get/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Reader.");
      const data = await response.json();
      console.log(data);
      setReader(data);
      setShowReader(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  //Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Reader?")) return;

    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/readers/delete/${id}`, {
        method: "DELETE",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("reader deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting Reader:", error);
    } finally {
      setLoading(false);
    }
  };

  // change status record
  const status = async (id) => {
    if (!window.confirm("Are you sure you want to change this Reader status?"))
      return;

    try {
      const response = await fetch(URI + `/admin/readers/status/${id}`, {
        method: "PUT",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      fetchData();
    } catch (error) {
      console.error("Error changing status :", error);
    }
  };

  // Pay Fine Payment
  const payFinePayment = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/readers/update/fine/payment/${readerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ finePayment }),
        }
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setReaderId(null);

      setShowFinePaymentForm(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting :", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Follow Up List
  const fetchFollowUpList = async (id) => {
    try {
      const response = await fetch(
        URI + `/admin/projectreader/followup/list/${id}`,
        {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch follow up list.");
      const data = await response.json();
      setFollowUpList(data);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  // ADD Follow Up
  const addFollowUp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        `${URI}/admin/readers/followup/add/${readerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ followUp, followUpText }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Success: ${data.message}`);
        setreaderPaymentStatus("Follow Up");
        await fetchData();
        fetchFollowUpList(readerId);
      } else {
        alert(`Error: ${data.message}`);
      }
      // Clear input fields
      setFollowUp("");
      setFollowUpText("");
    } catch (error) {
      console.error("Error adding FollowUp:", error);
    } finally {
      setLoading(false);
    }
  };

  // Assign login record
  const assignLogin = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure to assign login to this Reader ?"))
      return;

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/readers/assignlogin/${readerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", //  Ensures cookies are sent
          body: JSON.stringify({ readerId, username, password }),
        }
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setReaderId(null);
      setUsername("");
      setPassword("");
      setGiveAccess(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStates();
  }, [selectedReader]);

  useEffect(() => {
    if (newReader.state != "") {
      fetchCities();
    }
  }, [newReader.state]);

  const getReaderCounts = (data) => {
    return data.reduce(
      (acc, item) => {
        if (item.paymentstatus === "Success") {
          acc.Paid++;
        } else if (
          item.paymentstatus === "Follow Up" &&
          item.loginstatus === "Inactive"
        ) {
          acc.FollowUp++;
        } else if (item.paymentstatus === "Pending") {
          acc.Unpaid++;
        } else if (
          item.paymentstatus !== "Success" &&
          item.loginstatus === "Active"
        ) {
          acc.Free++;
        }
        return acc;
      },
      { Unpaid: 0, FollowUp: 0, Paid: 0, Free: 0 }
    );
  };

  const readerCounts = getReaderCounts(readers);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = readers?.filter((item) => {
    const matchesSearch =
      item.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchTerm.toLowerCase());

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
      (!startDate && !endDate) ||
      (startDate && endDate && itemDate >= startDate && itemDate <= endDate);

    // Reader filter logic: New, Alloted, Assign
    const getReaderStatus = () => {
      if (item.paymentstatus === "Success") return "Paid";
      if (item.paymentstatus === "Follow Up" && item.loginstatus === "Inactive")
        return "Follow Up";
      if (item.paymentstatus === "Pending") return "Unpaid";
      if (item.paymentstatus !== "Success" && item.loginstatus === "Active")
        return "Free";
      return "";
    };

    const matchesReader = !readerStatus || getReaderStatus() === readerStatus;

    return matchesSearch && matchesDate && matchesReader;
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
      name: "Follow Up",
      cell: (row) => {
        const followUpColorMap = {
          New: "bg-blue-100 text-blue-700",
          CNR1: "bg-red-100 text-red-600",
          CNR2: "bg-red-100 text-red-600",
          CNR3: "bg-red-100 text-red-600",
          CNR4: "bg-red-100 text-red-600",
          "Switch Off": "bg-red-100 text-red-700",
          "Call Busy": "bg-yellow-100 text-yellow-600",
          "Call Back": "bg-yellow-100 text-yellow-600",
          "Not Responding (After Follow Up)": "bg-yellow-100 text-yellow-600",
          "Call Cut / Disconnected": "bg-orange-100 text-orange-600",
          "Invalid Number": "bg-red-100 text-red-700",
          "Wrong Number": "bg-red-100 text-red-700",
          "Form Filled By Mistake": "bg-blue-100 text-blue-600",
          "Repeat Lead": "bg-gray-100 text-gray-600",
          "Lead Clash": "bg-purple-100 text-purple-500",
          "Details Shared": "bg-green-100 text-green-600",
          "Not Interested": "bg-pink-100 text-pink-600",
          "Not Interested (After Details Shared & Explanation)":
            "bg-orange-100 text-orange-600",
          Interested: "bg-green-100 text-green-700",
          "Documents Collected": "bg-green-200 text-green-800",
          "Payment Done": "bg-green-300 text-green-900",
          // fallback/default:
          Success: "bg-[#EAFBF1] text-[#0BB501]",
          "Follow Up": "bg-[#E9F2FF] text-[#0068FF]",
        };

        const styleClass =
          followUpColorMap[row.followUp] || "bg-[#efefef] text-[#000000]";

        return (
          <span
            onClick={() => {
              setreaderId(row.id);
              fetchFollowUpList(row.id);
              setShowFollowUpList(true);
            }}
            className={`px-2 py-1 rounded-md cursor-pointer ${styleClass}`}
          >
            {row.followUp || "- Empty -"}
          </span>
        );
      },
      minWidth: "150px",
    },
    { name: "Date & Time", selector: (row) => row.created_at, width: "200px" },
    {
      name: "Full Name",
      cell: (row) => (
        <div className={`flex gap-1 items-center justify-center`}>
          <div className="relative group cursor-pointer">
            <div
              className={`px-[2px] py-[2px] rounded-md flex items-center justify-center ${
                row.loginstatus === "Active"
                  ? "bg-[#EAFBF1] text-[#0BB501]"
                  : "bg-[#FBE9E9] text-[#FF0000]"
              }`}
              onClick={() => {
                setReaderId(row.id);
                setGiveAccess(true);
              }}
            >
              {row.loginstatus === "Active" ? <MdDone /> : <RxCross2 />}
            </div>
            <div className="absolute w-[150px] text-center -top-12 left-[75px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
              {row.loginstatus === "Active"
                ? "Login Status Active"
                : "Login Status Inactive"}
            </div>
          </div>
          <div className="relative group cursor-pointer">
            <span className={`${row.idcardimage ? "text-green-600" : ""}`}>
              {row.fullname}
            </span>
            <div className="absolute w-[150px] text-center -top-12 left-[50px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
              {row.idcardimage ? "KYC Completed" : "KYC Not Completed"}
            </div>
          </div>
        </div>
      ),
      width: "200px",
    },
    {
      name: "Contact",
      selector: (row) => row.contact,
      sortable: true,
      width: "150px",
    },
    {
      name: "State",
      selector: (row) => row.state || "--empty--",
      sortable: true,
      width: "150px",
    },
    {
      name: "City",
      selector: (row) => row.city || "--empty--",
      sortable: true,
      width: "150px",
    },
    {
      name: "Action",
      cell: (row) => <ActionDropdown row={row} />,
      width: "120px",
    },
  ];

  const ActionDropdown = ({ row }) => {
    const [selectedAction, setSelectedAction] = useState("");

    const handleActionSelect = (action, id) => {
      switch (action) {
        case "view":
          viewReader(id);
          break;
        case "status":
          status(id);
          break;
        case "update":
          edit(id);
          break;
        case "payment":
          setReaderId(id);
          setShowFinePaymentForm(true);
          break;
        case "followup":
          setReaderId(id);
          fetchFollowUpList(id);
          setShowFollowUpList(true);
          break;
        case "delete":
          del(id);
          break;
        case "assignlogin":
          setReaderId(id);
          setGiveAccess(true);
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
            handleActionSelect(action, row.id);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View</option>
          <option value="status">Status</option>
          <option value="update">Update</option>
          <option value="payment">Payment</option>
          <option value="followup">Follow Up</option>
          <option value="assignlogin">Assign Login</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className=" w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="w-full flex items-center justify-between gap-1 sm:gap-3">
          <div className="w-[65%] sm:min-w-[220px] sm:max-w-[230px] relative inline-block">
            <div className="flex gap-2 items-center justify-between bg-white border border-[#00000033] text-sm font-semibold  text-black rounded-lg py-1 px-3 focus:outline-none focus:ring-2 focus:ring-[#076300]">
              <span>{selectedReader || "Select Reader"}</span>
              <RiArrowDropDownLine className="w-6 h-6 text-[#000000B2]" />
            </div>
            <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value={selectedReader}
              onChange={(e) => {
                const action = e.target.value;
                setSelectedReader(action);
              }}
            >
              <option value="Select Reader">Select Reader</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"Reader.csv"} />
            <AddButton label={"Add"} func={setShowReaderForm} />
          </div>
        </div>
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="ssearch-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Reader"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <div className="flex flex-wrap items-center justify-end gap-3 px-2">
              <readerFilter counts={readerCounts} />
              <div className="block">
                <CustomDateRangePicker range={range} setRange={setRange} />
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Reader List</h2>
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

      <div
        className={`${
          showReaderForm ? "flex" : "hidden"
        } z-[61] sales-form overflow-scroll scrollbar-hide w-[400px] md:w-[700px] max-h-[70vh] fixed`}
      >
        <div className="w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Reader</h2>
            <IoMdClose
              onClick={() => {
                setShowReaderForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={add}>
            <div className="grid gap-6 md:gap-4 grid-cols-1 ">
              <input
                type="hidden"
                value={newReader.id || ""}
                onChange={(e) => {
                  setNewReader({ ...newReader, id: e.target.value });
                }}
              />

              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Role <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newReader.role}
                  onChange={(e) => {
                    setNewReader({
                      ...newReader,
                      role: e.target.value,
                    });
                  }}
                >
                  <option value="">Select Reader</option>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                </select>
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  value={newReader.fullname}
                  onChange={(e) => {
                    setNewReader({
                      ...newReader,
                      fullname: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Contact Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Contact Number"
                  value={newReader.contact}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) {
                      // Allows only up to 10 digits
                      setNewReader({
                        ...newReader,
                        contact: e.target.value,
                      });
                    }
                  }}
                  className="w-full mt-2 text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full ">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter Email"
                  value={newReader.email}
                  onChange={(e) => {
                    setNewReader({
                      ...newReader,
                      email: e.target.value,
                    });
                  }}
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* State Select Input */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Select State <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newReader.state}
                  onChange={(e) =>
                    setNewReader({ ...newReader, state: e.target.value })
                  }
                >
                  <option value="">Select Your State</option>
                  {states?.map((state, index) => (
                    <option key={index} value={state.state}>
                      {state.state}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Select Input */}
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Select City <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
                  style={{ backgroundImage: "none" }}
                  value={newReader.city}
                  onChange={(e) =>
                    setNewReader({
                      ...newReader,
                      city: e.target.value,
                    })
                  }
                >
                  <option value="">Select Your City</option>
                  {cities?.map((city, index) => (
                    <option key={index} value={city.city}>
                      {city.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowReaderForm(false);
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

      {/* Update Payment Id Form */}
      <div
        className={` ${
          !showFinePaymentForm && "hidden"
        }  z-[61] overflow-scroll scrollbar-hide flex fixed`}
      >
        <div className="w-[330px] h-[380px] sm:w-[600px] sm:h-[400px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] lg:h-[300px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Payment Details</h2>
            <IoMdClose
              onClick={() => {
                setShowFinePaymentForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={payFinePayment}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2">
              <input
                type="hidden"
                value={readerId || ""}
                onChange={(e) => {
                  setReaderId(e.target.value);
                }}
              />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Payment Amount
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter Amount"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={finePayment}
                  onChange={(e) => {
                    setFinePayment(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-center sm:justify-end gap-6">
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Pay Fine Payment
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      <div
        className={` ${
          !showFollowUpList && "hidden"
        }  z-[61] overflow-scroll scrollbar-hide flex fixed`}
      >
        <div className="w-[330px] sm:w-[600px]  overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] max-h-[75vh] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">reader Follow Up</h2>
            <IoMdClose
              onClick={() => {
                setShowFollowUpList(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addFollowUp}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              {/* Dropdown */}
              <select
                required
                value={followUp}
                onChange={(e) => {
                  setFollowUp(e.target.value);
                }}
                className="w-full p-4 border rounded-[4px] text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select Follow Up</option>
                <option className="text-red-600">CNR1</option>
                <option className="text-red-600">CNR2</option>
                <option className="text-red-600">CNR3</option>
                <option className="text-red-600">CNR4</option>
                <option className="text-red-700">Switch Off</option>
                <option className="text-yellow-600">Call Busy</option>
                <option className="text-yellow-600">Call Back</option>
                <option className="text-yellow-600">
                  Not Responding (After Follow Up)
                </option>
                <option className="text-orange-600">
                  Call Cut / Disconnected
                </option>
                <option className="text-red-700">Invalid Number</option>
                <option className="text-red-700">Wrong Number</option>
                <option className="text-blue-600">
                  Form Filled By Mistake
                </option>
                <option className="text-gray-600">Repeat Lead</option>
                <option className="text-purple-500">Lead Clash</option>
                <option className="text-green-600">Details Shared</option>
                <option className="text-pink-600">Not Interested</option>
                <option className="text-orange-600">
                  Not Interested (After Details Shared & Explanation)
                </option>
                <option className="text-green-700">Interested</option>
                <option className="text-green-800">Documents Collected</option>
                <option className="text-green-900">Payment Done</option>
              </select>

              {/* Input Field */}
              <input
                type="text"
                required
                placeholder="Enter Custom Follow Up"
                value={followUpText}
                onChange={(e) => {
                  setFollowUpText(e.target.value);
                }}
                className="w-full p-4 border border-[#00000033] rounded-[4px] text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex h-10 mt-8 md:mt-4 justify-center sm:justify-end gap-6">
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Add Follow Up
              </button>
              <Loader />
            </div>
          </form>
          {/* Show Follow Up List */}
          <div className="w-full mt-4">
            <div className="mt-2 flex flex-col gap-2">
              {followUpList.length > 0 ? (
                followUpList.map((followUp, index) => (
                  <div key={index} className="w-full">
                    <div className="flex gap-2 flex-wrap items-center justify-start mt-2 text-sm leading-4 text-[#00000066] font-medium">
                      <span>
                        {followUp?.created_at} {"->"}
                      </span>
                      <span
                        className={`px-[6px] py-[2px] rounded-lg text-xs font-medium
                        ${
                          followUp?.followUp === "CNR1" ||
                          followUp?.followUp === "CNR2" ||
                          followUp?.followUp === "CNR3" ||
                          followUp?.followUp === "CNR4"
                            ? "bg-red-100 text-red-600"
                            : followUp?.followUp === "Switch Off"
                            ? "bg-red-100 text-red-700"
                            : followUp?.followUp === "Call Busy" ||
                              followUp?.followUp === "Call Back" ||
                              followUp?.followUp ===
                                "Not Responding (After Follow Up)"
                            ? "bg-yellow-100 text-yellow-600"
                            : followUp?.followUp ===
                                "Call Cut / Disconnected" ||
                              followUp?.followUp ===
                                "Not Interested (After Details Shared & Explanation)"
                            ? "bg-orange-100 text-orange-600"
                            : followUp?.followUp === "Invalid Number" ||
                              followUp?.followUp === "Wrong Number"
                            ? "bg-red-100 text-red-700"
                            : followUp?.followUp === "Form Filled By Mistake"
                            ? "bg-blue-100 text-blue-600"
                            : followUp?.followUp === "Repeat Lead"
                            ? "bg-gray-100 text-gray-600"
                            : followUp?.followUp === "Lead Clash"
                            ? "bg-purple-100 text-purple-500"
                            : followUp?.followUp === "Details Shared"
                            ? "bg-green-100 text-green-600"
                            : followUp?.followUp === "Not Interested"
                            ? "bg-pink-100 text-pink-600"
                            : followUp?.followUp === "Interested"
                            ? "bg-green-100 text-green-700"
                            : followUp?.followUp === "Documents Collected"
                            ? "bg-green-100 text-green-800"
                            : followUp?.followUp === "Payment Done"
                            ? "bg-green-100 text-green-900"
                            : "bg-gray-100 text-black"
                        }`}
                      >
                        {" "}
                        {followUp?.followUp}
                      </span>
                    </div>
                    <input
                      type="text"
                      disabled
                      className="w-full mt-[6px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={followUp.followUpText}
                      readOnly
                    />
                  </div>
                ))
              ) : (
                <input
                  type="text"
                  disabled
                  className="w-full text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value="No Follow Up Found"
                  readOnly
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Give Access Form */}
      <div
        className={` ${
          !giveAccess && "hidden"
        }  z-[61] overflow-scroll scrollbar-hide flex fixed`}
      >
        <div className="w-[330px] h-[380px] sm:w-[600px] sm:h-[400px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] lg:h-[300px] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Give Access</h2>
            <IoMdClose
              onClick={() => {
                setGiveAccess(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={assignLogin}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2">
              <input
                type="hidden"
                value={readerId || ""}
                onChange={(e) => {
                  setReaderId(e.target.value);
                }}
              />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  User Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter UserName"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter Password"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-center sm:justify-end gap-6">
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Give Access
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>

      {/* Show Reader details */}
      <div
        className={`${
          showReader ? "flex" : "hidden"
        } z-[61] property-form overflow-scroll scrollbar-hide w-[400px] h-[70vh] md:w-[700px] fixed`}
      >
        <div className="w-[330px] sm:w-[600px] overflow-scroll scrollbar-hide md:w-[500px] lg:w-[700px] bg-white py-8 pb-16 px-3 sm:px-6 border border-[#cfcfcf33] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Reader Details</h2>
            <IoMdClose
              onClick={() => {
                setShowReader(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Status
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.status}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Login Status
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.loginstatus}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Payment Status
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.paymentstatus}
                readOnly
              />
            </div>
            <div className={`${reader.fine === null ? "hidden" : "block"}`}>
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Fine
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={<FormatPrice price={parseFloat(reader.fine)} />}
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
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.fullname}
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
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.contact}
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
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.email}
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
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.department}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Year of study
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.yearofstudy}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Address
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.address}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                State
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.state}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                City
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.city}
                readOnly
              />
            </div>
            <div className="w-full ">
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                Pin-Code
              </label>
              <input
                type="text"
                disabled
                className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={reader.pincode}
                readOnly
              />
            </div>

            {/* Identity Card Image */}
            <div
              className={`w-full ${reader.idcardimage ? "block" : "hidden"}`}
            >
              <label className="block text-sm leading-4 text-[#00000066] font-medium">
                ID Card Image
              </label>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {(() => {
                  try {
                    const images = JSON.parse(reader.idcardimage); // parse JSON array
                    return images.map((img, index) => (
                      <img
                        key={index}
                        onClick={() => {
                          window.open(`${URI}${img}`, "_blank");
                        }}
                        className="w-full border border-[#00000033] rounded-[4px] object-cover cursor-pointer"
                        src={`${URI}${img}`}
                        alt={`ID CARD ${index + 1}`}
                      />
                    ));
                  } catch (err) {
                    console.error("Invalid JSON in ID Card Image:", err);
                    return null;
                  }
                })()}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Readers;
