import express from "express";
import {
  getAll,
  edit,
  getById,
  status,
  del,
} from "../../controllers/admin/emiController.js";

const router = express.Router();

router.get("/get/:id", getById);
router.get("/:filterStatus", getAll);

router.put("/edit/:id", edit);
router.put("/status/:id", status);
router.delete("/delete/:id", del);

export default router;
