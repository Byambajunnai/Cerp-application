
import { Feather } from "@expo/vector-icons";

import {
    router,
    useFocusEffect,
    useLocalSearchParams,
} from "expo-router";

import {
    useCallback,
    useRef,
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { API_URL } from "../config/api";

// ======================================
// ТОХИРГОО
// ======================================

const BLUE = "#2075D2";

const PAGE_SIZE = 10;

const TIMEBREAK_URL =
  `${API_URL}/api/mobile/timebreak`;

// ======================================
// API TYPE
// ======================================

type LeaveRequest = {
  breakId: number | string;
  breakTypeNm?: string;
  prgsStatusNm?: string;
  breakstartDate?: string;
  breakfinishDate?: string;
  regDate?: string;
  breakSalaryNm?: string;
  workDays?: number | string;
  breakNote?: string;
};

type LeaveResponse = {
  items?: LeaveRequest[];
  pageNumber?: number;
  totalPage?: number;
  totalCount?: number;
  hasNextPage?: boolean;
  message?: string;
};

// ======================================
// ОГНОО ФОРМАТЛАХ
// ======================================

const formatDate = (
  date?: string | null
): string => {

  if (!date) {
    return "-";
  }

  const value = String(date);

  if (/^\d{8}$/.test(value)) {
    return (
      value.substring(0, 4) +
      "." +
      value.substring(4, 6) +
      "." +
      value.substring(6, 8)
    );
  }

  return value
    .substring(0, 10)
    .replace(/-/g, ".");
};

// ======================================
// ХҮСЭЛТИЙН ТӨЛӨВИЙН ӨНГӨ
// ======================================

const getStatusStyle = (
  status?: string
) => {

  const value = String(
    status || ""
  ).toLowerCase();

  if (
    value.includes("татгалз") ||
    value.includes("буцаа")
  ) {
    return {
      backgroundColor: "#FEE2E2",
      color: "#DC2626",
    };
  }

  if (
    value.includes("батал") ||
    value.includes("зөвшөөр") ||
    value.includes("хянасан")
  ) {
    return {
      backgroundColor: "#DCFCE7",
      color: "#16834A",
    };
  }

  return {
    backgroundColor: "#FFF1D6",
    color: "#C77700",
  };
};

// ======================================
// SCREEN
// ======================================

export default function LeaveRequestScreen() {

  // ====================================
  // LOGIN-ООС ДАМЖУУЛСАН МЭДЭЭЛЭЛ
  // ====================================

  const {
    userNm,
    cstmNm,
    userId,
    cstmCd,
    token,
  } = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    cstmCd?: string;
    token?: string;
  }>();

  // ====================================
  // STATE
  // ====================================

  const [requests, setRequests] =
    useState<LeaveRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  const [totalCount, setTotalCount] =
    useState(0);

  const [error, setError] =
    useState("");

  // Давхар API дуудлагаас хамгаалах

  const requestInProgress =
    useRef(false);

  // ====================================
  // МЭДЭГДЭЛ
  // ====================================

  const showMessage = (
    title: string,
    message: string
  ) => {

    if (Platform.OS === "web") {
      window.alert(
        `${title}\n${message}`
      );
    } else {
      Alert.alert(title, message);
    }
  };

  // ====================================
  // ХҮСЭЛТИЙН API
  // ====================================

  const fetchRequests = useCallback(

    async (
      pageNumber: number = 1,
      append: boolean = false
    ) => {

      // Давхар хүсэлт илгээхгүй

      if (requestInProgress.current) {
        return;
      }

      requestInProgress.current = true;

      try {

        if (pageNumber === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError("");

        // ==============================
        // TOKEN ШАЛГАХ
        // ==============================

        if (!token) {

          throw new Error(
            "Нэвтрэх мэдээлэл олдсонгүй. " +
            "Дахин нэвтэрнэ үү."
          );

        }

        // ==============================
        // API URL
        // ==============================

        const url =
          `${TIMEBREAK_URL}` +
          `?page=${pageNumber}` +
          `&pageSize=${PAGE_SIZE}`;

        // ==============================
        // API ДУУДАХ
        // ==============================

        const response = await fetch(
          url,
          {
            method: "GET",

            headers: {
              Accept: "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        // ==============================
        // API RESPONSE
        // ==============================

        const text =
          await response.text();

        let result: LeaveResponse = {};

        try {

          result = text
            ? JSON.parse(text)
            : {};

        } catch {

          throw new Error(
            "Амралтын хүсэлтийн API " +
            "JSON бус хариу буцаалаа."
          );

        }

        // ==============================
        // TOKEN ERROR
        // ==============================

        if (response.status === 401) {

          throw new Error(
            "Нэвтрэх эрхийн хугацаа " +
            "дууссан байна. " +
            "Дахин нэвтэрнэ үү."
          );

        }

        // ==============================
        // API ERROR
        // ==============================

        if (!response.ok) {

          throw new Error(
            result.message ||
            `API алдаа: ${response.status}`
          );

        }

        // ==============================
        // ITEMS
        // ==============================

        const newItems: LeaveRequest[] =
          Array.isArray(result.items)
            ? result.items
            : [];

        // ==============================
        // ЖАГСААЛТ ШИНЭЧЛЭХ
        // ==============================

        if (append) {

          setRequests((previous) => {

            const existingIds = new Set(
              previous.map(
                (item) =>
                  String(item.breakId)
              )
            );

            const uniqueItems =
              newItems.filter(
                (item) =>
                  !existingIds.has(
                    String(item.breakId)
                  )
              );

            return [
              ...previous,
              ...uniqueItems,
            ];

          });

        } else {

          setRequests(newItems);

        }

        // ==============================
        // PAGINATION
        // ==============================

        const currentPage =
          Number(result.pageNumber) ||
          pageNumber;

        const totalPages =
          Number(result.totalPage) || 1;

        setPage(currentPage);

        setHasNextPage(
          typeof result.hasNextPage ===
            "boolean"
            ? result.hasNextPage
            : currentPage < totalPages
        );

        setTotalCount(
          Number(result.totalCount) || 0
        );

      } catch (err: unknown) {

        const message =
          err instanceof Error
            ? err.message
            : "Хүсэлтүүдийг авахад " +
              "алдаа гарлаа.";

        console.error(
          "TIMEBREAK API ERROR:",
          message
        );

        setError(message);

        if (pageNumber > 1) {

          showMessage(
            "Алдаа",
            message
          );

        }

      } finally {

        setLoading(false);

        setRefreshing(false);

        setLoadingMore(false);

        requestInProgress.current = false;

      }

    },

    [token]

  );

  // ====================================
  // ДЭЛГЭЦ НЭЭГДЭХ БҮРД АЧААЛАХ
  // ====================================

  useFocusEffect(

    useCallback(() => {

      fetchRequests(1, false);

    }, [fetchRequests])

  );

  // ====================================
  // REFRESH
  // ====================================

  const onRefresh = () => {

    if (requestInProgress.current) {
      return;
    }

    setRefreshing(true);

    fetchRequests(1, false);

  };

  // ====================================
  // LOAD MORE
  // ====================================

  const loadMore = () => {

    if (
      !hasNextPage ||
      loading ||
      loadingMore ||
      refreshing ||
      requestInProgress.current
    ) {
      return;
    }

    fetchRequests(
      page + 1,
      true
    );

  };

  // ====================================
  // HOME РУУ БУЦАХ
  // ====================================

  const goHome = () => {

    router.replace({
      pathname: "/home",

      params: {
        userNm: userNm || "",
        cstmNm: cstmNm || "",
        userId: userId || "",
        cstmCd: cstmCd || "",
        token: token || "",
      },
    });

  };

  // ====================================
  // ШИНЭ ХҮСЭЛТ
  // ====================================

  const goCreateRequest = () => {

    router.push({
      pathname: "/leave-create",

      params: {
        userNm: userNm || "",
        cstmNm: cstmNm || "",
        userId: userId || "",
        cstmCd: cstmCd || "",
        token: token || "",
      },
    });

  };

  // ====================================
  // ХҮСЭЛТИЙН CARD
  // ====================================

  const renderRequest = ({
    item,
  }: {
    item: LeaveRequest;
  }) => {

    const statusStyle =
      getStatusStyle(
        item.prgsStatusNm
      );

    return (

    
<TouchableOpacity
  style={styles.card}
  activeOpacity={0.8}
  onPress={() =>
    router.push({
      pathname: "/leave-detail",
      params: {
        breakId: String(item.breakId),
        breakTypeNm: item.breakTypeNm || "",
        prgsStatusNm: item.prgsStatusNm || "",
        breakstartDate: item.breakstartDate || "",
        breakfinishDate: item.breakfinishDate || "",
        regDate: item.regDate || "",
        breakSalaryNm: item.breakSalaryNm || "",
        workDays: String(item.workDays ?? ""),
        breakNote: item.breakNote || "",

        userNm: userNm || "",
        cstmNm: cstmNm || "",
        userId: userId || "",
        cstmCd: cstmCd || "",
        token: token || "",
      },
    })
  }
>


        {/* CARD HEADER */}

        <View style={styles.cardHeader}>

          <Text
            style={styles.cardTitle}
            numberOfLines={2}
          >
            {item.breakTypeNm ||
              "Амралтын хүсэлт"}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusStyle.backgroundColor,
              },
            ]}
          >

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    statusStyle.color,
                },
              ]}
            >
              {item.prgsStatusNm ||
                "Тодорхойгүй"}
            </Text>

          </View>

        </View>

        {/* АМРАЛТЫН ХУГАЦАА */}

        <View style={styles.infoRow}>

          <Feather
            name="calendar"
            size={15}
            color="#64748B"
          />

          <Text style={styles.dateText}>

            {formatDate(
              item.breakstartDate
            )}

            {" – "}

            {formatDate(
              item.breakfinishDate
            )}

          </Text>

        </View>

        {/* БҮРТГЭСЭН ОГНОО */}

        <View style={styles.infoRow}>

          <Feather
            name="clock"
            size={15}
            color="#64748B"
          />

          <Text style={styles.infoText}>

            Илгээсэн:{" "}

            {formatDate(
              item.regDate
            )}

          </Text>

        </View>

        {/* ЦАЛИНТАЙ ЭСЭХ */}

        <View style={styles.infoRow}>

          <Feather
            name="file-text"
            size={15}
            color="#64748B"
          />

          <Text style={styles.infoText}>

            Цалинтай:{" "}

            {item.breakSalaryNm || "-"}

          </Text>

        </View>

        {/* АЖЛЫН ӨДӨР */}

        <View style={styles.infoRow}>

          <Feather
            name="calendar"
            size={15}
            color="#64748B"
          />

          <Text style={styles.infoText}>

            Ажлын өдөр:{" "}

            {item.workDays ?? "-"}

          </Text>

        </View>

        {/* ТАЙЛБАР */}

        {item.breakNote ? (

          <View style={styles.noteBox}>

            <Text
              style={styles.noteText}
              numberOfLines={2}
            >
              {item.breakNote}
            </Text>

          </View>

        ) : null}

        {/* ХҮСЭЛТИЙН ДУГААР */}

        <View style={styles.cardFooter}>

          <Text style={styles.requestId}>

            № {item.breakId}

          </Text>

          <Feather
            name="chevron-right"
            size={18}
            color="#94A3B8"
          />

        </View>

  </TouchableOpacity>

    );

  };

  // ====================================
  // UI
  // ====================================

  return (

    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >

          <Feather
            name="arrow-left"
            size={23}
            color="#26364D"
          />

        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Амралтын хүсэлт
        </Text>

        <TouchableOpacity
          onPress={goHome}
        >

          <Feather
            name="home"
            size={22}
            color="#26364D"
          />

        </TouchableOpacity>

      </View>

      {/* МИНИЙ ХҮСЭЛТҮҮД */}

      <View style={styles.tabContainer}>

        <View style={styles.activeTab}>

          <Text style={styles.activeTabText}>
            Миний хүсэлтүүд
          </Text>

        </View>

        <View style={styles.inactiveTab}>

          <Text style={styles.inactiveTabText}>
            Нийт: {totalCount}
          </Text>

        </View>

      </View>

      {/* МЭДЭЭЛЭЛ */}

      <View style={styles.infoBox}>

        <Feather
          name="info"
          size={19}
          color={BLUE}
        />

        <Text style={styles.infoBoxText}>
          Та өөрийн илгээсэн амралт,
          чөлөөний хүсэлтүүдийг эндээс
          харах боломжтой.
        </Text>

      </View>

      {/* ШИНЭ ХҮСЭЛТ */}

      <View style={styles.addContainer}>

        <TouchableOpacity
          style={styles.addButton}
          onPress={goCreateRequest}
        >

          <Feather
            name="plus"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.addButtonText}>
            Шинэ хүсэлт
          </Text>

        </TouchableOpacity>

      </View>

      {/* ЖАГСААЛТ */}

      {loading && !refreshing ? (

        <View style={styles.center}>

          <ActivityIndicator
            size="large"
            color={BLUE}
          />

          <Text style={styles.loadingText}>
            Хүсэлтүүдийг ачаалж байна...
          </Text>

        </View>

      ) : error && requests.length === 0 ? (

        <View style={styles.center}>

          <Feather
            name="alert-circle"
            size={45}
            color="#EF4444"
          />

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              fetchRequests(1, false)
            }
          >

            <Text style={styles.retryText}>
              Дахин оролдох
            </Text>

          </TouchableOpacity>

        </View>

      ) : (

        <FlatList
          data={requests}

          keyExtractor={(item) =>
            String(item.breakId)
          }

          renderItem={renderRequest}

          contentContainerStyle={
            requests.length === 0
              ? styles.emptyList
              : styles.listContent
          }

          refreshControl={

            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[BLUE]}
              tintColor={BLUE}
            />

          }

          onEndReached={loadMore}

          onEndReachedThreshold={0.3}

          ListFooterComponent={

            loadingMore ? (

              <ActivityIndicator
                color={BLUE}
                style={{
                  margin: 20,
                }}
              />

            ) : null

          }

          ListEmptyComponent={

            <View style={styles.emptyContainer}>

              <Feather
                name="file-text"
                size={65}
                color="#CBD5E1"
              />

              <Text style={styles.emptyTitle}>
                Одоогоор хүсэлт байхгүй байна.
              </Text>

              <Text style={styles.emptyText}>
                Шинэ амралтын хүсэлт
                үүсгэхийн тулд дээрх
                товчийг дарна уу.
              </Text>

            </View>

          }

        />

      )}

    </SafeAreaView>

  );

}

