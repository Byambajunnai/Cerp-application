// src/services/serverNotifications.ts
// Вэбийн хонхны мэдэгдлүүд (TNOTIFICATION) — CERP серверээс.
const BASE_URL = 'http://192.168.119.21:8981/CERP/rest';

export type ServerNotification = {
  notiId: string;
  notiType: string;   // TRANSFER_CALL, NEW_CALL ...
  title: string;
  message: string;
  workId?: string | null;
  read: boolean;
  regDate: string;    // 'YYYY-MM-DD HH:mm'
};

export async function fetchServerNotifications(
  token: string
): Promise<{ items: ServerNotification[]; unread: number }> {
  try {
    const res = await fetch(`${BASE_URL}/mobile/notifications`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    const json = JSON.parse(text);
    if (!res.ok || !json.success) {
      console.warn('🔔 Мэдэгдэл авахад алдаа:', res.status, json?.message);
      return { items: [], unread: 0 };
    }
    return { items: json.items ?? [], unread: json.unread ?? 0 };
  } catch (e) {
    console.warn('🔔 Мэдэгдэл авахад алдаа:', e);
    return { items: [], unread: 0 };
  }
}

/** notiId өгвөл нэгийг, өгөхгүй бол бүгдийг уншсан болгоно. */
export async function markServerNotificationRead(token: string, notiId?: string) {
  try {
    await fetch(`${BASE_URL}/mobile/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(notiId ? { notiId } : { all: true }),
    });
  } catch {}
}