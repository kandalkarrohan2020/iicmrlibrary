import { useState } from "react";

const StepThree = ({
  newProperty,
  setPropertyData,
  imageFiles,
  setImageFiles,
}) => {
  // Property Image Selector
  const handleImageChange = (event, category) => {
    const files = Array.from(event.target.files);

    setImageFiles((prev) => {
      const existing = prev[category] || [];
      const newFiles = [...existing, ...files];

      if (newFiles.length > 3) {
        alert("You can only upload up to 3 images per category.");
        return { ...prev, [category]: newFiles.slice(0, 3) }; // keep only 3
      }

      return { ...prev, [category]: newFiles };
    });

    // reset input so same file can be selected again
    event.target.value = "";
  };

  // Property Image Remove
  const removeImage = (category, index) => {
    setImageFiles((prev) => {
      const updated = [...prev[category]];
      updated.splice(index, 1);
      return { ...prev, [category]: updated };
    });
  };

  return (
    <div className="bg-white h-[55vh] overflow-scroll scrollbar-x-hidden p-2">
      <div className="flex items-center justify-between text-base font-semibold mb-4">
        Step 3: Upload Property Images{" "}
        <span className="text-red-600 text-xs">
          {" "}
          (Maximum Image Size 500kb)
        </span>
      </div>
      <div className="grid gap-6 md:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* Upload Multiple Images */}
        <div className="w-full">
          <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
            Front View <span className="text-red-600">*</span>
          </label>
          <div className="w-full mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e, "frontView")}
              className="hidden"
              id="frontViewImages"
            />
            <label
              htmlFor="frontViewImages"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imageFiles.frontView.map((image, index) => {
              const imageUrl = URL.createObjectURL(image);
              return (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className={`w-full h-24 object-cover rounded-lg border ${
                      index === 0
                        ? "border-4 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("frontView", index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
            Nearest Landmark <span className="text-red-600">*</span>
          </label>
          <div className="w-full mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e, "nearestLandmark")}
              className="hidden"
              id="nearestLandmarkImages"
            />
            <label
              htmlFor="nearestLandmarkImages"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imageFiles.nearestLandmark.map((image, index) => {
              const imageUrl = URL.createObjectURL(image);
              return (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className={`w-full h-24 object-cover rounded-lg border ${
                      index === 0
                        ? "border-4 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("nearestLandmark", index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
            Developed Amenities <span className="text-red-600">*</span>
          </label>
          <div className="w-full mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e, "developedAmenities")}
              className="hidden"
              id="developedAmenitiesImages"
            />
            <label
              htmlFor="developedAmenitiesImages"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imageFiles.developedAmenities.map((image, index) => {
              const imageUrl = URL.createObjectURL(image);
              return (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className={`w-full h-24 object-cover rounded-lg border ${
                      index === 0
                        ? "border-4 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("developedAmenities", index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`${
            newProperty.propertyCategory === "CommercialPlot" ||
            newProperty.propertyCategory === "NewPlot" ||
            newProperty.propertyCategory === "FarmLand"
              ? "hidden"
              : "block"
          } w-full`}
        >
          <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
            Side View
          </label>
          <div className="w-full mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e, "sideView")}
              className="hidden"
              id="sideViewImages"
            />
            <label
              htmlFor="sideViewImages"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imageFiles.sideView.map((image, index) => {
              const imageUrl = URL.createObjectURL(image);
              return (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className={`w-full h-24 object-cover rounded-lg border ${
                      index === 0
                        ? "border-4 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("sideView", index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`${
            newProperty.propertyCategory === "CommercialPlot" ||
            newProperty.propertyCategory === "NewPlot" ||
            newProperty.propertyCategory === "FarmLand"
              ? "hidden"
              : "block"
          } w-full`}
        >
          <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
            Hall View
          </label>
          <div className="w-full mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e, "hallView")}
              className="hidden"
              id="hallViewImages"
            />
            <label
              htmlFor="hallViewImages"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imageFiles.hallView.map((image, index) => {
              const imageUrl = URL.createObjectURL(image);
              return (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className={`w-full h-24 object-cover rounded-lg border ${
                      index === 0
                        ? "border-4 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("hallView", index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`${
            newProperty.propertyCategory === "CommercialPlot" ||
            newProperty.propertyCategory === "NewPlot" ||
            newProperty.propertyCategory === "FarmLand" ||
            newProperty.propertyCategory === "IndustrialSpace" ||
            newProperty.propertyCategory === "RentalShop"
              ? "hidden"
              : "block"
          } w-full`}
        >
          <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
            Kitchen View
          </label>
          <div className="w-full mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e, "kitchenView")}
              className="hidden"
              id="kitchenViewImages"
            />
            <label
              htmlFor="kitchenViewImages"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imageFiles.kitchenView.map((image, index) => {
              const imageUrl = URL.createObjectURL(image);
              return (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className={`w-full h-24 object-cover rounded-lg border ${
                      index === 0
                        ? "border-4 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("kitchenView", index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`${
            newProperty.propertyCategory === "CommercialPlot" ||
            newProperty.propertyCategory === "NewPlot" ||
            newProperty.propertyCategory === "FarmLand" ||
            newProperty.propertyCategory === "IndustrialSpace" ||
            newProperty.propertyCategory === "RentalShop"
              ? "hidden"
              : "block"
          } w-full`}
        >
          <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
            Bedroom View
          </label>
          <div className="w-full mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e, "bedroomView")}
              className="hidden"
              id="bedroomViewImages"
            />
            <label
              htmlFor="bedroomViewImages"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imageFiles.bedroomView.map((image, index) => {
              const imageUrl = URL.createObjectURL(image);
              return (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className={`w-full h-24 object-cover rounded-lg border ${
                      index === 0
                        ? "border-4 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("bedroomView", index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`${
            newProperty.propertyCategory === "CommercialPlot" ||
            newProperty.propertyCategory === "NewPlot" ||
            newProperty.propertyCategory === "FarmLand" ||
            newProperty.propertyCategory === "IndustrialSpace" ||
            newProperty.propertyCategory === "RentalShop"
              ? "hidden"
              : "block"
          } w-full`}
        >
          <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
            Bathroom View
          </label>
          <div className="w-full mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e, "bathroomView")}
              className="hidden"
              id="bathroomViewImages"
            />
            <label
              htmlFor="bathroomViewImages"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imageFiles.bathroomView.map((image, index) => {
              const imageUrl = URL.createObjectURL(image);
              return (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className={`w-full h-24 object-cover rounded-lg border ${
                      index === 0
                        ? "border-4 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("bathroomView", index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`${
            newProperty.propertyCategory === "CommercialPlot" ||
            newProperty.propertyCategory === "NewPlot" ||
            newProperty.propertyCategory === "FarmLand"
              ? "hidden"
              : "block"
          } w-full`}
        >
          <label className="block text-sm leading-4 text-[#00000066] font-medium mb-2">
            Balcony View
          </label>
          <div className="w-full mt-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageChange(e, "balconyView")}
              className="hidden"
              id="balconyViewImages"
            />
            <label
              htmlFor="balconyViewImages"
              className="flex items-center justify-between border border-gray-300 leading-4 text-[#00000066] rounded cursor-pointer"
            >
              <span className="m-3 p-2 text-[16px] font-medium text-[#00000066]">
                Upload Images
              </span>
              <div className="btn flex items-center justify-center w-[107px] p-5 rounded-[3px] rounded-tl-none rounded-bl-none bg-[#000000B2] text-white">
                Browse
              </div>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {imageFiles.balconyView.map((image, index) => {
              const imageUrl = URL.createObjectURL(image);
              return (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className={`w-full h-24 object-cover rounded-lg border ${
                      index === 0
                        ? "border-4 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("balconyView", index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
