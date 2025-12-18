import express from "express";

import {
  getAll,
  getById,
} from "../../controllers/frontend/issueController.js";

const router = express.Router();

router.get("/", getAll);
router.get("/get/:id", getById);

export default router;
