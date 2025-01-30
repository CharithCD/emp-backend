import mongoose, { Schema } from "mongoose";

const leaveSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
    },
    leaveType: { 
        type: String, 
        required: true, 
        enum: ["annual", "sick", "unpaid", "maternity", "paternity"],
    },
    requestDate: { type: Date, default: Date.now },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    noDays: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ["pending", "approved", "rejected"],
        default: "pending",
     },
    reviewedBy: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        default: null,
    },  
    comment: { type: String },
}, { timestamps: true });

export const Leave = mongoose.model("Leave", leaveSchema);