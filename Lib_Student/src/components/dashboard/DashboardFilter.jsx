import React from "react";
import { useAuth } from "../../store/auth";

const DashboardFilter = ({ counts = {} }) => {
  const { dashboardFilter, setDashboardFilter } = useAuth();

  const filterOptions = [
    {
      name: "Booked",
      label: "Booked",
      bg: "bg-[#E3FFDF]",
      text: "text-green-600",
      count: counts?.Booked || 0,
    },
    {
      name: "Received",
      label: "Received",
      bg: "bg-blue-100",
      text: "text-blue-600",
      count: counts?.Enquired || 0,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center z-10">
      {filterOptions.map((option) => {
        const isActive = dashboardFilter === option.label;
        return (
          <button
            key={option.label}
            onClick={() => setDashboardFilter(option.label)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border font-medium transition-all duration-200
              ${
                isActive
                  ? `${option.bg} ${option.text}`
                  : "bg-white text-black text-sm"
              }
              hover:opacity-90`}
          >
            <span>{option.name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold
                ${
                  isActive
                    ? `${option.text} bg-white`
                    : "text-gray-500 bg-gray-200"
                }
              `}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default DashboardFilter;
