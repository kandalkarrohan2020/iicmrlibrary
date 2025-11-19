import express from "express";
import {getAll, getById, add, status, del, getMenus, assignTask} from "../../controllers/admin/roleController.js";

const router = express.Router();

router.get("/", getAll);
router.get("/get/menus", getMenus);
router.get("/:id", getById);
router.post("/add", add);
router.put("/edit/:id", add);
router.put("/status/:id", status);
router.put("/assign/tasks/:id", assignTask);
router.delete("/delete/:id", del);

export default  router;
