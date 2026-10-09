import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import { postLocation } from './location';

const LOCATION_TASK_NAME = 'background-location-task';
const TOKEN_KEY = 'bg_location_token';

// Санах ойд + SecureStore-д хоёуланд нь хадгална.
// Процесс дахин эхлэхэд санах ойнх алга болох тул SecureStore-оос уншина.
let currentToken: string | null = null;

export function setBackgroundLocationToken(token: string | null) {
  currentToken = token;
  if (token) {
    SecureStore.setItemAsync(TOKEN_KEY, token).catch(e =>
      console.warn('📍🔒 Token хадгалахад алдаа:', e),
    );
  } else {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  }
}

async function getToken(): Promise<string | null> {
  if (currentToken) return currentToken;
  currentToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return currentToken;
}

// Модулийн дээд түвшинд — апп эхлэх бүрт бүртгэгдэнэ
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.warn('📍🔒 Background location error:', error.message);
    return;
  }

  const locations = (data as { locations?: Location.LocationObject[] })?.locations;
  if (!locations?.length) return;

  // Хамгийн сүүлийн (шинэ) байршил
  const pos = locations[locations.length - 1];
  console.log('📍🔒 BG байршил:', pos.coords.latitude, pos.coords.longitude);

  const token = await getToken();
  if (!token) {
    console.warn('📍🔒 Background ping алгасав: token алга');
    return;
  }

  await postLocation(token, pos); // хариуг (inside true/false) логлоно
});

/* ============================================================
   АЮУЛГҮЙ ЗОГСООХ
   prebuild / дахин суулгасны дараа систем "ажиллаж байна" гэж
   хэлдэг ч TaskManager task-ийг танихгүй тохиолдол гардаг.
   Тэр үед stopLocationUpdatesAsync алдаа шиддэг тул:
   1) task бүртгэлтэй эсэхийг шалгана
   2) алдаа гарвал залгиж, үргэлжлүүлнэ
============================================================ */

async function safeStopLocationUpdates(): Promise<void> {
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

    if (registered && started) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  } catch (e) {
    console.warn('📍🔒 Хуучин task зогсооход алдаа (алгасав):', e);
  }
}

export async function startBackgroundLocationTracking(): Promise<boolean> {
  const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
  if (fgStatus !== 'granted') {
    console.warn('📍🔒 Foreground зөвшөөрөл өгөгдөөгүй');
    return false;
  }

  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== 'granted') {
    console.warn('📍🔒 Background зөвшөөрөл өгөгдөөгүй ("Allow all the time" сонгоно уу)');
    return false;
  }

  // Хуучин тохиргоотой task ажиллаж байвал зогсоогоод шинээр эхлүүлнэ
  await safeStopLocationUpdates();

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5 * 60 * 1000, // 5 минут тутам
    distanceInterval: 0,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true, // iOS: дээд талд цэнхэр заагч
    foregroundService: {
      notificationTitle: 'Байршил хянагдаж байна',
      notificationBody: 'Ажлын цагийн бүртгэлд ашиглагдана',
    },
  });

  // Эхлэх мөчид нэг удаа шууд илгээнэ (эхний interval-ийг хүлээхгүйн тулд)
  try {
    const token = await getToken();
    if (token) {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      await postLocation(token, pos);
    } else {
      console.warn('📍🔒 Эхний ping алгасав: token алга (setBackgroundLocationToken-ийг эхэлж дуудна уу)');
    }
  } catch (e) {
    console.warn('📍🔒 Эхний ping илгээхэд алдаа:', e);
  }

  console.log('📍🔒 Background location tracking асаагдлаа');
  return true;
}

export async function stopBackgroundLocationTracking(): Promise<void> {
  await safeStopLocationUpdates();
  console.log('📍🔒 Background location tracking зогслоо');
  setBackgroundLocationToken(null);
}