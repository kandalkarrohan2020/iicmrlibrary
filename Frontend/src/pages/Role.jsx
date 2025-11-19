import React from "react";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { useAuth } from "../store/auth";
import AddButton from "../components/AddButton";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import Loader from "../components/Loader";

const Role = () => {
  const {
    URI,
    action,
    setLoading,
    showRole,
    setShowRole,
    showRoleForm,
    setShowRoleForm,
    showAssignTaskForm,
    setShowAssignTaskForm,
  } = useAuth();
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newRole, setNewRole] = useState({
    roleid: "",
    role: "",
    registration: "",
  });

  const [menus, setMenus] = useState([]);
  const [task, setTask] = useState({
    menus: [],
  });
  const [selectedId, setSelectedId] = useState(null); // Stores Role ID

  // **Fetch Data from API**
  const fetchData = async () => {
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
      setDatas(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Add or update record
  const addOrUpdate = async (e) => {
    e.preventDefault();

    const endpoint = newRole.roleid ? `edit/${newRole.roleid}` : "add";
    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/roles/${endpoint}`, {
        method: newRole.roleid ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRole),
      });

      if (!response.ok) throw new Error("Failed to save role.");

      if (newRole.roleid) {
        alert(`Role updated successfully!`);
      } else if (response.status === 202) {
        alert(`Role already Exit!!`);
      } else {
        alert(`Role added successfully!`);
      }

      setNewRole({ roleid: "", role: "", registration: "" });

      setShowRoleForm(false);
      fetchData();
    } catch (err) {
      console.error("Error saving :", err);
    } finally {
      setLoading(false);
    }
  };

  //fetch data on form
  const edit = async (id) => {
    try {
      const response = await fetch(URI + `/admin/roles/${id}`, {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch roles.");
      const data = await response.json();
      setNewRole(data);
      setShowRoleForm(true);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // change status record
  const status = async (id) => {
    if (!window.confirm("Are you sure you want to change this Role status?"))
      return;

    try {
      const response = await fetch(URI + `/admin/roles/status/${id}`, {
        method: "PUT",
        credentials: "include",
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
      console.error("Error deleting :", error);
    }
  };

  //fetch data on Tasks form
  const viewTasks = async (id) => {
    try {
      const response = await fetch(URI + `/admin/roles/${id}`, {
        method: "GET",
        credentials: "include", //  Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Role tasks.");
      const data = await response.json();
      setTask({ ...task, menus: JSON.parse(data.menus) });
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  //Fetch Menus
  const fetchMenus = async () => {
    try {
      const response = await fetch(URI + "/admin/roles/get/menus", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch menus.");
      const data = await response.json();
      setMenus(data); // Store the fetched data
    } catch (err) {
      console.error("Error fetching Menus:", err);
    }
  };

  const assignTask = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(
        URI + `/admin/roles/assign/tasks/${selectedId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      setSelectedId(null);
      setTask({ ...task, menus: [] });
      setShowAssignTaskForm(false);
      fetchData();
    } catch (error) {
      console.error("Error assigning tasks :", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Role?")) return;
    try {
      const response = await fetch(URI + `/admin/roles/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        alert("Role deleted successfully!");

        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting :", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMenus();
  }, []);

  const filteredData = datas.filter(
    (item) =>
      item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
      width: "200px",
    },
    {
      name: "Registration",
      selector: (row) => row.registration,
      width: "200px",
    },
    {
      name: "Assign Menus",
      cell: (row) => {
        // Convert string → array safely
        let menusArray = [];

        try {
          menusArray = JSON.parse(row.menus || "[]");
        } catch (error) {
          menusArray = [];
        }

        return (
          <div className="flex flex-wrap gap-2 w-full">
            {menusArray.length > 0 ? (
              menusArray.map((menu, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-md text-sm
                ${
                  row.status === "Active"
                    ? "bg-[#EAFBF1] text-[#0BB501]"
                    : "bg-[#FFEAEA] text-[#ff2323]"
                }
              `}
                >
                  {menu}
                </span>
              ))
            ) : (
              <span className="text-[#00000066] italic">Not Assigned</span>
            )}
          </div>
        );
      },
      minWidth: "200px",
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
        case "status":
          status(id);
          break;
        case "update":
          edit(id);
          break;
        case "assignTask":
          viewTasks(id);
          fetchMenus();
          setSelectedId(id);
          setShowAssignTaskForm(true);
          break;
        case "delete":
          del(id);
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
            handleActionSelect(action, row.roleid);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="status">Status</option>
          <option value="update">Update</option>
          <option value="assignTask">Assign Task</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`role overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="role-table w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
        {/* <p className="block md:hidden text-lg font-semibold">Role</p> */}
        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Role"
              className="search-input w-[250px] h-[36px] text-sm text-black bg-transparent border-none outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rightTableHead w-full lg:w-[70%] sm:h-[36px] gap-2 flex flex-wrap justify-end items-center">
            <AddButton label={"Add"} func={setShowRoleForm} />
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Role List</h2>
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
          showRoleForm ? "flex" : "hidden"
        } z-[61] roleForm overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[500px] max-h-[70vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Role</h2>
            <IoMdClose
              onClick={() => {
                setShowRoleForm(false);
                setNewRole({ roleid: "", role: "", registration: "" });
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addOrUpdate}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              <input
                type="hidden"
                value={newRole.roleid || ""}
                onChange={(e) =>
                  setNewRole({ ...newRole, roleid: e.target.value })
                }
              />
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Enter Role
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Role"
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] placeholder:text-black focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={newRole.role}
                  onChange={(e) =>
                    setNewRole({ ...newRole, role: e.target.value })
                  }
                />
              </div>
              <div className="w-full">
                <label className="block text-sm leading-4 text-[#00000066] font-medium">
                  Registration
                </label>
                <select
                  value={newRole.registration}
                  onChange={(e) =>
                    setNewRole({ ...newRole, registration: e.target.value })
                  }
                  required
                  className="w-full mt-[10px] text-[16px] font-medium p-4 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none "
                >
                  <option value="" disabled>
                    Set Registration Allow
                  </option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowRoleForm(false);
                  setNewRole({ roleid: "", role: "", registration: "" });
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

      {/* Assign Task Form */}
      <div
        className={` ${
          !showAssignTaskForm && "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[500px] lg:w-[750px] max-h-[70vh] overflow-scroll scrollbar-hide bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Assign Tasks</h2>
            <IoMdClose
              onClick={() => {
                setShowAssignTaskForm(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={assignTask}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1 lg:grid-cols-2">
              <input
                type="hidden"
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value)}
              />
              <div className="w-full col-span-2">
                <label className="block text-sm leading-4 text-[#0000009b] font-medium">
                  Select Menus
                </label>

                <div className="grid grid-cols-2 lg:grid-cols-3 mt-[10px] p-2 border border-[#00000033] rounded-[4px]">
                  {menus?.map((menu, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`menu-${index}`}
                        value={menu.menuName}
                        checked={task.menus?.includes(menu.menuName)}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          const updatedMenus = checked
                            ? [...(task.menus || []), value]
                            : (task.menus || []).filter(
                                (menu) => menu !== value
                              );
                          setTask({
                            ...task,
                            menus: updatedMenus,
                          });
                        }}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`menu-${index}`}
                        className="text-xs md:text-[14px] font-medium"
                      >
                        {menu.menuName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex mt-8 md:mt-6 justify-center md:justify-end gap-6">
              <button
                type="button"
                onClick={() => setTask({ ...task, menus: [] })}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Reset Tasks
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                Assign Tasks
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Role;
