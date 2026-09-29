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
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BottomNav from "../components/BottomNav";
import { API_URL } from "../config/api";

// =====================================================
// ТОХИРГОО
// =====================================================

const BLUE = "#1985DE";
const PAGE_SIZE = 10;

const TIMEBREAK_URL =
  `${API_URL}/api/mobile/timebreak`;

// =====================================================
// TYPE
// =====================================================

type LeaveRequest = {
  breakId: number | string;

  // API-аас ирэх хүсэлтийн төрөл
  // Жишээ: "19"
  breakType?: string;

  // Жишээ: "БУСАД"
  breakTypeNm?: string;

  prgsStatusNm?: string;
  prgsStatusCd?: string;

  breakstartDate?: string;
  breakfinishDate?: string;

  regDate?: string;

  breakSalary?: string;
  breakSalaryNm?: string;

  workDays?: number | string;

  breakNote?: string;

  fileId?: string;
  fileNm?: string;
};

type LeaveResponse = {
  items?: LeaveRequest[];

  pageNumber?: number;
  totalPage?: number;
  totalCount?: number;
  hasNextPage?: boolean;

  message?: string;
};

// =====================================================
// ОГНОО ФОРМАТ
// =====================================================

const formatDate = (
  date?: string | null
): string => {
  if (!date) {
    return "-";
  }

  const value = String(date);

  // 20260929
  if (/^\d{8}$/.test(value)) {
    return (
      value.substring(0, 4) +
      "." +
      value.substring(4, 6) +
      "." +
      value.substring(6, 8)
    );
  }

  // 2026-09-29
  return value
    .substring(0, 10)
    .replace(/-/g, ".");
};

// =====================================================
// ТӨЛӨВИЙН ӨНГӨ
// =====================================================

const getStatusStyle = (
  status?: string
) => {
  const value = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  // Татгалзсан
  if (
    value.includes("татгалз") ||
    value.includes("буцаа")
  ) {
    return {
      backgroundColor: "#FDEBED",
      color: "#D94B55",
    };
  }

  // Баталсан
  if (
    value.includes("батал") ||
    value.includes("зөвшөөр")
  ) {
    return {
      backgroundColor: "#E4F7ED",
      color: "#21945B",
    };
  }

  // Илгээсэн
  if (value.includes("илгээ")) {
    return {
      backgroundColor: "#E7F0FF",
      color: "#3275D8",
    };
  }

  // Хадгалсан
  if (value.includes("хадгал")) {
    return {
      backgroundColor: "#F1F3F6",
      color: "#64748B",
    };
  }

  // Хүлээгдэж байгаа
  return {
    backgroundColor: "#FFF0D8",
    color: "#C77700",
  };
};

// =====================================================
// MAIN SCREEN
// =====================================================

