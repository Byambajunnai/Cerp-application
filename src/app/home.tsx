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

/* ============================================================
   NEWS TYPE
============================================================ */

type NewsItem = {
  newsId: number;
  newsTitle: string;
  newsAuthor: string;
  newsPubDate: string;
  cstmCd: string;
  newsFolder: string;
  newsFileId: number;
};


/* ============================================================
   HOME
============================================================ */

export default function HomeScreen() {

  const {
  userNm,
  cstmNm,
  userId,
  token,
  roles,
} = useLocalSearchParams<{
  userNm?: string;
  cstmNm?: string;
  userId?: string;
  token?: string;
  roles?: string;
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
          `${API_URL}/api/mobile/news?page=1&pageSize=3`,
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
          setNews([]);
          return;
        }

        if (
          response.ok &&
          Array.isArray(data.items)
        ) {
          setNews(data.items.slice(0, 3));
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
  roles: roles || '[]',
};


  /* ========================================================
     ROUTES
  ======================================================== */

  const goNews = () => {
    router.push({
      pathname: '/news',
      params: commonParams,
    });
  };


  const goNewsDetail = (item: NewsItem) => {
    router.push({
      pathname: '/news-detail',
      params: {
        ...commonParams,
        newsId: String(item.newsId),
        newsFileId: String(
          item.newsFileId || ''
        ),
      },
    });
  };


  const goRequest = () => {
    router.push({
      pathname: '/request',
      params: commonParams,
    });
  };


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

    <SafeAreaView style={styles.safeArea}>

      {/* ====================================================
          SCROLL CONTENT
      ==================================================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ==================================================
            PROFILE
        ================================================== */}

        <View style={styles.profileRow}>

          <View style={styles.avatar}>

            <Feather
              name="user"
              size={30}
              color="#7B9BD0"
            />

          </View>


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


          <TouchableOpacity
            style={styles.notification}
            activeOpacity={0.7}
          >

            <Feather
              name="bell"
              size={25}
              color="#428CE5"
            />

            <View style={styles.notificationDot} />

          </TouchableOpacity>

        </View>


        {/* ==================================================
            ИРЦ
        ================================================== */}

        <TouchableOpacity
          style={styles.attendanceCard}
          activeOpacity={0.85}
          onPress={goAttendance}
        >

          <View style={styles.clockCircle}>

            <Feather
              name="clock"
              size={27}
              color="#FFFFFF"
            />

          </View>


          <View style={styles.dateBlock}>

            <Text style={styles.date}>
              2026.09.16
            </Text>

            <Text style={styles.day}>
              Мягмар
            </Text>

          </View>


          <View style={styles.timeDivider} />


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

        </TouchableOpacity>


        {/* ==================================================
            ХҮСЭЛТ HEADER
        ================================================== */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Хүсэлт
          </Text>

          <TouchableOpacity
            onPress={goRequest}
            activeOpacity={0.7}
          >

            <View style={styles.seeAllRow}>

              <Text style={styles.seeAll}>
                Цааш үзэх
              </Text>

              <Feather
                name="arrow-right"
                size={15}
                color="#428CE5"
              />

            </View>

          </TouchableOpacity>

        </View>


        {/* ==================================================
            ХҮСЭЛТ CARD
        ================================================== */}

        <View style={styles.requestContainer}>


          {/* ТЕХНИКИЙН ТУСЛАМЖ */}

          <TouchableOpacity
            style={[
              styles.requestItem,
              styles.requestBlue,
            ]}
            activeOpacity={0.8}
            onPress={goRequest}
          >

            <View
              style={[
                styles.requestIcon,
                styles.requestIconBlue,
              ]}
            >

              <Feather
                name="tool"
                size={26}
                color="#2478EE"
              />

            </View>

            <Text style={styles.requestTitle}>
              Техникийн{'\n'}тусламж
            </Text>

            <Text
              style={styles.requestDescription}
              numberOfLines={3}
            >
              Техник, төхөөрөмжийн тусламж хүсэх
            </Text>

            <View
              style={[
                styles.requestArrow,
                styles.requestArrowBlue,
              ]}
            >
              <Feather
                name="arrow-right"
                size={18}
                color="#2478EE"
              />
            </View>

          </TouchableOpacity>


          {/* ПРОГРАМЫН ӨӨРЧЛӨЛТ */}

          <TouchableOpacity
            style={[
              styles.requestItem,
              styles.requestPurple,
            ]}
            activeOpacity={0.8}
            onPress={goRequest}
          >

            <View
              style={[
                styles.requestIcon,
                styles.requestIconPurple,
              ]}
            >

              <Feather
                name="file-text"
                size={26}
                color="#7956EE"
              />

            </View>

            <Text style={styles.requestTitle}>
              Програмын{'\n'}өөрчлөлт
            </Text>

            <Text
              style={styles.requestDescription}
              numberOfLines={3}
            >
              Системийн шинэчлэлт, өөрчлөлт хүсэх
            </Text>

            <View
              style={[
                styles.requestArrow,
                styles.requestArrowPurple,
              ]}
            >
              <Feather
                name="arrow-right"
                size={18}
                color="#7956EE"
              />
            </View>

          </TouchableOpacity>


          {/* АМРАЛТ, ЧӨЛӨӨ */}

          <TouchableOpacity
            style={[
              styles.requestItem,
              styles.requestGreen,
            ]}
            activeOpacity={0.8}
            onPress={goRequest}
          >

            <View
              style={[
                styles.requestIcon,
                styles.requestIconGreen,
              ]}
            >

              <Feather
                name="send"
                size={26}
                color="#169B69"
              />

            </View>

            <Text style={styles.requestTitle}>
              Амралт, чөлөө{'\n'}Томилолт
            </Text>

            <Text
              style={styles.requestDescription}
              numberOfLines={3}
            >
              Амралт, чөлөө болон томилолтын хүсэлт
            </Text>

            <View
              style={[
                styles.requestArrow,
                styles.requestArrowGreen,
              ]}
            >
              <Feather
                name="arrow-right"
                size={18}
                color="#169B69"
              />
            </View>

          </TouchableOpacity>

        </View>


        {/* ==================================================
            NEWS HEADER
        ================================================== */}

        <View style={styles.newsHeader}>

          <Text style={styles.sectionTitle}>
            Мэдээ мэдээлэл
          </Text>

          <TouchableOpacity
            onPress={goNews}
            activeOpacity={0.7}
          >

            <View style={styles.seeAllRow}>

              <Text style={styles.seeAll}>
                Цааш үзэх
              </Text>

              <Feather
                name="arrow-right"
                size={15}
                color="#428CE5"
              />

            </View>

          </TouchableOpacity>

        </View>


        {/* ==================================================
            NEWS
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

          <View style={styles.newsEmptyBox}>

            <Feather
              name="file-text"
              size={27}
              color="#B0BAC8"
            />

            <Text style={styles.newsEmptyText}>
              Мэдээ мэдээлэл байхгүй байна.
            </Text>

          </View>

        ) : (

          news.map((item, index) => (

            <TouchableOpacity
              key={item.newsId}
              style={styles.newsCard}
              activeOpacity={0.8}
              onPress={() =>
                goNewsDetail(item)
              }
            >

              <View
                style={[
                  styles.newsAccent,
                  index === 0
                    ? styles.newsAccentBlue
                    : index === 1
                    ? styles.newsAccentPurple
                    : styles.newsAccentGreen,
                ]}
              />


              <View
                style={[
                  styles.newsIcon,
                  index === 0
                    ? styles.newsIconBlue
                    : index === 1
                    ? styles.newsIconPurple
                    : styles.newsIconGreen,
                ]}
              >

                <Feather
                  name="file-text"
                  size={20}
                  color={
                    index === 0
                      ? '#428CE5'
                      : index === 1
                      ? '#7956EE'
                      : '#35A875'
                  }
                />

              </View>


              <View style={styles.newsBody}>

                <Text
                  style={styles.newsTitle}
                  numberOfLines={2}
                >
                  {item.newsTitle}
                </Text>

                <View style={styles.newsMeta}>

                  <View style={styles.newsDateRow}>

                    <Feather
                      name="calendar"
                      size={11}
                      color="#8290A5"
                    />

                    <Text style={styles.newsDate}>
                      {item.newsPubDate}
                    </Text>

                  </View>

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


      {/* ====================================================
           BottomNav COMPONENT
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

  /* PAGE */

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
    paddingTop: 8,
    paddingBottom: 30,
  },


  /* ========================================================
     PROFILE
  ======================================================== */

  profileRow: {
    minHeight: 120,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 5,
  },

  avatar: {
    width: 60,
    height: 60,

    borderRadius: 30,

    backgroundColor: '#EAF1FC',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 15,
  },

  profileInfo: {
    flex: 1,
  },

  userId: {
    fontSize: 13,
    fontWeight: '700',

    color: '#22324D',

    marginBottom: 2,
  },

  userName: {
    fontSize: 20,
    fontWeight: '700',

    color: '#428CE5',
  },

  department: {
    fontSize: 10.5,
    lineHeight: 15,

    color: '#7E8A9D',

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
    shadowOpacity: 0.06,
    shadowRadius: 7,

    elevation: 2,
  },

  notificationDot: {
    position: 'absolute',

    top: 6,
    right: 7,

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
    minHeight: 102,

    backgroundColor: '#FFF7D9',

    borderRadius: 20,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 17,
    paddingVertical: 15,

    marginBottom: 25,

    borderWidth: 1,
    borderColor: '#FFF0BA',

    shadowColor: '#D9A329',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.07,
    shadowRadius: 11,

    elevation: 2,
  },

  clockCircle: {
    width: 55,
    height: 55,

    borderRadius: 28,

    backgroundColor: '#F2A817',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 15,
  },

  dateBlock: {
    width: 105,
  },

  date: {
    fontSize: 14,
    fontWeight: '700',

    color: '#24324A',
  },

  day: {
    fontSize: 11.5,

    color: '#687386',

    marginTop: 5,
  },

  timeDivider: {
    width: 1,
    height: 58,

    backgroundColor: '#F0C45D',

    marginRight: 15,
  },

  times: {
    flex: 1,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginVertical: 3,
  },

  timeLabel: {
    fontSize: 10,

    color: '#687386',
  },

  time: {
    fontSize: 17,
    fontWeight: '700',

    color: '#172033',
  },


  /* ========================================================
     SECTION
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

    color: '#1D2E4A',

    letterSpacing: -0.2,
  },

  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,
  },

  seeAll: {
    fontSize: 11.5,
    fontWeight: '500',

    color: '#428CE5',
  },


  /* ========================================================
     REQUEST
  ======================================================== */

  requestContainer: {
    flexDirection: 'row',

    gap: 9,

    backgroundColor: '#FFFFFF',

    borderRadius: 21,

    padding: 10,

    borderWidth: 1,
    borderColor: '#EDF2F8',

    shadowColor: '#344054',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,

    elevation: 1,
  },

  requestItem: {
    flex: 1,

    minHeight: 190,

    borderRadius: 17,

    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 11,

    borderWidth: 1,

    overflow: 'hidden',
  },


  /* BLUE */

  requestBlue: {
    backgroundColor: '#FCFDFF',
    borderColor: '#DDEBFC',
  },

  requestIconBlue: {
    backgroundColor: '#EAF4FF',
  },

  requestArrowBlue: {
    backgroundColor: '#EAF4FF',
  },


  /* PURPLE */

  requestPurple: {
    backgroundColor: '#FDFCFF',
    borderColor: '#E7E0FD',
  },

  requestIconPurple: {
    backgroundColor: '#F1ECFF',
  },

  requestArrowPurple: {
    backgroundColor: '#F1ECFF',
  },


  /* GREEN */

  requestGreen: {
    backgroundColor: '#FCFEFD',
    borderColor: '#DCEFE6',
  },

  requestIconGreen: {
    backgroundColor: '#E8F8F1',
  },

  requestArrowGreen: {
    backgroundColor: '#E8F8F1',
  },


  requestIcon: {
    width: 52,
    height: 52,

    borderRadius: 15,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 12,
  },

  requestTitle: {
    minHeight: 38,

    fontSize: 11.5,
    lineHeight: 16,

    fontWeight: '700',

    color: '#1D2E4A',
  },

  requestDescription: {
    flex: 1,

    fontSize: 8.5,
    lineHeight: 12.5,

    color: '#7B8798',

    marginTop: 6,
  },

  requestArrow: {
    width: 33,
    height: 33,

    borderRadius: 17,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 9,
  },


  /* ========================================================
     NEWS
  ======================================================== */

  newsCard: {
    minHeight: 88,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    flexDirection: 'row',
    alignItems: 'center',

    overflow: 'hidden',

    marginBottom: 10,

    borderWidth: 1,
    borderColor: '#EEF2F7',

    shadowColor: '#344054',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 1,
  },

  newsAccent: {
    width: 4,
    alignSelf: 'stretch',
  },

  newsAccentBlue: {
    backgroundColor: '#428CE5',
  },

  newsAccentPurple: {
    backgroundColor: '#7956EE',
  },

  newsAccentGreen: {
    backgroundColor: '#43B581',
  },

  newsIcon: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 13,
  },

  newsIconBlue: {
    backgroundColor: '#EAF4FF',
  },

  newsIconPurple: {
    backgroundColor: '#F1ECFF',
  },

  newsIconGreen: {
    backgroundColor: '#E8F8F1',
  },

  newsBody: {
    flex: 1,

    paddingLeft: 12,
    paddingRight: 14,
    paddingVertical: 13,
  },

  newsTitle: {
    fontSize: 13,
    lineHeight: 18,

    fontWeight: '700',

    color: '#428CE5',
  },

  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 9,
  },

  newsDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  newsDate: {
    fontSize: 9.5,

    color: '#7B8798',

    marginLeft: 5,
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
    minHeight: 100,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: '#EEF2F7',
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
    minHeight: 100,

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