import express from "express";
import multer from "multer";
import path from "path";
import {
  getAll,
  getById,
  add,
  update,
  status,
  del,
} from "../../controllers/admin/testimonialController.js";

const router = express.Router();

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
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, SVG, and JPG images are allowed"));
    }
    cb(null, true);
  },
});

router.get("/", getAll);
router.get("/:id", getById);
router.post("/add", upload.single("image"), add);
router.put("/edit/:id",  upload.single("image"), update);
router.put("/status/:id", status);
router.delete("/delete/:id", del);

export default router;
