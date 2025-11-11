import React, { useEffect, useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import { useAuth } from "../../store/auth";
import { IoMdClose } from "react-icons/io";
import Loader from "../Loader";

const MultiStepForm = ({
  fetchData,
  newProperty,
  setPropertyData,
  imageFiles,
  setImageFiles,
  builderData,
  authorities,
  states,
  cities,
}) => {
  const { URI, setLoading, showPropertyForm, setShowPropertyForm } = useAuth();
  const [step, setStep] = useState(1);
  const [nextButton, setNextButton] = useState(false);

  const steps = ["Property Details", "Overview Details", "Add Images"];

  const nextStep = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
  };

  const prevStep = (e) => {
    e.preventDefault();
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(newProperty).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const imageFields = [
      "frontView",
      "sideView",
      "kitchenView",
      "hallView",
      "bedroomView",
      "bathroomView",
      "balconyView",
      "nearestLandmark",
      "developedAmenities",
    ];

    imageFields.forEach((field) => {
      if (imageFiles[field]) {
        imageFiles[field].forEach((file) => {
          formData.append(field, file);
        });
      }
    });

    const endpoint = newProperty.propertyid
      ? `edit/${newProperty.propertyid}`
      : "add";

    try {
      setLoading(true);
      const response = await fetch(`${URI}/guest-user/properties/${endpoint}`, {
        method: newProperty.propertyid ? "PUT" : "POST",
        credentials: "include",
        body: formData,
      });

      // If duplicate property name
      if (response.status === 409) {
        const data = await response.json();
        alert(data.message || "Property name already exists!");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to save property. Status: ${response.status}`);
      }

      alert(
        newProperty.propertyid
          ? "Property updated successfully!"
          : "Property added successfully!"
      );

      // Reset form
      setPropertyData({
        propertyid: "",
        builderid: "",
        projectBy: "",
        possessionDate: "",
        propertyCategory: "",
        propertyApprovedBy: "",
        propertyName: "",
        address: "",
        state: "",
        city: "",
        pincode: "",
        location: "",
        distanceFromCityCenter: "",
        latitude: "",
        longitude: "",
        totalSalesPrice: "",
        totalOfferPrice: "",
        stampDuty: "",
        registrationFee: "",
        gst: "",
        advocateFee: "",
        msebWater: "",
        maintenance: "",
        other: "",
        tags: "",
        propertyType: "",
        builtYear: "",
        ownershipType: "",
        builtUpArea: "",
        carpetArea: "",
        parkingAvailability: "",
        totalFloors: "",
        floorNo: "",
        loanAvailability: "",
        propertyFacing: "",
        reraRegistered: "",
        furnishing: "",
        waterSupply: "",
        powerBackup: "",
        locationFeature: "",
        sizeAreaFeature: "",
        parkingFeature: "",
        terraceFeature: "",
        ageOfPropertyFeature: "",
        amenitiesFeature: "",
        propertyStatusFeature: "",
        smartHomeFeature: "",
        securityBenefit: "",
        primeLocationBenefit: "",
        rentalIncomeBenefit: "",
        qualityBenefit: "",
        capitalAppreciationBenefit: "",
        ecofriendlyBenefit: "",
      });

      setStep(1);
      setShowPropertyForm(false);
      await fetchData();
    } catch (err) {
      console.error("Error saving property:", err);
      alert("Please check empty fields or try again later.");
    } finally {
      setLoading(false);
    }
  };

  const checkButton = () => {
    if (step === 1) {
      const requiredFieldsStep1 = [
        "builderid", // number
        "propertyCategory",
        "propertyApprovedBy",
        "propertyName",
        "address",
        "state",
        "city",
        "pincode", // number
        "location",
        "distanceFromCityCenter",
        "latitude",
        "longitude",
        "totalSalesPrice", // number
        "totalOfferPrice", // number
        "stampDuty", // number
        "other", // number
        "tags",
      ];

      const allFilled = requiredFieldsStep1.every((field) => {
        const value = newProperty[field];
        if (typeof value === "number") {
          return value > -1; // for numbers, must be Positive
        }
        return value && value.toString().trim() !== ""; // for strings
      });

      setNextButton(allFilled);
    } else if (step === 2) {
      const requiredFieldsStep2 = [
        "builtYear", // number
        "ownershipType",
        "carpetArea", // number
        "parkingAvailability",
        "loanAvailability",
        "propertyFacing",
        "waterSupply",
        "powerBackup",
        "locationFeature",
        "sizeAreaFeature",
        "parkingFeature",
        "ageOfPropertyFeature",
        "amenitiesFeature",
        "propertyStatusFeature",
        "securityBenefit",
        "primeLocationBenefit",
        "rentalIncomeBenefit",
        "capitalAppreciationBenefit",
        "ecofriendlyBenefit",
      ];

      const allFilled = requiredFieldsStep2.every((field) => {
        const value = newProperty[field];
        if (typeof value === "number") {
          return value > -1; // number must be Positive
        }
        return value && value.toString().trim() !== "";
      });

      setNextButton(allFilled);
    } else {
      setNextButton(false);
    }
  };

  useEffect(() => {
    checkButton();
  }, [newProperty, step]);

  return (
    <div
      className={`${
        showPropertyForm ? "flex" : "hidden"
      } z-[61] property-form overflow-scroll scrollbar-hide w-full flex fixed bottom-0 md:bottom-auto`}
    >
      <div className="w-full overflow-scroll scrollbar-hide sm:w-[600px] md:w-[500px] lg:w-[700px] xl:w-[1000px] bg-white py-8 px-3 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Property</h2>

          {/* Step Indicator */}

          {steps.map((label, index) => (
            <div key={index} className="flex items-center justify-center gap-2">
              <div
                className={`mx-auto w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${
                  step === index + 1
                    ? "bg-blue-500 text-white"
                    : step > index + 1
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {index + 1}
              </div>
              <span className="hidden xl:block">{label}</span>
            </div>
          ))}

          {/* Close Button */}
          <IoMdClose
            onClick={() => {
              setShowPropertyForm(false);
              setPropertyData((prev) =>
                Object.fromEntries(Object.keys(prev).map((k) => [k, ""]))
              );
            }}
            className="w-7 h-7 cursor-pointer"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleFinalSubmit}>
          <input
            type="hidden"
            value={newProperty.propertyid}
            onChange={(e) =>
              setPropertyData({
                ...newProperty,
                propertyid: e.target.value,
              })
            }
          />
          {step === 1 && (
            <StepOne
              newProperty={newProperty}
              setPropertyData={setPropertyData}
              builderData={builderData}
              authorities={authorities}
              states={states}
              cities={cities}
            />
          )}
          {step === 2 && (
            <StepTwo
              newProperty={newProperty}
              setPropertyData={setPropertyData}
            />
          )}
          {step === 3 && (
            <StepThree
              newProperty={newProperty}
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
            />
          )}

          {/* Buttons Inside Form Container */}
          <div className="flex justify-end gap-4 p-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 text-white bg-gray-500 rounded active:scale-[0.98]"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextButton == true && nextStep}
                className={`${
                  nextButton == true
                    ? "active:scale-[0.98] bg-green-600"
                    : "bg-blue-400"
                } px-6 py-2 text-white  rounded `}
              >
                Next
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="px-6 py-2 text-white bg-green-600 rounded active:scale-[0.98]"
                >
                  Save
                </button>
                <Loader></Loader>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default MultiStepForm;
