import { Router } from "express";
import {
  requestLeave,
  getLeaves,
  getLeave,
  reviewLeave,
} from "../controllers/leave.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/request").post(verifyJWT, requestLeave);
router.route("/").get(verifyJWT, getLeaves);
router.route("/:leaveId").get(verifyJWT, getLeave);
router.route("/:leaveId/review").patch(verifyJWT, verifyAdmin, reviewLeave);


export default router;
