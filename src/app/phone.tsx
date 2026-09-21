import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import BottomNav from '../components/BottomNav';
import { API_URL } from '../config/api';


type UserItem = {
  userId: string;
  userNm: string;
  cstmNm: string;
  cellPhoneNo: string;
  telNo: string;
  email: string;
};

type UserResponse = {
  pageNumber: number;
  totalPage: number;
  totalCount: number;
  hasNextPage: boolean;
  items: UserItem[];
};


export default function PhoneScreen() {

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


  const [users, setUsers] = useState<UserItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);

  const [totalPage, setTotalPage] = useState(1);

  const [hasNextPage, setHasNextPage] = useState(false);

  const [nameSearch, setNameSearch] = useState('');

  const [phoneSearch, setPhoneSearch] = useState('');


  /* ============================================================
     API
  ============================================================ */

  const loadUsers = async (
    page: number = 1,
    name: string = nameSearch,
    phone: string = phoneSearch
  ) => {

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

      let url =
        `${API_URL}/api/mobile/users?page=${page}&pageSize=10`;


      if (name.trim()) {

        url +=
          `&userNm=${encodeURIComponent(name.trim())}`;

      }


      if (phone.trim()) {

        url +=
          `&cellPhoneNo=${encodeURIComponent(phone.trim())}`;

      }


      const response = await fetch(
        url,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );


      const text = await response.text();

      let data: UserResponse | any = {};


      try {

        data = text
          ? JSON.parse(text)
          : {};

      } catch {

        throw new Error(
          'Сервер JSON бус хариу буцаалаа.'
        );

      }


      if (response.status === 401) {

        Alert.alert(
          'Нэвтрэх шаардлагатай',
          data.message ||
            'Нэвтрэх хугацаа дууссан байна.'
        );

        return;
      }


      if (!response.ok) {

        throw new Error(
          data.message ||
            `HTTP ${response.status}`
        );

      }


      const newItems: UserItem[] =
        Array.isArray(data.items)
          ? data.items
          : [];


      if (page === 1) {

        setUsers(newItems);

      } else {

        setUsers((prev) => {

          const ids = new Set(
            prev.map((item) => item.userId)
          );


          const uniqueItems =
            newItems.filter(
              (item) =>
                !ids.has(item.userId)
            );


          return [
            ...prev,
            ...uniqueItems,
          ];

        });

      }


      const currentPage =
        Number(data.pageNumber) || page;

      const pages =
        Number(data.totalPage) || 1;


      setPageNumber(currentPage);

      setTotalPage(pages);


      if (
        typeof data.hasNextPage === 'boolean'
      ) {

        setHasNextPage(
          data.hasNextPage
        );

      } else {

        setHasNextPage(
          currentPage < pages
        );

      }


    } catch (error) {

      console.error(
        'User List API error:',
        error
      );


      Alert.alert(
        'Алдаа',
        'Утасны жагсаалтыг авч чадсангүй.'
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

    loadUsers(1, '', '');

  }, [token]);


  /* ============================================================
     SEARCH
  ============================================================ */

  useEffect(() => {

    const timer = setTimeout(() => {

      loadUsers(
        1,
        nameSearch,
        phoneSearch
      );

    }, 500);


    return () =>
      clearTimeout(timer);

  }, [
    nameSearch,
    phoneSearch,
  ]);


  /* ============================================================
     LOAD MORE
  ============================================================ */

  const loadMore = () => {

    if (loading) return;

    if (loadingMore) return;

    if (!hasNextPage) return;

    if (pageNumber >= totalPage) return;


    loadUsers(
      pageNumber + 1,
      nameSearch,
      phoneSearch
    );

  };


  /* ============================================================
     PHONE
  ============================================================ */

  const callPhone = async (
    phone?: string
  ) => {

    if (!phone) return;


    try {

      await Linking.openURL(
        `tel:${phone}`
      );

    } catch {

      Alert.alert(
        'Алдаа',
        'Дуудлага хийх боломжгүй байна.'
      );

    }

  };


  /* ============================================================
     EMAIL
  ============================================================ */

  const sendEmail = async (
    email?: string
  ) => {

    if (!email) return;


    try {

      await Linking.openURL(
        `mailto:${email}`
      );

    } catch {

      Alert.alert(
        'Алдаа',
        'И-мэйл нээх боломжгүй байна.'
      );

    }

  };


  /* ============================================================
     INITIAL
  ============================================================ */

  const getInitials = (
    name?: string
  ) => {

    if (!name) return 'Х';


    const value = name.trim();

    const parts = value.split('.');


    if (parts.length >= 2) {

      const first =
        parts[0]
          ?.trim()
          .charAt(0);

      const second =
        parts
          .slice(1)
          .join('.')
          .trim()
          .charAt(0);


      return `${first || ''}${second || ''}`.toUpperCase();

    }


    return value
      .substring(0, 2)
      .toUpperCase();

  };


  /* ============================================================
     AVATAR
  ============================================================ */

  const avatarBackgrounds = [
    '#E5F6F8',
    '#EEECFF',
    '#E5F6EF',
    '#FBEAF4',
    '#FFF0E2',
  ];

  const avatarColors = [
    '#4895A3',
    '#7366E5',
    '#48967B',
    '#B44580',
    '#A86B37',
  ];


  /* ============================================================
     USER CARD
  ============================================================ */

  const renderUser = ({
    item,
    index,
  }: {
    item: UserItem;
    index: number;
  }) => {

    const avatarIndex =
      index % avatarBackgrounds.length;


    return (

      <View style={styles.userCard}>

        {/* TOP */}

        <View style={styles.topRow}>

          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  avatarBackgrounds[
                    avatarIndex
                  ],
              },
            ]}
          >

            <Text
              style={[
                styles.avatarText,
                {
                  color:
                    avatarColors[
                      avatarIndex
                    ],
                },
              ]}
            >
              {getInitials(item.userNm)}
            </Text>

          </View>


          <View style={styles.userInfo}>

            <Text
              style={styles.userName}
              numberOfLines={1}
            >
              {item.userNm || '-'}
            </Text>


            <View
              style={styles.departmentPill}
            >

              <Text
                style={styles.departmentText}
                numberOfLines={1}
              >
                {item.cstmNm || '-'}
              </Text>

            </View>

          </View>

        </View>


        {/* CONTACT */}

        <View style={styles.contactRow}>

          {!!item.cellPhoneNo && (

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() =>
                callPhone(
                  item.cellPhoneNo
                )
              }
            >

              <Feather
                name="phone"
                size={12}
                color="#428CE5"
              />

              <Text
                style={styles.contactText}
                numberOfLines={1}
              >
                {item.cellPhoneNo}
              </Text>

            </TouchableOpacity>

          )}


          {!!item.telNo && (

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() =>
                callPhone(
                  item.telNo
                )
              }
            >

              <Feather
                name="smartphone"
                size={12}
                color="#428CE5"
              />

              <Text
                style={styles.contactText}
                numberOfLines={1}
              >
                {item.telNo}
              </Text>

            </TouchableOpacity>

          )}


          {!!item.email && (

            <TouchableOpacity
              style={[
                styles.contactItem,
                styles.emailItem,
              ]}
              onPress={() =>
                sendEmail(item.email)
              }
            >

              <Feather
                name="mail"
                size={12}
                color="#428CE5"
              />

              <Text
                style={styles.contactText}
                numberOfLines={1}
              >
                {item.email}
              </Text>

            </TouchableOpacity>

          )}

        </View>

      </View>

    );

  };


  /* ============================================================
     UI
  ============================================================ */

  return (

    <SafeAreaView style={styles.safeArea}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >

          <Feather
            name="chevron-left"
            size={26}
            color="#263650"
          />

        </TouchableOpacity>


        <Text style={styles.headerTitle}>
          Утасны жагсаалт
        </Text>

      </View>


      {/* SEARCH */}

      <View style={styles.searchSection}>

        <View style={styles.searchBox}>

          <Feather
            name="search"
            size={18}
            color="#7D9AC7"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Хэрэглэгчийн нэрээр хайх"
            placeholderTextColor="#9AA5B6"
            value={nameSearch}
            onChangeText={setNameSearch}
          />

        </View>


        <View style={styles.searchBox}>

          <Feather
            name="search"
            size={18}
            color="#7D9AC7"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Утасны дугаараар хайх"
            placeholderTextColor="#9AA5B6"
            value={phoneSearch}
            onChangeText={setPhoneSearch}
            keyboardType="phone-pad"
          />

        </View>

      </View>


      {/* LIST */}

      {loading ? (

        <View style={styles.loadingBox}>

          <ActivityIndicator
            size="large"
            color="#428CE5"
          />

        </View>

      ) : (

        <FlatList
          data={users}

          keyExtractor={(item) =>
            item.userId
          }

          renderItem={renderUser}

          contentContainerStyle={
            styles.listContent
          }

          showsVerticalScrollIndicator={
            false
          }

          keyboardShouldPersistTaps="handled"

          onEndReached={loadMore}

          onEndReachedThreshold={0.35}

          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={styles.footerLoader}
                size="small"
                color="#428CE5"
              />
            ) : null
          }

          ListEmptyComponent={

            <View style={styles.emptyBox}>

              <Text style={styles.emptyText}>
                Хэрэглэгч олдсонгүй
              </Text>

            </View>

          }
        />

      )}


      {/* BOTTOM NAV */}

      <BottomNav
        active="phone"
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
    backgroundColor: '#F6F8FC',
  },


  /* ========================================================
     HEADER
  ======================================================== */

  header: {
    height: 68,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 28,

    backgroundColor: '#F6F8FC',
  },


  backButton: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,

    shadowColor: '#344054',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 1,
  },


  headerTitle: {
    fontSize: 19,
    fontWeight: '700',

    color: '#1F3557',

    letterSpacing: -0.2,
  },


  /* ========================================================
     SEARCH
  ======================================================== */

  searchSection: {
    paddingHorizontal: 30,

    paddingTop: 5,
    paddingBottom: 22,
  },


  searchBox: {
    height: 44,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    borderWidth: 1,
    borderColor: '#EDF1F7',

    paddingHorizontal: 15,

    marginBottom: 11,

    shadowColor: '#43648C',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 1,
  },


  searchInput: {
    flex: 1,

    height: 44,

    marginLeft: 11,

    paddingVertical: 0,

    fontSize: 12,

    color: '#27364F',

    outlineStyle: 'none',
  } as any,


  /* ========================================================
     LIST
  ======================================================== */

  listContent: {
    paddingHorizontal: 30,

    paddingTop: 2,
    paddingBottom: 28,
  },


  /* ========================================================
     USER CARD
  ======================================================== */

  userCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    borderWidth: 1,
    borderColor: '#F0F3F8',

    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 13,

    marginBottom: 11,

    shadowColor: '#344054',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.045,
    shadowRadius: 9,

    elevation: 1,
  },


  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  /* ========================================================
     AVATAR
  ======================================================== */

  avatar: {
    width: 44,
    height: 44,

    borderRadius: 22,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },


  avatarText: {
    fontSize: 13,
    fontWeight: '700',

    letterSpacing: 0.2,
  },


  /* ========================================================
     USER INFORMATION
  ======================================================== */

  userInfo: {
    flex: 1,
  },


  userName: {
    fontSize: 13.5,
    fontWeight: '700',

    color: '#1E3558',

    marginBottom: 6,
  },


  /* ========================================================
     DEPARTMENT
  ======================================================== */

  departmentPill: {
    alignSelf: 'flex-start',

    maxWidth: '95%',

    backgroundColor: '#F3F6FA',

    borderRadius: 10,

    paddingHorizontal: 9,
    paddingVertical: 5,
  },


  departmentText: {
    fontSize: 8.5,
    lineHeight: 11,

    color: '#7C899D',
  },


  /* ========================================================
     CONTACT
  ======================================================== */

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginLeft: 56,
    marginTop: 11,
  },


  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',

    marginRight: 20,

    minWidth: 82,
  },


  emailItem: {
    flex: 1,

    minWidth: 0,
    marginRight: 0,
  },


  contactText: {
    marginLeft: 6,

    fontSize: 9.5,

    color: '#607089',
  },


  /* ========================================================
     LOADING
  ======================================================== */

  loadingBox: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },


  footerLoader: {
    marginVertical: 20,
  },


  /* ========================================================
     EMPTY
  ======================================================== */

  emptyBox: {
    paddingVertical: 60,

    alignItems: 'center',
  },


  emptyText: {
    fontSize: 12,

    color: '#98A2B3',
  },

});