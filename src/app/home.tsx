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


/* ==========================================================
   NEWS TYPE
========================================================== */

type NewsItem = {
  newsId: number;
  newsTitle: string;
  newsAuthor: string;
  newsPubDate: string;
  cstmCd: string;
  newsFolder: string;
  newsFileId: number;
};


/* ==========================================================
   HOME
========================================================== */

export default function HomeScreen() {

  const {
    userNm,
    cstmNm,
    userId,
    token,
  } = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    token?: string;
  }>();


  /* ========================================================
     NEWS STATE
  ======================================================== */

  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);


  /* ========================================================
     NEWS API
  ======================================================== */

  useEffect(() => {

    const loadNews = async () => {

      if (!token) {
        setNewsLoading(false);
        return;
      }

      try {

        setNewsLoading(true);

        const response = await fetch(
          'http://localhost:3001/api/mobile/news',
          {
            method: 'GET',

            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        const text = await response.text();

        let data: any = {};

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          console.error('Home News JSON parse error');
          return;
        }

        if (response.ok && Array.isArray(data.items)) {

          // API-аас ирсэн эхний 3 мэдээ
          setNews(data.items.slice(0, 3));

        } else {

          setNews([]);

        }

      } catch (error) {

        console.error('Home News API error:', error);

        setNews([]);

      } finally {

        setNewsLoading(false);

      }

    };


    loadNews();

  }, [token]);


  /* ========================================================
     UI
  ======================================================== */

  return (

    <SafeAreaView style={styles.safeArea}>


      {/* ================= ҮНДСЭН CONTENT ================= */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >


        {/* ================= PROFILE ================= */}

        <View style={styles.profileRow}>


          {/* Avatar */}

          <View style={styles.avatar}>

            <Feather
              name="user"
              size={34}
              color="#777777"
            />

          </View>


          {/* API USER INFO */}

          <View style={styles.profileInfo}>


            <Text style={styles.userId}>
              {userId || ''}
            </Text>


            <Text
              style={styles.userName}
              numberOfLines={1}
            >
              {userNm || ''}
            </Text>


            <Text
              style={styles.department}
              numberOfLines={2}
            >
              {cstmNm || ''}
            </Text>


          </View>


          {/* Notification */}

          <TouchableOpacity
            style={styles.notification}
            activeOpacity={0.7}
          >

            <Feather
              name="bell"
              size={29}
              color="#2E8BDD"
            />

            <View style={styles.notificationDot} />

          </TouchableOpacity>


        </View>


        {/* ================= ИРЦ ================= */}

        <View style={styles.attendanceCard}>


          {/* Clock */}

          <View style={styles.clockCircle}>

            <Feather
              name="clock"
              size={29}
              color="#FFFFFF"
            />

          </View>


          {/* Date */}

          <View style={styles.dateBlock}>

            <Text style={styles.date}>
              2026.09.16
            </Text>

            <Text style={styles.day}>
              Мягмар
            </Text>

          </View>


          {/* Times */}

          <View style={styles.times}>


            <View style={styles.timeRow}>

              <Text style={styles.timeLabel}>
                Ирсэн цаг
              </Text>

              <Text style={styles.time}>
                09:00
              </Text>

            </View>


            <View style={styles.timeRow}>

              <Text style={styles.timeLabel}>
                Гарсан цаг
              </Text>

              <Text style={styles.time}>
                18:27
              </Text>

            </View>


          </View>


        </View>


        {/* ================= ХҮСЭЛТ ================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Хүсэлт
          </Text>

          <TouchableOpacity>

            <Text style={styles.seeAll}>
              Цааш үзэх
            </Text>

          </TouchableOpacity>

        </View>


        {/* ================= REQUEST MENU ================= */}

        <View style={styles.requestCard}>


          {/* Техникийн тусламж */}

          <TouchableOpacity
            style={styles.requestItem}
            activeOpacity={0.75}
          >

            <View
              style={[
                styles.requestIcon,
                {
                  backgroundColor: '#EAF4FF',
                },
              ]}
            >

              <Feather
                name="arrow-up-right"
                size={32}
                color="#5797ED"
              />

            </View>


            <Text style={styles.requestText}>
              Техникийн{'\n'}тусламж
            </Text>


            <Feather
              name="arrow-right"
              size={18}
              color="#5797ED"
            />

          </TouchableOpacity>


          {/* Програмын өөрчлөлт */}

          <TouchableOpacity
            style={styles.requestItem}
            activeOpacity={0.75}
          >

            <View
              style={[
                styles.requestIcon,
                {
                  backgroundColor: '#F1EEFF',
                },
              ]}
            >

              <Feather
                name="file-text"
                size={30}
                color="#7D63F5"
              />

            </View>


            <Text style={styles.requestText}>
              Програмын{'\n'}өөрчлөлт
            </Text>


            <Feather
              name="arrow-right"
              size={18}
              color="#7D63F5"
            />

          </TouchableOpacity>


          {/* Амралт */}

          <TouchableOpacity
            style={styles.requestItem}
            activeOpacity={0.75}
          >

            <View
              style={[
                styles.requestIcon,
                {
                  backgroundColor: '#EAF9F2',
                },
              ]}
            >

              <Feather
                name="send"
                size={31}
                color="#4DB98B"
              />

            </View>


            <Text style={styles.requestText}>
              Амралт, чөлөө{'\n'}Томилолт
            </Text>


            <Feather
              name="arrow-right"
              size={18}
              color="#4DB98B"
            />

          </TouchableOpacity>


        </View>


        {/* ==================================================
            МЭДЭЭ МЭДЭЭЛЭЛ
        ================================================== */}

        <View style={styles.newsHeader}>


          <Text style={styles.sectionTitle}>
            Мэдээ мэдээлэл
          </Text>


          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/news',

                params: {
                  userNm: userNm || '',
                  cstmNm: cstmNm || '',
                  userId: userId || '',
                  token: token || '',
                },
              })
            }
          >

            <Text style={styles.seeAll}>
              Цааш үзэх
            </Text>

          </TouchableOpacity>


        </View>


        {/* ==================================================
            NEWS LOADING
        ================================================== */}

        {newsLoading ? (

          <View style={styles.newsLoadingBox}>

            <ActivityIndicator
              size="small"
              color="#428CE5"
            />

            <Text style={styles.newsLoadingText}>
              Мэдээ уншиж байна...
            </Text>

          </View>

        ) : news.length === 0 ? (

          /* =================================================
             NEWS EMPTY
          ================================================= */

          <View style={styles.newsEmptyBox}>

            <Feather
              name="file-text"
              size={28}
              color="#B0BAC8"
            />

            <Text style={styles.newsEmptyText}>
              Мэдээ мэдээлэл байхгүй байна.
            </Text>

          </View>

        ) : (

          /* =================================================
             API-ААС ИРСЭН ЭХНИЙ 3 МЭДЭЭ
          ================================================= */

          news.map((item) => (

            <TouchableOpacity
              key={item.newsId}
              style={styles.newsCard}
              activeOpacity={0.8}

              onPress={() =>
                router.push({
                  pathname: '/news-detail',

                  params: {
                    newsId: String(item.newsId),

                    newsFileId: String(
                      item.newsFileId || ''
                    ),

                    userNm: userNm || '',
                    cstmNm: cstmNm || '',
                    userId: userId || '',
                    token: token || '',
                  },
                })
              }
            >


              {/* ШАР ЗУРААС */}

              <View style={styles.yellowLine} />


              <View style={styles.newsBody}>


                {/* NEWS TITLE */}

                <Text
                  style={styles.newsTitle}
                  numberOfLines={2}
                >
                  {item.newsTitle}
                </Text>


                {/* NEWS META */}

                <View style={styles.newsMeta}>


                  {/* DATE */}

                  <View style={styles.newsDateRow}>

                    <Feather
                      name="calendar"
                      size={14}
                      color="#606A7C"
                    />

                    <Text style={styles.newsDate}>
                      {item.newsPubDate}
                    </Text>

                  </View>


                  {/* AUTHOR */}

                  <Text
                    style={styles.author}
                    numberOfLines={1}
                  >
                    Үүсгэсэн: {item.newsAuthor}
                  </Text>


                </View>


              </View>


            </TouchableOpacity>

          ))

        )}


      </ScrollView>


      {/* ================= BOTTOM NAV ================= */}

      <View style={styles.bottomNav}>


        {/* Нүүр */}

        <TouchableOpacity style={styles.navItem}>

          <Feather
            name="grid"
            size={24}
            color="#428CE5"
          />

          <Text style={styles.activeNav}>
            Нүүр
          </Text>

        </TouchableOpacity>


        {/* Хүсэлт */}

        <TouchableOpacity style={styles.navItem}>

          <Feather
            name="edit-3"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.navText}>
            Хүсэлт
          </Text>

        </TouchableOpacity>


        {/* PLUS */}

        <TouchableOpacity
          style={styles.plusButton}
          activeOpacity={0.8}
        >

          <Feather
            name="plus"
            size={31}
            color="#FFFFFF"
          />

        </TouchableOpacity>


        {/* Мэдээ */}

        <TouchableOpacity
          style={styles.navItem}

          onPress={() =>
            router.push({
              pathname: '/news',

              params: {
                userNm: userNm || '',
                cstmNm: cstmNm || '',
                userId: userId || '',
                token: token || '',
              },
            })
          }
        >

          <Feather
            name="book-open"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.navText}>
            Мэдээ
          </Text>

        </TouchableOpacity>


        {/* Миний */}

        <TouchableOpacity style={styles.navItem}>

          <Feather
            name="user"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.navText}>
            Миний
          </Text>

        </TouchableOpacity>


      </View>


    </SafeAreaView>

  );
}


