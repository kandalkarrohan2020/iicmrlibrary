import db from "../../config/dbconnect.js";
import moment from "moment";

//Fetch All
export const getAll = (req, res) => {
  const sql = `SELECT propertyfollowup.*,
                      properties.propertyName,
                      enquirers.customer,
                      enquirers.contact,
                      salespersons.fullname
               FROM propertyfollowup 
               INNER JOIN enquirers ON propertyfollowup.enquirerid = enquirers.enquirersid
               INNER JOIN properties ON enquirers.propertyid = properties.propertyid
               LEFT JOIN salespersons ON enquirers.salespersonid = salespersons.salespersonsid
               ORDER BY propertyfollowup.followupid DESC`; 

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(result);
  });
};

// **Add New **
export const add = (req, res) => {
  const {
    name,
    contact,
    email,
    address,
    dob,
    department,
    position,
    salary,
    doj,
  } = req.body;

  if (
    !name ||
    !contact ||
    !email ||
    !address ||
    !dob ||
    !department ||
    !position ||
    !salary ||
    !doj
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `INSERT INTO calenders (name, contact, email, address, dob, department, position, salary, doj) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [name, contact, email, address, dob, department, position, salary, doj],
    (err, result) => {
      if (err) {
        console.error("Error inserting :", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res
        .status(201)
        .json({ message: "Calender added successfully", Id: result.insertId });
    }
  );
};

// **Edit **
export const update = (req, res) => {
  const Id = parseInt(req.params.id);
  const {
    name,
    contact,
    email,
    address,
    dob,
    department,
    position,
    salary,
    doj,
  } = req.body;

  if (
    !name ||
    !contact ||
    !email ||
    !address ||
    !dob ||
    !department ||
    !position ||
    !salary ||
    !doj
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query("SELECT * FROM calenders WHERE id = ?", [Id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    if (result.length === 0)
      return res.status(404).json({ message: "Calender not found" });

    const sql = `UPDATE calenders SET name=?, contact=?, email=?, address=?, dob=?, department=?, position=?, salary=?, doj=? WHERE id=?`;

    db.query(
      sql,
      [
        name,
        contact,
        email,
        address,
        dob,
        department,
        position,
        salary,
        doj,
        Id,
      ],
      (err) => {
        if (err) {
          console.error("Error updating :", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }
        res.status(200).json({ message: "Calender updated successfully" });
      }
    );
  });
};

// **Delete **
export const del = (req, res) => {
  const Id = parseInt(req.params.id);

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Calender ID" });
  }

  db.query("SELECT * FROM calenders WHERE id = ?", [Id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Calender not found" });
    }

    db.query("DELETE FROM calenders WHERE id = ?", [Id], (err) => {
      if (err) {
        console.error("Error deleting :", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(200).json({ message: "Calender deleted successfully" });
    });
  });
};
