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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../config/api';


/* ============================================================
   API TYPE
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


type NewsResponse = {
  pageNumber: number;
  totalPage: number;
  totalCount: number;
  items: NewsItem[];
};


/* ============================================================
   SCREEN
============================================================ */

export default function NewsScreen() {

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


  /* ============================================================
     STATE
  ============================================================ */

  const [news, setNews] = useState<NewsItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [totalCount, setTotalCount] = useState(0);

  const [pageNumber, setPageNumber] = useState(1);

  const [totalPage, setTotalPage] = useState(1);

  /* ХАЙЛТ */
  const [searchText, setSearchText] = useState('');


  /* ============================================================
     NEWS API
  ============================================================ */

  const loadNews = async () => {

    if (!token) {

      Alert.alert(
        'Анхааруулга',
        'Нэвтрэх мэдээлэл олдсонгүй.'
      );

      setLoading(false);

      return;
    }


    try {

      setLoading(true);


      const response = await fetch(
        `${API_URL}/api/mobile/news`,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );


      const text = await response.text();


      let data: NewsResponse | any = {};


      try {

        data = text
          ? JSON.parse(text)
          : {};

      } catch {

        throw new Error(
          'News API JSON бус хариу буцаалаа.'
        );

      }


      /* ================= 401 ================= */

      if (response.status === 401) {

        Alert.alert(
          'Нэвтрэх шаардлагатай',
          data.message ||
          'Нэвтрэх хугацаа дууссан байна.'
        );

        return;
      }


      /* ================= ERROR ================= */

      if (!response.ok) {

        throw new Error(
          data.message ||
          'Мэдээ авах үед алдаа гарлаа.'
        );

      }


      /* ================= SUCCESS ================= */

      setNews(
        Array.isArray(data.items)
          ? data.items
          : []
      );


      setTotalCount(
        data.totalCount || 0
      );


      setPageNumber(
        data.pageNumber || 1
      );


      setTotalPage(
        data.totalPage || 1
      );


    } catch (error) {

      console.error(
        'News API error:',
        error
      );


      Alert.alert(
        'Алдаа',
        'Мэдээ мэдээллийг серверээс авч чадсангүй.'
      );


    } finally {

      setLoading(false);

    }

  };


  /* ============================================================
     SCREEN OPEN
  ============================================================ */

  useEffect(() => {

    loadNews();

  }, []);


  /* ============================================================
     SEARCH
  ============================================================ */

  const searchKeyword =
    searchText
      .trim()
      .toLowerCase();


  const filteredNews = news.filter((item) => {

    /*
      Хайлтын талбар хоосон үед
      бүх мэдээг харуулна.
    */

    if (!searchKeyword) {
      return true;
    }


    const title =
      item.newsTitle?.toLowerCase() || '';

    const author =
      item.newsAuthor?.toLowerCase() || '';

    const date =
      item.newsPubDate?.toLowerCase() || '';

    const folder =
      item.newsFolder?.toLowerCase() || '';

    const department =
      item.cstmCd?.toLowerCase() || '';


    return (
      title.includes(searchKeyword) ||
      author.includes(searchKeyword) ||
      date.includes(searchKeyword) ||
      folder.includes(searchKeyword) ||
      department.includes(searchKeyword)
    );

  });


  /* ============================================================
     HOME
  ============================================================ */

  const goHome = () => {

    router.replace({
      pathname: '/home',

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

    <SafeAreaView style={styles.safeArea}>


      {/* ======================================================
          PROFILE
      ====================================================== */}

      <View style={styles.profileHeader}>


        <View style={styles.avatar}>

          <Feather
            name="user"
            size={33}
            color="#777777"
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
          style={styles.notificationButton}
          activeOpacity={0.7}
        >

          <Feather
            name="bell"
            size={29}
            color="#2E8BDD"
          />


          <View
            style={styles.notificationDot}
          />

        </TouchableOpacity>


      </View>


      {/* ======================================================
          TITLE
      ====================================================== */}

      <View style={styles.pageTitleRow}>


        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >

          <Feather
            name="arrow-left"
            size={22}
            color="#273248"
          />

        </TouchableOpacity>


        <Text style={styles.pageTitle}>
          Мэдээ мэдээлэл
        </Text>


        {!loading && (

          <Text style={styles.totalText}>
            {totalCount}
          </Text>

        )}


      </View>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      {!loading && (

        <View style={styles.searchWrapper}>

          <View style={styles.searchBox}>


            <Feather
              name="search"
              size={19}
              color="#98A2B3"
            />


            <TextInput
              style={styles.searchInput}
              placeholder="Мэдээ хайх..."
              placeholderTextColor="#98A2B3"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />


            {searchText.length > 0 && (

              <TouchableOpacity
                style={styles.clearButton}
                activeOpacity={0.7}
                onPress={() =>
                  setSearchText('')
                }
              >

                <Feather
                  name="x"
                  size={18}
                  color="#98A2B3"
                />

              </TouchableOpacity>

            )}


          </View>

        </View>

      )}


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <View style={styles.loadingContainer}>

          <ActivityIndicator
            size="large"
            color="#428CE5"
          />


          <Text style={styles.loadingText}>
            Мэдээ уншиж байна...
          </Text>

        </View>

      ) : (


        /* ====================================================
           NEWS LIST
        ==================================================== */

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >


          {/* PAGE INFO */}

          <View style={styles.listInfoRow}>

            {searchText.trim().length > 0 ? (

              <Text style={styles.searchResultText}>
                {filteredNews.length} үр дүн
              </Text>

            ) : (

              <View />

            )}


            {totalPage > 1 && (

              <Text style={styles.pageInfo}>
                {pageNumber} / {totalPage} хуудас
              </Text>

            )}

          </View>


          {/* =================================================
              API EMPTY
          ================================================= */}

          {news.length === 0 && (

            <View style={styles.emptyBox}>

              <Feather
                name="file-text"
                size={35}
                color="#B0BAC8"
              />


              <Text style={styles.emptyText}>
                Мэдээ мэдээлэл байхгүй байна.
              </Text>

            </View>

          )}


          {/* =================================================
              SEARCH EMPTY
          ================================================= */}

          {news.length > 0 &&
            searchText.trim().length > 0 &&
            filteredNews.length === 0 && (

              <View style={styles.emptyBox}>

                <View style={styles.emptySearchIcon}>

                  <Feather
                    name="search"
                    size={26}
                    color="#98A2B3"
                  />

                </View>


                <Text style={styles.emptyTitle}>
                  Илэрц олдсонгүй
                </Text>


                <Text style={styles.emptyText}>
                  Өөр түлхүүр үгээр хайж үзнэ үү.
                </Text>


                <TouchableOpacity
                  style={styles.clearSearchButton}
                  activeOpacity={0.8}
                  onPress={() =>
                    setSearchText('')
                  }
                >

                  <Text
                    style={styles.clearSearchText}
                  >
                    Хайлтыг цэвэрлэх
                  </Text>

                </TouchableOpacity>

              </View>

            )}


          {/* =================================================
              NEWS
          ================================================= */}

          {filteredNews.map((item) => (

            <TouchableOpacity
              key={item.newsId}

              style={styles.newsCard}

              activeOpacity={0.8}

              onPress={() =>
                router.push({

                  pathname:
                    '/news-detail',

                  params: {

                    newsId:
                      String(
                        item.newsId
                      ),

                    newsFileId:
                      String(
                        item.newsFileId
                      ),

                    userNm:
                      userNm || '',

                    cstmNm:
                      cstmNm || '',

                    userId:
                      userId || '',

                    token:
                      token || '',

                  },

                })
              }
            >


              {/* ЗҮҮН ШАР ШУГАМ */}

              <View
                style={styles.accentLine}
              />


              <View
                style={styles.newsBody}
              >


                {/* TITLE */}

                <Text
                  style={styles.newsTitle}
                  numberOfLines={2}
                >
                  {item.newsTitle}
                </Text>


                {/* DEPARTMENT */}

                {!!item.newsFolder &&
                  item.newsFolder !== '[]' && (

                    <Text
                      style={
                        styles.newsFolder
                      }
                      numberOfLines={1}
                    >
                      {item.newsFolder}
                    </Text>

                  )}


                {/* META */}

                <View
                  style={styles.newsBottom}
                >


                  {/* DATE */}

                  <View
                    style={styles.dateRow}
                  >

                    <Feather
                      name="calendar"
                      size={14}
                      color="#657085"
                    />


                    <Text
                      style={styles.dateText}
                    >
                      {item.newsPubDate}
                    </Text>

                  </View>


                  {/* AUTHOR */}

                  <Text
                    style={
                      styles.authorText
                    }
                    numberOfLines={1}
                  >
                    Үүсгэсэн:{' '}
                    {item.newsAuthor}
                  </Text>


                </View>


              </View>


            </TouchableOpacity>

          ))}


        </ScrollView>

      )}


      {/* ======================================================
          BOTTOM NAV
      ====================================================== */}

      <View style={styles.bottomNav}>


        {/* HOME */}

        <TouchableOpacity
          style={styles.navItem}
          onPress={goHome}
        >

          <Feather
            name="grid"
            size={24}
            color="#94A3B8"
          />


          <Text style={styles.navText}>
            Нүүр
          </Text>

        </TouchableOpacity>


        {/* REQUEST */}

        <TouchableOpacity
          style={styles.navItem}
        >

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
        >

          <Feather
            name="plus"
            size={31}
            color="#FFFFFF"
          />

        </TouchableOpacity>


        {/* NEWS ACTIVE */}

        <TouchableOpacity
          style={styles.navItem}
        >

          <Feather
            name="book-open"
            size={23}
            color="#428CE5"
          />


          <Text
            style={
              styles.activeNavText
            }
          >
            Мэдээ
          </Text>

        </TouchableOpacity>


        {/* PROFILE */}

        <TouchableOpacity
          style={styles.navItem}
        >

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


/* ============================================================
   STYLE
============================================================ */

const styles = StyleSheet.create({


  /* ========================================================
     PAGE
  ======================================================== */

  safeArea: {

    flex: 1,

    backgroundColor: '#FFFFFF',

  },


  /* ========================================================
     PROFILE
  ======================================================== */

  profileHeader: {

    minHeight: 125,

    paddingHorizontal: 27,

    paddingTop: 17,

    paddingBottom: 10,

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#FFFFFF',

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

    maxWidth: 210,

    marginTop: 5,

    fontSize: 10,

    lineHeight: 14,

    color: '#8B95A5',

  },


  /* ========================================================
     NOTIFICATION
  ======================================================== */

  notificationButton: {

    width: 48,

    height: 55,

    alignItems: 'center',

    justifyContent: 'center',

    position: 'relative',

  },


  notificationDot: {

    position: 'absolute',

    top: 5,

    right: 5,

    width: 10,

    height: 10,

    borderRadius: 5,

    backgroundColor: '#E94A4A',

    borderWidth: 2,

    borderColor: '#FFFFFF',

  },


  /* ========================================================
     TITLE
  ======================================================== */

  pageTitleRow: {

    height: 58,

    paddingHorizontal: 28,

    flexDirection: 'row',

    alignItems: 'center',

  },


  backButton: {

    width: 30,

    height: 40,

    justifyContent: 'center',

    marginRight: 3,

  },


  pageTitle: {

    flex: 1,

    fontSize: 18,

    fontWeight: '500',

    color: '#273248',

  },


  totalText: {

    minWidth: 30,

    textAlign: 'center',

    backgroundColor: '#EDF5FF',

    color: '#428CE5',

    fontSize: 11,

    fontWeight: '600',

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 12,

  },


  /* ========================================================
     SEARCH
  ======================================================== */

  searchWrapper: {

    paddingHorizontal: 22,

    paddingBottom: 12,

  },


  searchBox: {

    height: 46,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 14,

    backgroundColor: '#F7F9FC',

    borderWidth: 1,

    borderColor: '#E1E7EF',

    borderRadius: 13,

  },


  searchInput: {

    flex: 1,

    height: 44,

    marginLeft: 10,

    paddingVertical: 0,

    fontSize: 13,

    color: '#273248',

    outlineStyle: 'none',

  } as any,


  clearButton: {

    width: 30,

    height: 30,

    alignItems: 'center',

    justifyContent: 'center',

    marginLeft: 4,

  },


  /* ========================================================
     LOADING
  ======================================================== */

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


  /* ========================================================
     LIST
  ======================================================== */

  scroll: {

    flex: 1,

    width: '100%',

  },


  content: {

    paddingHorizontal: 22,

    paddingTop: 4,

    paddingBottom: 110,

  },


  listInfoRow: {

    minHeight: 20,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 6,

  },


  pageInfo: {

    fontSize: 10,

    color: '#98A2B3',

  },


  searchResultText: {

    fontSize: 10,

    color: '#667085',

  },


  /* ========================================================
     NEWS CARD
  ======================================================== */

  newsCard: {

    width: '100%',

    minHeight: 90,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#E0E5EC',

    borderRadius: 12,

    flexDirection: 'row',

    overflow: 'hidden',

    marginBottom: 9,

  },


  accentLine: {

    width: 3,

    backgroundColor: '#F3A600',

  },


  newsBody: {

    flex: 1,

    paddingHorizontal: 16,

    paddingVertical: 13,

  },


  newsTitle: {

    fontSize: 14.5,

    lineHeight: 20,

    fontWeight: '700',

    color: '#428CE5',

  },


  newsFolder: {

    marginTop: 5,

    fontSize: 9.5,

    color: '#98A2B3',

  },


  newsBottom: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginTop: 12,

  },


  dateRow: {

    flexDirection: 'row',

    alignItems: 'center',

  },


  dateText: {

    marginLeft: 7,

    fontSize: 10,

    color: '#667085',

  },


  authorText: {

    maxWidth: '53%',

    fontSize: 10,

    color: '#667085',

  },


  /* ========================================================
     EMPTY
  ======================================================== */

  emptyBox: {

    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical: 70,

  },


  emptySearchIcon: {

    width: 58,

    height: 58,

    borderRadius: 29,

    backgroundColor: '#F4F7FB',

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 12,

  },


  emptyTitle: {

    fontSize: 14,

    fontWeight: '600',

    color: '#344054',

    marginBottom: 5,

  },


  emptyText: {

    marginTop: 5,

    fontSize: 12,

    color: '#98A2B3',

    textAlign: 'center',

  },


  clearSearchButton: {

    marginTop: 16,

    paddingHorizontal: 16,

    paddingVertical: 9,

    backgroundColor: '#EDF5FF',

    borderRadius: 9,

  },


  clearSearchText: {

    fontSize: 11,

    fontWeight: '600',

    color: '#428CE5',

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

  },


  navItem: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

  },


  navText: {

    marginTop: 5,

    fontSize: 9,

    color: '#94A3B8',

  },


  activeNavText: {

    marginTop: 5,

    fontSize: 9,

    fontWeight: '600',

    color: '#428CE5',

  },


  plusButton: {

    width: 55,

    height: 55,

    borderRadius: 28,

    backgroundColor: '#428CE5',

    alignItems: 'center',

    justifyContent: 'center',

    marginHorizontal: 9,

  },

});