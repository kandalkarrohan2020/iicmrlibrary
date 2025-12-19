import db from "../../config/dbconnect.js";
import moment from "moment";

export const getAll = (req, res) => {
  const sql = `
      SELECT issue.*,
             issue.created_at AS issueCreatedAt,
             issue.updated_at AS issueUpdatedAt,
             issue.status AS issueStatus,
             users.*,
             books.image,
             books.title
      FROM issue
      LEFT JOIN users ON users.id = issue.readerId
      LEFT JOIN books ON books.itemId = issue.issueId
      WHERE role = 'Student' OR role = 'Teacher'
      ORDER BY issue.created_at DESC;
    `;

  // Execute Query
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching Issue:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    // Format Dates
    const formatted = result.map((row) => ({
      ...row,
      issueCreatedAt: moment(row.issueCreatedAt).format("DD MMM YYYY | hh:mm A"),
      issueUpdatedAt: moment(row.issueUpdatedAt).format("DD MMM YYYY | hh:mm A"),
    }));

    res.json(formatted);
  });
};

// **Fetch Single by ID**
export const getById = (req, res) => {
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Reader ID" });
  }
  const sql = `SELECT issue.*,
             issue.status AS issueStatus,
             users.*,
             books.image,
             books.title
      FROM issue
      LEFT JOIN users ON users.id = issue.readerId
      LEFT JOIN books ON books.itemId = issue.issueId
      WHERE issueId = ?
    `;

  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Issue not found" });
    }
    res.json(result[0]);
    console.log(result[0]);
  });
};

// **Change Issue Status**
export const status = (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const issueId = parseInt(req.params.id);

  if (isNaN(issueId)) {
    return res.status(400).json({ message: "Invalid Issue ID" });
  }

  const { prnno, status } = req.body;

  if (!prnno || !status) {
    return res.status(400).json({ message: "All fields required" });
  }

  // Step 1: Get itemId & current issue status
  db.query(
    "SELECT itemId, status AS currentStatus FROM issue WHERE issueId = ?",
    [issueId],
    (err, issueResult) => {
      if (err) {
        return res.status(500).json({ message: "Database error", err });
      }

      if (issueResult.length === 0) {
        return res.status(404).json({ message: "Issue record not found" });
      }

      const { itemId, currentStatus } = issueResult[0];
      console.log(issueResult[0]);

      // Step 2: Update issue status & prnno
      db.query(
        "UPDATE issue SET prnno = ?, status = ?, updated_at = ? WHERE issueId = ?",
        [prnno, status, currentdate, issueId],
        (err) => {
          if (err) {
            return res.status(500).json({
              message: "Error updating issue status",
              err,
            });
          }

          db.query(
            "UPDATE books SET available_copies = available_copies - 1 WHERE itemId = ? AND available_copies > 0",
            [itemId],
            (err, result) => {
              if (err) {
                return res.status(500).json({
                  message: "Failed to update available copies",
                  err,
                });
              }

              if (result.affectedRows === 0) {
                return res.status(400).json({
                  message: "Book is not available",
                });
              }

              return res.status(200).json({
                message: "Book issued successfully",
              });
            }
          );
        }
      );
    }
  );
};

// **Delete **
export const del = (req, res) => {
  const Id = parseInt(req.params.id);

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Reader ID" });
  }

  db.query("SELECT * FROM issue WHERE issueId = ?", [Id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Issue not found" });
    }

    db.query("DELETE FROM issue WHERE issueId = ?", [Id], (err) => {
      if (err) {
        console.error("Error deleting :", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(200).json({ message: "Issue deleted successfully" });
    });
  });
};
