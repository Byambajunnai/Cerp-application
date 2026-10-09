import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import { API_URL } from '../config/api';
import { baseName, downloadAndOpen, extOf } from '../services/fileOpener';

/* =========================================================
   ХАВСРАЛТ ТАТАХ ENDPOINT
   CERP сервер FTP-ээс уншаад HTTP-ээр буцаана.
   Сервер дээр өөр замтай бол зөвхөн энэ мөрийг солино.
========================================================= */

const attachmentUrl = (newsId: number | string, fileId: number | string) =>
  `${API_URL}/api/mobile/news/${newsId}/file/${fileId}`;

/* =========================================================
   TYPE
========================================================= */

type NewsDetail = {
  newsId: number;
  newsTitle: string;
  newsValue: string;
  newsAuthor: string;
  newsPubDate: string;
  cstmCd: string;
  newsFolder: string;
  newsFileId: number;
  fileName: string | null;
};

/* =========================================================
   HTML -> TEXT
========================================================= */

function htmlToText(html?: string) {
  if (!html) return '';

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* Өргөтгөлөөр файлын шошго, өнгө */
function fileBadge(name: string) {
  const ext = extOf(name);
  if (ext === 'pdf') return { label: 'PDF', color: '#E94343' };
  if (['doc', 'docx', 'hwp'].includes(ext)) return { label: 'DOC', color: '#2F6FDB' };
  if (['xls', 'xlsx'].includes(ext)) return { label: 'XLS', color: '#1F9D5B' };
  if (['ppt', 'pptx'].includes(ext)) return { label: 'PPT', color: '#E07A2E' };
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return { label: 'IMG', color: '#8B5CF6' };
  return { label: 'FILE', color: '#64748B' };
}

/* =========================================================
   SCREEN
========================================================= */

export default function NewsDetailScreen() {
  const insets = useSafeAreaInsets();

  const { userNm, cstmNm, userId, newsId, token } = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    newsId?: string;
    token?: string;
  }>();

  const [detail, setDetail] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opening, setOpening] = useState(false);

  /* ================= NEWS DETAIL API ================= */

  useEffect(() => {
    const loadNewsDetail = async () => {
      if (!newsId) {
        setError('Мэдээний дугаар олдсонгүй.');
        setLoading(false);
        return;
      }

      if (!token) {
        setError('Нэвтрэх мэдээлэл олдсонгүй.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}/api/mobile/news/${newsId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (response.status === 404) {
          setError('Мэдээ олдсонгүй.');
          return;
        }

        if (response.status === 401) {
          setError('Нэвтрэх эрхийн хугацаа дууссан эсвэл token буруу байна.');
          return;
        }

        if (!response.ok) {
          throw new Error(`Мэдээ авах үед алдаа гарлаа. HTTP ${response.status}`);
        }

        const data: NewsDetail = await response.json();
        setDetail(data);
      } catch (err) {
        console.error('NEWS DETAIL ERROR:', err);
        setError('Мэдээний дэлгэрэнгүй мэдээллийг серверээс авч чадсангүй.');
      } finally {
        setLoading(false);
      }
    };

    loadNewsDetail();
  }, [newsId, token]);

  /* ================= ХАВСРАЛТ НЭЭХ ================= */

  const displayFileName = detail
    ? baseName(detail.fileName) || `Хавсралт файл #${detail.newsFileId}`
    : '';

  const openFile = async () => {
    if (!detail || !token || opening) return;

    try {
      setOpening(true);
      await downloadAndOpen(
        attachmentUrl(detail.newsId, detail.newsFileId),
        token,
        displayFileName,
      );
    } catch (e: any) {
      console.warn('Хавсралт нээх алдаа:', e);

      const status = e?.status;
      const message =
        status === 404
          ? 'Файл олдсонгүй, эсвэл файл татах API сервер дээр хараахан нэмэгдээгүй байна.'
          : status === 401
          ? 'Нэвтрэх эрхийн хугацаа дууссан байна. Дахин нэвтэрнэ үү.'
          : e?.message || 'Файлыг нээж чадсангүй.';

      Alert.alert('Хавсралт', message);
    } finally {
      setOpening(false);
    }
  };

  const contentText = detail ? htmlToText(detail.newsValue) : '';
  const badge = fileBadge(displayFileName);

  /* ================= RENDER ================= */

  return (
    <View style={styles.safeArea}>
      {/* HEADER */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={28} color="#263247" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Мэдээллийн дэлгэрэнгүй</Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* LOADING */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#428CE5" />
            <Text style={styles.loadingText}>Мэдээ уншиж байна...</Text>
          </View>
        )}

        {/* ERROR */}
        {!loading && error !== '' && (
          <View style={styles.errorBox}>
            <View style={styles.errorIcon}>
              <Feather name="alert-circle" size={26} color="#E5484D" />
            </View>

            <Text style={styles.errorTitle}>Алдаа гарлаа</Text>
            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity
              style={styles.backToNewsButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={17} color="#FFFFFF" />
              <Text style={styles.backToNewsText}>Буцах</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DETAIL */}
        {!loading && !error && detail && (
          <View style={styles.detailCard}>
            <Text style={styles.newsTitle}>{detail.newsTitle || '-'}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Feather name="calendar" size={16} color="#596274" />
                <Text style={styles.metaText}>{detail.newsPubDate || '-'}</Text>
              </View>

              <View style={[styles.metaItem, styles.authorItem]}>
                <Feather name="user" size={17} color="#596274" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {detail.newsAuthor || '-'}
                </Text>
              </View>
            </View>

            {/* Агуулга хоосон бол хүрээг харуулахгүй */}
            {contentText !== '' && (
              <View style={styles.descriptionBox}>
                <Text style={styles.newsContent}>{contentText}</Text>
              </View>
            )}

            {/* ATTACHMENT */}
            {detail.newsFileId > 0 && (
              <View style={styles.attachmentBox}>
                <View style={styles.attachmentTitleRow}>
                  <Feather name="paperclip" size={20} color="#428CE5" />
                  <Text style={styles.attachmentTitle}>Хавсралт файл</Text>
                </View>

                <TouchableOpacity
                  style={styles.fileItem}
                  activeOpacity={0.75}
                  onPress={openFile}
                  disabled={opening}
                >
                  <View style={[styles.pdfIcon, { backgroundColor: badge.color }]}>
                    <Text style={styles.pdfText}>{badge.label}</Text>
                  </View>

                  <Text style={styles.fileName} numberOfLines={2}>
                    {displayFileName}
                  </Text>

                  <View style={styles.fileStatusButton}>
                    {opening ? (
                      <ActivityIndicator size="small" color="#428CE5" />
                    ) : (
                      <Feather name="eye" size={17} color="#428CE5" />
                    )}
                  </View>
                </TouchableOpacity>

                <Text style={styles.attachmentHint}>
                  {opening ? 'Файл татаж байна...' : 'Файл дээр дарж нээж үзнэ үү.'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <BottomNav
        active="home"
        userNm={userNm}
        cstmNm={cstmNm}
        userId={userId}
        token={token}
      />
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFD' },

  /* HEADER */
  header: {
    height: 70,
    backgroundColor: '#F8FAFD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  headerTitle: { fontSize: 19, fontWeight: '500', color: '#20283A' },

  /* SCROLL */
  scroll: { flex: 1 },
  content: { paddingHorizontal: 17, paddingBottom: 30 },

  /* DETAIL CARD */
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  newsTitle: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '600',
    color: '#428CE5',
    marginBottom: 15,
  },

  /* META */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 18,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  authorItem: { flex: 1, justifyContent: 'flex-end', marginLeft: 15 },
  metaText: { fontSize: 11, color: '#303744', marginLeft: 8 },

  /* DESCRIPTION */
  descriptionBox: {
    borderWidth: 1,
    borderColor: '#DCE3EC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 15,
    marginBottom: 13,
  },
  newsContent: { fontSize: 12, lineHeight: 21, color: '#202020' },

  /* ATTACHMENT */
  attachmentBox: {
    backgroundColor: '#EAF3FF',
    borderRadius: 10,
    padding: 12,
    marginTop: 2,
  },
  attachmentTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  attachmentTitle: { fontSize: 13, fontWeight: '500', color: '#263247', marginLeft: 9 },
  fileItem: {
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D6E6FB',
  },
  pdfIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfText: { fontSize: 8, fontWeight: '800', color: '#FFFFFF' },
  fileName: { flex: 1, marginLeft: 12, marginRight: 8, fontSize: 12, color: '#242424' },
  fileStatusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentHint: { fontSize: 10, lineHeight: 15, color: '#7B8798', marginTop: 8 },

  /* LOADING */
  centerBox: { minHeight: 300, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 12, color: '#7B8798' },

  /* ERROR */
  errorBox: {
    minHeight: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 30,
  },
  errorIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorTitle: { fontSize: 16, fontWeight: '600', color: '#273248', marginBottom: 7 },
  errorText: { fontSize: 12, lineHeight: 19, color: '#7B8798', textAlign: 'center' },
  backToNewsButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#428CE5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 18,
  },
  backToNewsText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF', marginLeft: 7 },
});