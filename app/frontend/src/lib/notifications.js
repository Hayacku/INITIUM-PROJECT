import { db } from './db';

export const createNotification = async (title, message, type = 'info') => {
    try {
        const notification = {
            title,
            message,
            type,
            read: false,
            createdAt: new Date()
        };
        await db.notifications.add(notification);
        // You could also dispatch a custom event here if needed for real-time updates without polling
        // window.dispatchEvent(new Event('notification-added'));
        return true;
    } catch (error) {
        console.error('Failed to create notification', error);
        return false;
    }
};
