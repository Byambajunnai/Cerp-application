// src/services/push.ts
// Утасны push мэдэгдэл: token авах → серверт бүртгэх, мэдэгдэл дээр дарахыг барих.
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const BASE_URL = 'http://192.168.119.21:8981/CERP/rest';

// Апп НЭЭЛТТЭЙ байх үед ирсэн мэдэгдлийг ч дэлгэцийн дээд хэсэгт харуулна
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Нэвтэрсний дараа НЭГ удаа дуудна.
 * Зөвшөөрөл асууж, Expo push token авч, серверт бүртгэнэ.
 */
export async function registerForPush(authToken: string): Promise<string | null> {
  try {
    // iOS simulator push хүлээж авахгүй. Android emulator (Google Play-тэй) хүлээж авна.
    if (!Device.isDevice && Platform.OS === 'ios') {
      console.warn('🔔 iOS simulator дээр push ажиллахгүй');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Мэдэгдэл',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let granted = existing.granted;
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }
    if (!granted) {
      console.warn('🔔 Мэдэгдлийн зөвшөөрөл өгөөгүй');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn('🔔 EAS projectId олдсонгүй (app.json → extra.eas.projectId)');
      return null;
    }

    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('🔔 Push token:', pushToken);

    const res = await fetch(`${BASE_URL}/mobile/push/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: pushToken, deviceType: Platform.OS }),
    });
    console.log('🔔 Token бүртгэл:', res.status);

    return pushToken;
  } catch (e) {
    console.warn('🔔 Push бүртгэхэд алдаа:', e);
    return null;
  }
}

/** Гарах (logout) үед дуудна — энэ утас руу мэдэгдэл ирэхээ болино. */
export async function unregisterPush(authToken: string, pushToken: string) {
  try {
    await fetch(`${BASE_URL}/mobile/push/unregister`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: pushToken }),
    });
  } catch {}
}

/**
 * Гарах (logout) үед дуудна: энэ утасны token-ийг серверээс устгана.
 * Token-ийг дахин авч илгээдэг тул хаана ч хадгалах шаардлагагүй.
 * 3 секундээс удаан бол хүлээхгүй (гарах үйлдлийг саатуулахгүй).
 */
export async function unregisterCurrentDevice(authToken?: string | null) {
  if (!authToken) return;
  const work = (async () => {
    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) return;
      const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
      await unregisterPush(authToken, pushToken);
      console.log('🔔 Token устгагдлаа');
    } catch (e) {
      console.warn('🔔 Token устгахад алдаа:', e);
    }
  })();
  await Promise.race([work, new Promise((r) => setTimeout(r, 3000))]);
}

/** Туршилт: өөрийн утас руу мэдэгдэл илгээлгэнэ. */
export async function sendTestPush(authToken: string) {
  const res = await fetch(`${BASE_URL}/mobile/push/test`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { status: res.status, body: text.slice(0, 200) };
  }
}

/**
 * Мэдэгдэл дээр дарахад ажиллана (апп нээлттэй, ар талд, ХААЛТТАЙ байсан ч).
 * data нь серверээс илгээсэн { workId, notiType } гэх мэт.
 */
export function useNotificationTap(onTap: (data: Record<string, any>) => void) {
  useEffect(() => {
    // Апп хаалттай байхад мэдэгдэл дээр дарж нээсэн бол
    Notifications.getLastNotificationResponseAsync().then((r) => {
      if (r) onTap(r.notification.request.content.data ?? {});
    });

    const sub = Notifications.addNotificationResponseReceivedListener((r) => {
      onTap(r.notification.request.content.data ?? {});
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Апп НЭЭЛТТЭЙ байх үед push ирэхэд ажиллана (жишээ нь хонхны тоог шинэчлэх).
 */
export function useNotificationReceived(onReceive: (data: Record<string, any>) => void) {
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((n) => {
      onReceive(n.request.content.data ?? {});
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}