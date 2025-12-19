import db from "../../config/dbconnect.js";
import moment from "moment";

export const getAll = (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Please login again!" });
  }
  const sql = `
      SELECT issue.*,
             issue.status AS issueStatus,
             issue.created_at AS issueCreatedAt,
             issue.updated_at AS issueUpdatedAt,
             users.*,
             books.image,
             books.title
      FROM issue
      LEFT JOIN users ON users.id = issue.readerId
      LEFT JOIN books ON books.itemId = issue.issueId
      WHERE readerId = ?
      ORDER BY issue.created_at DESC;
    `;

  // Execute Query
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching Issue:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    const formatted = result.map((row) => ({
      ...row,
      issueCreatedAt: moment(row.issueCreatedAt).format(
        "DD MMM YYYY | hh:mm A"
      ),
      issueUpdatedAt: moment(row.issueUpdatedAt).format(
        "DD MMM YYYY | hh:mm A"
      ),
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
