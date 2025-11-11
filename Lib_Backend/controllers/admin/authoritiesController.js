import db from "../../config/dbconnect.js";

// **Fetch All **
export const getAll = (req, res) => {
  const sql = "SELECT * FROM propertyAuthorities ORDER BY authorityNACL";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(result);
  });
};

