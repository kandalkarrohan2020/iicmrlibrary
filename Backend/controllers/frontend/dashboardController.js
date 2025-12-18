import db from "../../config/dbconnect.js";

export const getCount = (req, res) => {
  const userId = req.user.id;
  if(!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Please login again!" });
  }

  const query = `
    SELECT
      (SELECT IFNULL(fine, 0)
       FROM users
       WHERE id = ?
      ) AS totalFine,

      (SELECT COUNT(itemId)
       FROM books
      ) AS totalItems
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching dashboard count:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.json(results[0]);
  });
};