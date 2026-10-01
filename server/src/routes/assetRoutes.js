import { Router } from "express";
import {
  getAssets, getAsset, createAsset, updateAsset, deleteAsset,
} from "../controllers/assetController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect); // every asset route needs login

router.route("/").get(getAssets).post(createAsset);
router.route("/:id").get(getAsset).put(updateAsset).delete(authorize("admin"), deleteAsset);

export default router;