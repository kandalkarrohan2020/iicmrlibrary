import db from "../../config/dbconnect.js";
import moment from "moment";

// **Fetch All**
export const getAll = (req, res) => {
  const sql = "SELECT * FROM books ORDER BY RAND()";
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
  const Id = req.params.id;
  const sql = "SELECT * FROM books WHERE book_id = ?";
  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error("Error fetching:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    const formatted = result.map((row) => ({
          ...row,
          created_at: moment(row.created_at).format("DD MMM YYYY | hh:mm A"),
          updated_at: moment(row.updated_at).format("DD MMM YYYY | hh:mm A"),
        }));
    
        res.json(formatted[0]);
  });
};
