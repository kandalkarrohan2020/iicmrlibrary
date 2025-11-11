import express from "express";
import {getAll, getAllByCity} from "../../controllers/frontend/allPropertiesController.js";

const router = express.Router();

router.get("/", getAll);
router.get("/:city", getAllByCity);

export default  router;