export default function LeaveRequestScreen() {
  // ===================================================
  // ROUTER PARAMS
  // ===================================================

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

  // ===================================================
  // STATE
  // ===================================================

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

  // 3 цэгийн нээлттэй menu
  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  // API давхар дуудагдахаас хамгаална
  const requestInProgress =
    useRef(false);

  // ===================================================
  // NAVIGATION PARAMS
  // ===================================================

  const navigationParams = {
    userNm: userNm || "",
    cstmNm: cstmNm || "",
    userId: userId || "",
    cstmCd: cstmCd || "",
    token: token || "",
  };

  // ===================================================
  // MESSAGE
  // ===================================================

  const showMessage = (
    title: string,
    message: string
  ) => {
    if (Platform.OS === "web") {
      window.alert(
        `${title}\n${message}`
      );
    } else {
      Alert.alert(
        title,
        message
      );
    }
  };

  // ===================================================
  // GET REQUEST LIST
  // ===================================================

  const fetchRequests = useCallback(
    async (
      pageNumber: number = 1,
      append: boolean = false
    ) => {
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

        if (!token) {
          throw new Error(
            "Нэвтрэх мэдээлэл олдсонгүй. Дахин нэвтэрнэ үү."
          );
        }

        const url =
          `${TIMEBREAK_URL}` +
          `?page=${pageNumber}` +
          `&pageSize=${PAGE_SIZE}`;

        console.log(
          "===================================="
        );
        console.log(
          "TIMEBREAK LIST URL:",
          url
        );

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

        const text =
          await response.text();

        console.log(
          "TIMEBREAK LIST STATUS:",
          response.status
        );

        console.log(
          "TIMEBREAK LIST RESPONSE:",
          text
        );

        let result: LeaveResponse = {};

        try {
          result = text
            ? JSON.parse(text)
            : {};
        } catch {
          throw new Error(
            "API JSON бус хариу буцаалаа."
          );
        }

        if (response.status === 401) {
          throw new Error(
            "Нэвтрэх эрхийн хугацаа дууссан байна."
          );
        }

        if (!response.ok) {
          throw new Error(
            result.message ||
              `API алдаа: ${response.status}`
          );
        }

        const newItems =
          Array.isArray(result.items)
            ? result.items
            : [];

        console.log(
          "TIMEBREAK ITEMS:",
          newItems
        );

        // breakType ирж байгаа эсэхийг харах
        if (newItems.length > 0) {
          console.log(
            "FIRST BREAK ID:",
            newItems[0].breakId
          );

          console.log(
            "FIRST BREAK TYPE:",
            newItems[0].breakType
          );

          console.log(
            "FIRST BREAK TYPE NAME:",
            newItems[0].breakTypeNm
          );
        }

        // Pagination append
        if (append) {
          setRequests(
            (previous) => {
              const existingIds =
                new Set(
                  previous.map(
                    (item) =>
                      String(
                        item.breakId
                      )
                  )
                );

              const uniqueItems =
                newItems.filter(
                  (item) =>
                    !existingIds.has(
                      String(
                        item.breakId
                      )
                    )
                );

              return [
                ...previous,
                ...uniqueItems,
              ];
            }
          );
        } else {
          setRequests(newItems);
        }

        const currentPage =
          Number(
            result.pageNumber
          ) || pageNumber;

        const totalPages =
          Number(
            result.totalPage
          ) || 1;

        setPage(currentPage);

        setHasNextPage(
          typeof result.hasNextPage ===
            "boolean"
            ? result.hasNextPage
            : currentPage < totalPages
        );

        setTotalCount(
          Number(
            result.totalCount
          ) || 0
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Хүсэлтүүдийг авахад алдаа гарлаа.";

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

        requestInProgress.current =
          false;
      }
    },
    [token]
  );

  // ===================================================
  // ДЭЛГЭЦ НЭЭГДЭХ БҮР ЖАГСААЛТ ШИНЭЧИЛНЭ
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      setOpenMenuId(null);

      fetchRequests(
        1,
        false
      );
    }, [fetchRequests])
  );

  // ===================================================
  // REFRESH
  // ===================================================

  const onRefresh = () => {
    if (
      requestInProgress.current
    ) {
      return;
    }

    setOpenMenuId(null);

    setRefreshing(true);

    fetchRequests(
      1,
      false
    );
  };

  // ===================================================
  // LOAD MORE
  // ===================================================

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

  // ===================================================
  // БУЦАХ
  // ===================================================

  const goBack = () => {
    router.replace({
      pathname: "/leave-menu",
      params: navigationParams,
    });
  };

  // ===================================================
  // НЭМЭХ
  // ===================================================

  const goCreateRequest = () => {
    setOpenMenuId(null);

    router.push({
      pathname: "/leave-create",

      params: navigationParams,
    });
  };

  // ===================================================
  // DETAIL
  // ===================================================

  const goDetail = (
    item: LeaveRequest
  ) => {
    setOpenMenuId(null);

    console.log(
      "===================================="
    );

    console.log(
      "OPEN DETAIL"
    );

    console.log(
      "BREAK ID:",
      item.breakId
    );

    console.log(
      "BREAK TYPE:",
      item.breakType
    );

    console.log(
      "BREAK TYPE NAME:",
      item.breakTypeNm
    );

    console.log(
      "STATUS CODE:",
      item.prgsStatusCd
    );

    console.log(
      "STATUS NAME:",
      item.prgsStatusNm
    );

    console.log(
      "FULL ITEM:",
      item
    );

    console.log(
      "===================================="
    );

    if (!item.breakId) {
      showMessage(
        "Алдаа",
        "Хүсэлтийн дугаар олдсонгүй."
      );

      return;
    }

    if (!item.breakType) {
      showMessage(
        "Алдаа",
        "Хүсэлтийн төрөл олдсонгүй."
      );

      return;
    }

    router.push({
      pathname: "/leave-detail",

      params: {
        ...navigationParams,

        // Detail API-д хэрэгтэй
        breakId:
          String(
            item.breakId
          ),

        breakType:
          String(
            item.breakType
          ),

        // Дэлгэцийн мэдээлэл
        breakTypeNm:
          item.breakTypeNm || "",

        prgsStatusCd:
          item.prgsStatusCd || "",

        prgsStatusNm:
          item.prgsStatusNm || "",

        breakstartDate:
          item.breakstartDate || "",

        breakfinishDate:
          item.breakfinishDate || "",

        regDate:
          item.regDate || "",

        breakSalary:
          item.breakSalary || "",

        breakSalaryNm:
          item.breakSalaryNm || "",

        workDays:
          String(
            item.workDays ?? ""
          ),

        breakNote:
          item.breakNote || "",

        fileId:
          item.fileId || "",

        fileNm:
          item.fileNm || "",
      },
    });
  };

  // ===================================================
  // EDIT
  // ===================================================

  const goEdit = (
    item: LeaveRequest
  ) => {
    setOpenMenuId(null);

    if (!item.breakId) {
      showMessage(
        "Алдаа",
        "Хүсэлтийн дугаар олдсонгүй."
      );

      return;
    }

    if (!item.breakType) {
      showMessage(
        "Алдаа",
        "Хүсэлтийн төрөл олдсонгүй."
      );

      return;
    }

    router.push({
      pathname:
        "/leave-edit" as any,

      params: {
        ...navigationParams,

        breakId:
          String(
            item.breakId
          ),

        breakType:
          String(
            item.breakType
          ),

        breakTypeNm:
          item.breakTypeNm || "",

        prgsStatusCd:
          item.prgsStatusCd || "",

        prgsStatusNm:
          item.prgsStatusNm || "",

        breakstartDate:
          item.breakstartDate || "",

        breakfinishDate:
          item.breakfinishDate || "",

        breakSalary:
          item.breakSalary || "",

        breakSalaryNm:
          item.breakSalaryNm || "",

        workDays:
          String(
            item.workDays ?? ""
          ),

        breakNote:
          item.breakNote || "",

        fileId:
          item.fileId || "",

        fileNm:
          item.fileNm || "",
      },
    });
  };

  // ===================================================
  // DELETE
  // ===================================================

  const deleteRequest = async (
    item: LeaveRequest
  ) => {
    try {
      if (!token) {
        throw new Error(
          "Нэвтрэх мэдээлэл олдсонгүй."
        );
      }

      if (!item.breakId) {
        throw new Error(
          "Хүсэлтийн дугаар олдсонгүй."
        );
      }

      const url =
        `${TIMEBREAK_URL}/` +
        `${encodeURIComponent(
          String(
            item.breakId
          )
        )}`;

      console.log(
        "DELETE URL:",
        url
      );

      const response =
        await fetch(
          url,
          {
            method: "DELETE",

            headers: {
              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const text =
        await response.text();

      console.log(
        "DELETE STATUS:",
        response.status
      );

      console.log(
        "DELETE RESPONSE:",
        text
      );

      let result: {
        message?: string;
      } = {};

      if (text) {
        try {
          result =
            JSON.parse(text);
        } catch {
          // Сервер JSON бус response
          // буцааж болох тул хоосон үлдээнэ.
        }
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Устгахад алдаа гарлаа: ${response.status}`
        );
      }

      setOpenMenuId(null);

      showMessage(
        "Амжилттай",
        result.message ||
          "Хүсэлт амжилттай устгагдлаа."
      );

      fetchRequests(
        1,
        false
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Хүсэлт устгахад алдаа гарлаа.";

      console.error(
        "DELETE ERROR:",
        message
      );

      showMessage(
        "Алдаа",
        message
      );
    }
  };

  // ===================================================
  // DELETE CONFIRM
  // ===================================================

  const confirmDelete = (
    item: LeaveRequest
  ) => {
    setOpenMenuId(null);

    const message =
      `Та "${
        item.breakTypeNm ||
        "Хүсэлт"
      }" хүсэлтийг устгах уу?`;

    if (
      Platform.OS === "web"
    ) {
      if (
        window.confirm(message)
      ) {
        deleteRequest(item);
      }

      return;
    }

    Alert.alert(
      "Хүсэлт устгах",
      message,
      [
        {
          text: "Болих",
          style: "cancel",
        },

        {
          text: "Устгах",
          style: "destructive",

          onPress: () =>
            deleteRequest(item),
        },
      ]
    );
  };

  // ===================================================
  // REQUEST CARD
  // ===================================================

  const renderRequest = ({
    item,
  }: {
    item: LeaveRequest;
  }) => {
    const statusStyle =
      getStatusStyle(
        item.prgsStatusNm
      );

    // Зөвхөн ХАДГАЛСАН төлөвтэй үед
    // Засах / Устгах menu гарна.
    const isSaved =
      String(
        item.prgsStatusCd || ""
      ) === "10" ||
      String(
        item.prgsStatusNm || ""
      )
        .trim()
        .toLowerCase() ===
        "хадгалсан";

    const isMenuOpen =
      openMenuId ===
      String(
        item.breakId
      );

    return (
      <View
        style={
          styles.cardWrapper
        }
      >
        {/* ================================= */}
        {/* ҮНДСЭН CARD */}
        {/* ================================= */}

        <Pressable
          onPress={() =>
            goDetail(item)
          }
          style={({
            hovered,
            pressed,
          }) => [
            styles.card,

            (hovered ||
              pressed) &&
              styles.cardHover,
          ]}
        >
          {/* HEADER */}

          <View
            style={
              styles.cardHeader
            }
          >
            <Text
              style={
                styles.cardTitle
              }
              numberOfLines={2}
            >
              {item.breakTypeNm ||
                "Амралтын хүсэлт"}
            </Text>

            <View
              style={
                styles.cardActions
              }
            >
              {/* STATUS */}

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

              {/* 3 DOT */}

              {isSaved && (
                <Pressable
                  style={
                    styles.moreButton
                  }
                  onPress={(
                    event
                  ) => {
                    // Card-ийн detail
                    // event ажиллахаас хамгаална.
                    event.stopPropagation();

                    setOpenMenuId(
                      isMenuOpen
                        ? null
                        : String(
                            item.breakId
                          )
                    );
                  }}
                >
                  <Feather
                    name="more-vertical"
                    size={19}
                    color="#64748B"
                  />
                </Pressable>
              )}

              {/* DETAIL ARROW */}

              <Feather
                name="chevron-right"
                size={19}
                color="#64748B"
              />
            </View>
          </View>

          {/* DATE */}

          <Text
            style={
              styles.dateText
            }
          >
            {formatDate(
              item.breakstartDate
            )}

            {" - "}

            {formatDate(
              item.breakfinishDate
            )}
          </Text>

          {/* SALARY */}

          <Text
            style={
              styles.infoText
            }
          >
            Цалинтай эсэх:{" "}

            {item.breakSalaryNm ||
              "-"}
          </Text>

          {/* WORK DAYS */}

          <Text
            style={
              styles.infoText
            }
          >
            Ажлын өдөр:{" "}

            {item.workDays ?? "-"}
          </Text>
        </Pressable>

        {/* ================================= */}
        {/* ЗАСАХ / УСТГАХ POPUP */}
        {/* ================================= */}

        {isSaved &&
          isMenuOpen && (
            <View
              style={
                styles.popupMenu
              }
            >
              {/* EDIT */}

              <Pressable
                onPress={() =>
                  goEdit(item)
                }
                style={({
                  hovered,
                  pressed,
                }) => [
                  styles.menuItem,

                  (hovered ||
                    pressed) &&
                    styles.menuItemHover,
                ]}
              >
                <Feather
                  name="edit-2"
                  size={17}
                  color="#2388EF"
                />

                <Text
                  style={
                    styles.editText
                  }
                >
                  Засах
                </Text>
              </Pressable>

              <View
                style={
                  styles.menuDivider
                }
              />

              {/* DELETE */}

              <Pressable
                onPress={() =>
                  confirmDelete(
                    item
                  )
                }
                style={({
                  hovered,
                  pressed,
                }) => [
                  styles.menuItem,

                  (hovered ||
                    pressed) &&
                    styles.menuItemHover,
                ]}
              >
                <Feather
                  name="trash-2"
                  size={17}
                  color="#E5484D"
                />

                <Text
                  style={
                    styles.deleteText
                  }
                >
                  Устгах
                </Text>
              </Pressable>
            </View>
          )}
      </View>
    );
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          style={
            styles.backButton
          }
          onPress={goBack}
        >
          <Feather
            name="chevron-left"
            size={27}
            color="#1D2B43"
          />
        </Pressable>

        <Text
          style={
            styles.headerTitle
          }
        >
          Хүсэлт
        </Text>

        <Pressable
          style={
            styles.addButton
          }
          onPress={
            goCreateRequest
          }
        >
          <Feather
            name="plus"
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.addButtonText
            }
          >
            Нэмэх
          </Text>
        </Pressable>
      </View>

      {/* ================================= */}
      {/* TAB */}
      {/* ================================= */}

      <View
        style={
          styles.tabContainer
        }
      >
        <View
          style={
            styles.activeTab
          }
        >
          <Text
            style={
              styles.activeTabText
            }
          >
            Миний хүсэлт
          </Text>
        </View>

        <View
          style={
            styles.inactiveTab
          }
        >
          <Text
            style={
              styles.inactiveTabText
            }
          >
            Нийт {totalCount}
          </Text>
        </View>
      </View>

      {/* ================================= */}
      {/* CATEGORY */}
      {/* ================================= */}

      <View
        style={
          styles.categoryBox
        }
      >
        <View
          style={
            styles.categoryDot
          }
        />

        <Text
          style={
            styles.categoryText
          }
        >
          Амралт, чөлөө,
          томилолт
        </Text>
      </View>

      {/* ================================= */}
      {/* LIST */}
      {/* ================================= */}

      {loading &&
      !refreshing ? (
        <View
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="large"
            color={BLUE}
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Хүсэлтүүдийг
            ачаалж байна...
          </Text>
        </View>
      ) : error &&
        requests.length ===
          0 ? (
        <View
          style={
            styles.center
          }
        >
          <Feather
            name="alert-circle"
            size={40}
            color="#E5484D"
          />

          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>

          <Pressable
            style={
              styles.retryButton
            }
            onPress={() =>
              fetchRequests(
                1,
                false
              )
            }
          >
            <Text
              style={
                styles.retryText
              }
            >
              Дахин оролдох
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(
            item
          ) =>
            String(
              item.breakId
            )
          }
          renderItem={
            renderRequest
          }
          extraData={
            openMenuId
          }
          style={
            styles.list
          }
          contentContainerStyle={
            requests.length ===
            0
              ? styles.emptyList
              : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                onRefresh
              }
              colors={[
                BLUE,
              ]}
              tintColor={
                BLUE
              }
            />
          }
          onEndReached={
            loadMore
          }
          onEndReachedThreshold={
            0.3
          }
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
            <View
              style={
                styles.emptyContainer
              }
            >
              <Feather
                name="file-text"
                size={55}
                color="#CBD5E1"
              />

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Одоогоор хүсэлт
                байхгүй байна.
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Шинэ хүсэлт
                үүсгэхийн тулд
                Нэмэх товчийг
                дарна уу.
              </Text>
            </View>
          }
        />
      )}

      {/* ================================= */}
      {/* BOTTOM NAV */}
      {/* ================================= */}

      <BottomNav
        active="request"
        userNm={userNm}
        cstmNm={cstmNm}
        userId={userId}
        token={token}
      />
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({
    // =================================================
    // PAGE
    // =================================================

    container: {
      flex: 1,
      backgroundColor:
        "#F8FBFF",
    },

    // =================================================
    // HEADER
    // =================================================

    header: {
      height: 80,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      backgroundColor:
        "#F8FBFF",
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 12,
    },

    headerTitle: {
      flex: 1,
      fontSize: 22,
      fontWeight: "700",
      color: "#1D2B43",
    },

    addButton: {
      height: 36,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: BLUE,
      gap: 4,
    },

    addButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#FFFFFF",
    },

    // =================================================
    // TAB
    // =================================================

    tabContainer: {
      height: 43,
      flexDirection: "row",
      marginHorizontal: 16,
      marginTop: 6,
      marginBottom: 12,
      padding: 2,
      borderWidth: 1,
      borderColor: "#D8E5F8",
      backgroundColor:
        "#F3F7FF",
      borderRadius: 12,
    },

    activeTab: {
      flex: 1,
      backgroundColor: BLUE,
      borderRadius: 10,
      alignItems: "center",
      justifyContent:
        "center",
    },

    activeTabText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },

    inactiveTab: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    inactiveTabText: {
      color: "#64748B",
      fontSize: 13,
    },

    // =================================================
    // CATEGORY
    // =================================================

    categoryBox: {
      height: 29,
      marginHorizontal: 16,
      marginBottom: 14,
      borderRadius: 7,
      backgroundColor:
        "#EDF7FF",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 9,
      gap: 17,
    },

    categoryDot: {
      width: 19,
      height: 19,
      borderRadius: 10,
      backgroundColor: BLUE,
    },

    categoryText: {
      fontSize: 12,
      color: "#64748B",
    },

    // =================================================
    // LIST
    // =================================================

    list: {
      flex: 1,
    },

    listContent: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 30,
      gap: 11,
    },

    cardWrapper: {
      position: "relative",
      overflow: "visible",
    },

    // =================================================
    // CARD
    // =================================================

    card: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor: "#DCE7FA",
      borderRadius: 17,
      paddingHorizontal: 14,
      paddingVertical: 11,
      minHeight: 106,
    },

    cardHover: {
      backgroundColor:
        "#F0F7FF",
      borderColor: BLUE,
    },

    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 5,
      marginBottom: 5,
    },

    cardTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: "#1D2B43",
    },

    cardActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },

    statusBadge: {
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      maxWidth: 105,
    },

    statusText: {
      fontSize: 10,
      fontWeight: "500",
      textAlign: "center",
    },

    moreButton: {
      width: 24,
      height: 30,
      justifyContent:
        "center",
      alignItems: "center",
    },

    dateText: {
      fontSize: 12,
      color: "#475569",
      marginBottom: 6,
    },

    infoText: {
      fontSize: 11,
      color: "#73839D",
      marginBottom: 4,
    },

    // =================================================
    // POPUP
    // =================================================

    popupMenu: {
      position: "absolute",
      top: 38,
      right: 27,
      width: 112,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor: "#DCE7FA",
      borderRadius: 12,
      padding: 6,

      // Card-аас дээр харагдана
      zIndex: 1000,
      elevation: 10,

      // Web
      boxShadow:
        "0px 3px 12px rgba(0,0,0,0.10)",
    },

    menuItem: {
      height: 34,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 9,
      borderRadius: 6,
      gap: 9,
    },

    menuItemHover: {
      backgroundColor:
        "#F0F7FF",
    },

    menuDivider: {
      height: 1,
      backgroundColor:
        "#EDF0F5",
      marginVertical: 3,
    },

    editText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#2388EF",
    },

    deleteText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#E5484D",
    },

    // =================================================
    // LOADING / ERROR
    // =================================================

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
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

    // =================================================
    // EMPTY
    // =================================================

    emptyList: {
      flexGrow: 1,
      justifyContent:
        "center",
      paddingHorizontal: 25,
      paddingBottom: 50,
    },

    emptyContainer: {
      alignItems: "center",
      justifyContent:
        "center",
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