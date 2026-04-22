import { NotificationLog } from "./notificationLog.model.js";
import { Office } from "../office/office.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";

export const getNotificationHistory = async (req, res, next) => {
    try {
        const { officeId } = req.params;
        if (!officeId) throw new ApiError(400, "Office ID is required");

        const history = await NotificationLog.find({ office_id: officeId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(new ApiResponse(200, "Notification history retrieved", history));
    } catch (error) {
        next(error);
    }
};

export const updateNotificationSettings = async (req, res, next) => {
    try {
        const { officeId } = req.params;
        const { notification_settings } = req.body;

        if (!officeId) throw new ApiError(400, "Office ID is required");
        if (!notification_settings) throw new ApiError(400, "Settings are required");

        const office = await Office.findByIdAndUpdate(
            officeId,
            { $set: { notification_settings } },
            { new: true }
        );

        if (!office) throw new ApiError(404, "Office not found");

        res.status(200).json(new ApiResponse(200, "Settings updated successfully", office.notification_settings));
    } catch (error) {
        next(error);
    }
};
