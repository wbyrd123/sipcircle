import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export const initPushNotifications = async (token) => {
  // Only initialize on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications only available on native platforms');
    return;
  }

  try {
    // Request permission
    const permStatus = await PushNotifications.requestPermissions();
    
    if (permStatus.receive === 'granted') {
      // Register for push notifications
      await PushNotifications.register();
    } else {
      console.log('Push notification permission denied');
      return;
    }

    // Handle registration success
    PushNotifications.addListener('registration', async (deviceToken) => {
      console.log('Push registration success, token: ' + deviceToken.value);
      
      // Send token to backend
      try {
        const platform = Capacitor.getPlatform(); // 'ios' or 'android'
        await axios.post(`${API}/device-token`, {
          token: deviceToken.value,
          platform: platform
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Device token registered with backend');
      } catch (e) {
        console.error('Failed to register device token:', e);
      }
    });

    // Handle registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error: ', error);
    });

    // Handle incoming notifications when app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      // You can show a toast or in-app notification here
    });

    // Handle notification tap (when user taps notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed: ', notification);
      
      // Handle navigation based on notification type
      const data = notification.notification.data;
      if (data?.type === 'invite') {
        // Navigate to invites page
        window.location.href = '/invites';
      } else if (data?.type === 'vendor_notification') {
        // Navigate to venue profile if location_id exists
        if (data.location_id) {
          window.location.href = `/venue/${data.location_id}`;
        }
      }
    });

  } catch (e) {
    console.error('Push notification initialization error:', e);
  }
};

export const unregisterPushNotifications = async (deviceToken, token) => {
  if (!Capacitor.isNativePlatform() || !deviceToken) {
    return;
  }

  try {
    await axios.delete(`${API}/device-token`, {
      data: { token: deviceToken, platform: Capacitor.getPlatform() },
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Device token unregistered');
  } catch (e) {
    console.error('Failed to unregister device token:', e);
  }
};
