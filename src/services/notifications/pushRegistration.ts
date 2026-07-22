import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { env } from '../../config/env';
import { ensureAnonymousSession } from '../firebase/authService';
import { getFirebaseServices } from '../firebase/client';
import { AppServiceError, toAppServiceError } from '../firebase/errors';

export const configureForegroundNotifications = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

/**
 * Registers an Expo push token. Android delivery is backed by Firebase Cloud
 * Messaging; iOS delivery uses APNs through the same server-side send path.
 */
export const registerPushToken = async (): Promise<string> => {
  if (!Device.isDevice) {
    throw new AppServiceError(
      'Push notifications require a physical device.',
      'notifications/physical-device-required',
    );
  }
  if (!env.easProjectId) {
    throw new AppServiceError(
      'Add EXPO_PUBLIC_EAS_PROJECT_ID before registering push notifications.',
      'notifications/project-not-configured',
    );
  }

  const services = getFirebaseServices();
  if (!services) {
    throw new AppServiceError('Firebase is not configured.', 'firebase/not-configured');
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('budget-reminders', {
        name: 'Budget reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 150, 250],
        lightColor: '#966A00',
      });
    }

    const currentPermissions = await Notifications.getPermissionsAsync();
    const finalPermissions =
      currentPermissions.status === 'granted'
        ? currentPermissions
        : await Notifications.requestPermissionsAsync();

    if (finalPermissions.status !== 'granted') {
      throw new AppServiceError(
        'Notification permission was not granted.',
        'notifications/permission-denied',
      );
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId: env.easProjectId })).data;
    const user = services.auth.currentUser ?? (await ensureAnonymousSession());
    const tokenId = encodeURIComponent(token);

    await setDoc(
      doc(services.db, 'users', user.uid, 'notificationTokens', tokenId),
      {
        token,
        provider: 'expo',
        platform: Platform.OS,
        deviceName: Device.deviceName ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return token;
  } catch (error) {
    throw toAppServiceError(error);
  }
};
