import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/* ============================================================
   ТӨРӨЛ
============================================================ */

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO
  read: boolean;
};

const STORAGE_KEY = 'cerp_notifications_v1';

/* ============================================================
   АПП НЭЭЛТТЭЙ ҮЕД Ч МЭДЭГДЭЛ ДЭЭРЭЭС ГАРЧ ИРНЭ
============================================================ */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady = false;

async function ensureChannel() {
  if (Platform.OS !== 'android' || channelReady) return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Мэдэгдэл',
    importance: Notifications.AndroidImportance.MAX,
  });
  channelReady = true;
}

export async function ensurePermission(): Promise<boolean> {
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.status === 'granted';
}

/* ============================================================
   ХАДГАЛАХ / УНШИХ
============================================================ */

export async function getNotifications(): Promise<AppNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

async function saveNotifications(list: AppNotification[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function getNotification(id: string) {
  const list = await getNotifications();
  return list.find((n) => n.id === id) ?? null;
}

export async function getUnreadCount() {
  const list = await getNotifications();
  return list.filter((n) => !n.read).length;
}

export async function markAsRead(id: string) {
  const list = await getNotifications();
  let changed = false;
  const next = list.map((n) => {
    if (n.id === id && !n.read) {
      changed = true;
      return { ...n, read: true };
    }
    return n;
  });
  if (changed) await saveNotifications(next);
}

export async function deleteNotification(id: string) {
  const list = await getNotifications();
  await saveNotifications(list.filter((n) => n.id !== id));
}

/* ============================================================
   ҮҮСГЭЭД УТАС РУУ ИЛГЭЭХ
============================================================ */

export async function createAndSend(title: string, body: string) {
  const item: AppNotification = {
    id: Date.now().toString(),
    title: title.trim(),
    body: body.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  const list = await getNotifications();
  await saveNotifications([item, ...list]);

  if (await ensurePermission()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.body,
        sound: 'default',
        data: { notificationId: item.id },
      },
      trigger: null, // шууд
    });
  }

  return item;
}

/* ============================================================
   ОГНОО ФОРМАТ  → 2026.10.06 14:35
============================================================ */

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}