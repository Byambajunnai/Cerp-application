import * as Location from 'expo-location';

const BASE_URL = 'http://192.168.119.21:8981/CERP/rest';

type PingResult = { hasZone: boolean; inside: boolean } | null;

// Координатыг серверт илгээх — foreground, background хоёуланд ашиглана
export async function postLocation(
  token: string,
  loc: Location.LocationObject,
): Promise<PingResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    console.log('📍 Илгээж байна:', loc.coords.latitude, loc.coords.longitude);
    const res = await fetch(`${BASE_URL}/mobile/location/ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        mocked: loc.mocked ?? false,
      }),
      signal: controller.signal,
    }); 

    if (!res.ok) {
      console.warn('📍 Алдаа:', res.status, await res.text());
      return null;
    }
    const json = await res.json();
    console.log('📍 Серверийн хариу:', JSON.stringify(json));
    return json;
  } catch (e) {
    console.warn('📍 Илгээхэд алдаа:', e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Зөвхөн апп нээлттэй (foreground) үед дуудна
export async function sendLocationPing(token: string): Promise<PingResult> {
  const { status } = await Location.getForegroundPermissionsAsync(); // request биш, get
  if (status !== 'granted') {
    console.warn('📍 Зөвшөөрөл алга:', status);
    return null;
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return postLocation(token, pos);
}

/* =====================================================
   АЖЛЫН БҮС ДОТОР ЭСЭХ
===================================================== */

export type ZoneStatus =
  | 'inside'        // ажлын бүсэд байна
  | 'outside'       // бүсээс гадна
  | 'noZone'        // ажилтанд бүс тохируулаагүй
  | 'noPermission'  // байршлын зөвшөөрөл өгөөгүй
  | 'gpsOff'        // утасны GPS унтраалттай
  | 'mocked'        // хуурамч байршил
  | 'error';        // сервер / сүлжээний алдаа

// Бүс дотор биш үед харуулах мессежүүд
export const ZONE_MESSAGES: Record<
  Exclude<ZoneStatus, 'inside'>,
  { title: string; message: string }
> = {
  outside: {
    title: 'Ажлын бүсэд байхгүй байна',
    message: 'Та ажлын байрныхаа бүсэд ирсний дараа цагаа бүртгүүлнэ үү.',
  },
  noZone: {
    title: 'Ажлын бүс тохируулаагүй',
    message: 'Танд ажлын байрны бүс тохируулагдаагүй байна. Хүний нөөцийн ажилтанд хандана уу.',
  },
  noPermission: {
    title: 'Байршлын зөвшөөрөл хэрэгтэй',
    message: 'Утасны тохиргооноос энэ аппад байршил ашиглахыг зөвшөөрнө үү.',
  },
  gpsOff: {
    title: 'Байршил унтраалттай',
    message: 'Утасны байршил (GPS)-ийг асаагаад дахин оролдоно уу.',
  },
  mocked: {
    title: 'Хуурамч байршил илэрлээ',
    message: 'Байршил өөрчилдөг аппыг унтрааж дахин оролдоно уу.',
  },
  error: {
    title: 'Байршил шалгаж чадсангүй',
    message: 'Интернэт холболтоо шалгаад дахин оролдоно уу.',
  },
};

// Одоогийн байршлыг серверт илгээж, ажлын бүс дотор эсэхийг буцаана.
// Бүсийн шалгалтыг сервер хийдэг (/mobile/location/ping → { hasZone, inside }).
export async function checkZone(token: string): Promise<ZoneStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return 'noPermission';

  if (!(await Location.hasServicesEnabledAsync())) return 'gpsOff';

  let pos: Location.LocationObject;
  try {
    pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch {
    return 'error';
  }

  if (pos.mocked) return 'mocked';

  const result = await postLocation(token, pos);
  if (!result) return 'error';
  if (!result.hasZone) return 'noZone';

  return result.inside ? 'inside' : 'outside';
}

/* =====================================================
   ЦАГ БҮРТГЭЛ (Ирлээ / Явлаа)
===================================================== */

export type AttendanceType = 'IN' | 'OUT';

export type AttendanceResult = {
  ok: boolean;
  message: string;
  time?: string; // серверийн бүртгэсэн цаг, жишээ нь "08:21:41"
};

// Утаснаас шалгах дээд алдаа (метр). Үүнээс муу бол дахин оролдуулна.
const MAX_ACCURACY_METERS = 100;

// "Ирлээ" / "Явлаа" товч дарахад дуудна.
// Жинхэнэ шалгалтыг (бүс дотор эсэх, цаг) СЕРВЕР хийнэ — энд зөвхөн
// хэрэглэгчид ойлгомжтой алдаа эрт харуулах зорилготой урьдчилсан шалгалт.
export async function checkAttendance(
  token: string,
  type: AttendanceType,
): Promise<AttendanceResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return {
      ok: false,
      message: 'Байршлын зөвшөөрөл өгөөгүй байна. Тохиргооноос зөвшөөрнө үү.',
    };
  }

  if (!(await Location.hasServicesEnabledAsync())) {
    return { ok: false, message: 'Утасны байршил (GPS)-ийг асаана уу.' };
  }

  let pos: Location.LocationObject;
  try {
    pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch {
    return { ok: false, message: 'Байршил тодорхойлж чадсангүй. Дахин оролдоно уу.' };
  }

  if (pos.mocked) {
    return {
      ok: false,
      message: 'Хуурамч байршлын апп илэрлээ. Түүнийг унтрааж дахин оролдоно уу.',
    };
  }

  const accuracy = pos.coords.accuracy ?? 0;
  if (accuracy > MAX_ACCURACY_METERS) {
    return {
      ok: false,
      message: `Байршлын нарийвчлал хангалтгүй байна (±${Math.round(accuracy)} м). Цонхны ойролцоо очоод дахин оролдоно уу.`,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${BASE_URL}/mobile/attendance/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy,
        mocked: pos.mocked ?? false,
      }),
      signal: controller.signal,
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (res.status === 401) {
      return { ok: false, message: 'Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.' };
    }

    if (!res.ok || !json?.success) {
      return {
        ok: false,
        message: json?.message || `Бүртгэл амжилтгүй боллоо (HTTP ${res.status}).`,
      };
    }

    return {
      ok: true,
      time: json.time,
      message: json.message || 'Амжилттай бүртгэгдлээ.',
    };
  } catch (e) {
    console.warn('🕘 Цаг бүртгэхэд алдаа:', e);
    return {
      ok: false,
      message: 'Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу.',
    };
  } finally {
    clearTimeout(timer);
  }
}