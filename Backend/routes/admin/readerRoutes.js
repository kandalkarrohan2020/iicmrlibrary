import express from "express";
import multer from "multer";
import path from "path";
import {
  getAll,
  getAllActive,
  add,
  edit,
  getById,
  status,
  del,
  assignLogin,
  payFinePayment,
  addFollowUp,
  fetchFollowUpList,
  getMenus,
  assignTask,
} from "../../controllers/admin/readerController.js";

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
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size (5MB)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and JPG images are allowed"));
    }
    cb(null, true);
  },
});

router.get("/active", getAllActive);
router.get("/get/menus", getMenus);
router.get("/get/:id", getById);
router.get("/:role", getAll);

router.post(
  "/add",
  upload.fields([
    { name: "adharImage", maxCount: 2 },
    { name: "panImage", maxCount: 2 },
  ]),
  add
);
router.put(
    "/edit/:id",
    upload.fields([
      { name: "adharImage", maxCount: 2 },
      { name: "panImage", maxCount: 2 },
    ]),
    edit
  );
router.put("/status/:id", status);
router.put("/update/paymentid/:id", payFinePayment);
router.get("/followup/list/:id", fetchFollowUpList);
router.post("/followup/add/:id", addFollowUp);
router.put("/assign/tasks/:id", assignTask);
router.put("/assignlogin/:id", assignLogin);
router.delete("/delete/:id", del);

export default router;
