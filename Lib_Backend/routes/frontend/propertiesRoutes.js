import express from "express";
import {
  getAll,
  getAllBySlug,
  getAllCity,
  getAllLocation,
  getLocationsByCityAndCategory,
  fetchAdditionalInfo,
  fetchFlatById,
  fetchPlotById,
  getAdditionalInfo,
} from "../../controllers/frontend/propertiesController.js";

const router = express.Router();

router.get("/", getAll);
router.get("/get-all-by-slug", getAllBySlug);
router.get("/cities", getAllCity);
router.get("/location/all", getAllLocation);
router.get("/location", getLocationsByCityAndCategory);
router.get("/additionalinfo/get/:id", fetchAdditionalInfo);
router.get("/additionalinfo/flat/get/:id", fetchFlatById);
router.get("/additionalinfo/plot/get/:id", fetchPlotById);
router.get("/additionalinfo/data/get/:propertyId", getAdditionalInfo);
export default router;
