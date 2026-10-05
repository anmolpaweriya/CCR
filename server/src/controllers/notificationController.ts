import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

export class NotificationController {
  static async getMyNotifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const notifications = await Notification.find({ recipient: user._id })
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        recipient: user._id,
        isRead: false,
      });

      res.json({ success: true, notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: user._id },
        { isRead: true }
      );

      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      await Notification.updateMany(
        { recipient: user._id, isRead: false },
        { isRead: true }
      );

      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}
