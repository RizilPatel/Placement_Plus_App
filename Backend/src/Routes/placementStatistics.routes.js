import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../Middlewares/auth.middleware.js"
import { getBranchPlacementStatistics, getPlacementStatistics } from "../Controllers/placementStatistics.controller.js";

const router = Router()

router.route("/get-placement-statistics").get(verifyJWT, getPlacementStatistics)
router.route("/get-branch-placement-statistics/c/:branch").get(verifyAdmin, getBranchPlacementStatistics)
router.route("/get-placement-statistics").get(verifyAdmin, getBranchPlacementStatistics)

export default router