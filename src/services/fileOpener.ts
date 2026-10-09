import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  hwp: 'application/x-hwp',
  txt: 'text/plain',
  zip: 'application/zip',
};

/** "ftp://nas/.../Тушаал.pdf" → "Тушаал.pdf" */
export function baseName(pathOrUrl?: string | null) {
  if (!pathOrUrl) return '';
  const clean = pathOrUrl.split('?')[0];
  const parts = clean.split(/[\\/]/);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export function extOf(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

export function mimeOf(name: string) {
  return MIME[extOf(name)] ?? '*/*';
}

export async function downloadAndOpen(
  url: string,
  token: string,
  fileName: string,
): Promise<void> {
  const safeName = (fileName || `file_${Date.now()}`).replace(/[\\/:*?"<>|]/g, '_');
  const target = `${FileSystem.cacheDirectory}${safeName}`;

  const res = await FileSystem.downloadAsync(url, target, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status !== 200) {
    await FileSystem.deleteAsync(res.uri, { idempotent: true });
    const err = new Error(`HTTP ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }

  const headerType =
    res.headers?.['Content-Type'] || res.headers?.['content-type'] || '';
  const mimeType =
    headerType && !headerType.startsWith('application/octet-stream')
      ? headerType.split(';')[0]
      : mimeOf(safeName);

  if (Platform.OS === 'android') {
    try {
      const contentUri = await FileSystem.getContentUriAsync(res.uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: mimeType,
      });
      return;
    } catch (e) {
      console.warn('Шууд нээж чадсангүй, хуваалцах цэс рүү шилжлээ:', e);
    }
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(res.uri, { mimeType, dialogTitle: safeName });
  } else {
    throw new Error('Энэ төрлийн файлыг нээх програм олдсонгүй.');
  }
}