import { Router } from "express";
import {
  requestLeave,
  getLeaves,
  reviewLeave,
  getEmployeeLeaves
} from "../controllers/leave.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/").get(verifyJWT, getLeaves);
router.route("/employee").get(verifyJWT, getEmployeeLeaves);
router.route("/request").post(verifyJWT, requestLeave);

// router.route("/:leaveId").get(verifyJWT, getLeave);
router.route("/:leaveId/review").put(verifyJWT, verifyAdmin, reviewLeave);


export default router;
