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
  const sql = "SELECT * FROM books WHERE itemId = ?";
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

// **Borrow / Issue Book (No stock change)**
export const borrowItem = (req, res) => {
  const readerId = req.user.id;
  const itemId = parseInt(req.params.id);

  if (!readerId) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Please login again!" });
  }

  if (isNaN(itemId)) {
    return res.status(400).json({ message: "Invalid Item ID!" });
  }

  // Step 1: Check book availability
  db.query(
    "SELECT available_copies FROM books WHERE itemId = ?",
    [itemId],
    (err, bookResult) => {
      if (err) {
        return res.status(500).json({ message: "Database error", err });
      }

      if (bookResult.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      if (bookResult[0].available_copies <= 0) {
        return res.status(400).json({ message: "Book not available" });
      }

      // Step 2: Insert issue record ONLY
      const issueSql = `
        INSERT INTO issue (itemId, readerId, status)
        VALUES (?, ?, 'New')
      `;

      db.query(issueSql, [itemId, readerId], (err) => {
        if (err) {
          return res.status(500).json({ message: "Issue failed", err });
        }

        return res.status(200).json({
          message: "Book borrowed successfully",
        });
      });
    }
  );
};
