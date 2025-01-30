import { asyncHandler } from "../utils/asyncHandler.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getEmployees = asyncHandler(async (req, res) => {
  try {
    const employees = await Employee.find({});

    console.log(employees);
    
    if (!employees) {
      throw new ApiError(404, "No employees found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, employees, "Employees fetched successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, {}, error.message));
    }
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal server error"));
  }
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

const updateEmployee = asyncHandler(async (req, res) => {
  const { name, email, phone, department, position, dateOfEmployment, salary } =
    req.body;

  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    {
      name,
      email,
      phone,
      department,
      position,
      dateOfEmployment,
      salary,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, employee, "Employee updated successfully"));
});

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
