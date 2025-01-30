import { asyncHandler } from "../utils/asyncHandler.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({});

  if (!employees) {
    throw new ApiError(404, "No employees found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, employees, "Employees fetched successfully"));
});

const getEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, employee, "Employee details fetched successfully")
    );
});

const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, phone, department, position, dateOfEmployment, salary } =
    req.body;

  const employee = await Employee.create({
    name,
    email,
    phone,
    department,
    position,
    dateOfEmployment,
    salary,
  });

  if (!employee) {
    throw new ApiError(400, "Employee creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, employee, "Employee created successfully"));
});

const updateEmployee = asyncHandler(async (req, res) => {});

const deleteEmployee = asyncHandler(async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ message: "Employee removed" });
});

export {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
