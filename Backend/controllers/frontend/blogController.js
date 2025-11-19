import db from "../../config/dbconnect.js";
import moment from "moment";

// **Fetch All**
export const getAll = (req, res) => {
  const sql = "SELECT * FROM blogs WHERE status='Active' ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    const formatted = result.map((row) => ({
          ...row,
          created_at: moment(row.created_at).format("DD MMM YYYY | hh:mm A"),
          updated_at: moment(row.updated_at).format("DD MMM YYYY | hh:mm A"),
        }));
    
        res.json(formatted);
  });
};

// **Fetch Single by ID**
export const getById = (req, res) => {
  const seoSlug = req.params.slug;
  const sql = "SELECT * FROM blogs WHERE seoSlug = ?";
  db.query(sql, [seoSlug], (err, result) => {
    if (err) {
      console.error("Error fetching:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const formatted = result.map((row) => ({
          ...row,
          created_at: moment(row.created_at).format("DD MMM YYYY | hh:mm A"),
          updated_at: moment(row.updated_at).format("DD MMM YYYY | hh:mm A"),
        }));
    
        res.json(formatted[0]);
  });
};
