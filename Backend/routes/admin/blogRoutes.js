import express from "express";
import multer from "multer";
import path from "path";
import {
  getAll,
  getAllActive,
  getById,
  add,
  edit,
  status,
  del,
  seoDetails
} from "../../controllers/admin/blogController.js";

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and JPG images are allowed"));
    }
    cb(null, true);
  },
});

// Routes
router.get("/", getAll);
router.get("/active", getAllActive);
router.get("/:id", getById);

router.post(
  "/add",
  upload.fields([
    { name: "blogImage", maxCount: 1 },
  ]),
  add
);

router.put(
  "/edit/:id",
  upload.fields([
    { name: "blogImage", maxCount: 1 },
  ]),
  edit
);

router.put("/status/:id", status);
router.put("/seo/:id", seoDetails);
router.delete("/delete/:id", del);

export default router;