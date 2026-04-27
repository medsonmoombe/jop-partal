import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
    getAdminJobs, 
    getAllJobs, 
    getJobById, 
    postJob,
    updateJob,
    deleteJob,
    closeJob,
    getJobRecommendations,
    getJobAnalytics
} from "../controllers/job.controller.js";
import { validateJobPost } from "../middlewares/validation.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, validateJobPost, postJob);
router.route("/get").get(getAllJobs); // Public route with filters
router.route("/get/:id").get(getJobById); // Public route
router.route("/update/:id").put(isAuthenticated, updateJob);
router.route("/delete/:id").delete(isAuthenticated, deleteJob);
router.route("/close/:id").patch(isAuthenticated, closeJob);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/recommendations").get(isAuthenticated, getJobRecommendations);
router.route("/:id/analytics").get(isAuthenticated, getJobAnalytics);

export default router;

