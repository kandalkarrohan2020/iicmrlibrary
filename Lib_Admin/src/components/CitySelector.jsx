import React, { useState } from "react";
import {
  TextField,
  Checkbox,
  ListItemText,
  MenuItem,
  Select,
  FormControl,
  OutlinedInput,
} from "@mui/material";
import { styled } from "@mui/system";
import cityIcon from "../assets/overview/cityIcon.svg";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  "Ahmednagar",
  "Akola",
  "Amravati",
  "Aurangabad",
  "Beed",
  "Buldhana",
  "Chandrapur",
  "Dhule",
  "Gondia",
  "Jalgaon",
  "Kolhapur",
  "Latur",
  "Mumbai",
  "Nagpur",
  "Nanded",
  "Nandurbar",
  "Nashik",
  "Osmanabad",
  "Parbhani",
  "Pune",
  "Ratnagiri",
  "Sangli",
  "Satara",
  "Sindhudurg",
  "Solapur",
  "Thane",
  "Wardha",
  "Washim",
  "Yavatmal",
];

const CustomSelect = styled(Select)({
  backgroundColor: "#fff",
  borderRadius: "8px",
});

const CustomCheckbox = styled(Checkbox)({
  color: "#076300",
  "&.Mui-checked": {
    color: "#076300",
  },
});

export default function CitySelector() {
  const [selectedCities, setSelectedCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedCities(typeof value === "string" ? value.split(",") : value);
  };

  const filteredCities = names.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="">
      <FormControl style={{maxWidth:"150px"}}>
        <CustomSelect style={{minWidth:"107px", height: "36px"}}
          labelId="city-selector"
          multiple
          displayEmpty
          value={selectedCities}
          onChange={handleChange}
          renderValue={(selected) =>
            selected.length === 0 ? (
              <div className="w-15 h-9 flex items-center justify-center gap-2 text-sm leading-[20px]">
                <img className="w-4 h-4" src={cityIcon} alt="" />
                <p>City</p>
              </div>
            ) : (
              selected.join(", ")
            )
          }
          MenuProps={MenuProps}
          input={<OutlinedInput />}
        >
          <div className="p-2" style={{border:"none",outline:"none"}}>
            <TextField
              style={{border:"none",outline:"none"}}
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredCities.map((city) => (
            <MenuItem key={city} value={city}>
              <CustomCheckbox checked={selectedCities.indexOf(city) > -1} />
              <ListItemText primary={city} />
            </MenuItem>
          ))}
        </CustomSelect>
      </FormControl>
    </div>
  );
}
