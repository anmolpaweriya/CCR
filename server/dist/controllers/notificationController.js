"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const Notification_js_1 = require("../models/Notification.js");
class NotificationController {
    static async getMyNotifications(req, res, next) {
        try {
            const user = req.user;
            const notifications = await Notification_js_1.Notification.find({ recipient: user._id })
                .sort({ createdAt: -1 })
                .limit(50);
            const unreadCount = await Notification_js_1.Notification.countDocuments({
                recipient: user._id,
                isRead: false,
            });
            res.json({ success: true, notifications, unreadCount });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            const user = req.user;
            await Notification_js_1.Notification.findOneAndUpdate({ _id: req.params.id, recipient: user._id }, { isRead: true });
            res.json({ success: true, message: 'Notification marked as read' });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            const user = req.user;
            await Notification_js_1.Notification.updateMany({ recipient: user._id, isRead: false }, { isRead: true });
            res.json({ success: true, message: 'All notifications marked as read' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
