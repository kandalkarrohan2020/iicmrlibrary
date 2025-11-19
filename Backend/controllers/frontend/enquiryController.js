import db from "../../config/dbconnect.js";
import moment from "moment";

export const add = async (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");

  const { propertyid, fullname, phone, state, city, minbudget, maxbudget } =
    req.body;

  if (
    !propertyid ||
    !fullname ||
    !phone ||
    !state ||
    !city ||
    !minbudget ||
    !maxbudget
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Step 1: Fetch propertyCategory from properties table
  const categorySQL = `SELECT propertyCategory FROM properties WHERE propertyid = ?`;

  db.query(categorySQL, [propertyid], (err, results) => {
    if (err) {
      console.error("Error fetching property category:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const propertyCategory = results[0].propertyCategory;

    // Step 2: Insert enquiry
    const insertSQL = `INSERT INTO enquirers (
      propertyid, category, customer, contact, state, city, minbudget, maxbudget, source,
      updated_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      insertSQL,
      [
        propertyid,
        propertyCategory,
        fullname,
        phone,
        state,
        city,
        minbudget,
        maxbudget,
        "Onsite",
        currentdate,
        currentdate,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }

        res.status(201).json({
          message: "Enquiry added successfully",
          Id: result.insertId,
          propertyCategory: propertyCategory, // returning the category if needed
        });
      }
    );
  });
};
