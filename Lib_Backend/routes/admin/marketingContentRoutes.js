import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getAll,
  getById,
  add,
  update,
  del,
} from "../../controllers/admin/marketingContentController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/marketing-content");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images or videos are allowed (jpeg, png, mp4, etc)."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});


// Routes
router.get("/", getAll);
router.get("/:id", getById);
router.post("/add", upload.single("contentFile"), add);
router.put("/edit/:id", upload.single("contentFile"), update);
router.delete("/delete/:id", del);

export default router;