import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAcessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Token generation failed");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession(); // Start a new session
  session.startTransaction(); // Begin the transaction

  try {
    const { fullname, email, password } = req.body;

    // // Validation (if needed)
    // if (!fullname || !email || !password) {
    //   throw new ApiError(400, "Please provide full name, email, and password");
    // }

    // Check if user already exists
    const userExists = await User.findOne({ email }).session(session);
    if (userExists) {
      throw new ApiError(400, "User with this email already exists");
    }

    // Create User document
    const user = await User.create([{ email, password }], { session });
    if (!user || user.length === 0) {
      throw new ApiError(500, "User registration failed");
    }

    // Create Employee document linked to the User
    const employee = await Employee.create(
      [{ name: fullname, email, user: user[0]._id }],
      {validateBeforeSave: false, session: session}
    );

    console.log(employee);

    if (!employee || employee.length === 0) {
      throw new ApiError(500, "Employee creation failed");
    }

    // Fetch the newly created user without sensitive fields
    const newUser = await User.findById(user[0]._id)
      .select("-password -refreshToken -employee")
      .session(session);
    if (!newUser) {
      throw new ApiError(500, "Failed to retrieve user after creation");
    }

    // Commit the transaction
    await session.commitTransaction(); 
    session.endSession();  // End the session after commit

    return res
      .status(201)
      .json(new ApiResponse(201, newUser, "User registered successfully"));
  } catch (error) {
    // If something goes wrong, abort the transaction
    await session.abortTransaction();
    session.endSession();  // End the session after aborting

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



// const registerUser = asyncHandler(async (req, res) => {
//   try {
//     const { fullname, email, password } = req.body;

//     //Do the validation here
//     //   if (!username || !email || !password) {
//     //     throw new ApiError(400, "Please provide name, email and password");
//     //   }

//     const userExists = await User.findOne({ email });

//     if (userExists) {
//       throw new ApiError(
//         400,
//         "User with this email or username already exists"
//       );
//     }

//     const user = await User.create({
//       email,
//       password,
//     });

//     if (!user) {
//       throw new ApiError(500, "User registration failed");
//     }

//     const employee = await Employee.create({
//       name: fullname,
//       email,
//       user: user._id, 
//     });

//     if (!employee) {
//       throw new ApiError(500, "User registration failed");
//     }

//     const newUser = await User.findById(user._id).select(
//       "-password -refreshToken -employee"
//     );

//     if (!newUser) {
//       throw new ApiError(500, "User registration failed");
//     }

//     return res
//       .status(201)
//       .json(
//         new ApiResponse(201, newUser, "User registered successfully", newUser)
//       );
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

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new ApiError(400, "Please provide an email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAcessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken -employee"
    );

    //Fix the options
    // const options = {
    //   httpOnly: true,
    //   secure: false, //process.env.NODE_ENV === "production", // Secure in production (HTTPS)
    //   sameSite: "none",
    // };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged in successfully"
        )
      );
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

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: "" },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    })
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    })
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new ApiError(401, "Please login to continue");
    }

    let payload = null;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new ApiError(401, "Invalid token");
    }

    const user = await User.findById(payload.id);

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    if (user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Invalid token");
    }

    const { accessToken, newRefreshToken } = await generateAcessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Token refreshed successfully"
        )
      );
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

const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken -employee"
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User details fetched successfully"));
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

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User removed" });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getCurrentUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
