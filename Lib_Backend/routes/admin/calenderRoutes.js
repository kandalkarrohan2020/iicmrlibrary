import express from "express";
import { getAll, } from "../../controllers/admin/calenderController.js";

const router = express.Router();

router.get("/meetings", getAll);

export default router;
