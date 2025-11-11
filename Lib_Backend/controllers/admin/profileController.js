import db from "../../config/dbconnect.js";
import moment from "moment";
import bcrypt from "bcryptjs";
import sendEmail from "../../utils/nodeMailer.js";

const saltRounds = 10;

export const getProfile = async (req, res) => {
  const Id = req.user?.id; 
  if (!Id) {
    return res.status(400).json({ message: "Unauthorized User" });
  }

  const sql = "SELECT * FROM users WHERE id = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(sql, [Id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result[0]);
    
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Database error", error });
  }
};

export const editProfile = (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const { name, username, contact, email } = req.body;

  if (!name || !username || !contact || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Fetch existing user profile first
  db.query("SELECT userimage FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingImage = result[0].userimage;
    const finalImagePath = req.file ? `/uploads/${req.file.filename}` : existingImage;

    let updateSql = `UPDATE users SET name = ?, username = ?, contact = ?, email = ?, userimage = ?, updated_at = ? WHERE id = ?`;
    const updateValues = [
      name,
      username,
      contact,
      email,
      finalImagePath,
      currentdate,
      userId,
    ];

    db.query(updateSql, updateValues, (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating profile:", updateErr);
        return res.status(500).json({ message: "Database error during update", error: updateErr });
      }

      res.status(200).json({ message: "Profile updated successfully" });
    });
  });
};

export const changePassword = async (req, res) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new passwords are required" });
  }
  if(currentPassword === newPassword) {
    return res.status(400).json({ message: "New Password Cannot be Same as Current Password"});
  }
  
  try {
    // Fetch user's current password from the database
    db.query("SELECT password FROM users WHERE id = ?", [userId], async (err, result) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const storedPassword = result[0].password;

      // Compare provided current password with stored password
      const isMatch = await bcrypt.compare(currentPassword, storedPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password in the database
      db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId], (updateErr) => {
        if (updateErr) {
          console.error("Error updating password:", updateErr);
          return res.status(500).json({ message: "Database error during update", error: updateErr });
        }

        res.status(200).json({ message: "Password changed successfully" });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};