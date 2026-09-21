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

  const [newsLoading, setNewsLoading] =
    useState(true);


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


        /*
          Home дээр зөвхөн эхний 3 мэдээ хэрэгтэй.
          page=1&pageSize=3
        */

        const response = await fetch(
          `${API_URL}/api/mobile/news?page=1&pageSize=3`,
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

          console.error(
            'Home News JSON parse error'
          );

          setNews([]);

          return;
        }


        if (
          response.ok &&
          Array.isArray(data.items)
        ) {

          /*
            API pageSize=3 авсан ч
            хамгаалалт болгож slice(0, 3)
          */

          setNews(
            data.items.slice(0, 3)
          );

        } else {

          setNews([]);

        }


      } catch (error) {

        console.error(
          'Home News API error:',
          error
        );

        setNews([]);


      } finally {

        setNewsLoading(false);

      }

    };


    loadNews();

  }, [token]);


  /* ========================================================
     COMMON PARAMS
  ======================================================== */

  const commonParams = {

    userNm: userNm || '',

    cstmNm: cstmNm || '',

    userId: userId || '',

    token: token || '',

  };


  /* ========================================================
     NEWS LIST
  ======================================================== */

  const goNews = () => {

    router.push({

      pathname: '/news',

      params: commonParams,

    });

  };


  /* ========================================================
     NEWS DETAIL
  ======================================================== */

  const goNewsDetail = (
    item: NewsItem
  ) => {

    router.push({

      pathname: '/news-detail',

      params: {

        ...commonParams,

        newsId:
          String(item.newsId),

        newsFileId:
          String(
            item.newsFileId || ''
          ),

      },

    });

  };


  /* ========================================================
     REQUEST
  ======================================================== */

  const goRequest = () => {

    router.push({

      pathname: '/request',

      params: commonParams,

    });

  };


  /* ========================================================
     ATTENDANCE
  ======================================================== */

  const goAttendance = () => {

    router.push({

      pathname: '/attendance',

      params: commonParams,

    });

  };


  /* ========================================================
     UI
  ======================================================== */

  return (

    <SafeAreaView
      style={styles.safeArea}
    >


      {/* ====================================================
          ҮНДСЭН CONTENT
      ==================================================== */}

      <ScrollView

        style={styles.scroll}

        contentContainerStyle={
          styles.content
        }

        showsVerticalScrollIndicator={
          false
        }

      >


        {/* ==================================================
            PROFILE
        ================================================== */}

        <View
          style={styles.profileRow}
        >


          {/* AVATAR */}

          <View
            style={styles.avatar}
          >

            <Feather
              name="user"
              size={34}
              color="#777777"
            />

          </View>


          {/* USER INFO */}

          <View
            style={styles.profileInfo}
          >


            <Text
              style={styles.userId}
            >
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


          {/* NOTIFICATION */}

          <TouchableOpacity

            style={
              styles.notification
            }

            activeOpacity={0.7}

          >

            <Feather
              name="bell"
              size={29}
              color="#2E8BDD"
            />


            <View
              style={
                styles.notificationDot
              }
            />

          </TouchableOpacity>


        </View>


        {/* ==================================================
            ИРЦ
        ================================================== */}

        <TouchableOpacity

          style={
            styles.attendanceCard
          }

          activeOpacity={0.85}

          onPress={goAttendance}

        >


          {/* CLOCK */}

          <View
            style={
              styles.clockCircle
            }
          >

            <Feather
              name="clock"
              size={29}
              color="#FFFFFF"
            />

          </View>


          {/* DATE */}

          <View
            style={styles.dateBlock}
          >

            <Text
              style={styles.date}
            >
              2026.09.16
            </Text>


            <Text
              style={styles.day}
            >
              Мягмар
            </Text>

          </View>


          {/* TIMES */}

          <View
            style={styles.times}
          >


            <View
              style={styles.timeRow}
            >

              <Text
                style={
                  styles.timeLabel
                }
              >
                Ирсэн цаг
              </Text>


              <Text
                style={styles.time}
              >
                09:00
              </Text>

            </View>


            <View
              style={styles.timeRow}
            >

              <Text
                style={
                  styles.timeLabel
                }
              >
                Гарсан цаг
              </Text>


              <Text
                style={styles.time}
              >
                18:27
              </Text>

            </View>


          </View>


        </TouchableOpacity>


        {/* ==================================================
            ХҮСЭЛТ HEADER
        ================================================== */}

        <View
          style={styles.sectionHeader}
        >


          <Text
            style={styles.sectionTitle}
          >
            Хүсэлт
          </Text>


          <TouchableOpacity
            onPress={goRequest}
          >

            <Text
              style={styles.seeAll}
            >
              Цааш үзэх
            </Text>

          </TouchableOpacity>


        </View>


        {/* ==================================================
            REQUEST MENU
        ================================================== */}

        <View
          style={styles.requestCard}
        >


          {/* ================================================
              ТЕХНИКИЙН ТУСЛАМЖ
          ================================================ */}

          <TouchableOpacity

            style={styles.requestItem}

            activeOpacity={0.75}

          >


            <View
              style={[
                styles.requestIcon,
                {
                  backgroundColor:
                    '#EAF4FF',
                },
              ]}
            >

              <Feather
                name="arrow-up-right"
                size={32}
                color="#5797ED"
              />

            </View>


            <Text
              style={styles.requestText}
            >
              Техникийн{'\n'}тусламж
            </Text>


            <Feather
              name="arrow-right"
              size={18}
              color="#5797ED"
            />


          </TouchableOpacity>


          {/* ================================================
              ПРОГРАМЫН ӨӨРЧЛӨЛТ
          ================================================ */}

          <TouchableOpacity

            style={styles.requestItem}

            activeOpacity={0.75}

          >


            <View
              style={[
                styles.requestIcon,
                {
                  backgroundColor:
                    '#F1EEFF',
                },
              ]}
            >

              <Feather
                name="file-text"
                size={30}
                color="#7D63F5"
              />

            </View>


            <Text
              style={styles.requestText}
            >
              Програмын{'\n'}өөрчлөлт
            </Text>


            <Feather
              name="arrow-right"
              size={18}
              color="#7D63F5"
            />


          </TouchableOpacity>


          {/* ================================================
              АМРАЛТ ЧӨЛӨӨ
          ================================================ */}

          <TouchableOpacity

            style={styles.requestItem}

            activeOpacity={0.75}

          >


            <View
              style={[
                styles.requestIcon,
                {
                  backgroundColor:
                    '#EAF9F2',
                },
              ]}
            >

              <Feather
                name="send"
                size={31}
                color="#4DB98B"
              />

            </View>


            <Text
              style={styles.requestText}
            >
              Амралт, чөлөө{'\n'}
              Томилолт
            </Text>


            <Feather
              name="arrow-right"
              size={18}
              color="#4DB98B"
            />


          </TouchableOpacity>


        </View>


        {/* ==================================================
            NEWS HEADER
        ================================================== */}

        <View
          style={styles.newsHeader}
        >


          <Text
            style={styles.sectionTitle}
          >
            Мэдээ мэдээлэл
          </Text>


          <TouchableOpacity
            onPress={goNews}
          >

            <Text
              style={styles.seeAll}
            >
              Цааш үзэх
            </Text>

          </TouchableOpacity>


        </View>


        {/* ==================================================
            NEWS LOADING
        ================================================== */}

        {newsLoading ? (

          <View
            style={
              styles.newsLoadingBox
            }
          >

            <ActivityIndicator
              size="small"
              color="#428CE5"
            />


            <Text
              style={
                styles.newsLoadingText
              }
            >
              Мэдээ уншиж байна...
            </Text>

          </View>

        ) : news.length === 0 ? (


          /* ================================================
             NEWS EMPTY
          ================================================ */

          <View
            style={
              styles.newsEmptyBox
            }
          >

            <Feather
              name="file-text"
              size={28}
              color="#B0BAC8"
            />


            <Text
              style={
                styles.newsEmptyText
              }
            >
              Мэдээ мэдээлэл байхгүй
              байна.
            </Text>

          </View>


        ) : (


          /* ================================================
             ЭХНИЙ 3 МЭДЭЭ
          ================================================ */

          news.map((item) => (

            <TouchableOpacity

              key={item.newsId}

              style={styles.newsCard}

              activeOpacity={0.8}

              onPress={() =>
                goNewsDetail(item)
              }

            >


              {/* ШАР ЗУРААС */}

              <View
                style={styles.yellowLine}
              />


              <View
                style={styles.newsBody}
              >


                {/* TITLE */}

                <Text
                  style={
                    styles.newsTitle
                  }
                  numberOfLines={2}
                >
                  {item.newsTitle}
                </Text>


                {/* META */}

                <View
                  style={
                    styles.newsMeta
                  }
                >


                  {/* DATE */}

                  <View
                    style={
                      styles.newsDateRow
                    }
                  >

                    <Feather
                      name="calendar"
                      size={14}
                      color="#606A7C"
                    />


                    <Text
                      style={
                        styles.newsDate
                      }
                    >
                      {item.newsPubDate}
                    </Text>

                  </View>


                  {/* AUTHOR */}

                  <Text
                    style={styles.author}
                    numberOfLines={1}
                  >
                    Үүсгэсэн:{' '}
                    {item.newsAuthor}
                  </Text>


                </View>


              </View>


            </TouchableOpacity>

          ))

        )}


      </ScrollView>


      {/* ====================================================
          COMMON BOTTOM NAV
      ==================================================== */}

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

  /* ========================================================
     PAGE
  ======================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FD',
  },

  scroll: {
    flex: 1,
    backgroundColor: '#F7F9FD',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },


  /* ========================================================
     PROFILE
  ======================================================== */

  profileRow: {
    minHeight: 125,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 4,
    paddingVertical: 14,
  },

  avatar: {
    width: 64,
    height: 64,

    borderRadius: 32,

    backgroundColor: '#EAF1FC',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,
  },

  profileInfo: {
    flex: 1,
  },

  userId: {
    fontSize: 13,
    fontWeight: '700',

    color: '#263650',

    marginBottom: 3,
  },

  userName: {
    fontSize: 21,
    fontWeight: '700',

    color: '#428CE5',

    letterSpacing: -0.3,
  },

  department: {
    fontSize: 11,
    lineHeight: 16,

    color: '#7B8798',

    marginTop: 5,

    maxWidth: 220,
  },

  notification: {
    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    position: 'relative',

    shadowColor: '#344054',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 1,
  },

  notificationDot: {
    position: 'absolute',

    top: 7,
    right: 8,

    width: 9,
    height: 9,

    borderRadius: 5,

    backgroundColor: '#E5484D',

    borderWidth: 2,
    borderColor: '#FFFFFF',
  },


  /* ========================================================
     ATTENDANCE
  ======================================================== */

  attendanceCard: {
    minHeight: 105,

    backgroundColor: '#FFF8DF',

    borderRadius: 20,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 18,
    paddingVertical: 16,

    marginBottom: 25,

    borderWidth: 1,
    borderColor: '#FFF0B9',

    shadowColor: '#DDAA32',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 2,
  },

  clockCircle: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: '#F2A817',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 17,
  },

  dateBlock: {
    width: 112,

    paddingRight: 12,

    borderRightWidth: 1,
    borderRightColor: '#F3C85D',
  },

  date: {
    fontSize: 15,
    fontWeight: '700',

    color: '#263650',
  },

  day: {
    fontSize: 12,

    color: '#687386',

    marginTop: 5,
  },

  times: {
    flex: 1,

    paddingLeft: 16,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginVertical: 3,
  },

  timeLabel: {
    fontSize: 10.5,

    color: '#687386',
  },

  time: {
    fontSize: 18,
    fontWeight: '700',

    color: '#1F2937',
  },


  /* ========================================================
     SECTION HEADER
  ======================================================== */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 13,
  },

  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 27,
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',

    color: '#20314D',

    letterSpacing: -0.3,
  },

  seeAll: {
    fontSize: 11.5,
    fontWeight: '500',

    color: '#428CE5',

    textDecorationLine: 'none',
  },


  /* ========================================================
     REQUEST
  ======================================================== */

  requestCard: {
    height: 155,

    flexDirection: 'row',

    backgroundColor: 'transparent',

    borderWidth: 0,

    paddingHorizontal: 0,
    paddingVertical: 0,

    gap: 10,
  },

  requestItem: {
    flex: 1,

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 7,
    paddingVertical: 12,

    borderWidth: 1,
    borderColor: '#EEF2F7',

    shadowColor: '#344054',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.055,
    shadowRadius: 10,

    elevation: 2,
  },

  requestIcon: {
    width: 66,
    height: 58,

    borderRadius: 17,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 10,
  },

  requestText: {
    minHeight: 35,

    fontSize: 10.5,
    lineHeight: 15,

    fontWeight: '700',

    color: '#273248',

    textAlign: 'center',
  },


  /* ========================================================
     NEWS
  ======================================================== */

  newsCard: {
    minHeight: 88,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    flexDirection: 'row',

    overflow: 'hidden',

    marginBottom: 11,

    borderWidth: 1,
    borderColor: '#EEF2F7',

    shadowColor: '#344054',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.045,
    shadowRadius: 9,

    elevation: 1,
  },

  yellowLine: {
    width: 4,

    backgroundColor: '#428CE5',
  },

  newsBody: {
    flex: 1,

    paddingHorizontal: 16,
    paddingVertical: 14,

    justifyContent: 'center',
  },

  newsTitle: {
    fontSize: 13.5,
    lineHeight: 18,

    fontWeight: '700',

    color: '#357FD9',
  },

  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 10,
  },

  newsDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  newsDate: {
    fontSize: 9.5,

    color: '#7B8798',

    marginLeft: 6,
  },

  author: {
    maxWidth: '52%',

    fontSize: 9.5,

    color: '#7B8798',
  },


  /* ========================================================
     NEWS LOADING
  ======================================================== */

  newsLoadingBox: {
    minHeight: 110,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    alignItems: 'center',
    justifyContent: 'center',
  },

  newsLoadingText: {
    marginTop: 8,

    fontSize: 11,

    color: '#98A2B3',
  },


  /* ========================================================
     NEWS EMPTY
  ======================================================== */

  newsEmptyBox: {
    minHeight: 110,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: '#EEF2F7',
  },

  newsEmptyText: {
    marginTop: 8,

    fontSize: 11,

    color: '#98A2B3',
  },

});