// ======================================
// STYLES
// ======================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFD",
  },

  header: {
    height: 60,
    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 20,

    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF5",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#26364D",
  },

  tabContainer: {
    flexDirection: "row",

    marginHorizontal: 16,
    marginTop: 18,

    backgroundColor: "#EDF3FA",
    borderRadius: 10,
    padding: 3,
  },

  activeTab: {
    flex: 1,
    backgroundColor: BLUE,

    paddingVertical: 12,
    borderRadius: 8,

    alignItems: "center",
  },

  activeTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  inactiveTab: {
    flex: 1,

    paddingVertical: 12,
    alignItems: "center",
  },

  inactiveTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },

  infoBox: {
    marginHorizontal: 16,
    marginTop: 14,

    padding: 13,

    backgroundColor: "#EAF3FF",
    borderRadius: 10,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,
  },

  infoBoxText: {
    flex: 1,

    fontSize: 12,
    lineHeight: 19,

    color: "#475569",
  },

  addContainer: {
    alignItems: "flex-end",

    paddingHorizontal: 16,

    marginTop: 12,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: BLUE,

    borderRadius: 10,

    paddingHorizontal: 17,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",

    gap: 7,
  },

  addButtonText: {
    color: "#FFFFFF",

    fontSize: 14,
    fontWeight: "700",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,

    gap: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 12,
    padding: 15,

    borderWidth: 1,
    borderColor: "#E1E8F2",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    gap: 8,
    marginBottom: 10,
  },

  cardTitle: {
    flex: 1,

    fontSize: 15,
    fontWeight: "700",

    color: "#26364D",
  },

  statusBadge: {
    borderRadius: 20,

    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 9,
    marginTop: 7,
  },

  dateText: {
    fontSize: 13,
    color: "#475569",
  },

  infoText: {
    fontSize: 12,
    color: "#64748B",
  },

  noteBox: {
    marginTop: 12,

    padding: 10,

    backgroundColor: "#F8FAFD",
    borderRadius: 8,
  },

  noteText: {
    fontSize: 12,
    lineHeight: 19,

    color: "#475569",
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginTop: 12,
    paddingTop: 10,

    borderTopWidth: 1,
    borderTopColor: "#EDF0F5",
  },

  requestId: {
    fontSize: 11,
    color: "#94A3B8",
  },

  center: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    padding: 25,
    gap: 15,
  },

  loadingText: {
    fontSize: 13,
    color: "#64748B",
  },

  errorText: {
    fontSize: 13,
    color: "#DC2626",

    textAlign: "center",
  },

  retryButton: {
    backgroundColor: BLUE,

    paddingHorizontal: 20,
    paddingVertical: 12,

    borderRadius: 9,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  emptyList: {
    flexGrow: 1,

    justifyContent: "center",

    paddingHorizontal: 25,
    paddingBottom: 90,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",

    padding: 20,
    gap: 15,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",

    color: "#26364D",
    textAlign: "center",
  },

  emptyText: {
    fontSize: 13,
    color: "#64748B",

    textAlign: "center",
    lineHeight: 20,
  },

});
