import React from "react";
import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useAuth } from "../store/auth";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import AddButton from "../components/AddButton";
import { IoMdClose } from "react-icons/io";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import Loader from "../components/Loader";
import DownloadCSV from "../components/DownloadCSV";
import FormatPrice from "../components/FormatPrice";
import itemImage from "../assets/items/image.webp";

const ManageItems = () => {
  const {
    URI,
    setLoading,
    showItem,
    setShowItem,
    showItemForm,
    setShowItemForm,
  } = useAuth();

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemId, setItemId] = useState(null);
  const [newItem, setNewItem] = useState({
    title: "",
    price: "",
    prnno: "",
    description: "",
    author_name: "",
    publisher: "",
    category: "",
    isbn: "",
    edition: "",
    language: "",
    total_copies: "",
    available_copies: "",
    publication_year: "",
    shelf_location: "",
  });

  // For View Item & item List
  const [item, setItem] = useState({});

  //Image Upload
  const [selectedImage, setSelectedImage] = useState(null);
  const singleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 1 * 1024 * 1024) {
      setSelectedImage(file);
      //setNewItem((prev) => ({ ...prev, image: file }));
    } else {
      alert("File size must be less than 1MB");
    }
  };
  const removeSingleImage = () => {
    setSelectedImage(null);
  };

  // **Fetch Data from API**
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/items", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch items.");
      const data = await response.json();
      console.log(data);
      setItems(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Fetch Item Data
  const fetchItem = async (id) => {
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

  //fetch data on form
  const edit = async (id) => {
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

      setNewItem(data);
      setShowItemForm(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  const add = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      Object.entries(newItem).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const isEdit = Boolean(newItem.itemId);
      const endpoint = isEdit
        ? `${URI}/admin/items/edit/${newItem.itemId}`
        : `${URI}/admin/items/add`;

      const response = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        body: formData, // NOT JSON
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save item");
      }

      alert(isEdit ? "Item updated successfully!" : "Item added successfully!");

      setShowItemForm(false);
      setSelectedImage(null);
      setNewItem({
        title: "",
        description: "",
        author_name: "",
        publisher: "",
        category: "",
        isbn: "",
        edition: "",
        language: "",
        total_copies: "",
        available_copies: "",
        publication_year: "",
        shelf_location: "",
      });

      fetchData();
    } catch (err) {
      console.error("Error saving item:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Change Status
  const changeStatus = async (id) => {
    if (!window.confirm("Are you sure to change this Item Status?")) return;

    try {
      const response = await fetch(URI + `/admin/items/status/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await response.json();
      //console.log(response);
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.message}`);
      }
      fetchData();
    } catch (error) {
      console.error("Error in Changing status :", error);
    }
  };

  //Delete record
  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Item?")) return;

    try {
      setLoading(true);
      const response = await fetch(URI + `/admin/items/delete/${id}`, {
        method: "DELETE",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("Item deleted successfully!");
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting Item:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [range, setRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const filteredData = items?.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isbn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.prnno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

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
              row.available_copies > 0
                ? "bg-[#EAFBF1] text-[#0BB501]"
                : "bg-[#FFEAEA] text-[#ff2323]"
            }`}
          >
            {index + 1}
          </span>

          {/* Tooltip */}
          <div className="absolute w-[65px] text-center -top-12 left-[30px] -translate-x-1/2 px-2 py-2 rounded bg-black text-white text-xs hidden group-hover:block transition">
            {row.available_copies > 0 ? "Available" : "Out of Stock"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Image",
      cell: (row) => {
        let imageSrc = URI + row.image || itemImage;
        return (
          <div className="w-[60px] h-[70px] overflow-hidden border rounded-lg flex items-center justify-center">
            <img
              src={imageSrc}
              alt="image"
              onClick={() => {
                fetchItem(row.itemId);
              }}
              className="w-full h-[100%] object-cover cursor-pointer"
            />
          </div>
        );
      },
      width: "100px",
    },
    {
      name: "Date & Time",
      selector: (row) => row.created_at,
      width: "200px",
    },
    {
      name: "Item Name",
      cell: (row) => (
        <span className={`${row.status === "Active" && "text-green-600"}`}>
          {row.title}{" "}
        </span>
      ),
      sortable: true,
      minWidth: "180px",
      maxWidth: "200px",
    },
    {
      name: "ISBN",
      selector: (row) => row.isbn,
      minWidth: "150px",
    },
    {
      name: "Unit Price",
      selector: (row) => <FormatPrice price={row.price} />,
      minWidth: "150px",
      maxWidth: "200px",
    },
    {
      name: "Total Quantity",
      selector: (row) => row.total_copies + " Copies",
      minWidth: "150px",
      maxWidth: "200px",
    },
    {
      name: "Available",
      selector: (row) => row.available_copies + " Copies",
      minWidth: "150px",
      maxWidth: "200px",
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
          fetchItem(id);
          break;
        case "update":
          setItemId(id);
          edit(id);
          break;
        case "changeStatus":
          setItemId(id);
          changeStatus(id);
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
            handleActionSelect(action, row.itemId);
          }}
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view">View</option>
          <option value="update">Update</option>
          <option value="changeStatus">Change Status</option>
          <option value="delete">Delete</option>
        </select>
      </div>
    );
  };

  return (
    <div
      className={`overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start`}
    >
      <div className="w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white md:rounded-[24px]">
        <div className="w-full flex items-center justify-between gap-1 sm:gap-3">
          <div className="flex xl:hidden flex-wrap items-center justify-end gap-2 sm:gap-3 px-2">
            <DownloadCSV data={filteredData} filename={"item.csv"} />
            <AddButton label={"Add"} func={setShowItemForm} />
          </div>
        </div>

        <div className="searchBarContainer w-full flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="search-bar w-full lg:w-[30%] min-w-[150px] max:w-[289px] xl:w-[289px] h-[36px] flex gap-[10px] border rounded-[12px] p-[10px] items-center justify-start lg:justify-between bg-[#0000000A]">
            <CiSearch />
            <input
              type="text"
              placeholder="Search Item"
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
              <DownloadCSV data={filteredData} filename={"Item.csv"} />
              <AddButton label={"Add"} func={setShowItemForm} />
            </div>
          </div>
        </div>
        <h2 className="text-[16px] font-semibold">Item List</h2>
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
          showItemForm ? "flex" : "hidden"
        } z-[61] overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full overflow-scroll scrollbar-hide md:w-[500px] lg:w-[750px] max-h-[75vh] bg-white py-8 pb-10 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              {" "}
              {newItem.itemId ? "Update Item" : "ADD Item"}{" "}
            </h2>

            <IoMdClose
              onClick={() => {
                setShowItemForm(false);
                setNewItem({
                  title: "",
                  price: "",
                  prnno: "",
                  description: "",
                  author_name: "",
                  publisher: "",
                  category: "",
                  isbn: "",
                  edition: "",
                  language: "",
                  total_copies: "",
                  available_copies: "",
                  publication_year: "",
                  shelf_location: "",
                });
                setSelectedImage(null);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={add}>
            <div className="grid gap-2 lg:gap-3 grid-cols-1 lg:grid-cols-2">
              <input type="hidden" value={newItem.itemId || ""} readOnly />

              <div className={` w-full `}>
                <label
                  htmlFor="itemName"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Item Name
                </label>
                <input
                  type="text"
                  id="itemName"
                  placeholder="Enter Item Name"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem?.title || ""}
                  onChange={(e) => {
                    setNewItem({
                      ...newItem,
                      title: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={` w-full`}>
                <label className="block ml-1 text-sm leading-4 text-[#00000066] font-medium">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="Enter Category"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.category || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                />
              </div>

              <div className={` w-full`}>
                <label className="block ml-1 text-sm leading-4 text-[#00000066] font-medium">
                  Edition
                </label>
                <input
                  type="text"
                  placeholder="Enter Edition"
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.edition || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, edition: e.target.value })
                  }
                />
              </div>

              <div className={` w-full`}>
                <label className="block ml-1 text-sm leading-4 text-[#00000066] font-medium">
                  Language
                </label>
                <input
                  type="text"
                  placeholder="Enter Language"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.language || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, language: e.target.value })
                  }
                />
              </div>

              <div className={` w-full`}>
                <label className="block ml-1 text-sm leading-4 text-[#00000066] font-medium">
                  Publication Year
                </label>
                <input
                  type="number"
                  placeholder="Enter Publication Year"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.publication_year || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, publication_year: e.target.value })
                  }
                />
              </div>

              <div className={` w-full`}>
                <label className="block ml-1 text-sm leading-4 text-[#00000066] font-medium">
                  Shelf Location
                </label>
                <input
                  type="text"
                  placeholder="Enter Shelf Location"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.shelf_location || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, shelf_location: e.target.value })
                  }
                />
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="price"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="sellingPrice"
                  placeholder="Enter Price"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem?.price}
                  onChange={(e) => {
                    setNewItem({
                      ...newItem,
                      price: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="itemQuantity"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  id="itemQuantity"
                  placeholder="Enter Quantity"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem?.total_copies}
                  onChange={(e) => {
                    setNewItem({
                      ...newItem,
                      total_copies: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="isbn"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  ISBN
                </label>
                <input
                  type="number"
                  id="isbn"
                  placeholder="Enter ISBN"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem?.isbn}
                  onChange={(e) => {
                    setNewItem({
                      ...newItem,
                      isbn: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={`w-full `}>
                <label
                  htmlFor="author"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Author Name
                </label>
                <input
                  type="text"
                  id="author"
                  placeholder="Enter Author"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem?.author_name}
                  onChange={(e) => {
                    setNewItem({
                      ...newItem,
                      author_name: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={`col-span-1 lg:col-span-2 w-full`}>
                <label
                  htmlFor="description"
                  className="block ml-1 text-sm leading-4 text-[#00000066] font-medium"
                >
                  Item Description
                </label>
                <input
                  type="text"
                  id="discription"
                  placeholder="Enter item Description"
                  required
                  className="w-full mt-[8px] mb-1 text-[16px] font-medium p-3 border border-[#00000033] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem?.description}
                  onChange={(e) => {
                    setNewItem({
                      ...newItem,
                      description: e.target.value,
                    });
                  }}
                />
              </div>

              <div className={"w-full"}>
                <label className="block ml-1 text-sm leading-4 text-[#00000066] font-medium mb-2">
                  Upload item Image
                </label>

                <div className="w-full mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={singleImageChange}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="flex items-center justify-between border border-gray-300 rounded cursor-pointer"
                  >
                    <span className="m-3 p-0 text-[16px] font-medium text-[#00000066]">
                      Upload Image
                    </span>
                    <div className="btn flex items-center justify-center w-[107px] p-3 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                      Browse
                    </div>
                  </label>
                </div>

                {/* Image Preview */}
                {selectedImage && (
                  <div className="relative mt-2 w-full max-w-[300px]">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Uploaded preview"
                      className="w-full object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeSingleImage}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex h-10 mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowItemForm(false);
                  setNewItem({
                    title: "",
                    price: "",
                    prnno: "",
                    description: "",
                    author_name: "",
                    publisher: "",
                    category: "",
                    isbn: "",
                    edition: "",
                    language: "",
                    total_copies: "",
                    available_copies: "",
                    publication_year: "",
                    shelf_location: "",
                  });
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
    </div>
  );
};

export default ManageItems;
