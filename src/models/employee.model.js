import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    dateOfEmployment: { type: Date, required: true },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    salary: { type: Number, required: true },
    status: { type: String, required: true, default: "active" },
    photo: { type: String },
    leaveBalance: { type: Number, required: true, default: 20 },
  },
  { timestamps: true }
);


export const Employee = mongoose.model("Employee", employeeSchema);