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
} from "../../controllers/admin/manageItemsController.js";

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
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit file size (1MB)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, JPG, and WEBP images are allowed"));
    }
    cb(null, true);
  },
});

// Routes
router.get("/", getAll);
router.get("/active", getAllActive);
router.get("/:id", getById);

router.post("/add", upload.single("image"), add);

router.put("/edit/:id", upload.single("image"), edit);

router.put("/status/:id", status);
router.delete("/delete/:id", del);

export default router;
