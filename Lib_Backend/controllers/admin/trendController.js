import db from "../../config/dbconnect.js";
import moment from "moment";
import bcrypt from "bcryptjs";

function toSlug(text) {
  return text
    .toLowerCase()               // Convert to lowercase
    .trim()                      // Remove leading/trailing spaces
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/-+/g, '-');        // Replace multiple hyphens with single
}

// **Fetch All **
export const getAll = (req, res) => {
  const sql = "SELECT * FROM trends ORDER BY created_at DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
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

// **Fetch All**
export const getAllActive = (req, res) => {
  const sql =
    "SELECT * FROM trends WHERE status = 'Active' ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(result);
  });
};

// **Fetch Single by ID**
export const getById = (req, res) => {
  const Id = parseInt(req.params.id);
  const sql = "SELECT * FROM trends WHERE id = ?";

  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Trend not found" });
    }
    res.json(result[0]);
  });
};

// **Add New **
export const add = (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const { trendName, content } = req.body;
  
  if (!trendName || !content) {
    return res.status(400).json({ message: "All Fields are Required" });
  }

  const seoSlug = toSlug(trendName);

  const trendImageFile = req.files?.["trendImage"]?.[0];
  const trendImageUrl = trendImageFile ? `/uploads/${trendImageFile.filename}` : null;

  const sql = `INSERT INTO trends (trendName, content, seoSlug, image, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [trendName, content, seoSlug, trendImageUrl, currentdate, currentdate],
    (err, result) => {
      if (err) {
        console.error("Error inserting trend:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      return res.status(201).json({
        message: "Trend added successfully",
        trendId: result.insertId,
      });
    }
  );
};

export const edit = (req, res) => {
  const trendId = req.params.id;
  if (!trendId) {
    return res.status(400).json({ message: "Invalid Trend ID" });
  }

  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const { trendName, content } = req.body;

  if (!trendName || !content) {
    return res.status(400).json({ message: "all fields are required" });
  }

  // Handle uploaded image
  const trendImageFile = req.files?.["trendImage"]?.[0];
  const trendImageUrl = trendImageFile ? `/uploads/${trendImageFile.filename}` : null;

  // Build update SQL
  let updateSql = `UPDATE trends SET trendName = ?, content = ?, updated_at = ?`;
  const updateValues = [trendName, content, currentdate];

  if (trendImageUrl) {
    updateSql += `, image = ?`;
    updateValues.push(trendImageUrl);
  }

  updateSql += ` WHERE id = ?`;
  updateValues.push(trendId);

  db.query(updateSql, updateValues, (err, result) => {
    if (err) {
      console.error("Error updating trend:", err);
      return res.status(500).json({ message: "Database error during update", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trend not found" });
    }

    return res.status(200).json({ message: "Trend updated successfully" });
  });
};


//**Change status */
export const status = (req, res) => {
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Trend ID" });
  }

  db.query(
    "SELECT * FROM trends WHERE id = ?",
    [Id],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      let status = "";
      if (result[0].status === "Active") {
        status = "Inactive";
      } else {
        status = "Active";
      }
      console.log(status);
      db.query(
        "UPDATE trends SET status = ? WHERE id = ?",
        [status, Id],
        (err, result) => {
          if (err) {
            console.error("Error deleting :", err);
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }
          res
            .status(200)
            .json({ message: "Trend status change successfully" });
        }
      );
    }
  );
};

//* ADD Seo Details */
export const seoDetails = (req, res) => {
  const {seoSlug, seoTittle, seoDescription } = req.body;
  if (!seoSlug || !seoTittle || !seoDescription) {
    return res.status(401).json({ message: "All Field Are Required" });
  }
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  db.query(
    "SELECT * FROM trends WHERE id = ?",
    [Id],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      db.query(
        "UPDATE trends SET seoSlug = ?, seoTittle = ?, seoDescription = ? WHERE id = ?",
        [seoSlug, seoTittle, seoDescription, Id],
        (err, result) => {
          if (err) {
            console.error("Error While Add Seo Details:", err);
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }
          res
            .status(200)
            .json({ message: "Seo Details Add successfully" });
        }
      );
    }
  );
};

// **Delete **
export const del = (req, res) => {
  const Id = parseInt(req.params.id);

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  db.query(
    "SELECT * FROM trends WHERE id = ?",
    [Id],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Trend not found" });
      }

      db.query(
        "DELETE FROM trends WHERE id = ?",
        [Id],
        (err) => {
          if (err) {
            console.error("Error deleting :", err);
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }
          res.status(200).json({ message: "Trend deleted successfully" });
        }
      );
    }
  );
};
