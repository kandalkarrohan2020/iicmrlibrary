import React from "react";

const propertyTypes = [
  {
    category: "NewFlat",
    types: [
      "1 RK",
      "1 BHK",
      "2 BHK",
      "2.5 BHK",
      "3 BHK",
      "3.5 BHK",
      "4 BHK",
      "5 BHK",
      "Above 5 BHK",
      "Pent House",
      "Builder Floor",
      "Studio Apartment",
      "Duplex Apartment",
      "Serviced Apartment",
    ],
  },
  {
    category: "RentalFlat",
    types: [
      "1 RK",
      "1 BHK",
      "2 BHK",
      "2.5 BHK",
      "3 BHK",
      "3.5 BHK",
      "4 BHK",
      "5 BHK",
      "Above 5 BHK",
      "Pent House",
      "Builder Floor",
      "Studio Apartment",
      "Duplex Apartment",
      "Serviced Apartment",
    ],
  },
  {
    category: "NewPlot",
    types: [
      "Corner Plot",
      "Park Facing Plot",
      "Road Facing Plot",
      "Gated Community Plot",
    ],
  },
  {
    category: "CommercialFlat",
    types: [
      "Office Space",
      "Co-Working Space",
      "Corporate Office",
      "Studio Office",
    ],
  },
  {
    category: "CommercialShop",
    types: ["Shop", "Showroom", "Restaurant / Cafe", "Bank / ATM"],
  },
  {
    category: "IndustrialSpace",
    types: ["Godown", "Cold Storage", "Small Manufacturing Unit"],
  },
  {
    category: "CommercialPlot",
    types: [
      "Office Building Plot",
      "Warehouse Plot",
      "Mixed-Use Development Plot",
      "Highway-Facing Plot",
      "Petrol Pump Plot",
      "School / Hospital Plot",
    ],
  },
];

export default function PropertyTypeMultiSelect({
  newProperty,
  setPropertyData,
}) {
  const handleChange = (value) => {
    let updated = [...(newProperty.propertyType || [])];

    if (updated.includes(value)) {
      updated = updated.filter((item) => item !== value); // remove if exists
    } else {
      updated.push(value); // add if not exists
    }
    console.log(updated);
    setPropertyData({ ...newProperty, propertyType: updated });
  };

  // find the matching category
  const currentCategory = propertyTypes.find(
    (p) => p.category === newProperty.propertyCategory
  );

  return (
    <div className="w-full mt-[10px]">
      <label
        className={`${
          newProperty.propertyType?.length
            ? "text-green-600"
            : "text-[#00000066]"
        } block text-sm leading-4 font-medium mb-3`}
      >
        Select Property Type <span className="text-red-600">*</span>
      </label>

      {currentCategory ? (
        <div className="grid gap-2 lg:gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 border border-[#00000033] rounded-[4px]">
          {currentCategory.types.map((type, idx) => (
            <label key={idx} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                checked={(newProperty.propertyType || []).includes(type)}
                onChange={() => handleChange(type)}
              />
              <span className="text-sm font-medium text-black">{type}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="p-4 text-sm text-gray-500 border border-[#00000033] rounded-[4px]">
          Select a property category first
        </div>
      )}
    </div>
  );
}
