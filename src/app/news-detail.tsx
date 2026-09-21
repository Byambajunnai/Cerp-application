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

import BottomNav from '../components/BottomNav';
import { API_URL } from '../config/api';


/* ============================================================
   TYPE
============================================================ */

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


/* ============================================================
   HTML -> TEXT
============================================================ */

const htmlToText = (html?: string) => {

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

    .replace(/\n\s+\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')

    .trim();
};


/* ============================================================
   SCREEN
============================================================ */

export default function NewsDetailScreen() {

  const {
    userNm,
    cstmNm,
    userId,
    newsId,
    newsFileId,
    token,
  } = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    newsId?: string;
    newsFileId?: string;
    token?: string;
  }>();


  /* ============================================================
     STATE
  ============================================================ */

  const [detail, setDetail] =
    useState<NewsDetail | null>(null);

  const [loading, setLoading] =
    useState(true);


  /* ============================================================
     DETAIL API
  ============================================================ */

  useEffect(() => {

    const loadDetail = async () => {

      if (!token) {

        Alert.alert(
          'Анхааруулга',
          'Нэвтрэх мэдээлэл олдсонгүй.'
        );

        setLoading(false);

        return;
      }


      if (!newsId) {

        Alert.alert(
          'Алдаа',
          'Мэдээний ID олдсонгүй.'
        );

        setLoading(false);

        return;
      }


      try {

        setLoading(true);


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


        const text =
          await response.text();


        let data: any = {};


        try {

          data = text
            ? JSON.parse(text)
            : {};

        } catch {

          throw new Error(
            'Сервер JSON бус хариу буцаалаа.'
          );
        }


        /* =========================
           401
        ========================= */

        if (response.status === 401) {

          Alert.alert(
            'Нэвтрэх шаардлагатай',
            data.message ||
              'Нэвтрэх хугацаа дууссан байна.'
          );

          return;
        }


        /* =========================
           404
        ========================= */

        if (response.status === 404) {

          Alert.alert(
            'Мэдээ олдсонгүй',
            data.message ||
              'Сонгосон мэдээ олдсонгүй.'
          );

          return;
        }


        /* =========================
           ERROR
        ========================= */

        if (!response.ok) {

          throw new Error(
            data.message ||
              `Серверийн алдаа: ${response.status}`
          );
        }


        /* =========================
           SUCCESS
        ========================= */

        setDetail(data);


      } catch (error) {

        console.error(
          'News Detail API error:',
          error
        );


        Alert.alert(
          'Алдаа',
          'Мэдээний дэлгэрэнгүй мэдээллийг авч чадсангүй.'
        );


      } finally {

        setLoading(false);

      }

    };


    loadDetail();

  }, [newsId, token]);


  /* ============================================================
     NEWS VALUE
  ============================================================ */

  const newsContent =
    htmlToText(detail?.newsValue);


  /* ============================================================
     NEWS LIST
  ============================================================ */

  const goNews = () => {

    router.replace({

      pathname: '/news',

      params: {
        userNm: userNm || '',
        cstmNm: cstmNm || '',
        userId: userId || '',
        token: token || '',
      },

    });

  };


  /* ============================================================
     UI
  ============================================================ */

  return (

    <SafeAreaView
      style={styles.safeArea}
    >


      {/* ======================================================
          HEADER
      ====================================================== */}

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


        <Text
          style={styles.headerTitle}
        >
          Мэдээллийн дэлгэрэнгүй
        </Text>

      </View>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <View
          style={styles.loadingContainer}
        >

          <ActivityIndicator
            size="large"
            color="#428CE5"
          />

          <Text
            style={styles.loadingText}
          >
            Мэдээлэл уншиж байна...
          </Text>

        </View>

      ) : !detail ? (

        /* ====================================================
           EMPTY
        ==================================================== */

        <View
          style={styles.emptyContainer}
        >

          <Feather
            name="file-text"
            size={38}
            color="#AAB4C3"
          />

          <Text
            style={styles.emptyTitle}
          >
            Мэдээлэл олдсонгүй
          </Text>


          <TouchableOpacity
            style={styles.backToNewsButton}
            onPress={goNews}
            activeOpacity={0.8}
          >

            <Text
              style={styles.backToNewsText}
            >
              Мэдээ мэдээлэл рүү буцах
            </Text>

          </TouchableOpacity>

        </View>

      ) : (

        /* ====================================================
           CONTENT
        ==================================================== */

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        >

          <View
            style={styles.detailCard}
          >


            {/* ================================================
                TITLE
            ================================================ */}

            <Text
              style={styles.newsTitle}
            >
              {detail.newsTitle}
            </Text>


            {/* ================================================
                META
            ================================================ */}

            <View
              style={styles.metaRow}
            >


              {/* DATE */}

              <View
                style={styles.metaItem}
              >

                <Feather
                  name="calendar"
                  size={16}
                  color="#596274"
                />

                <Text
                  style={styles.metaText}
                >
                  {detail.newsPubDate}
                </Text>

              </View>


              {/* AUTHOR */}

              <View
                style={styles.metaItem}
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
                  {detail.newsAuthor}
                </Text>

              </View>

            </View>


            {/* ================================================
                DEPARTMENT
            ================================================ */}

            {!!detail.newsFolder &&
              detail.newsFolder !== '[]' && (

                <View
                  style={
                    styles.departmentRow
                  }
                >

                  <Feather
                    name="map-pin"
                    size={14}
                    color="#8A94A6"
                  />

                  <Text
                    style={
                      styles.departmentText
                    }
                    numberOfLines={2}
                  >
                    {detail.newsFolder}
                  </Text>

                </View>

              )}


            {/* ================================================
                NEWS CONTENT
            ================================================ */}

            <View
              style={styles.descriptionBox}
            >

              {newsContent ? (

                <Text
                  style={
                    styles.descriptionText
                  }
                >
                  {newsContent}
                </Text>

              ) : (

                <Text
                  style={
                    styles.noContentText
                  }
                >
                  Мэдээний агуулга байхгүй байна.
                </Text>

              )}

            </View>


            {/* ================================================
                ATTACHMENT
            ================================================ */}

            {detail.newsFileId > 0 && (

              <View
                style={styles.attachmentBox}
              >

                <View
                  style={
                    styles.attachmentTitleRow
                  }
                >

                  <Feather
                    name="paperclip"
                    size={20}
                    color="#428CE5"
                  />

                  <Text
                    style={
                      styles.attachmentTitle
                    }
                  >
                    Хавсралт файл
                  </Text>

                </View>


                <TouchableOpacity
                  style={styles.fileItem}
                  activeOpacity={0.8}
                >

                  <View
                    style={styles.fileIcon}
                  >

                    <Feather
                      name="file"
                      size={17}
                      color="#FFFFFF"
                    />

                  </View>


                  <View
                    style={styles.fileInfo}
                  >

                    <Text
                      style={styles.fileName}
                      numberOfLines={1}
                    >
                      {detail.fileName ||
                        `Хавсралт файл #${detail.newsFileId}`}
                    </Text>

                    <Text
                      style={
                        styles.fileSubText
                      }
                    >
                      Хавсралт
                    </Text>

                  </View>


                  <View
                    style={
                      styles.downloadButton
                    }
                  >

                    <Feather
                      name="arrow-down"
                      size={18}
                      color="#FFFFFF"
                    />

                  </View>

                </TouchableOpacity>

              </View>

            )}

          </View>

        </ScrollView>

      )}


      {/* ======================================================
          COMMON BOTTOM NAV
      ====================================================== */}

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


