import db from "../../config/dbconnect.js";
import moment from "moment";

// **Fetch All **
export const getAll = (req, res) => {
  const sql = "SELECT * FROM testimonials ORDER BY id";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(result);
  });
};

// **Fetch Single by ID**
export const getById = (req, res) => {
  const id = parseInt(req.params.id);
  const sql = "SELECT * FROM testimonials WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error fetching:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json(result[0]);
  });
};

// **Add New Builder**
export const add = (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const { url, message, client } = req.body;

  if (!url || !client) {
    return res
      .status(400)
      .json({ message: "Client And Video Url Are Required!" });
  }
  // Check if an image was uploaded
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const insertSQL = `INSERT INTO testimonials (url, message, client, clientimage, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    insertSQL,
    [url, message, client, imagePath, currentdate, currentdate],
    (err, result) => {
      if (err) {
        console.error("Error inserting:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res
        .status(201)
        .json({
          message: "Testimonial added successfully",
          id: result.insertId,
        });
    }
  );
};

// ** Edit Testimonials **
export const update = (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const Id = req.params.id ? parseInt(req.params.id) : null;

  const { url, message, client } = req.body;

  if (!url || !client) {
    return res.status(400).json({ message: "Client Name And Video Url Required!" });
  }
  // Check if an image was uploaded
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  db.query("SELECT * FROM testimonials WHERE id = ?", [Id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    if (result.length === 0)
      return res.status(404).json({ message: "Testimonial not found" });
    
    // Preserve existing image if no new image is uploaded
    const existingImage = result[0].clientimage;
    const finalImagePath = imagePath || existingImage;
    const sql = `UPDATE testimonials SET url=?, message=?, client=?, clientimage=?, updated_at=? WHERE id=?`;

    db.query(sql, [url, message, client, finalImagePath, currentdate, Id], (err) => {
      if (err) {
        console.error("Error updating:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(200).json({ message: "Testimonial updated successfully" });
    });
  });
};

// **Delete**
export const del = (req, res) => {
  const Id = req.params.id ? parseInt(req.params.id) : null;

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Testimonial ID" });
  }

  db.query("SELECT * FROM testimonials WHERE id = ?", [Id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    db.query("DELETE FROM testimonials WHERE id = ?", [Id], (err) => {
      if (err) {
        console.error("Error deleting:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(200).json({ message: "Testimonial deleted successfully" });
    });
  });
};

// **Change Status**
export const status = (req, res) => {
  const Id = parseInt(req.params.id);

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Testimonial ID" });
  }

  db.query("SELECT * FROM testimonials WHERE id = ?", [Id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    const newStatus = result[0].status === "Active" ? "Inactive" : "Active";

    db.query(
      "UPDATE testimonials SET status = ? WHERE id = ?",
      [newStatus, Id],
      (err) => {
        if (err) {
          console.error("Error updating status:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }
        res
          .status(200)
          .json({ message: `Testimonial status changed to ${newStatus}` });
      }
    );
  });
};
