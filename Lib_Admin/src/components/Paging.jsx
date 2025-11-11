import React, { useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const Paging = ({ totalPages, currentPage, setCurrentPage }) => {
  const handlePrevClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="overview-footer w-full h-[52px] flex items-center justify-end gap-2 my-[10px] p-[10px] text-xs font-medium">
      {/* Left Button */}
      <div
        className={`left-button w-[32px] h-[28px] flex items-center justify-center border border-[#0000001A] rounded-[6px] ${
          currentPage === 1 ? "cursor-not-allowed text-gray-400" : "cursor-pointer"
        }`}
        onClick={handlePrevClick}
      >
        <FaAngleLeft />
      </div>

      {/* Page Indicator */}
      <p>
        {currentPage}/{totalPages}
      </p>

      {/* Right Button */}
      <div
        className={`right-button w-[32px] h-[28px] flex items-center justify-center border border-[#0000001A] rounded-[6px] ${
          currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "cursor-pointer"
        }`}
        onClick={handleNextClick}
      >
        <FaAngleRight />
      </div>
    </div>
  );
};

export default Paging;