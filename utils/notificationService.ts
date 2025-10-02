
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { StorageService } from './storage';
import { WhatsAppHelper } from './whatsappHelper';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  private static checkInterval: NodeJS.Timeout | null = null;

  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      console.log('Notification permissions granted');
      return true;
    } catch (error) {
      console.log('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(text: string, timestamp: number): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'پیام آماده ارسال',
          body: text.length > 100 ? text.substring(0, 100) + '...' : text,
          data: { text, timestamp },
          sound: true,
        },
        trigger: {
          date: new Date(timestamp),
        },
      });

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.log('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.log('Error cancelling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.log('Error cancelling all notifications:', error);
    }
  }

  static async generateSchedules(): Promise<void> {
    try {
      const appState = await StorageService.getAppState();
      
      if (!appState.isAutoSendEnabled) {
        console.log('Auto send is disabled');
        return;
      }

      if (appState.availableTexts.length === 0) {
        console.log('No available texts for scheduling');
        return;
      }

      // Clear existing schedules
      await this.cancelAllNotifications();

      const now = new Date();
      const schedules: Array<{ id: string; timestamp: number; text: string }> = [];

      // Generate schedules for the next 7 days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + dayOffset);
        const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Convert to Persian calendar (Saturday = 0, Sunday = 1, etc.)
        const persianDayIndex = dayOfWeek === 6 ? 0 : dayOfWeek + 1;

        if (!appState.selectedDays[persianDayIndex]) {
          continue; // Skip this day
        }

        // Parse time window
        const [startHour, startMinute] = appState.timeWindow.start.split(':').map(Number);
        const [endHour, endMinute] = appState.timeWindow.end.split(':').map(Number);

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        // Generate random times for messages
        for (let i = 0; i < appState.messagesPerDay; i++) {
          if (appState.availableTexts.length <= schedules.length) {
            break; // No more texts available
          }

          // Generate random time within the window
          const randomMinutes = Math.floor(Math.random() * (endMinutes - startMinutes)) + startMinutes;
          const randomHour = Math.floor(randomMinutes / 60);
          const randomMinute = randomMinutes % 60;

          const scheduleTime = new Date(targetDate);
          scheduleTime.setHours(randomHour, randomMinute, 0, 0);

          // Skip if the time is in the past
          if (scheduleTime.getTime() <= now.getTime()) {
            continue;
          }

          // Select random text
          const randomTextIndex = Math.floor(Math.random() * appState.availableTexts.length);
          const selectedText = appState.availableTexts[randomTextIndex];

          const schedule = {
            id: `schedule_${scheduleTime.getTime()}`,
            timestamp: scheduleTime.getTime(),
            text: selectedText,
          };

          schedules.push(schedule);

          // Schedule notification
          await this.scheduleNotification(selectedText, scheduleTime.getTime());
        }
      }

      // Save schedules to storage
      const updatedState = {
        ...appState,
        schedules: schedules,
      };

      await StorageService.saveAppState(updatedState);
      console.log(`Generated ${schedules.length} schedules`);

    } catch (error) {
      console.log('Error generating schedules:', error);
    }
  }

  static startPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every minute for due notifications
    this.checkInterval = setInterval(async () => {
      await this.checkDueSchedules();
    }, 60000); // 60 seconds

    console.log('Periodic schedule check started');
  }

  static stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Periodic schedule check stopped');
    }
  }

  private static async checkDueSchedules(): Promise<void> {
    try {
      const dueSchedules = await StorageService.getDueSchedules();
      
      for (const schedule of dueSchedules) {
        console.log('Processing due schedule:', schedule.id);
        
        // Show notification with action button
        await Notifications.presentNotificationAsync({
          title: 'پیام آماده ارسال',
          body: schedule.text.length > 100 ? schedule.text.substring(0, 100) + '...' : schedule.text,
          data: { 
            text: schedule.text,
            scheduleId: schedule.id,
            action: 'send_whatsapp'
          },
        });

        // Remove the schedule
        await StorageService.removeSchedule(schedule.id);
      }
    } catch (error) {
      console.log('Error checking due schedules:', error);
    }
  }

  static setupNotificationHandlers(): void {
    // Handle notification tap
    Notifications.addNotificationResponseReceivedListener(async (response) => {
      const { text, scheduleId, action } = response.notification.request.content.data as any;
      
      if (action === 'send_whatsapp' && text) {
        console.log('Opening WhatsApp for scheduled message');
        
        // Open WhatsApp
        const success = await WhatsAppHelper.shareText(text);
        
        if (success) {
          // Mark text as used
          const appState = await StorageService.getAppState();
          const updatedAvailableTexts = appState.availableTexts.filter(t => t !== text);
          const updatedUsedTexts = [...appState.usedTexts, text];
          
          const updatedState = {
            ...appState,
            availableTexts: updatedAvailableTexts,
            usedTexts: updatedUsedTexts,
          };
          
          await StorageService.saveAppState(updatedState);
          console.log('Text marked as used after WhatsApp send');
        }
      }
    });

    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification);
    });
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.log('Error getting scheduled notifications:', error);
      return [];
    }
  }
}
