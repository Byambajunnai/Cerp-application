import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AppNotification,
  deleteNotification,
  formatDateTime,
  getNotification,
  markAsRead,
} from '../services/notifications';

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<AppNotification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      const found = await getNotification(String(id));
      setItem(found);
      setLoading(false);
      if (found && !found.read) await markAsRead(found.id);
    })();
  }, [id]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/notifications');
  };

  const confirmDelete = () => {
    if (!item) return;
    Alert.alert('Мэдэгдэл устгах', 'Энэ мэдэгдлийг устгах уу?', [
      { text: 'Болих', style: 'cancel' },
      {
        text: 'Устгах',
        style: 'destructive',
        onPress: async () => {
          await deleteNotification(item.id);
          goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} style={s.iconBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#1D2E4A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Дэлгэрэнгүй</Text>
        {item && (
          <TouchableOpacity onPress={confirmDelete} style={s.iconBtn} activeOpacity={0.7}>
            <Feather name="trash-2" size={20} color="#E5484D" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#428CE5" />
      ) : !item ? (
        <View style={s.missing}>
          <Feather name="alert-circle" size={28} color="#98A2B3" />
          <Text style={s.missingText}>Мэдэгдэл олдсонгүй. Устгагдсан байж магадгүй.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.card}>
            <View style={s.iconWrap}>
              <Feather name="bell" size={22} color="#428CE5" />
            </View>

            <Text style={s.title}>{item.title}</Text>

            <View style={s.dateRow}>
              <Feather name="clock" size={12} color="#8290A5" />
              <Text style={s.date}>{formatDateTime(item.createdAt)}</Text>
            </View>

            <View style={s.divider} />

            <Text style={s.body}>{item.body}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FD' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1D2E4A', marginLeft: 6 },

  content: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 19, lineHeight: 26, fontWeight: '700', color: '#1D2E4A' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  date: { fontSize: 12, color: '#8290A5' },
  divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
  body: { fontSize: 15, lineHeight: 23, color: '#344054' },

  missing: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40, gap: 10 },
  missingText: { fontSize: 13.5, color: '#7B8798', textAlign: 'center' },
});