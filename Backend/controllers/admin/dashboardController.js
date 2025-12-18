import db from "../../config/dbconnect.js";

export const getCount = (req, res) => {
  const query = `
    SELECT
      (SELECT IFNULL(SUM(fine), 0) FROM users) AS totalFine,
      (SELECT COUNT(itemId) FROM books) AS totalItems,
      (SELECT COUNT(id) 
       FROM users 
       WHERE role IN ('Student', 'Teacher')
      ) AS totalReaders
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching dashboard count:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.json(results[0]);
  });
};
