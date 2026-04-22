import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
    {
        office_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Office",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ["LOW_BALANCE", "RIDE_UPDATE", "SYSTEM_ALERT"],
            required: true
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "LOW"
        },
        recipient: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["SENT", "FAILED"],
            default: "SENT"
        }
    },
    {
        timestamps: true
    }
);

export const NotificationLog = mongoose.model("NotificationLog", notificationLogSchema);
