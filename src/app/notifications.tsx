import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import {
  AppNotification,
  formatDateTime,
  getNotifications,
} from '../services/notifications';
import {
  fetchServerNotifications,
  markServerNotificationRead,
  ServerNotification,
} from '../services/serverNotifications';

export default function NotificationsScreen() {
  const params = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    token?: string;
    roles?: string;
    mode?: string;
  }>();

  // 🔔 хонхноос орвол зөвхөн ирсэн мэдэгдэл (mode байхгүй)
  // «Цааш үзэх»-ээс орвол нэмэх боломжтой (mode = 'manage')
  const { mode, ...navParams } = params;
  const canAdd = mode === 'manage';

  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<AppNotification[]>([]);
  // Вэбийн хонхны мэдэгдлүүд (TNOTIFICATION)
  const [serverItems, setServerItems] = useState<ServerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Дэлгэц рүү буцаж ирэх бүрт шинэчилнэ (нэмсний / уншсаны дараа)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        getNotifications(),
        navParams.token
          ? fetchServerNotifications(navParams.token)
          : Promise.resolve({ items: [] as ServerNotification[], unread: 0 }),
      ]).then(([list, server]) => {
        if (active) {
          setItems(list);
          setServerItems(server.items);
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navParams.token])
  );

  const goCreate = () =>
    router.push({ pathname: '/notification-create', params: navParams });

  const goDetail = (id: string) =>
    router.push({ pathname: '/notification-detail', params: { ...navParams, id } });

  // Серверийн мэдэгдэл дээр дарах: уншсан болгоод холбогдох дэлгэц рүү
  const openServerItem = async (n: ServerNotification) => {
    if (!n.read && navParams.token) {
      setServerItems((prev) =>
        prev.map((x) => (x.notiId === n.notiId ? { ...x, read: true } : x))
      );
      markServerNotificationRead(navParams.token, n.notiId);
    }
    if (n.workId) {
      router.push({ pathname: '/tech-support', params: navParams });
    }
  };

  const markAllServerRead = () => {
    if (!navParams.token) return;
    setServerItems((prev) => prev.map((x) => ({ ...x, read: true })));
    markServerNotificationRead(navParams.token);
  };

  const serverUnread = serverItems.filter((n) => !n.read).length;
  const unread = items.filter((n) => !n.read).length + serverUnread;
  const isEmpty = items.length === 0 && serverItems.length === 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.content, { paddingTop: insets.top + 14 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Feather name="chevron-left" size={24} color="#1D2E4A" />
          </TouchableOpacity>
          <Text style={s.title}>Мэдэгдэл</Text>
        </View>

        <Text style={s.subtitle}>
          {unread > 0
            ? `Танд уншаагүй ${unread} мэдэгдэл байна`
            : canAdd
            ? 'Мэдэгдлээ үзэх эсвэл шинээр илгээнэ үү'
            : 'Танд ирсэн мэдэгдлүүд'}
        </Text>

        {/* ШИНЭ МЭДЭГДЭЛ — зөвхөн «Цааш үзэх»-ээс орсон үед */}
        {canAdd && (
        <TouchableOpacity style={[s.card, s.addCard]} onPress={goCreate} activeOpacity={0.85}>
          <View style={[s.iconBox, s.iconBoxAdd]}>
            <Feather name="plus" size={24} color="#FFFFFF" />
          </View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>Шинэ мэдэгдэл</Text>
            <Text style={s.cardText}>Гарчиг, мессеж бичээд утас руу илгээх</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#428CE5" />
        </TouchableOpacity>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} color="#428CE5" />
        ) : isEmpty ? (
          <View style={s.empty}>
            <Feather name="bell-off" size={26} color="#A9B6C9" />
            <Text style={s.emptyText}>Одоогоор мэдэгдэл алга байна.</Text>
          </View>
        ) : (
          <>
            {/* ===== СИСТЕМИЙН МЭДЭГДЭЛ (вэбийн хонх) ===== */}
            {serverItems.length > 0 && (
              <>
                <View style={s.sectionRow}>
                  <Text style={s.sectionLabel}>Системийн мэдэгдэл</Text>
                  {serverUnread > 0 && (
                    <TouchableOpacity onPress={markAllServerRead} activeOpacity={0.7}>
                      <Text style={s.markAll}>Бүгдийг уншсан</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {serverItems.map((n) => (
                  <TouchableOpacity
                    key={n.notiId}
                    style={s.card}
                    onPress={() => openServerItem(n)}
                    activeOpacity={0.85}
                  >
                    <View style={[s.iconBox, n.read ? s.iconBoxRead : s.iconBoxServer]}>
                      <Feather name="phone-call" size={21} color={n.read ? '#8EA6C8' : '#E58A1F'} />
                      {!n.read && <View style={s.dot} />}
                    </View>

                    <View style={s.cardBody}>
                      <Text style={[s.cardTitle, n.read && s.cardTitleRead]} numberOfLines={1}>
                        {n.title}
                      </Text>
                      <Text style={s.cardText} numberOfLines={2}>
                        {n.message}
                      </Text>
                      <Text style={s.cardDate}>
                        {n.regDate}
                        {n.workId ? `  ·  ${n.workId}` : ''}
                      </Text>
                    </View>

                    <Feather name="chevron-right" size={20} color="#98A2B3" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* ===== ИРСЭН МЭДЭГДЛҮҮД (апп дотор үүсгэсэн) ===== */}
            {items.length > 0 && (
              <>
                <Text style={s.sectionLabel}>Ирсэн мэдэгдлүүд</Text>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={s.card}
                    onPress={() => goDetail(item.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[s.iconBox, item.read ? s.iconBoxRead : s.iconBoxUnread]}>
                      <Feather name="bell" size={22} color={item.read ? '#8EA6C8' : '#2478EE'} />
                      {!item.read && <View style={s.dot} />}
                    </View>

                    <View style={s.cardBody}>
                      <Text
                        style={[s.cardTitle, item.read && s.cardTitleRead]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text style={s.cardText} numberOfLines={2}>
                        {item.body}
                      </Text>
                      <Text style={s.cardDate}>{formatDateTime(item.createdAt)}</Text>
                    </View>

                    <Feather name="chevron-right" size={20} color="#98A2B3" />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <BottomNav
        active="home"
        userNm={navParams.userNm}
        cstmNm={navParams.cstmNm}
        userId={navParams.userId}
        token={navParams.token}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FD' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 30 },

  header: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#344054',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#1D2E4A', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: '#7E8A9D', marginTop: 14, marginBottom: 18 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B6B82',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 2,
  },
  markAll: { fontSize: 12, fontWeight: '600', color: '#428CE5', marginTop: 10, marginBottom: 10 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6ECF5',
  },
  addCard: { backgroundColor: '#F3F8FF', borderColor: '#CFE2FB' },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconBoxAdd: { backgroundColor: '#428CE5' },
  iconBoxUnread: { backgroundColor: '#EAF4FF' },
  iconBoxServer: { backgroundColor: '#FFF4E5' },
  iconBoxRead: { backgroundColor: '#F1F4F9' },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5484D',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  cardBody: { flex: 1, marginRight: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1D2E4A' },
  cardTitleRead: { fontWeight: '600', color: '#4A5568' },
  cardText: { fontSize: 12.5, lineHeight: 18, color: '#6B778A', marginTop: 4 },
  cardDate: { fontSize: 11, color: '#98A2B3', marginTop: 6 },

  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 13, color: '#98A2B3' },
});