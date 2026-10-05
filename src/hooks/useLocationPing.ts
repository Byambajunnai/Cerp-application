import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { sendLocationPing } from '../services/location';

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 минут

export function useLocationPing(token: string | null) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!token) return;

    // Нэвтэрмэгц шууд нэг удаа илгээнэ
    sendLocationPing(token);

    // Дараа нь тогтмол давтамжтай
    timerRef.current = setInterval(() => {
      sendLocationPing(token);
    }, PING_INTERVAL_MS);

    // Апп дэлгэц дээр эргэж идэвхжих бүрд ч дахин илгээнэ
    const onAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        sendLocationPing(token);
      }
    };
    const sub = AppState.addEventListener('change', onAppStateChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      sub.remove();
    };
  }, [token]);
}