import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomNav from '../components/BottomNav';
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
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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

  const [loadingMore, setLoadingMore] = useState(false);

  const [totalCount, setTotalCount] = useState(0);

  const [pageNumber, setPageNumber] = useState(1);

  const [totalPage, setTotalPage] = useState(1);

  const [hasNextPage, setHasNextPage] = useState(false);

  const [searchText, setSearchText] = useState('');


  /* ============================================================
     NEWS API
  ============================================================ */

  const loadNews = async (page: number = 1) => {

    if (!token) {

      Alert.alert(
        'Анхааруулга',
        'Нэвтрэх мэдээлэл олдсонгүй.'
      );

      setLoading(false);

      return;
    }


    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }


    try {

      const response = await fetch(
        `${API_URL}/api/mobile/news?page=${page}&pageSize=10`,
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


      /* =========================
         TOKEN ERROR
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
         API ERROR
      ========================= */

      if (!response.ok) {

        throw new Error(
          data.message ||
            `Мэдээ авах үед алдаа гарлаа. HTTP ${response.status}`
        );
      }


      /* =========================
         NEWS ITEMS
      ========================= */

      const newItems: NewsItem[] =
        Array.isArray(data.items)
          ? data.items
          : [];


      if (page === 1) {

        setNews(newItems);

      } else {

        setNews((prev) => {

          /*
            Давхардсан newsId орохоос
            хамгаална.
          */

          const existingIds = new Set(
            prev.map(
              (item) => item.newsId
            )
          );


          const uniqueNewItems =
            newItems.filter(
              (item) =>
                !existingIds.has(
                  item.newsId
                )
            );


          return [
            ...prev,
            ...uniqueNewItems,
          ];
        });
      }


      /* =========================
         PAGINATION
      ========================= */

      setTotalCount(
        Number(data.totalCount) || 0
      );


      setPageNumber(
        Number(data.pageNumber) || page
      );


      setTotalPage(
        Number(data.totalPage) || 1
      );


      if (
        typeof data.hasNextPage ===
        'boolean'
      ) {

        setHasNextPage(
          data.hasNextPage
        );

      } else {

        const currentPage =
          Number(data.pageNumber) ||
          page;

        const pages =
          Number(data.totalPage) ||
          1;


        setHasNextPage(
          currentPage < pages
        );
      }


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

      if (page === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }

    }
  };


  /* ============================================================
     FIRST LOAD
  ============================================================ */

  useEffect(() => {

    loadNews(1);

  }, [token]);


  /* ============================================================
     LOAD MORE
  ============================================================ */

  const loadMore = () => {

    /*
      Хайлт хийж байгаа үед
      дараагийн page автоматаар татахгүй.
    */

    if (searchText.trim().length > 0) {
      return;
    }


    if (loadingMore) {
      return;
    }


    if (!hasNextPage) {
      return;
    }


    if (pageNumber >= totalPage) {
      return;
    }


    const nextPage =
      pageNumber + 1;


    loadNews(nextPage);
  };


  /* ============================================================
     SEARCH
  ============================================================ */

  const searchKeyword =
    searchText
      .trim()
      .toLowerCase();


  const filteredNews =
    news.filter((item) => {

      if (!searchKeyword) {
        return true;
      }


      const title =
        item.newsTitle
          ?.toLowerCase() || '';


      const author =
        item.newsAuthor
          ?.toLowerCase() || '';


      const date =
        item.newsPubDate
          ?.toLowerCase() || '';


      const folder =
        item.newsFolder
          ?.toLowerCase() || '';


      const department =
        item.cstmCd
          ?.toLowerCase() || '';


      return (
        title.includes(searchKeyword) ||
        author.includes(searchKeyword) ||
        date.includes(searchKeyword) ||
        folder.includes(searchKeyword) ||
        department.includes(searchKeyword)
      );
    });


  /* ============================================================
     NEWS DETAIL
  ============================================================ */

  const goNewsDetail = (
    item: NewsItem
  ) => {

    router.push({

      pathname: '/news-detail',

      params: {

        newsId:
          String(item.newsId),

        newsFileId:
          String(
            item.newsFileId || ''
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
    });
  };


  /* ============================================================
     NEWS ITEM
  ============================================================ */

  const renderNewsItem = ({
    item,
  }: {
    item: NewsItem;
  }) => {

    return (

      <TouchableOpacity
        style={styles.newsCard}
        activeOpacity={0.8}
        onPress={() =>
          goNewsDetail(item)
        }
      >

        {/* ЗҮҮН ШАР ЗУРААС */}

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


          {/* FOLDER */}

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

            <View
              style={styles.dateRow}
            >

              <Feather
                name="calendar"
                size={14}
                color="#657085"
              />

              <Text
                style={
                  styles.dateText
                }
              >
                {item.newsPubDate}
              </Text>

            </View>


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
    );
  };


  /* ============================================================
     LIST HEADER
  ============================================================ */

  const renderListHeader = () => {

    return (

      <View
        style={styles.listInfoRow}
      >

        {searchText
          .trim()
          .length > 0 ? (

          <Text
            style={
              styles.searchResultText
            }
          >
            {filteredNews.length} үр дүн
          </Text>

        ) : (

          <Text
            style={
              styles.loadedText
            }
          >
            {news.length} / {totalCount}
          </Text>

        )}


        {totalPage > 1 && (

          <Text
            style={styles.pageInfo}
          >
            {pageNumber} / {totalPage} хуудас
          </Text>

        )}

      </View>
    );
  };


  /* ============================================================
     LIST EMPTY
  ============================================================ */

  const renderEmpty = () => {

    if (
      searchText.trim().length > 0
    ) {

      return (

        <View
          style={styles.emptyBox}
        >

          <View
            style={
              styles.emptySearchIcon
            }
          >

            <Feather
              name="search"
              size={26}
              color="#98A2B3"
            />

          </View>


          <Text
            style={styles.emptyTitle}
          >
            Илэрц олдсонгүй
          </Text>


          <Text
            style={styles.emptyText}
          >
            Одоогоор татагдсан мэдээнүүдээс
            илэрц олдсонгүй.
          </Text>


          <TouchableOpacity
            style={
              styles.clearSearchButton
            }
            activeOpacity={0.8}
            onPress={() =>
              setSearchText('')
            }
          >

            <Text
              style={
                styles.clearSearchText
              }
            >
              Хайлтыг цэвэрлэх
            </Text>

          </TouchableOpacity>

        </View>
      );
    }


    return (

      <View
        style={styles.emptyBox}
      >

        <Feather
          name="file-text"
          size={35}
          color="#B0BAC8"
        />


        <Text
          style={styles.emptyText}
        >
          Мэдээ мэдээлэл байхгүй байна.
        </Text>

      </View>
    );
  };


  /* ============================================================
     LIST FOOTER
  ============================================================ */

  const renderFooter = () => {

    if (loadingMore) {

      return (

        <View
          style={
            styles.footerLoading
          }
        >

          <ActivityIndicator
            size="small"
            color="#428CE5"
          />

          <Text
            style={
              styles.footerLoadingText
            }
          >
            Дараагийн мэдээнүүдийг
            уншиж байна...
          </Text>

        </View>
      );
    }


    if (
      news.length > 0 &&
      !hasNextPage &&
      searchText.trim().length === 0
    ) {

      return (

        <View
          style={styles.endBox}
        >

          <View
            style={styles.endLine}
          />

          <Text
            style={styles.endText}
          >
            Бүх мэдээг харууллаа
          </Text>

          <View
            style={styles.endLine}
          />

        </View>
      );
    }


    return null;
  };


  /* ============================================================
     UI
  ============================================================ */

  return (

    <SafeAreaView
      style={styles.safeArea}
    >

      {/* ======================================================
          PROFILE
      ====================================================== */}

      <View
        style={styles.profileHeader}
      >

        <View
          style={styles.avatar}
        >

          <Feather
            name="user"
            size={33}
            color="#777777"
          />

        </View>


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


        <TouchableOpacity
          style={
            styles.notificationButton
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


      {/* ======================================================
          TITLE
      ====================================================== */}

      <View
        style={styles.pageTitleRow}
      >

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >

          <Feather
            name="arrow-left"
            size={22}
            color="#273248"
          />

        </TouchableOpacity>


        <Text
          style={styles.pageTitle}
        >
          Мэдээ мэдээлэл
        </Text>


        {!loading && (

          <Text
            style={styles.totalText}
          >
            {totalCount}
          </Text>

        )}

      </View>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      {!loading && (

        <View
          style={styles.searchWrapper}
        >

          <View
            style={styles.searchBox}
          >

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
              onChangeText={
                setSearchText
              }
              returnKeyType="search"
            />


            {searchText.length > 0 && (

              <TouchableOpacity
                style={
                  styles.clearButton
                }
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
          CONTENT
      ====================================================== */}

      {loading ? (

        <View
          style={
            styles.loadingContainer
          }
        >

          <ActivityIndicator
            size="large"
            color="#428CE5"
          />


          <Text
            style={styles.loadingText}
          >
            Мэдээ уншиж байна...
          </Text>

        </View>

      ) : (

        <FlatList
          style={styles.list}

          contentContainerStyle={
            styles.content
          }

          data={filteredNews}

          keyExtractor={(item) =>
            String(item.newsId)
          }

          renderItem={
            renderNewsItem
          }

          ListHeaderComponent={
            renderListHeader
          }

          ListEmptyComponent={
            renderEmpty
          }

          ListFooterComponent={
            renderFooter
          }

          showsVerticalScrollIndicator={
            false
          }

          keyboardShouldPersistTaps="handled"

          onEndReached={
            loadMore
          }

          onEndReachedThreshold={
            0.35
          }
        />

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

  list: {
    flex: 1,
    width: '100%',
  },


  content: {
    paddingHorizontal: 22,
    paddingTop: 4,

    /*
      BottomNav нь тусдаа component болсон тул
      өмнөх 110 хэрэггүй.
    */
    paddingBottom: 25,

    flexGrow: 1,
  },


  listInfoRow: {
    minHeight: 25,

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


  loadedText: {
    fontSize: 10,
    color: '#98A2B3',
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
    flex: 1,

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
    lineHeight: 18,

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
     LOAD MORE
  ======================================================== */

  footerLoading: {
    paddingVertical: 22,

    alignItems: 'center',
    justifyContent: 'center',
  },


  footerLoadingText: {
    marginTop: 8,

    fontSize: 10,

    color: '#98A2B3',
  },


  endBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: 22,
  },


  endLine: {
    width: 35,
    height: 1,

    backgroundColor: '#E4E7EC',
  },


  endText: {
    marginHorizontal: 10,

    fontSize: 10,

    color: '#98A2B3',
  },

});