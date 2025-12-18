import express from "express";
import { borrowItem, getAll, getById } from "../../controllers/frontend/itemsController.js";

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/borrow/:id", borrowItem);

export default  router;
