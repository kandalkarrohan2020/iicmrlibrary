import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import "dotenv/config";
import db from "./config/dbconnect.js";

import userRoutes from "./routes/admin/userRoutes.js";
import profileRoutes from "./routes/admin/profileRoutes.js";
import dashboardRoutes from "./routes/admin/dashboardRoutes.js";
import roleRoutes from "./routes/admin/roleRoutes.js";
import stateRoutes from "./routes/admin/stateRoutes.js";
import cityRoutes from "./routes/admin/cityRoutes.js";
import readerRoutes from "./routes/admin/readerRoutes.js";
import manageItemsRoutes from "./routes/admin/manageItemsRoutes.js";
import issueRoutes from "./routes/admin/issueRoutes.js";

// Frontend Routes
import itemsRoutes from  "./routes/frontend/itemsRoutes.js";
import frontendDashboardRoutes from "./routes/frontend/dashboardRoutes.js";
import frontendIssueRoutes from "./routes/frontend/issueRoutes.js";

// Account Cancellation Route
import accountCancellation from "./routes/accountCancellationRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Configure Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }, // Use `secure: true` in production with HTTPS
  })
);

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
// Serve static files from 'uploads' directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const allowedOrigins = [
  "http://localhost:5173",
  "https://iicmrlibrary.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin); // Debugging
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// Use the same custom CORS for preflight requests
app.options(
  "*",
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS (OPTIONS):", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const publicRoutes = [
    "/user/login",
    "/admin/login",
    "/admin/register",
    "/admin/roles",
    // account cancellation request from partner
    "/api/user/account/cancellation",
  ];

  //  Allow public routes to pass through
  if (publicRoutes.some((route) => req.path.startsWith(route))) {
    return next();
  }

  const token = req.cookies?.token; // Ensure token exists
  //console.log("Token received:", token); // Debugging line

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next(); //  Continue to protected route
  } catch (error) {
    console.error("JWT Verification Failed:", error); // Log error
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running successfully!",
  });
});

app.get("/get-cookie", (req, res) => {
  console.log("Cookies:", req.cookies); //  Print cookies in terminal
  res.json({ cookies: req.cookies }); // Send cookie data in response
});

// Use Login & Auth Routes

app.use("/admin", userRoutes);

// Account Cancellation Request
app.use("/api/user/account", accountCancellation);

app.use(verifyToken);
app.use("/admin/profile", profileRoutes);
app.use("/admin/dashboard", dashboardRoutes);
app.use("/admin/roles", roleRoutes);
app.use("/admin/states", stateRoutes);
app.use("/admin/cities", cityRoutes);
app.use("/admin/readers", readerRoutes);
app.use("/admin/items", manageItemsRoutes);
app.use("/admin/issue", issueRoutes);

// Frontend Routes
app.use("/frontend/items", itemsRoutes);
app.use("/frontend/dashboard", frontendDashboardRoutes);
app.use("/frontend/issue", frontendIssueRoutes);

// Test Database Connection on Startup
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database Connection Failed:", err);
  } else {
    console.log("Database Connected Successfully!");
    connection.release();
  }
});

//  Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
