import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomNav from '../components/BottomNav';
import { API_URL } from '../config/api';
import {
  AttendanceType,
  checkAttendance,
  checkZone,
  ZONE_MESSAGES,
  ZoneStatus,
} from '../services/location';


/* =====================================================
   TYPES
===================================================== */

type TimTimeItem = {
  dateNo: string;
  date: string;

  dayOfNo: string;
  dayOfWeekNm: string;

  isWeekend: boolean;

  badgeNo?: string;
  fullName?: string;
  userPociNm?: string;
  cstmNm?: string;

  breakId?: number | string | null;
  breakType?: string | null;
  breakTypeNm?: string | null;

  comeIn?: string | null;
  goneOn?: string | null;

  worked?: string | null;

  iluu?: string | null;
  hotsrolt?: string | null;
  taslalt?: string | null;
};


type TimTimeSummary = {
  totIluu: number;
  totHotsrolt: number;
  totTaslalt: number;
  shortage: number;
};


type TimTimeResponse = {
  pageNumber: number;
  totalPage: number;
  totalCount: number;
  hasNextPage: boolean;

  startDate: string;
  endDate: string;

  summary: TimTimeSummary;

  items: TimTimeItem[];
};


/* =====================================================
   DATE FUNCTIONS
===================================================== */

const formatApiDate = (date: Date) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}${month}${day}`;
};


const formatDisplayDate = (date: Date) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}.${month}.${day}`;
};


/*
  "2026/10/02", "2026-10-02T00:00:00", "20261002"
  гэх мэт ямар ч форматыг "20261002" болгоно.
*/
const toDateKey = (
  value?: string | null
) =>
  (value || '')
    .replace(/\D/g, '')
    .slice(0, 8);


/* =====================================================
   WEEK RANGE
===================================================== */

const getWeekRange = (baseDate: Date) => {
  const date = new Date(baseDate);

  const day = date.getDay();

  const diffToMonday =
    day === 0
      ? -6
      : 1 - day;

  const start = new Date(date);

  start.setDate(
    date.getDate() + diffToMonday
  );

  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  end.setDate(
    start.getDate() + 6
  );

  end.setHours(
    23,
    59,
    59,
    999
  );

  return {
    start,
    end,
  };
};


/* =====================================================
   SCREEN
===================================================== */

