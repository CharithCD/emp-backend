import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  { timestamps: true }
);

export const Department = mongoose.model("Department", departmentSchema);
