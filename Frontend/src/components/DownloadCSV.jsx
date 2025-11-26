import React from "react";
import { IoMdDownload } from "react-icons/io";

const DownloadCSV = ({ data, filename }) => {
  const handleDownload = () => {
    downloadCSV(data, filename);
  };

  const downloadCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(",") + "\n";
    const rows = data.map((obj) => Object.values(obj).join(",")).join("\n");
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.click();
  };

  return (
    <button
      onClick={handleDownload}
      className="px-2 lg:px-4 py-[6px] z-10 cursor-pointer flex items-center justify-center gap-2 border border-[#00000033] rounded-md bg-[#076300] font-semibold text-4 leading-5 text-[#FFFFFF] active:scale-[0.98]"
    >
      <p className="hidden lg:block">Download</p>
      <IoMdDownload className="text-[20px]" />
    </button>
  );
};

export default DownloadCSV;
