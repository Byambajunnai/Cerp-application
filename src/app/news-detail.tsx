import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomNav from '../components/BottomNav';
import { API_URL } from '../config/api';


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
  if (!html) {
    return '';
  }

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


/* =========================================================
   SCREEN
========================================================= */

export default function NewsDetailScreen() {

  const {
    userNm,
    cstmNm,
    userId,
    newsId,
    token,
  } = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    newsId?: string;
    token?: string;
  }>();


  /* =========================================================
     STATE
  ========================================================= */

  const [detail, setDetail] =
    useState<NewsDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  /* =========================================================
     NEWS DETAIL API
  ========================================================= */

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

        const response = await fetch(
          `${API_URL}/api/mobile/news/${newsId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );


        /* ================= 404 ================= */

        if (response.status === 404) {
          setError('Мэдээ олдсонгүй.');
          return;
        }


        /* ================= 401 ================= */

        if (response.status === 401) {
          setError(
            'Нэвтрэх эрхийн хугацаа дууссан эсвэл token буруу байна.'
          );
          return;
        }


        /* ================= OTHER ERROR ================= */

        if (!response.ok) {
          throw new Error(
            `Мэдээ авах үед алдаа гарлаа. HTTP ${response.status}`
          );
        }


        /* ================= JSON ================= */

        const data: NewsDetail =
          await response.json();

        setDetail(data);

      } catch (err) {

        console.error(
          'NEWS DETAIL ERROR:',
          err
        );

        setError(
          'Мэдээний дэлгэрэнгүй мэдээллийг серверээс авч чадсангүй.'
        );

      } finally {

        setLoading(false);

      }

    };


    loadNewsDetail();

  }, [newsId, token]);


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <SafeAreaView style={styles.safeArea}>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >

          <Feather
            name="chevron-left"
            size={28}
            color="#263247"
          />

        </TouchableOpacity>


        <Text style={styles.headerTitle}>
          Мэдээллийн дэлгэрэнгүй
        </Text>

      </View>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >


        {/* ================= LOADING ================= */}

        {loading && (

          <View style={styles.centerBox}>

            <ActivityIndicator
              size="large"
              color="#428CE5"
            />

            <Text style={styles.loadingText}>
              Мэдээ уншиж байна...
            </Text>

          </View>

        )}


        {/* ================= ERROR ================= */}

        {!loading && error !== '' && (

          <View style={styles.errorBox}>

            <View style={styles.errorIcon}>

              <Feather
                name="alert-circle"
                size={26}
                color="#E5484D"
              />

            </View>

            <Text style={styles.errorTitle}>
              Алдаа гарлаа
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>


            <TouchableOpacity
              style={styles.backToNewsButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >

              <Feather
                name="arrow-left"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.backToNewsText}>
                Буцах
              </Text>

            </TouchableOpacity>

          </View>

        )}


        {/* ================= DETAIL ================= */}

        {!loading && !error && detail && (

          <View style={styles.detailCard}>


            {/* ================= TITLE ================= */}

            <Text style={styles.newsTitle}>
              {detail.newsTitle || '-'}
            </Text>


            {/* ================= META ================= */}

            <View style={styles.metaRow}>


              {/* DATE */}

              <View style={styles.metaItem}>

                <Feather
                  name="calendar"
                  size={16}
                  color="#596274"
                />

                <Text style={styles.metaText}>
                  {detail.newsPubDate || '-'}
                </Text>

              </View>


              {/* AUTHOR */}

              <View
                style={[
                  styles.metaItem,
                  styles.authorItem,
                ]}
              >

                <Feather
                  name="user"
                  size={17}
                  color="#596274"
                />

                <Text
                  style={styles.metaText}
                  numberOfLines={1}
                >
                  {detail.newsAuthor || '-'}
                </Text>

              </View>

            </View>


            {/* =================================================
                NEWS CONTENT
            ================================================= */}

            <View style={styles.descriptionBox}>

              <Text style={styles.newsContent}>
                {htmlToText(detail.newsValue)}
              </Text>

            </View>


            {/* =================================================
                ATTACHMENT
                newsFileId > 0 үед л харуулна
            ================================================= */}

            {detail.newsFileId > 0 && (

              <View style={styles.attachmentBox}>

                <View style={styles.attachmentTitleRow}>

                  <Feather
                    name="paperclip"
                    size={20}
                    color="#428CE5"
                  />

                  <Text style={styles.attachmentTitle}>
                    Хавсралт файл
                  </Text>

                </View>


                <View style={styles.fileItem}>

                  <View style={styles.pdfIcon}>

                    <Text style={styles.pdfText}>
                      FILE
                    </Text>

                  </View>


                  <Text
                    style={styles.fileName}
                    numberOfLines={1}
                  >
                    {detail.fileName ||
                      `Хавсралт файл #${detail.newsFileId}`}
                  </Text>


                  <View style={styles.fileStatusButton}>

                    <Feather
                      name="paperclip"
                      size={17}
                      color="#428CE5"
                    />

                  </View>

                </View>


                <Text style={styles.attachmentHint}>
                  Файл татах API холбогдсоны дараа татах
                  товч идэвхжинэ.
                </Text>

              </View>

            )}


          </View>

        )}


      </ScrollView>


      {/* =====================================================
          COMMON BOTTOM NAV
      ===================================================== */}

      <BottomNav
        active="home"
        userNm={userNm}
        cstmNm={cstmNm}
        userId={userId}
        token={token}
      />


    </SafeAreaView>

  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },


  /* ================= HEADER ================= */

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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,

    elevation: 1,
  },


  headerTitle: {
    fontSize: 19,
    fontWeight: '500',
    color: '#20283A',
  },


  /* ================= SCROLL ================= */

  scroll: {
    flex: 1,
  },


  content: {
    paddingHorizontal: 17,
    paddingBottom: 30,
  },


  /* ================= DETAIL CARD ================= */

  detailCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 12,

    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 8,

    elevation: 1,
  },


  /* ================= TITLE ================= */

  newsTitle: {
    fontSize: 15,
    lineHeight: 23,

    fontWeight: '600',

    color: '#428CE5',

    marginBottom: 15,
  },


  /* ================= META ================= */

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 4,

    marginBottom: 18,
  },


  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  authorItem: {
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: 15,
  },


  metaText: {
    fontSize: 11,

    color: '#303744',

    marginLeft: 8,
  },


  /* ================= DESCRIPTION ================= */

  descriptionBox: {
    borderWidth: 1,
    borderColor: '#DCE3EC',

    borderRadius: 10,

    paddingHorizontal: 14,
    paddingVertical: 15,

    marginBottom: 13,
  },


  newsContent: {
    fontSize: 12,
    lineHeight: 21,

    color: '#202020',
  },


  /* ================= ATTACHMENT ================= */

  attachmentBox: {
    backgroundColor: '#EAF3FF',

    borderRadius: 10,

    padding: 12,

    marginTop: 2,
  },


  attachmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 12,
  },


  attachmentTitle: {
    fontSize: 13,
    fontWeight: '500',

    color: '#263247',

    marginLeft: 9,
  },


  fileItem: {
    minHeight: 47,

    backgroundColor: '#FFFFFF',

    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
  },


  pdfIcon: {
    width: 29,
    height: 29,

    backgroundColor: '#E94343',

    borderRadius: 5,

    alignItems: 'center',
    justifyContent: 'center',
  },


  pdfText: {
    fontSize: 6,
    fontWeight: '700',

    color: '#FFFFFF',
  },


  fileName: {
    flex: 1,

    marginLeft: 12,

    fontSize: 12,

    color: '#242424',
  },


  fileStatusButton: {
    width: 30,
    height: 30,

    borderRadius: 15,

    backgroundColor: '#EAF3FF',

    alignItems: 'center',
    justifyContent: 'center',
  },


  attachmentHint: {
    fontSize: 10,
    lineHeight: 15,

    color: '#7B8798',

    marginTop: 8,
  },


  /* ================= LOADING ================= */

  centerBox: {
    minHeight: 300,

    alignItems: 'center',
    justifyContent: 'center',
  },


  loadingText: {
    marginTop: 12,

    fontSize: 12,

    color: '#7B8798',
  },


  /* ================= ERROR ================= */

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


  errorTitle: {
    fontSize: 16,
    fontWeight: '600',

    color: '#273248',

    marginBottom: 7,
  },


  errorText: {
    fontSize: 12,
    lineHeight: 19,

    color: '#7B8798',

    textAlign: 'center',
  },


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


  backToNewsText: {
    fontSize: 12,
    fontWeight: '600',

    color: '#FFFFFF',

    marginLeft: 7,
  },

});