import { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";

const ActionSelect = ({
  viewRoute,
  statusAction,
  editAction,
  deleteAction,
  approveAction,
}) => {
  const [selectedAction, setSelectedAction] = useState("");
  const { setShowEplDetailsForm, setAction, setShowUploadImagesForm} = useAuth();
  const navigate = useNavigate();

  const handleAction = (action) => {
    switch (action) {
      case "view":
        navigate(viewRoute);
        break;

      case "status":
        statusAction();
        break;

      case "approve":
        approveAction();
        break;

      case "upload":
        setAction("upload"); // Optional: Set global state for action
        setShowUploadImagesForm(true);
        break;

      case "update":
        setAction("update"); // Optional: Set global state for action
        editAction();
        break;

      case "delete":
        deleteAction(); // Call the function passed from Employee table
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
          handleAction(action);
        }}
      >
        <option value="" disabled>
          Select Action
        </option>
        <option value="status">Status</option>
        <option value="approve">Approve</option>
        <option value="upload">Upload Image</option>
        <option value="update">Update</option>
        <option value="delete">Delete</option>
      </select>
    </div>
  );
};

export default ActionSelect;
