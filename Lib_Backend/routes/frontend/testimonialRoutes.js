import express from "express";
import { getAllActive } from "../../controllers/frontend/testimonialController.js";

const router = express.Router();

router.get("/", getAllActive);

export default router;