export default function AttendanceScreen() {

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


  /* ===================================================
     STATE
  =================================================== */

  const [selectedDate, setSelectedDate] =
    useState(new Date());


  const [items, setItems] =
    useState<TimTimeItem[]>([]);


  const [summary, setSummary] =
    useState<TimTimeSummary>({
      totIluu: 0,
      totHotsrolt: 0,
      totTaslalt: 0,
      shortage: 0,
    });


  const [loading, setLoading] =
    useState(true);


  const [refreshing, setRefreshing] =
    useState(false);


  // Аль товч дээр хүсэлт явж байгааг заана
  const [checking, setChecking] =
    useState<AttendanceType | null>(null);


  // Ажлын бүс дотор эсэх ('checking' = шалгаж байна)
  const [zoneStatus, setZoneStatus] =
    useState<ZoneStatus | 'checking'>('checking');


  const weekRange =
    getWeekRange(selectedDate);


  /* ===================================================
     TODAY
  =================================================== */

  const today = new Date();

  const todayKey =
    formatApiDate(today);


  // Сонгосон 7 хоногт өнөөдөр багтаж байгаа эсэх
  const isCurrentWeek =
    todayKey >= formatApiDate(weekRange.start) &&
    todayKey <= formatApiDate(weekRange.end);


  const todayItem =
    isCurrentWeek
      ? items.find(
          item =>
            toDateKey(item.date) === todayKey ||
            toDateKey(item.dateNo) === todayKey
        )
      : undefined;


  const alreadyCameIn =
    Boolean(todayItem?.comeIn);


  /* ===================================================
     API
  =================================================== */

  const loadAttendance =
    useCallback(async () => {

      if (!token) {

        Alert.alert(
          'Анхааруулга',
          'Нэвтрэх мэдээлэл олдсонгүй.'
        );

        setLoading(false);
        setRefreshing(false);

        return;
      }


      try {

        const startDate =
          formatApiDate(
            weekRange.start
          );


        const endDate =
          formatApiDate(
            weekRange.end
          );


        const url =
          `${API_URL}/api/mobile/timtime` +
          `?page=1` +
          `&pageSize=31` +
          `&startDate=${startDate}` +
          `&endDate=${endDate}`;


        const response =
          await fetch(
            url,
            {
              method: 'GET',

              headers: {
                Accept:
                  'application/json',

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        let data: any = null;


        try {

          data =
            await response.json();

        } catch {

          data = null;

        }


        if (!response.ok) {

          if (
            response.status === 401
          ) {

            Alert.alert(
              'Нэвтрэх хугацаа дууссан',
              data?.message ||
                'Дахин нэвтэрнэ үү.'
            );

            return;
          }


          throw new Error(
            data?.message ||
              `HTTP ${response.status}`
          );
        }


        const result =
          data as TimTimeResponse;


        setItems(
          Array.isArray(result.items)
            ? result.items
            : []
        );


        setSummary({
          totIluu:
            Number(
              result.summary?.totIluu
            ) || 0,

          totHotsrolt:
            Number(
              result.summary?.totHotsrolt
            ) || 0,

          totTaslalt:
            Number(
              result.summary?.totTaslalt
            ) || 0,

          shortage:
            Number(
              result.summary?.shortage
            ) || 0,
        });

      } catch (error) {

        console.error(
          'TimTime API error:',
          error
        );


        Alert.alert(
          'Алдаа',
          'Цаг бүртгэлийн мэдээлэл авахад алдаа гарлаа.'
        );

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    }, [
      token,
      weekRange.start.getTime(),
      weekRange.end.getTime(),
    ]);


  /* ===================================================
     LOAD
  =================================================== */

  useEffect(() => {

    setLoading(true);

    loadAttendance();

  }, [loadAttendance]);


  /* ===================================================
     REFRESH
  =================================================== */

  const onRefresh = () => {

    setRefreshing(true);

    loadAttendance();

  };


  /* ===================================================
     АЖЛЫН БҮС ШАЛГАХ
  =================================================== */

  const refreshZone =
    useCallback(async (): Promise<ZoneStatus> => {

      if (!token) {

        setZoneStatus('error');

        return 'error';
      }


      const status =
        await checkZone(token);


      setZoneStatus(status);

      return status;

    }, [token]);


  /*
    Дэлгэц нээгдэх бүрт шалгаад,
    нээлттэй байх хугацаанд 1 минут тутам шинэчилнэ.
    Дэлгэцээс гарахад зогсоно.
  */

  useFocusEffect(
    useCallback(() => {

      refreshZone();


      const timer =
        setInterval(
          refreshZone,
          60 * 1000
        );


      return () =>
        clearInterval(timer);

    }, [refreshZone])
  );


  const isInside =
    zoneStatus === 'inside';


  const getZoneText = () => {

    if (zoneStatus === 'checking') {
      return 'Байршил шалгаж байна...';
    }

    if (zoneStatus === 'inside') {
      return 'Та ажлын бүсэд байна';
    }

    return ZONE_MESSAGES[zoneStatus].title;

  };


  /* ===================================================
     ИРЛЭЭ / ЯВЛАА
  =================================================== */

  const handleCheck = async (
    type: AttendanceType
  ) => {

    if (!token) {

      Alert.alert(
        'Анхааруулга',
        'Нэвтрэх мэдээлэл олдсонгүй.'
      );

      return;
    }


    if (checking) {
      return;
    }


    setChecking(type);


    try {

      /*
        Сүүлийн шалгалтаар бүсэд байгаагүй бол
        (дөнгөж ирсэн байж магадгүй) дахин шалгана.
      */

      let zone: ZoneStatus | 'checking' =
        zoneStatus;


      if (zone !== 'inside') {

        zone =
          await refreshZone();

      }


      if (zone !== 'inside') {

        const info =
          ZONE_MESSAGES[
            zone as Exclude<ZoneStatus, 'inside'>
          ];


        Alert.alert(
          info.title,
          info.message
        );

        return;
      }


      const result =
        await checkAttendance(
          token,
          type
        );


      if (!result.ok) {

        Alert.alert(
          'Бүртгэгдсэнгүй',
          result.message
        );

        return;
      }


      Alert.alert(
        type === 'IN'
          ? 'Ирсэн цаг бүртгэгдлээ'
          : 'Явсан цаг бүртгэгдлээ',
        result.time
          ? `Бүртгэгдсэн цаг: ${result.time}`
          : result.message
      );


      // Өнөөдрийн мөрийг шинэчилж харуулах
      if (isCurrentWeek) {

        setRefreshing(true);

        loadAttendance();

      } else {

        // Өөр 7 хоног харж байсан бол
        // өнөөдөр рүү буцаана (useEffect дахин татна)
        setSelectedDate(new Date());

      }

    } finally {

      setChecking(null);

    }

  };


  /* ===================================================
     PREVIOUS WEEK
  =================================================== */

  const previousWeek = () => {

    const previous =
      new Date(selectedDate);


    previous.setDate(
      previous.getDate() - 7
    );


    setSelectedDate(previous);

  };


  /* ===================================================
     NEXT WEEK
  =================================================== */

  const nextWeek = () => {

    const next =
      new Date(selectedDate);


    next.setDate(
      next.getDate() + 7
    );


    setSelectedDate(next);

  };


  /* ===================================================
     STATUS
  =================================================== */

  /*
    ЗӨВХӨН "ТАСАЛСАН" ТӨРӨЛ УЛААН
  */

  const isAbsent = (
    item: TimTimeItem
  ) => {

    const typeName =
      (item.breakTypeNm || '')
        .trim()
        .toUpperCase();


    return typeName === 'ТАСАЛСАН';

  };


  /*
    ТАСАЛСАН-аас бусад бүх төрөл:

    - ГЕГ-ЫН ДАРГЫН ТУШААЛААР ЧӨЛӨӨТЭЙ
    - АКТ
    - ЦАХИМААР АЖИЛЛАХ
    - ЭБНБД ЧӨЛӨӨ
    - ТОМИЛОЛТ
    - ЭЭЛЖИЙН АМРАЛТ
    - ХУРАЛ, ЗӨВЛӨГӨӨН, ХЭЛЭЛЦҮҮЛЭГ
    - ЖИРЭМСНИЙ БОЛОН АМАРЖСАНЫ АМРАЛТ
    - ГАЗАР, ХОРООНЫ ДАРГЫН ЧӨЛӨӨ
    - БУСАД
    - ХУРЛЫН ӨРӨӨ ХҮСЭЛТ
    гэх мэт

    бүгд цэнхэр.
  */

  const hasSpecialType = (
    item: TimTimeItem
  ) => {

    if (isAbsent(item)) {
      return false;
    }


    return Boolean(
      item.breakTypeNm &&
      item.breakTypeNm.trim()
    );

  };


  /* ===================================================
     CARD BACKGROUND
  =================================================== */

  const getCardColor = (
    item: TimTimeItem
  ) => {

    // 🔴 ТАСАЛСАН
    if (isAbsent(item)) {

      return '#FFF0F0';

    }


    // 🟡 АМРАЛТЫН ӨДӨР
    if (item.isWeekend) {

      return '#FFF8E8';

    }


    // 🔵 БУСАД БҮХ ТӨРӨЛ
    if (hasSpecialType(item)) {

      return '#EEF5FF';

    }


    // 🟢 ЭНГИЙН АЖЛЫН ӨДӨР
    return '#F0F9F4';

  };


  /* ===================================================
     LEFT ACCENT COLOR
  =================================================== */

  const getAccentColor = (
    item: TimTimeItem
  ) => {

    // 🔴 ТАСАЛСАН
    if (isAbsent(item)) {

      return '#E96868';

    }


    // 🟡 АМРАЛТЫН ӨДӨР
    if (item.isWeekend) {

      return '#F0B83D';

    }


    // 🔵 БУСАД БҮХ ТӨРӨЛ
    if (hasSpecialType(item)) {

      return '#6C9FE8';

    }


    // 🟢 АЖЛЫН ӨДӨР
    return '#55B77A';

  };


  /* ===================================================
     TYPE TEXT
  =================================================== */

  const getTypeText = (
    item: TimTimeItem
  ) => {

    // ТАСАЛСАН
    if (isAbsent(item)) {

      return 'Тасалсан';

    }


    // АМРАЛТЫН ӨДӨР
    if (item.isWeekend) {

      return 'Амралтын өдөр';

    }


    // БУСАД ТӨРӨЛ
    if (item.breakTypeNm) {

      return item.breakTypeNm;

    }


    return '';

  };


  /* ===================================================
     TYPE TEXT COLOR
  =================================================== */

  const getTypeTextColor = (
    item: TimTimeItem
  ) => {

    // 🔴 ТАСАЛСАН
    if (isAbsent(item)) {

      return '#D85858';

    }


    // 🟡 АМРАЛТЫН ӨДӨР
    if (item.isWeekend) {

      return '#B98720';

    }


    // 🔵 БУСАД ТӨРӨЛ
    if (hasSpecialType(item)) {

      return '#4C83D1';

    }


    return '#65758C';

  };


  /* ===================================================
     DISPLAY HELPERS
  =================================================== */

  const displayTime = (
    value?: string | null
  ) => {

    if (!value) {

      return '—';

    }


    return value;

  };


  const displayNumber = (
    value?: string | null
  ) => {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {

      return '0';

    }


    return value;

  };


  /* ===================================================
     WORKED DAYS
  =================================================== */

  const workedDays =
    items.filter(
      item => {

        /*
          Амралтын өдөр биш
          Тусгай төрөл биш
          Тасалсан биш
          Ирсэн эсвэл явсан цагтай
        */

        return (
          !item.isWeekend &&
          !hasSpecialType(item) &&
          !isAbsent(item) &&
          Boolean(
            item.comeIn ||
            item.goneOn
          )
        );

      }
    ).length;


  /* ===================================================
     RENDER
  =================================================== */

  return (

    <SafeAreaView
      style={styles.safeArea}
    >


      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() =>
            router.back()
          }
        >

          <Feather
            name="chevron-left"
            size={25}
            color="#253653"
          />

        </TouchableOpacity>


        <Text
          style={styles.headerTitle}
        >
          Миний цаг бүртгэл
        </Text>

      </View>


      {/* ================= WEEK ================= */}

      <View
        style={styles.weekWrapper}
      >

        <View
          style={styles.weekCard}
        >

          {/* ӨМНӨХ */}

          <TouchableOpacity
            style={styles.weekArrow}
            activeOpacity={0.7}
            onPress={previousWeek}
          >

            <Feather
              name="chevron-left"
              size={18}
              color="#8190A5"
            />

          </TouchableOpacity>


          {/* ОГНОО */}

          <View
            style={styles.weekCenter}
          >

            <Text
              style={styles.weekLabel}
            >
              7 хоног
            </Text>


            <Text
              style={styles.weekDate}
            >

              {formatDisplayDate(
                weekRange.start
              )}

              {' - '}

              {formatDisplayDate(
                weekRange.end
              )}

            </Text>

          </View>


          {/* ДАРААГИЙН */}

          <TouchableOpacity
            style={styles.weekArrow}
            activeOpacity={0.7}
            onPress={nextWeek}
          >

            <Feather
              name="chevron-right"
              size={18}
              color="#8190A5"
            />

          </TouchableOpacity>

        </View>

      </View>


      {/* ================= SUMMARY ================= */}

      <View
        style={styles.summaryRow}
      >

        {/* АЖИЛЛАСАН */}

        <View
          style={styles.summaryItem}
        >

          <Text
            style={styles.summaryNumber}
          >
            {workedDays}
          </Text>


          <Text
            style={styles.summaryLabel}
          >
            Ажилласан
          </Text>

        </View>


        <View
          style={styles.summaryDivider}
        />


        {/* ХОЦРОЛТ */}

        <View
          style={styles.summaryItem}
        >

          <Text
            style={styles.summaryNumber}
          >
            {summary.totHotsrolt}
          </Text>


          <Text
            style={styles.summaryLabel}
          >
            Хоцролт
          </Text>

        </View>


        <View
          style={styles.summaryDivider}
        />


        {/* ИЛҮҮ */}

        <View
          style={styles.summaryItem}
        >

          <Text
            style={styles.summaryNumber}
          >
            {summary.totIluu}
          </Text>


          <Text
            style={styles.summaryLabel}
          >
            Илүү цаг
          </Text>

        </View>

      </View>


      {/* ================= TABLE HEADER ================= */}

      <View
        style={styles.tableHeader}
      >

        <View
          style={styles.dayColumn}
        >

          <Text
            style={styles.headerText}
          >
            Өдөр
          </Text>

        </View>


        <View
          style={styles.typeColumn}
        >

          <Text
            style={styles.headerText}
          >
            Төрөл
          </Text>

        </View>


        <View
          style={styles.timeColumn}
        >

          <Text
            style={styles.headerText}
          >
            Ирсэн
          </Text>

        </View>


        <View
          style={styles.timeColumn}
        >

          <Text
            style={styles.headerText}
          >
            Явсан
          </Text>

        </View>


        <View
          style={styles.numberColumn}
        >

          <Text
            style={styles.headerText}
          >
            Илүү
          </Text>


          <Text
            style={styles.headerSubText}
          >
            мин
          </Text>

        </View>


        <View
          style={styles.numberColumn}
        >

          <Text
            style={styles.headerText}
          >
            Хоцролт
          </Text>


          <Text
            style={styles.headerSubText}
          >
            мин
          </Text>

        </View>

      </View>


      {/* ================= LOADING ================= */}

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
            Цаг бүртгэл татаж байна...
          </Text>

        </View>

      ) : (


        /* ================= LIST ================= */

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={

            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />

          }
        >


          {items.length === 0 ? (

            /* ================= EMPTY ================= */

            <View
              style={styles.emptyContainer}
            >

              <Feather
                name="clock"
                size={32}
                color="#A5B0BF"
              />


              <Text
                style={styles.emptyTitle}
              >
                Цаг бүртгэл байхгүй байна
              </Text>


              <Text
                style={
                  styles.emptyDescription
                }
              >
                Сонгосон 7 хоногт мэдээлэл
                олдсонгүй.
              </Text>

            </View>

          ) : (

            /* ================= ROWS ================= */

            items.map(
              (item, index) => (

                <View
                  key={
                    item.dateNo ||
                    `${item.date}-${index}`
                  }
                  style={[
                    styles.attendanceCard,

                    {
                      backgroundColor:
                        getCardColor(item),
                    },
                  ]}
                >


                  {/* ЗҮҮН ӨНГӨТ ЗУРААС */}

                  <View
                    style={[
                      styles.accentLine,

                      {
                        backgroundColor:
                          getAccentColor(
                            item
                          ),
                      },
                    ]}
                  />


                  {/* ӨДӨР */}

                  <View
                    style={styles.dayColumn}
                  >

                    <Text
                      style={styles.dayName}
                    >
                      {item.dayOfWeekNm}
                    </Text>


                    <Text
                      style={styles.dateSmall}
                    >
                      {item.dateNo}
                    </Text>

                  </View>


                  {/* ТӨРӨЛ */}

                  <View
                    style={styles.typeColumn}
                  >

                    <Text
                      style={[
                        styles.typeText,

                        {
                          color:
                            getTypeTextColor(
                              item
                            ),
                        },
                      ]}
                      numberOfLines={3}
                    >
                      {getTypeText(item)}
                    </Text>

                  </View>


                  {/* ИРСЭН */}

                  <View
                    style={styles.timeColumn}
                  >

                    <Text
                      style={[
                        styles.timeText,

                        !item.comeIn &&
                          styles.emptyText,
                      ]}
                    >
                      {displayTime(
                        item.comeIn
                      )}
                    </Text>

                  </View>


                  {/* ЯВСАН */}

                  <View
                    style={styles.timeColumn}
                  >

                    <Text
                      style={[
                        styles.timeText,

                        !item.goneOn &&
                          styles.emptyText,
                      ]}
                    >
                      {displayTime(
                        item.goneOn
                      )}
                    </Text>

                  </View>


                  {/* ИЛҮҮ */}

                  <View
                    style={
                      styles.numberColumn
                    }
                  >

                    <Text
                      style={
                        styles.numberText
                      }
                    >
                      {displayNumber(
                        item.iluu
                      )}
                    </Text>

                  </View>


                  {/* ХОЦРОЛТ */}

                  <View
                    style={
                      styles.numberColumn
                    }
                  >

                    <Text
                      style={[
                        styles.numberText,

                        Number(
                          item.hotsrolt ||
                            0
                        ) !== 0 &&
                          styles.warningText,
                      ]}
                    >
                      {displayNumber(
                        item.hotsrolt
                      )}
                    </Text>

                  </View>

                </View>

              )
            )

          )}

          {/* ================= ИРЛЭЭ / ЯВЛАА (жагсаалтын доор) ================= */}

          {isCurrentWeek && (

            <View
              style={styles.checkSection}
            >

              {/* БҮСИЙН ТӨЛӨВ */}

              <View
                style={styles.zoneRow}
              >

                {zoneStatus === 'checking' ? (

                  <ActivityIndicator
                    size="small"
                    color="#8A96A8"
                  />

                ) : (

                  <View
                    style={[
                      styles.zoneDot,

                      {
                        backgroundColor:
                          isInside
                            ? '#55B77A'
                            : '#E96868',
                      },
                    ]}
                  />

                )}


                <Text
                  style={[
                    styles.zoneText,

                    isInside &&
                      styles.zoneTextInside,
                  ]}
                >
                  {getZoneText()}
                </Text>

              </View>


              <View
                style={styles.checkButtons}
              >

                {/* ИРЛЭЭ */}

                <TouchableOpacity
                  style={[
                    styles.checkButton,

                    isInside && !alreadyCameIn
                      ? styles.checkInButton
                      : styles.checkButtonInactive,
                  ]}
                  activeOpacity={0.8}
                  disabled={
                    alreadyCameIn ||
                    checking !== null
                  }
                  onPress={() =>
                    handleCheck('IN')
                  }
                >

                  {checking === 'IN' ? (

                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                  ) : (

                    <>
                      <Feather
                        name="log-in"
                        size={16}
                        color="#FFFFFF"
                      />

                      <Text
                        style={styles.checkButtonText}
                      >
                        {alreadyCameIn
                          ? `Ирсэн ${todayItem?.comeIn}`
                          : 'Ирлээ'}
                      </Text>
                    </>

                  )}

                </TouchableOpacity>


                {/* ЯВЛАА */}

                <TouchableOpacity
                  style={[
                    styles.checkButton,

                    isInside
                      ? styles.checkOutButton
                      : styles.checkButtonInactive,
                  ]}
                  activeOpacity={0.8}
                  disabled={checking !== null}
                  onPress={() =>
                    handleCheck('OUT')
                  }
                >

                  {checking === 'OUT' ? (

                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                  ) : (

                    <>
                      <Feather
                        name="log-out"
                        size={16}
                        color="#FFFFFF"
                      />

                      <Text
                        style={styles.checkButtonText}
                      >
                        Явлаа
                      </Text>
                    </>

                  )}

                </TouchableOpacity>

              </View>

            </View>

          )}

        </ScrollView>

      )}


      {/* ================= BOTTOM NAV ================= */}

      <BottomNav
        active="attendance"
        userNm={userNm}
        cstmNm={cstmNm}
        userId={userId}
        token={token}
      />

    </SafeAreaView>

  );
}


/* =====================================================
   STYLES
===================================================== */

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,

      backgroundColor: '#F8FAFD',
    },


    /* ================= HEADER ================= */

    header: {
      height: 70,

      paddingHorizontal: 20,

      flexDirection: 'row',
      alignItems: 'center',

      backgroundColor: '#FFFFFF',
    },


    backButton: {
      width: 40,
      height: 40,

      borderRadius: 20,

      backgroundColor: '#F6F8FC',

      alignItems: 'center',
      justifyContent: 'center',

      marginRight: 10,
    },


    headerTitle: {
      fontSize: 19,

      fontWeight: '600',

      color: '#1F2B3D',
    },


    /* ================= ИРЛЭЭ / ЯВЛАА ================= */

    checkSection: {
      marginTop: 8,

      borderRadius: 13,

      backgroundColor: '#FFFFFF',

      borderWidth: 1,
      borderColor: '#E9EDF3',

      padding: 14,
    },


    zoneRow: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 7,
    },


    zoneDot: {
      width: 8,
      height: 8,

      borderRadius: 4,
    },


    zoneText: {
      fontSize: 12,

      color: '#7D8A9C',
    },


    zoneTextInside: {
      color: '#3E9963',

      fontWeight: '600',
    },


    checkButtons: {
      flexDirection: 'row',

      marginTop: 12,

      gap: 10,
    },


    checkButton: {
      flex: 1,

      height: 46,

      borderRadius: 11,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 6,
    },


    checkInButton: {
      backgroundColor: '#428CE5',
    },


    checkOutButton: {
      backgroundColor: '#55B77A',
    },


    // Бүсээс гадна эсвэл аль хэдийн ирсэн: саарал,
    // гэхдээ "Явлаа" дарагдаж alert харуулна
    checkButtonInactive: {
      backgroundColor: '#B8C2CF',
    },


    checkButtonText: {
      fontSize: 14,

      fontWeight: '600',

      color: '#FFFFFF',
    },


    /* ================= WEEK ================= */

    weekWrapper: {
      backgroundColor: '#FFFFFF',

      paddingHorizontal: 20,

      paddingBottom: 15,
    },


    weekCard: {
      height: 62,

      borderRadius: 14,

      backgroundColor: '#FFFFFF',

      flexDirection: 'row',
      alignItems: 'center',

      borderWidth: 1,
      borderColor: '#E9EDF3',

      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.06,

      shadowRadius: 8,

      elevation: 3,
    },


    weekArrow: {
      width: 48,

      height: '100%',

      alignItems: 'center',

      justifyContent: 'center',
    },


    weekCenter: {
      flex: 1,

      alignItems: 'center',
    },


    weekLabel: {
      fontSize: 11,

      color: '#98A2B3',

      marginBottom: 3,
    },


    weekDate: {
      fontSize: 15,

      fontWeight: '600',

      color: '#27364E',
    },


    /* ================= SUMMARY ================= */

    summaryRow: {
      height: 64,

      marginHorizontal: 20,

      marginTop: 12,

      marginBottom: 12,

      borderRadius: 14,

      backgroundColor: '#FFFFFF',

      flexDirection: 'row',

      alignItems: 'center',

      borderWidth: 1,

      borderColor: '#EDF0F5',
    },


    summaryItem: {
      flex: 1,

      alignItems: 'center',
    },


    summaryNumber: {
      fontSize: 18,

      fontWeight: '700',

      color: '#428CE5',
    },


    summaryLabel: {
      marginTop: 3,

      fontSize: 10,

      color: '#8A96A8',
    },


    summaryDivider: {
      width: 1,

      height: 27,

      backgroundColor: '#E9EDF3',
    },


    /* ================= TABLE HEADER ================= */

    tableHeader: {
      minHeight: 46,

      marginHorizontal: 15,

      borderRadius: 11,

      backgroundColor: '#EEF4FC',

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 8,

      marginBottom: 7,
    },


    headerText: {
      fontSize: 10.5,

      fontWeight: '700',

      color: '#62728A',

      textAlign: 'center',
    },


    headerSubText: {
      marginTop: 1,

      fontSize: 8.5,

      color: '#9AA5B5',

      textAlign: 'center',
    },


    /* ================= COLUMNS ================= */

    dayColumn: {
      width: '19%',

      justifyContent: 'center',
    },


    typeColumn: {
      width: '20%',

      alignItems: 'center',

      justifyContent: 'center',
    },


    timeColumn: {
      width: '17%',

      alignItems: 'center',

      justifyContent: 'center',
    },


    numberColumn: {
      width: '13.5%',

      alignItems: 'center',

      justifyContent: 'center',
    },


    /* ================= LIST ================= */

    scroll: {
      flex: 1,
    },


    scrollContent: {
      paddingHorizontal: 15,

      paddingBottom: 20,
    },


    attendanceCard: {
      minHeight: 67,

      borderRadius: 13,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 8,

      marginBottom: 7,

      overflow: 'hidden',

      position: 'relative',

      borderWidth: 1,

      borderColor:
        'rgba(220,228,238,0.45)',
    },


    accentLine: {
      position: 'absolute',

      left: 0,

      top: 9,

      bottom: 9,

      width: 4,

      borderTopRightRadius: 4,

      borderBottomRightRadius: 4,
    },


    /* ================= ROW TEXT ================= */

    dayName: {
      fontSize: 12,

      fontWeight: '700',

      color: '#30445F',

      marginLeft: 4,
    },


    dateSmall: {
      fontSize: 9,

      color: '#93A1B5',

      marginTop: 4,

      marginLeft: 4,
    },


    typeText: {
      fontSize: 9.5,

      lineHeight: 13,

      textAlign: 'center',

      color: '#65758C',
    },


    timeText: {
      fontSize: 10,

      fontWeight: '500',

      color: '#34597A',

      textAlign: 'center',
    },


    emptyText: {
      color: '#9AA8B9',
    },


    numberText: {
      fontSize: 10,

      fontWeight: '600',

      color: '#48647F',

      textAlign: 'center',
    },


    warningText: {
      color: '#D76554',
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

      color: '#7D8A9C',
    },


    /* ================= EMPTY ================= */

    emptyContainer: {
      paddingTop: 60,

      alignItems: 'center',
    },


    emptyTitle: {
      marginTop: 12,

      fontSize: 14,

      fontWeight: '600',

      color: '#536176',
    },


    emptyDescription: {
      marginTop: 5,

      fontSize: 11,

      color: '#98A3B3',

      textAlign: 'center',
    },

  });
