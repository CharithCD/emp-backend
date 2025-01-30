import { Router } from "express";

import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller.js";

import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(verifyJWT, getEmployees)
  .post(verifyJWT, verifyAdmin, createEmployee);

router
  .route("/:id")
  .get(verifyJWT, getEmployee)
  .put(verifyJWT, updateEmployee)
  .delete(verifyJWT, verifyAdmin, deleteEmployee);

export default router;
