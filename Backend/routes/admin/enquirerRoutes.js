import express from "express";
import multer from "multer";
import path from "path";
import {
  getAll,
  getById,
  del,
  status,
  assignEnquiry,
  visitScheduled,
  cancelled,
  followUp,
  token,
  getRemarkList,
  getPropertyList,
  updateEnquirerProperty,
} from "../../controllers/admin/enquirerController.js";

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
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size (2MB)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and JPG images are allowed"));
    }
    cb(null, true);
  },
});

//router.get("/", getAll);
router.get("/get/:source", getAll);
router.get("/:id", getById);
router.get("/remark/list/:id", getRemarkList);
router.get("/property/list/:id", getPropertyList);
router.put("/status/:id", status);
router.put("/assign/:id", assignEnquiry);
router.post("/visitscheduled/:id", visitScheduled);
router.post("/followup/:id", followUp);
router.post("/cancelled/:id", cancelled);
router.post("/token/:id",upload.single("paymentimage"), token);
// router.post("/add", enquiryController.add);
// router.put("/edit/:id", enquiryController.update);
router.put("/property/update/:id", updateEnquirerProperty);
router.delete("/delete/:id", del);

export default router;
