import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import "dotenv/config";
import "./utils/cron.js";

import loginRoutes from "./routes/admin/loginRoutes.js";
import profileRoutes from "./routes/admin/profileRoutes.js";
import dashboardRoutes from "./routes/admin/dashboardRoutes.js";
import employeeRoutes from "./routes/admin/employeeRoutes.js";
import builderRoutes from "./routes/admin/builderRoutes.js";
import propertyRoutes from "./routes/admin/propertyRoutes.js";
import customerRoutes from "./routes/admin/customerRoutes.js";
import roleRoutes from "./routes/admin/roleRoutes.js";
import departmentRoutes from "./routes/admin/departmentRoutes.js";
import authoritiesRoutes from "./routes/admin/authoritiesRoutes.js";
import stateRoutes from "./routes/admin/stateRoutes.js";
import cityRoutes from "./routes/admin/cityRoutes.js";
import mapRoutes from "./routes/admin/mapRoutes.js";
import promoterRoutes from "./routes/admin/promoterRoutes.js";
import salespersonRoutes from "./routes/admin/salespersonRoutes.js";
import partnerRoutes from "./routes/admin/partnerRoutes.js";
import projectPartnerRoutes from "./routes/admin/projectPartnerRoutes.js";
import territoryPartnerRoutes from "./routes/admin/territoryPartnerRoutes.js";
import guestUserRoutes from "./routes/admin/guestUserRoutes.js";
import propertytypeRoutes from "./routes/admin/propertytypeRoutes.js";
import enquirerRoutes from "./routes/admin/enquirerRoutes.js";
import addEnquiryRoutes from "./routes/admin/enquiryRoutes.js";
import auctionmembersRoutes from "./routes/admin/auctionmemberRoutes.js";
import ticketRoutes from "./routes/admin/ticketRoutes.js";
import apkUploadRoutes from "./routes/admin/apkUploadRoutes.js";
import blogRoutes from "./routes/admin/blogRoutes.js";
import trendRoutes from "./routes/admin/trendRoutes.js";
import sliderRoutes from "./routes/admin/sliderRoutes.js";
import testimonialRoutes from "./routes/admin/testimonialRoutes.js";
import calenderRoutes from "./routes/admin/calenderRoutes.js";
import emiRoutes from "./routes/admin/emiRoutes.js";
import marketingContentRoutes from "./routes/admin/marketingContentRoutes.js";
import brandAccessoriesRoutes from "./routes/admin/brandAccessoriesRoutes.js";

//frontend
import allPropertiesRoutes from "./routes/frontend/allPropertiesRoutes.js";
import propertiesRoutes from "./routes/frontend/propertiesRoutes.js";
import joinourteamRoutes from "./routes/frontend/joinourteamRoutes.js";
import propertyinfoRoutes from "./routes/frontend/propertyinfoRoutes.js";
import enquiryRoutes from "./routes/frontend/enquiryRoutes.js";
import frontendBlogRoutes from "./routes/frontend/blogRoutes.js";
import sliderImagesRoutes from "./routes/frontend/sliderRoutes.js";
import testimonialFeedbackRoutes from "./routes/frontend/testimonialRoutes.js";
import frontendEmiRoutes from "./routes/frontend/emiRoutes.js";

// Account Cancellation Route
import accountCancellation from "./routes/accountCancellationRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

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
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
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
    "/admin/login",
    "/frontend/properties",
    "/frontend/all-properties",
    "/frontend/joinourteam",
    "/frontend/propertyinfo",
    "/frontend/enquiry",
    "/frontend/blog",
    "/frontend/blog/",
    "/frontend/blog/details/",
    "/frontend/slider",
    "/frontend/testimonial",
    "/frontend/emi",

    // account cancellation request from partner
    "/api/partner/account/cancellation",
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

app.use("/admin", loginRoutes);

//frontend
app.use("/frontend/all-properties", allPropertiesRoutes);
app.use("/frontend/properties", propertiesRoutes);
app.use("/frontend/joinourteam", joinourteamRoutes);
app.use("/frontend/propertyinfo", propertyinfoRoutes);
app.use("/frontend/enquiry", enquiryRoutes);
app.use("/frontend/blog", frontendBlogRoutes);
app.use("/frontend/slider", sliderImagesRoutes);
app.use("/frontend/testimonial", testimonialFeedbackRoutes);
app.use("/frontend/emi", frontendEmiRoutes);

// Account Cancellation Request
app.use("/api/partner/account", accountCancellation);

app.use(verifyToken);
app.use("/admin/profile", profileRoutes);
app.use("/admin/dashboard", dashboardRoutes);
app.use("/admin/employees", employeeRoutes);
app.use("/admin/properties", propertyRoutes);
app.use("/admin/builders", builderRoutes);
app.use("/admin/customers", customerRoutes);
app.use("/admin/roles", roleRoutes);
app.use("/admin/departments", departmentRoutes);
app.use("/admin/authorities", authoritiesRoutes);
app.use("/admin/states", stateRoutes);
app.use("/admin/cities", cityRoutes);
app.use("/admin/map", mapRoutes);
app.use("/admin/promoter", promoterRoutes);
app.use("/admin/salespersons", salespersonRoutes);
app.use("/admin/partner", partnerRoutes);
app.use("/admin/projectpartner", projectPartnerRoutes);
app.use("/admin/territorypartner", territoryPartnerRoutes);
app.use("/admin/guestuser", guestUserRoutes);
app.use("/admin/propertytypes", propertytypeRoutes);
app.use("/admin/enquirers", enquirerRoutes);
// CSV File add Enquiries Route
app.use("/admin/enquiries", verifyToken, addEnquiryRoutes);
app.use("/admin/auctionmembers", auctionmembersRoutes);
app.use("/admin/tickets", ticketRoutes);
app.use("/admin/apk", apkUploadRoutes);
app.use("/admin/blog", blogRoutes);
app.use("/admin/trend", trendRoutes);
app.use("/admin/slider", sliderRoutes);
app.use("/admin/testimonial", testimonialRoutes);
app.use("/admin/calender", calenderRoutes);
app.use("/admin/emi", emiRoutes);
app.use("/admin/marketing-content", marketingContentRoutes);
app.use("/admin/brand-accessories", brandAccessoriesRoutes);

//  Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
