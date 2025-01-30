import { asyncHandler } from "../utils/asyncHandler.js";
import { Leave } from "../models/leave.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendLeaveRequestEmail } from "../utils/SendEmail.js";

//Request leave
const requestLeave = asyncHandler(async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const employee = req.user._id;

    const noDays = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );

    const leave = await Leave.create({
      employee,
      leaveType,
      startDate,
      noDays,
      endDate,
      reason,
    });

    if (!leave) {
      throw new ApiError(400, "Leave request failed");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Leave requested successfully"));
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

//Get logged-in user's leave history
const getLeaves = asyncHandler(async (req, res) => {
  try {
    const leaves = await Leave.find({});

    if (!leaves) {
      throw new ApiError(404, "No leaves found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, leaves, "Leaves fetched successfully"));
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

//Get a single leave
const getEmployeeLeaves = asyncHandler(async (req, res) => {
  try {
    const employee = req.user._id;

    //find all leaves for the given employee
    const leaves = await Leave.find({ employee });

    if (!leaves) {
      throw new ApiError(404, "Leave not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, leaves, "Leave details fetched successfully"));
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

// const approveLeave = asyncHandler(async (req, res) => {
//   const { leaveId } = req.params;
//   const leave = await Leave.findByIdAndUpdate(
//     leaveId,
//     { status: "approved" },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   if (!leave) {
//     throw new ApiError(404, "Leave not found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, leave, "Leave approved successfully"));
// });

// const rejectLeave = asyncHandler(async (req, res) => {
//   const { leaveId } = req.params;
//   const leave = await Leave.findByIdAndUpdate(
//     leaveId,
//     { status: "rejected" },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   if (!leave) {
//     throw new ApiError(404, "Leave not found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, leave, "Leave rejected successfully"));
// });

// const reviewLeave = asyncHandler(async (req, res) => {
//   try {
//     const { leaveId } = req.params;
//     const { status, comment } = req.body;

//     const leave = await Leave.findByIdAndUpdate(
//       leaveId,
//       { status, comment, reviewedBy: req.user._id },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!leave) {
//       throw new ApiError(404, "Leave not found");
//     }

//     if (status === "approved") {
//       const employee = await Employee.findByIdAndUpdate(
//         leave.employee,
//         { $inc: { leaveBalance: -leave.noDays } },
//         {
//           new: true,
//           runValidators: false,
//         }
//       );
//     }

//     return res
//       .status(200)
//       .json(new ApiResponse(200, leave, "Leave reviewed successfully"));
//   } catch (error) {
//     if (error instanceof ApiError) {
//       return res
//         .status(error.statusCode)
//         .json(new ApiResponse(error.statusCode, {}, error.message));
//     }
//     return res
//       .status(500)
//       .json(new ApiResponse(500, {}, "Internal server error"));
//   }
// });

const reviewLeave = asyncHandler(async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, comment } = req.body;

    // Get the leave first to check previous status
    const previousLeave = await Leave.findById(leaveId);
    if (!previousLeave) {
      throw new ApiError(404, "Leave not found");
    }

    // Update the leave
    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, comment, reviewedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!leave) {
      throw new ApiError(404, "Leave not found");
    }

    // If status changed to approved

    if (status === "approved" && previousLeave.status !== "approved") {
      // Update employee's leave balance
      const employee = await Employee.findByIdAndUpdate(
        leave.employee,
        { $inc: { leaveBalance: -leave.noDays } },
        { new: true }
      );

      if (!employee) {
        throw new ApiError(404, "Employee not found");
      }
    } 

    // Send email notification
    const employee = await Employee.findById(leave.employee);
    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }
    await sendLeaveRequestEmail(employee.email, "Leave Request", status);

    // // If status changed from approved to something else
    // if (previousLeave.status === 'approved' && status !== 'approved') {
    //   // Restore leave balance
    //   await Employee.findByIdAndUpdate(
    //     leave.employee,
    //     { $inc: { leaveBalance: previousLeave.noDays } },
    //     { new: true }
    //   );
    // }

    return res
      .status(200)
      .json(new ApiResponse(200, leave, "Leave reviewed successfully"));
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

export { requestLeave, getLeaves, getEmployeeLeaves, reviewLeave };