/* ==========================================================
   STYLES
========================================================== */

const styles = StyleSheet.create({


  /* PAGE */

  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },


  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },


  content: {
    paddingHorizontal: 27,
    paddingTop: 15,
    paddingBottom: 35,
  },


  /* ========================================================
     PROFILE
  ======================================================== */

  profileRow: {

    minHeight: 125,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 7,

  },


  avatar: {

    width: 52,
    height: 58,

    borderRadius: 10,

    backgroundColor: '#F1F2F4',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,

  },


  profileInfo: {
    flex: 1,
  },


  userId: {

    fontSize: 14,

    fontWeight: '500',

    color: '#202020',

    marginBottom: 1,

  },


  userName: {

    fontSize: 19,

    fontWeight: '700',

    color: '#428CE5',

  },


  department: {

    fontSize: 10,

    lineHeight: 14,

    color: '#8B95A5',

    marginTop: 5,

    maxWidth: 210,

  },


  notification: {

    width: 50,
    height: 55,

    alignItems: 'center',
    justifyContent: 'center',

    position: 'relative',

  },


  notificationDot: {

    position: 'absolute',

    top: 5,
    right: 6,

    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: '#E94A4A',

    borderWidth: 2,

    borderColor: '#FFFFFF',

  },


  /* ========================================================
     ATTENDANCE
  ======================================================== */

  attendanceCard: {

    height: 95,

    backgroundColor: '#FFF3C7',

    borderRadius: 13,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,

    marginBottom: 13,

  },


  clockCircle: {

    width: 50,
    height: 50,

    borderRadius: 25,

    backgroundColor: '#F4A000',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,

  },


  dateBlock: {
    width: 95,
  },


  date: {

    fontSize: 13,

    fontWeight: '700',

    color: '#171717',

  },


  day: {

    fontSize: 12,

    color: '#333333',

    marginTop: 3,

  },


  times: {
    flex: 1,
  },


  timeRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginVertical: 4,

  },


  timeLabel: {

    fontSize: 10,

    color: '#333333',

  },


  time: {

    fontSize: 20,

    fontWeight: '700',

    color: '#111111',

  },


  /* ========================================================
     SECTION
  ======================================================== */

  sectionHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingHorizontal: 5,

    marginTop: 1,

    marginBottom: 8,

  },


  newsHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingHorizontal: 5,

    marginTop: 28,

    marginBottom: 12,

  },


  sectionTitle: {

    fontSize: 18,

    fontWeight: '700',

    color: '#273248',

  },


  seeAll: {

    fontSize: 12,

    color: '#428CE5',

    textDecorationLine: 'underline',

  },


  /* ========================================================
     REQUEST
  ======================================================== */

  requestCard: {

    height: 145,

    borderWidth: 1,

    borderColor: '#DEE5ED',

    borderRadius: 14,

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',

    paddingHorizontal: 8,

    paddingVertical: 10,

  },


  requestItem: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'flex-start',

    paddingHorizontal: 3,

  },


  requestIcon: {

    width: 62,
    height: 62,

    borderRadius: 13,

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 8,

  },


  requestText: {

    minHeight: 32,

    fontSize: 9.5,

    lineHeight: 13,

    fontWeight: '700',

    color: '#273248',

    textAlign: 'center',

  },


  /* ========================================================
     NEWS
  ======================================================== */

  newsCard: {

    minHeight: 85,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#E0E5EC',

    borderRadius: 12,

    flexDirection: 'row',

    overflow: 'hidden',

    marginBottom: 9,

  },


  yellowLine: {

    width: 3,

    backgroundColor: '#F2A900',

  },


  newsBody: {

    flex: 1,

    paddingHorizontal: 15,

    paddingVertical: 13,

  },


  newsTitle: {

    fontSize: 14,

    lineHeight: 20,

    fontWeight: '700',

    color: '#428CE5',

  },


  newsMeta: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginTop: 12,

  },


  newsDateRow: {

    flexDirection: 'row',

    alignItems: 'center',

  },


  newsDate: {

    fontSize: 10,

    color: '#667085',

    marginLeft: 7,

  },


  author: {

    maxWidth: '52%',

    fontSize: 10,

    color: '#667085',

  },


  /* NEWS LOADING */

  newsLoadingBox: {

    minHeight: 100,

    alignItems: 'center',

    justifyContent: 'center',

  },


  newsLoadingText: {

    marginTop: 8,

    fontSize: 11,

    color: '#98A2B3',

  },


  /* NEWS EMPTY */

  newsEmptyBox: {

    minHeight: 100,

    alignItems: 'center',

    justifyContent: 'center',

  },


  newsEmptyText: {

    marginTop: 8,

    fontSize: 11,

    color: '#98A2B3',

  },


  /* ========================================================
     BOTTOM NAV
  ======================================================== */

  bottomNav: {

    height: 84,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,

    borderTopColor: '#E4E7EC',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-around',

    paddingHorizontal: 7,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: -2,
    },

    shadowOpacity: 0.04,

    shadowRadius: 5,

    elevation: 5,

  },


  navItem: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

  },


  activeNav: {

    fontSize: 9,

    color: '#428CE5',

    marginTop: 5,

  },


  navText: {

    fontSize: 9,

    color: '#94A3B8',

    marginTop: 5,

  },


  plusButton: {

    width: 55,
    height: 55,

    borderRadius: 28,

    backgroundColor: '#428CE5',

    alignItems: 'center',

    justifyContent: 'center',

    marginHorizontal: 9,

    shadowColor: '#428CE5',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.2,

    shadowRadius: 6,

    elevation: 5,

  },

});