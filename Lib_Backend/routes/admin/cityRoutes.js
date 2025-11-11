import express from "express";
import {getById} from "../../controllers/admin/cityController.js";

const router = express.Router();

router.get("/:id", getById);

export default  router;
