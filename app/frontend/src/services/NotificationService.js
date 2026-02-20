import { db } from '../lib/db';
import { toast } from 'sonner';

class NotificationService {
    constructor() {
        this.intervalId = null;
        this.permissionGranted = false;
    }

    async init() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            return;
        }

        if (Notification.permission === 'granted') {
            this.permissionGranted = true;
            this.startScheduler();
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.permissionGranted = true;
                this.startScheduler();
                new Notification('INITIUM', { body: 'Notifications activées !' });
            }
        }
    }

    startScheduler() {
        if (this.intervalId) return;

        console.log('Notification Scheduler Started');
        // Check every minute
        this.intervalId = setInterval(() => this.checkMockNotifications(), 60000);
        this.checkMockNotifications(); // Run immediately on start
    }

    async checkMockNotifications() {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const todayStr = now.toDateString();

            // 1. Check Habits Reminders
            const habits = await db.habits.filter(h => !!h.reminderTime && !h.completedDates?.includes(todayStr)).toArray();

            habits.forEach(habit => {
                const [hHour, hMinute] = habit.reminderTime.split(':').map(Number);

                // Matches current time (within the minute)
                if (hHour === currentHour && hMinute === currentMinute) {
                    this.sendNotification(`Rappel: ${habit.title}`, {
                        body: `C'est l'heure de votre habitude "${habit.title}" !`,
                        icon: '/logo192.png'
                    });
                }
            });

            // 2. Check Quest Deadlines (Run only once per day, e.g., at 9:00 AM)
            if (currentHour === 9 && currentMinute === 0) {
                const quests = await db.quests.filter(q => q.status === 'in_progress' && !!q.dueDate).toArray();

                quests.forEach(quest => {
                    const dueDate = new Date(quest.dueDate);
                    const diffTime = dueDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 0) {
                        this.sendNotification(`Deadline Aujourd'hui !`, {
                            body: `La quête "${quest.title}" doit être terminée aujourd'hui.`,
                            tag: `deadline-${quest.id}`
                        });
                    } else if (diffDays === 1) {
                        this.sendNotification(`J-1 : ${quest.title}`, {
                            body: `La quête "${quest.title}" est pour demain !`,
                            tag: `deadline-${quest.id}`
                        });
                    } else if (diffDays === 3) {
                        this.sendNotification(`J-3 : ${quest.title}`, {
                            body: `N'oubliez pas votre quête "${quest.title}".`,
                            tag: `deadline-${quest.id}`
                        });
                    }
                });
            }

        } catch (error) {
            console.error('Error checking notifications:', error);
        }
    }

    sendNotification(title, options) {
        if (this.permissionGranted) {
            new Notification(title, options);
        } else {
            // Fallback to in-app toast
            toast(title, {
                description: options.body
            });
        }
    }
}

export const notificationService = new NotificationService();
