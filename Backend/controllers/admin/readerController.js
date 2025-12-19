import db from "../../config/dbconnect.js";
import moment from "moment";
import bcrypt from "bcryptjs";
import sendEmail from "../../utils/nodeMailer.js";
import fs from "fs";
import path from "path";

const saltRounds = 10;

export const getAll = (req, res) => {
  const role = req.params.role;

  if (!role) {
    return res.status(400).json({ message: "Role not provided" });
  }

  let sql = "";

  // Filter based on role
  if (role === "Student") {
    sql = `
      SELECT * FROM users
      WHERE role = 'Student'
      ORDER BY created_at DESC;
    `;
  } else if (role === "Teacher") {
    sql = `
      SELECT * FROM users
      WHERE role = 'Teacher'
      ORDER BY created_at DESC;
    `;
  } else {
    sql = `
      SELECT * FROM users
      WHERE role = 'Student' OR role = 'Teacher'
      ORDER BY created_at DESC;
    `;
  }

  // Execute Query
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    // Format Dates
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
  const sql = `SELECT * FROM users WHERE role = "Student" OR role = "Teacher" AND status = 'Active' ORDER BY id DESC`;
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
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Reader ID" });
  }
  const sql = "SELECT * FROM users WHERE id = ?";

  db.query(sql, [Id], (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Partner not found" });
    }
    res.json(result[0]);
    console.log(result[0]);
  });
};

