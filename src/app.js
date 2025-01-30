import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//imoport routes
import userRoutes from "./routes/user.routes.js";
import leaveRoutes from "./routes/leave.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/leaves", leaveRoutes);




export { app };
