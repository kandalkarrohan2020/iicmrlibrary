import express from "express";
import {
  getCount,
} from "../../controllers/frontend/dashboardController.js";

const router = express.Router();

//router.get("/", getData);
router.get("/count", getCount);

export default router;