/* ============================================================
   STYLE
============================================================ */

const styles = StyleSheet.create({

  /* ================= PAGE ================= */

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
  },


  headerTitle: {
    fontSize: 19,
    fontWeight: '500',

    color: '#20283A',
  },


  /* ================= LOADING ================= */

  loadingContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },


  loadingText: {
    marginTop: 10,

    fontSize: 12,

    color: '#8A94A6',
  },


  /* ================= EMPTY ================= */

  emptyContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 30,
  },


  emptyTitle: {
    marginTop: 13,

    fontSize: 14,
    fontWeight: '600',

    color: '#344054',
  },


  backToNewsButton: {
    marginTop: 18,

    paddingHorizontal: 17,
    paddingVertical: 10,

    backgroundColor: '#EDF5FF',

    borderRadius: 9,
  },


  backToNewsText: {
    fontSize: 11,
    fontWeight: '600',

    color: '#428CE5',
  },


  /* ================= SCROLL ================= */

  scroll: {
    flex: 1,
  },


  content: {
    paddingHorizontal: 17,
    paddingBottom: 25,
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

    marginBottom: 12,
  },


  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',

    maxWidth: '48%',
  },


  metaText: {
    fontSize: 11,

    color: '#303744',

    marginLeft: 8,
  },


  /* ================= DEPARTMENT ================= */

  departmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    backgroundColor: '#F7F9FC',

    borderRadius: 8,

    paddingHorizontal: 10,
    paddingVertical: 9,

    marginBottom: 13,
  },


  departmentText: {
    flex: 1,

    marginLeft: 8,

    fontSize: 10,
    lineHeight: 15,

    color: '#667085',
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


  descriptionText: {
    fontSize: 12,
    lineHeight: 21,

    color: '#202020',
  },


  noContentText: {
    fontSize: 11,

    color: '#98A2B3',

    textAlign: 'center',

    paddingVertical: 20,
  },


  /* ================= ATTACHMENT ================= */

  attachmentBox: {
    backgroundColor: '#EAF3FF',

    borderRadius: 10,

    padding: 12,
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


  /* ================= FILE ================= */

  fileItem: {
    minHeight: 52,

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,

    borderRadius: 7,
  },


  fileIcon: {
    width: 30,
    height: 34,

    backgroundColor: '#E94343',

    borderRadius: 5,

    alignItems: 'center',
    justifyContent: 'center',
  },


  fileInfo: {
    flex: 1,

    marginLeft: 12,
  },


  fileName: {
    fontSize: 12,

    color: '#242424',
  },


  fileSubText: {
    marginTop: 3,

    fontSize: 9,

    color: '#98A2B3',
  },


  downloadButton: {
    width: 30,
    height: 30,

    borderRadius: 15,

    backgroundColor: '#428CE5',

    alignItems: 'center',
    justifyContent: 'center',
  },

});