// **Add New**
export const add = (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");

  const {
    role,
    fullname,
    contact,
    email,
    address,
    state,
    city,
    pincode,
    department,
    yearofstudy,
    designation,
  } = req.body;

  // Basic Validation
  if (!fullname || !contact || !email || !role) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }

  // Optional ID Card Image
  const idCardImageFile = req.file || null;
  const idCardImageUrl = idCardImageFile
    ? `/uploads/${idCardImageFile.filename}`
    : null;

  // Check existing user
  const checkSql = `SELECT * FROM users WHERE contact = ? OR email = ?`;

  db.query(checkSql, [contact, email], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking existing user:", checkErr);
      return res.status(500).json({
        message: "Database error during validation",
        error: checkErr,
      });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({
        message: "User already exists with this contact or email",
      });
    }

    // Insert new user
    const insertSql = `
      INSERT INTO users 
      (role, fullname, contact, email, address, state, city, pincode, department, yearofstudy, designation, idcardimage, updated_at, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        role,
        fullname,
        contact,
        email,
        address,
        state,
        city,
        pincode,
        department,
        yearofstudy,
        designation,
        idCardImageUrl,
        currentdate,
        currentdate,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).json({
            message: "Database error while inserting user",
            error: err,
          });
        }

        // SUCCESS (without follow-up insert)
        return res.status(201).json({
          message: "Reader added successfully",
          id: result.insertId,
        });
      }
    );
  });
};

export const edit = (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");

  const {
    role,
    fullname,
    contact,
    email,
    address,
    state,
    city,
    pincode,
    department,
    yearofstudy,
    designation,
  } = req.body;

  // Basic validations
  if (!fullname || !contact || !email || !role) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }

  // Optional ID card image
  const idCardImageFile = req.file || null;
  const idCardImageUrl = idCardImageFile
    ? `/uploads/${idCardImageFile.filename}`
    : null;

  // Check duplicate user for email/contact except current user
  const checkSql = `
    SELECT * FROM users 
    WHERE (contact = ? OR email = ?) AND id != ?
  `;

  db.query(checkSql, [contact, email, userId], (checkErr, existing) => {
    if (checkErr) {
      console.error("Error checking existing user:", checkErr);
      return res
        .status(500)
        .json({ message: "Database error", error: checkErr });
    }

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Another user already exists with this contact or email",
      });
    }

    // Build dynamic update query
    let updateSql = `
      UPDATE users SET
        role = ?, 
        fullname = ?, 
        contact = ?, 
        email = ?, 
        address = ?, 
        state = ?, 
        city = ?, 
        pincode = ?, 
        department = ?, 
        yearofstudy = ?, 
        designation = ?, 
        updated_at = ?
    `;

    const values = [
      role,
      fullname,
      contact,
      email,
      address,
      state,
      city,
      pincode,
      department,
      yearofstudy,
      designation,
      currentdate,
    ];

    // If new image uploaded → add to SQL
    if (idCardImageUrl) {
      updateSql += `, idcardimage = ?`;
      values.push(idCardImageUrl);
    }

    updateSql += ` WHERE id = ?`;
    values.push(userId);

    // Execute update
    db.query(updateSql, values, (err) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({
          message: "Database error while updating user",
          error: err,
        });
      }

      return res.status(200).json({
        message: "Reader updated successfully",
      });
    });
  });
};

// **Delete **
export const del = (req, res) => {
  const Id = parseInt(req.params.id);

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Reader ID" });
  }

  db.query("SELECT * FROM users WHERE id = ?", [Id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Reader not found" });
    }

    db.query("DELETE FROM users WHERE id = ?", [Id], (err) => {
      if (err) {
        console.error("Error deleting :", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(200).json({ message: "Reader deleted successfully" });
    });
  });
};

//**Change status */
export const status = (req, res) => {
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  db.query("SELECT * FROM users WHERE id = ?", [Id], (err, result) => {
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
      "UPDATE users SET status = ? WHERE id = ?",
      [status, Id],
      (err, result) => {
        if (err) {
          console.error("Error status changing :", err);
          return res
            .status(500)
            .json({ message: "error status changing", error: err });
        }
        res.status(200).json({ message: "Reader status change successfully" });
      }
    );
  });
};

//* Pay Fine Payment */
export const payFinePayment = (req, res) => {
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  db.query("SELECT * FROM users WHERE id = ?", [Id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    db.query(
      "UPDATE users SET paymentstatus = ?, fine = ? WHERE id = ?",
      ["Paid", 0, Id],
      (err, result) => {
        if (err) {
          console.error("Error Paying Payment :", err);
          return res.status(500).json({ message: "error payment", error: err });
        }
        res.status(200).json({ message: "Reader Payment successfully" });
      }
    );
  });
};

// **Fetch All Menus**
export const getMenus = (req, res) => {
  const sql = "SELECT * FROM menu ORDER BY menuName";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching :", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(result);
  });
};

// assign Task to Users
export const assignTask = async (req, res) => {
  try {
    const { menus } = req.body;
    const Id = parseInt(req.params.id);

    const menuString = JSON.stringify(menus);

    if (isNaN(Id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // Fetch Role details first
    db.query("SELECT * FROM users WHERE id = ?", [Id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Reader not found" });
      }

      // Update Role details
      db.query(
        "UPDATE users SET menus = ? WHERE id = ? ",
        [menuString, Id],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Error updating Reader:", updateErr);
            return res
              .status(500)
              .json({ message: "Database error", error: updateErr });
          }

          res.status(200).json({ message: "Task assigned successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Error assigning tasks:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const fetchFollowUpList = (req, res) => {
  const Id = parseInt(req.params.id);
  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Partner ID" });
  }

  const sql =
    "SELECT * FROM partnerFollowup WHERE partnerId = ? AND role = ? ORDER BY created_at DESC";
  db.query(sql, [Id, "Onboarding Partner"], (err, result) => {
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

export const addFollowUp = async (req, res) => {
  const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
  const Id = parseInt(req.params.id);

  if (isNaN(Id)) {
    return res.status(400).json({ message: "Invalid Partner ID" });
  }

  const { followUp, followUpText } = req.body;
  if (!followUp || !followUpText) {
    return res.status(400).json({ message: "Empty Follow Up or Text" });
  }

  // Check if onboarding partner exists
  db.query(
    "SELECT * FROM onboardingpartner WHERE partnerid = ?",
    [Id],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: "Onboarding partner not found." });
      }

      // Insert follow-up entry
      db.query(
        "INSERT INTO partnerFollowup (partnerId, role, followUp, followUpText, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        [
          Id,
          "Onboarding Partner",
          followUp.trim(),
          followUpText.trim(),
          currentdate,
          currentdate,
        ],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Error Adding Follow Up:", insertErr);
            return res
              .status(500)
              .json({ message: "Database error", error: insertErr });
          }

          // Update partnerLister in onboardingpartner
          db.query(
            "UPDATE onboardingpartner SET paymentstatus = 'Follow Up', updated_at = ? WHERE partnerid = ?",
            [currentdate, Id],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Error updating paymentstatus:", updateErr);
                return res
                  .status(500)
                  .json({ message: "Database error", error: updateErr });
              }

              return res.status(200).json({
                message:
                  "Partner Follow Up added and payment status updated to 'Follow Up'.",
              });
            }
          );
        }
      );
    }
  );
};

export const assignLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const Id = parseInt(req.params.id);

    if (isNaN(Id)) {
      return res.status(400).json({ message: "Invalid Partner ID" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Use 10 as salt rounds

    db.query("SELECT * FROM users WHERE id = ?", [Id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Reader not found" });
      }

      let loginstatus = "Active";
      const email = result[0].email;
      const role = result[0].role;

      db.query(
        "UPDATE users SET loginstatus = ?, username = ?, password = ? WHERE id = ?",
        [loginstatus, username, hashedPassword, Id],
        (err, updateResult) => {
          if (err) {
            console.error("Error updating record:", err);
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }

          // Send email after successful update
          sendEmail(
            email,
            username,
            password,
            role,
            "https://iicmrlibrary.onrender.com"
          )
            .then(() => {
              res.status(200).json({
                message: "Reader login assigned successfully and email sent.",
              });
            })
            .catch((emailError) => {
              console.error("Error sending email:", emailError);
              res
                .status(500)
                .json({ message: "Login updated but email failed to send." });
            });
        }
      );
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Unexpected server error", error });
  }
};
