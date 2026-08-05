import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

// Notification interface
interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  iconName: string;
  priority: string;
  actionText: string;
  isRead: boolean;
  timestamp: Date;
  actionRoute?: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: false,
})
export class NotificationsPage implements OnInit {

  unreadCount: number = 2;

  notifications: Notification[] = [
    {
      id: 1,
      title: 'Payment Reminder',
      message: 'Slab 4 payment of ₹2,50,000 is due on February 15, 2024',
      type: 'payment',
      iconName: 'calendar',
      priority: 'High',
      actionText: 'Mark Payment',
      isRead: false,
      timestamp: new Date('2024-02-10T10:30:00')
    },
    {
      id: 2,
      title: 'Receipt Verified',
      message: 'Your payment receipt for Slab 3 has been verified and processed',
      type: 'receipt',
      iconName: 'checkmark-circle',
      priority: 'High',
      actionText: 'View Receipt',
      isRead: false,
      timestamp: new Date('2024-02-09T14:20:00')
    },
    {
      id: 3,
      title: 'Support Ticket Update',
      message: 'Slab 4 payment of ₹2,50,000 is due on February 15, 2024',
      type: 'support',
      iconName: 'information-circle',
      priority: 'Medium',
      actionText: 'View Ticket',
      isRead: true,
      timestamp: new Date('2024-02-08T09:15:00')
    }
  ];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  ionViewWillEnter() {
    // Refresh notifications when view enters
    this.loadNotifications();
  }

  /**
   * Load notifications data
   */
  private loadNotifications() {
    // TODO: Implement API call to fetch notifications
    console.log('Loading notifications...');

    // Calculate unread count
    this.calculateUnreadCount();
  }

  /**
   * Calculate unread notifications count
   */
  private calculateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    if (this.unreadCount === 0) {
      await this.showToast('No unread notifications', 'primary');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Mark All as Read',
      message: 'Are you sure you want to mark all notifications as read?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Mark Read',
          handler: () => {
            this.notifications.forEach(notification => {
              notification.isRead = true;
            });
            this.calculateUnreadCount();
            this.showToast('All notifications marked as read', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Dismiss a notification
   */
  async dismissNotification(notification: Notification) {
    const alert = await this.alertController.create({
      header: 'Dismiss Notification',
      message: 'Are you sure you want to dismiss this notification?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Dismiss',
          handler: () => {
            // Remove notification from array
            const index = this.notifications.findIndex(n => n.id === notification.id);
            if (index > -1) {
              this.notifications.splice(index, 1);
              this.calculateUnreadCount();
              this.showToast('Notification dismissed', 'success');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Handle notification action button click
   */
  async handleNotificationAction(notification: Notification) {
    console.log('Notification action clicked:', notification);

    // Mark notification as read
    notification.isRead = true;
    this.calculateUnreadCount();

    // Handle different notification types
    switch (notification.type) {
      case 'payment':
        await this.showToast('Opening payment page...', 'primary');
        // Navigate to payment page
        // this.router.navigate(['/payment-slabs']);
        break;

      case 'receipt':
        await this.showToast('Opening receipt...', 'primary');
        // Navigate to receipt viewer
        // this.router.navigate(['/payment-receipts']);
        break;

      case 'support':
        await this.showToast('Opening support ticket...', 'primary');
        // Navigate to support page
        // this.router.navigate(['/support']);
        break;

      case 'document':
        await this.showToast('Opening document...', 'primary');
        // Navigate to document page
        // this.router.navigate(['/documents']);
        break;

      default:
        await this.showToast('Action completed', 'success');
    }
  }

  /**
   * Toggle notification read status
   */
  toggleReadStatus(notification: Notification) {
    notification.isRead = !notification.isRead;
    this.calculateUnreadCount();
  }

  /**
   * Get notification time ago
   */
  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
  
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    const alert = await this.alertController.create({
      header: 'Clear All Notifications',
      message: 'Are you sure you want to clear all notifications? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear All',
          handler: () => {
            this.notifications = [];
            this.calculateUnreadCount();
            this.showToast('All notifications cleared', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: string = 'dark') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

}
