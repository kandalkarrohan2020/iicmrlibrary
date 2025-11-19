import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../../config/dbconnect.js";
import sendEmail from "../../utils/nodeMailer.js";
import moment from "moment";

const router = express.Router();

// Helper: Extract name from email
const extractNameFromEmail = (email) => {
  if (!email) return "";
  const namePart = email.split("@")[0];
  const lettersOnly = namePart.match(/[a-zA-Z]+/);
  if (!lettersOnly) return "";
  const name = lettersOnly[0].toLowerCase();
  return name.charAt(0).toUpperCase() + name.slice(1);
};

// Helper: Generate random password
const generatePassword = () => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Route: Register User
router.post("/register", async (req, res) => {
  try {
    const currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
    const { role, fullname, contact, email } = req.body;

    if (!role || !fullname || !contact || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1 Fetch Menus From roles table using selected role
    const roleData = await new Promise((resolve, reject) => {
      db.query(
        "SELECT menus FROM roles WHERE role = ? AND status = 'Active'",
        [role],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });

    if (!roleData) {
      return res.status(404).json({ message: "Selected Role not found" });
    }

    // menus stored as string in DB → convert to JSON array if needed
    const menus = JSON.parse(roleData.menus || "[]");

    // 2 Check duplicate user
    const existingUser = await new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM users WHERE (email = ? OR contact = ?) AND role = ?`,
        [email, contact, role],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email or contact." });
    }

    // 3 Generate username & password
    const username = extractNameFromEmail(email);
    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 4 Insert User with Menus
    const insertedUser = await new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO users (role, fullname, contact, email, username, password, menus, loginstatus, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          role,
          fullname,
          contact,
          email,
          username,
          hashedPassword,
          JSON.stringify(menus),
          "Active",
          currentdate,
          currentdate,
        ],
        (err, result) => {
          if (err) return reject(err);
          resolve({
            id: result.insertId,
            role,
            fullname,
            contact,
            email,
            username,
            menus,
          });
        }
      );
    });

    // 5 Send login credentials email
    await sendEmail(
      email,
      username,
      rawPassword,
      role,
      "https://iicmrlibrary.onrender.com"
    );

    return res.status(201).json({
      message: "Registration successful. Check your email for login details.",
      user: insertedUser,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// User Login Route
router.post("/login", async (req, res) => {
  try {
    const { role, emailOrUsername, password } = req.body;

    if (!role || !emailOrUsername || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //  Query the database for either email OR username
    const user = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE (email = ? OR username = ?) AND role = ? AND loginstatus = 'Active'",
        [emailOrUsername, emailOrUsername, role],
        (err, results) => {
          if (err)
            reject({ status: 500, message: "Database error", error: err });
          else if (results.length === 0)
            reject({ status: 401, message: "Invalid Email | Username" });
          else resolve(results[0]);
        }
      );
    });

    //  Compare password securely
    try {
      const isMatch = await bcrypt.compare(password, user?.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Wrong Password try again!" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Password comparison error", error });
    }

    //  Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        assignMenus: JSON.parse(user.menus),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d",
      }
    );

    //  Store session data
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username, // Added username field
      name: user.name,
      contact: user.contact,
      role: user.role,
      assignMenus: JSON.parse(user.menus),
    };

    //  Set secure cookie for authentication
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    //  Send response
    return res.json({
      message: "Login successful",
      token,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
});

//  Get Current User's Session Data
router.get("/session-data", (req, res) => {
  if (req.session.user) {
    res.json({ message: "Session Active", user: req.session.user });
  } else {
    res.status(401).json({ message: "No active session" });
  }
});

//  Logout Route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    console.log("Logout Successfully");
    return res.json({ message: "Logout successful." });
  });
});

export default router;
