import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// import routes
import userRoutes from "./routes/user.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import employeeRoutes from "./routes/employee.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/leaves", leaveRoutes);
app.use("/api/v1/employees", employeeRoutes);




export { app };
