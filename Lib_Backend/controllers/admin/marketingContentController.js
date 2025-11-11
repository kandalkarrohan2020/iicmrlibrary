import db from "../../config/dbconnect.js";
import fs from "fs";
import path from "path";
import moment from "moment";

// **Fetch All **
export const getAll = (req, res) => {
  const sql = "SELECT * FROM marketingContent ORDER BY id DESC";
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
  const Id = parseInt(req.params.id);
  const sql = "SELECT * FROM marketingContent WHERE id = ?";

  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.json(result[0]);
  });
};

export const add = (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const { contentType, contentName } = req.body;
  const contentFile = req.file
    ? `uploads/marketing-content/${req.file.filename}`
    : null;

  if (!contentType || !contentName || !contentFile) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const checkDuplicateSql = `SELECT * FROM marketingContent WHERE contentFile = ?`;
  db.query(checkDuplicateSql, [contentFile], (err, data) => {
    if (err) return res.status(500).json({ message: "DB Error", error: err });

    if (data.length > 0) {
      return res.status(202).json({ message: "Content already exists" });
    }

    const sql = `INSERT INTO marketingContent (contentType, contentName, contentFile, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;
    db.query(
      sql,
      [contentType, contentName, contentFile, currentdate, currentdate],
      (err, result) => {
        if (err)
          return res.status(500).json({ message: "DB Error", error: err });
        res
          .status(201)
          .json({ message: "Content added successfully", id: result.insertId });
      }
    );
  });
};

export const update = (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const contentId = req.params.id;
  const { contentType, contentName } = req.body;
  const contentFile = req.file
    ? `uploads/marketing-content/${req.file.filename}`
    : null;

  const selectSql = "SELECT contentFile FROM marketingContent WHERE id = ?";
  db.query(selectSql, [contentId], (selectErr, selectResult) => {
    if (selectErr) {
      console.error("Error fetching content:", selectErr);
      return res.status(500).json({ message: "Database error" });
    }

    if (selectResult.length === 0) {
      return res.status(404).json({ message: "Content not found" });
    }

    const oldFile = selectResult[0].contentFile;

    // Prepare fields and values
    const fields = [];
    const values = [];

    if (contentType) {
      fields.push("contentType = ?");
      values.push(contentType);
    }

    if (contentName) {
      fields.push("contentName = ?");
      values.push(contentName);
    }

    if (contentFile) {
      fields.push("contentFile = ?");
      values.push(contentFile);
    }

    fields.push("updated_at = ?");
    values.push(currentdate);

    values.push(contentId);

    const updateSql = `UPDATE marketingContent SET ${fields.join(
      ", "
    )} WHERE id = ?`;

    db.query(updateSql, values, (updateErr, result) => {
      if (updateErr) {
        console.error("Error updating content:", updateErr);
        return res.status(500).json({ message: "Database update error" });
      }

      if (contentFile && oldFile && fs.existsSync("." + oldFile)) {
        fs.unlink("." + oldFile, (err) => {
          if (err) console.error("Error deleting old file:", err);
        });
      }

      res.status(200).json({ message: "Content updated successfully" });
    });
  });
};


export const del = (req, res) => {
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  // Step 1: Get the APK record to find file path
  db.query(
    "SELECT * FROM marketingContent WHERE id = ?",
    [Id],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Content not found" });
      }

      const content = result[0];
      const filePath = content.contentFile;

      // Step 2: Delete the file if it exists
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (fsErr) => {
          if (fsErr) {
            console.error("Error deleting content file:", fsErr);
            // Continue even if file delete fails — optional behavior
          }
        });
      }

      // Step 3: Delete the DB record
      db.query("DELETE FROM marketingContent WHERE id = ?", [Id], (err) => {
        if (err) {
          console.error("Error deleting DB record:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }

        res.status(200).json({ message: "Content deleted successfully" });
      });
    }
  );
};
