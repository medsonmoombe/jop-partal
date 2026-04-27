import express from "express";
import { saveJob, removeSavedJob, getSavedJobs, isJobSaved } from "../controllers/savedJob.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/save/:id").post(isAuthenticated, saveJob);
router.route("/remove/:id").delete(isAuthenticated, removeSavedJob);
router.route("/get").get(isAuthenticated, getSavedJobs);
router.route("/check/:id").get(isAuthenticated, isJobSaved);

export default router;
