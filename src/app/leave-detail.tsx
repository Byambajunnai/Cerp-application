import { Feather } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
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

const TIMEBREAK_URL =
  `${API_URL}/api/mobile/timebreak`;

// =====================================================
// TYPE
// =====================================================

type TimeBreakDetail = {
  breakId?: string;

  breakType?: string;
  breakTypeNm?: string;

  breakSalary?: string;
  breakSalaryNm?: string;

  breakstartDate?: string;
  breakfinishDate?: string;

  workDays?: string | number;

  breakNote?: string;

  prgsStatusCd?: string;
  prgsStatusNm?: string;

  regDate?: string;
  regNm?: string;

  cstmorgCd?: string;
  cstmNm?: string;

  userPositionNm?: string;

  fileId?: string;
  fileNm?: string;

  checkNm?: string;
  checkDate?: string;

  confirmNm?: string;
  confirmDate?: string;

  message?: string;
};

// =====================================================
// DATE
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

  return value
    .substring(0, 10)
    .replace(/-/g, ".");
};

// =====================================================
// FILE NAME
// =====================================================

const getFileName = (
  value?: string
) => {
  if (!value) {
    return "";
  }

  try {
    const normalized =
      value.replace(/\\/g, "/");

    const parts =
      normalized.split("/");

    return decodeURIComponent(
      parts[
        parts.length - 1
      ] || ""
    );
  } catch {
    const normalized =
      value.replace(/\\/g, "/");

    const parts =
      normalized.split("/");

    return (
      parts[
        parts.length - 1
      ] || value
    );
  }
};

// =====================================================
// STATUS STYLE
// =====================================================

const getStatusStyle = (
  status?: string
) => {
  const value = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  if (
    value.includes("татгалз") ||
    value.includes("буцаа")
  ) {
    return {
      backgroundColor: "#FDEBED",
      color: "#D94B55",
    };
  }

  if (
    value.includes("батал") ||
    value.includes("зөвшөөр")
  ) {
    return {
      backgroundColor: "#E4F7ED",
      color: "#21945B",
    };
  }

  if (
    value.includes("илгээ")
  ) {
    return {
      backgroundColor: "#E7F0FF",
      color: "#3275D8",
    };
  }

  if (
    value.includes("хадгал")
  ) {
    return {
      backgroundColor: "#F1F3F6",
      color: "#64748B",
    };
  }

  return {
    backgroundColor: "#FFF0D8",
    color: "#C77700",
  };
};

// =====================================================
// STATUS STEP
// =====================================================

const getCurrentStep = (
  statusCd?: string,
  statusNm?: string
) => {
  const code = String(
    statusCd || ""
  ).trim();

  const name = String(
    statusNm || ""
  )
    .trim()
    .toLowerCase();

  // -----------------------------------
  // 1. Хадгалсан
  // -----------------------------------

  if (
    code === "10" ||
    name.includes("хадгал")
  ) {
    return 1;
  }

  // -----------------------------------
  // 2. Илгээсэн
  // -----------------------------------

  if (
    code === "20" ||
    name.includes("илгээ")
  ) {
    return 2;
  }

  // -----------------------------------
  // 3. Дарга баталсан / шалгуулсан
  // -----------------------------------

  if (
    code === "30" ||
    name.includes("шалгуул") ||
    name.includes("хяна") ||
    name.includes("дарга")
  ) {
    return 3;
  }

  // -----------------------------------
  // 4. Шийдвэрлэсэн
  // -----------------------------------

  if (
    code === "40" ||
    name.includes("шийдвэр") ||
    name.includes("батлаг") ||
    name.includes("дуус")
  ) {
    return 4;
  }

  return 1;
};

// =====================================================
// MAIN
// =====================================================

export default function LeaveDetailScreen() {
  // ===================================================
  // PARAMS
  // ===================================================

  const params =
    useLocalSearchParams<{
      breakId?: string;
      breakType?: string;

      breakTypeNm?: string;

      prgsStatusCd?: string;
      prgsStatusNm?: string;

      breakstartDate?: string;
      breakfinishDate?: string;

      regDate?: string;

      breakSalary?: string;
      breakSalaryNm?: string;

      workDays?: string;

      breakNote?: string;

      fileId?: string;
      fileNm?: string;

      userNm?: string;
      cstmNm?: string;
      userId?: string;
      cstmCd?: string;
      token?: string;
    }>();

  const {
    breakId,
    breakType,

    userNm,
    cstmNm,
    userId,
    cstmCd,
    token,
  } = params;

  // ===================================================
  // STATE
  // ===================================================

  const [
    detail,
    setDetail,
  ] =
    useState<TimeBreakDetail | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    sending,
    setSending,
  ] =
    useState(false);

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
    if (
      Platform.OS === "web"
    ) {
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
  // DEBUG
  // ===================================================

  useEffect(() => {
    console.log(
      "===================================="
    );

    console.log(
      "LEAVE DETAIL PARAMS"
    );

    console.log(
      "BREAK ID:",
      breakId
    );

    console.log(
      "BREAK TYPE:",
      breakType
    );

    console.log(
      "TOKEN:",
      token
        ? "TOKEN БАЙНА"
        : "TOKEN БАЙХГҮЙ"
    );

    console.log(
      "===================================="
    );
  }, [
    breakId,
    breakType,
    token,
  ]);

  // ===================================================
  // GET DETAIL
  // ===================================================

  const loadDetail =
    useCallback(
      async () => {
        try {
          setLoading(true);

          // ---------------------------------
          // VALIDATION
          // ---------------------------------

          if (!breakId) {
            throw new Error(
              "Хүсэлтийн дугаар олдсонгүй."
            );
          }

          if (!breakType) {
            throw new Error(
              "Хүсэлтийн төрөл олдсонгүй."
            );
          }

          if (!token) {
            throw new Error(
              "Нэвтрэх мэдээлэл олдсонгүй."
            );
          }

          // ---------------------------------
          // URL
          // ---------------------------------

          const url =
            `${TIMEBREAK_URL}/` +
            `${encodeURIComponent(
              String(
                breakId
              )
            )}` +
            `?breakType=${encodeURIComponent(
              String(
                breakType
              )
            )}`;

          console.log(
            "===================================="
          );

          console.log(
            "DETAIL URL:",
            url
          );

          // ---------------------------------
          // REQUEST
          // ---------------------------------

          const response =
            await fetch(
              url,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          // ---------------------------------
          // RESPONSE
          // ---------------------------------

          const responseText =
            await response.text();

          console.log(
            "DETAIL STATUS:",
            response.status
          );

          console.log(
            "DETAIL RESPONSE:",
            responseText
          );

          console.log(
            "===================================="
          );

          let data: any = {};

          if (
            responseText.trim()
          ) {
            try {
              data =
                JSON.parse(
                  responseText
                );
            } catch {
              throw new Error(
                `Сервер JSON бус хариу буцаалаа. HTTP ${response.status}`
              );
            }
          }

          // ---------------------------------
          // ERROR
          // ---------------------------------

          if (
            response.status === 401
          ) {
            throw new Error(
              "Нэвтрэх эрхийн хугацаа дууссан байна."
            );
          }

          if (!response.ok) {
            throw new Error(
              data?.message ||
                `Хүсэлтийн мэдээлэл авахад алдаа гарлаа. HTTP ${response.status}`
            );
          }

          // ---------------------------------
          // API заримдаа data/result дотор
          // object буцааж болох тул шалгана.
          // ---------------------------------

          const result =
            data?.data &&
            typeof data.data ===
              "object"
              ? data.data
              : data?.result &&
                typeof data.result ===
                  "object"
              ? data.result
              : data;

          // ---------------------------------
          // FALLBACK
          // list-ээс дамжсан мэдээллийг
          // detail response-д байхгүй бол ашиглана.
          // ---------------------------------

          const normalized:
            TimeBreakDetail = {
            ...result,

            breakId:
              result?.breakId ||
              breakId,

            breakType:
              result?.breakType ||
              breakType,

            breakTypeNm:
              result?.breakTypeNm ||
              params.breakTypeNm ||
              "",

            prgsStatusCd:
              result?.prgsStatusCd ||
              params.prgsStatusCd ||
              "",

            prgsStatusNm:
              result?.prgsStatusNm ||
              params.prgsStatusNm ||
              "",

            breakstartDate:
              result?.breakstartDate ||
              params.breakstartDate ||
              "",

            breakfinishDate:
              result?.breakfinishDate ||
              params.breakfinishDate ||
              "",

            regDate:
              result?.regDate ||
              params.regDate ||
              "",

            breakSalary:
              result?.breakSalary ||
              params.breakSalary ||
              "",

            breakSalaryNm:
              result?.breakSalaryNm ||
              params.breakSalaryNm ||
              "",

            workDays:
              result?.workDays ??
              params.workDays ??
              "",

            breakNote:
              result?.breakNote ||
              params.breakNote ||
              "",

            fileId:
              result?.fileId ||
              params.fileId ||
              "",

            fileNm:
              result?.fileNm ||
              params.fileNm ||
              "",
          };

          console.log(
            "NORMALIZED DETAIL:",
            normalized
          );

          setDetail(
            normalized
          );
        } catch (
          error: unknown
        ) {
          const message =
            error instanceof Error
              ? error.message
              : "Хүсэлтийн мэдээлэл авахад алдаа гарлаа.";

          console.error(
            "DETAIL ERROR:",
            message
          );

          showMessage(
            "Алдаа",
            message
          );
        } finally {
          setLoading(false);
        }
      },
      [
        breakId,
        breakType,
        token,

        params.breakTypeNm,
        params.prgsStatusCd,
        params.prgsStatusNm,

        params.breakstartDate,
        params.breakfinishDate,

        params.regDate,

        params.breakSalary,
        params.breakSalaryNm,

        params.workDays,
        params.breakNote,

        params.fileId,
        params.fileNm,
      ]
    );

  // ===================================================
  // LOAD
  // ===================================================

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // ===================================================
  // BACK
  // ===================================================

  const goBack = () => {
    router.back();
  };

  // ===================================================
  // EDIT
  // ===================================================

  const handleEdit = () => {
    if (!detail) {
      return;
    }

    // Зөвхөн хадгалсан хүсэлт
    if (
      String(
        detail.prgsStatusCd
      ) !== "10"
    ) {
      showMessage(
        "Анхааруулга",
        "Зөвхөн хадгалсан хүсэлтийг засах боломжтой."
      );

      return;
    }

    router.push({
      pathname:
        "/leave-edit" as any,

      params: {
        ...navigationParams,

        breakId:
          detail.breakId ||
          "",

        breakType:
          detail.breakType ||
          breakType ||
          "",

        breakTypeNm:
          detail.breakTypeNm ||
          "",

        prgsStatusCd:
          detail.prgsStatusCd ||
          "",

        prgsStatusNm:
          detail.prgsStatusNm ||
          "",

        breakstartDate:
          detail.breakstartDate ||
          "",

        breakfinishDate:
          detail.breakfinishDate ||
          "",

        breakSalary:
          detail.breakSalary ||
          "",

        breakSalaryNm:
          detail.breakSalaryNm ||
          "",

        workDays:
          String(
            detail.workDays ??
              ""
          ),

        breakNote:
          detail.breakNote ||
          "",

        fileId:
          detail.fileId ||
          "",

        fileNm:
          detail.fileNm ||
          "",
      },
    });
  };

  // ===================================================
  // SEND REQUEST
  // ===================================================

  const sendRequest =
    async () => {
      if (
        !detail ||
        sending
      ) {
        return;
      }

      // ---------------------------------
      // Зөвхөн хадгалсан үед илгээнэ
      // ---------------------------------

      if (
        String(
          detail.prgsStatusCd
        ) !== "10"
      ) {
        showMessage(
          "Анхааруулга",
          "Зөвхөн хадгалсан хүсэлтийг илгээх боломжтой."
        );

        return;
      }

      const requestBreakId =
        detail.breakId ||
        breakId;

      const requestBreakType =
        detail.breakType ||
        breakType;

      if (!requestBreakId) {
        showMessage(
          "Алдаа",
          "Хүсэлтийн дугаар олдсонгүй."
        );

        return;
      }

      if (
        !requestBreakType
      ) {
        showMessage(
          "Алдаа",
          "Хүсэлтийн төрөл олдсонгүй."
        );

        return;
      }

      if (!token) {
        showMessage(
          "Алдаа",
          "Нэвтрэх мэдээлэл олдсонгүй."
        );

        return;
      }

      try {
        setSending(true);

        // =================================
        // POST TimeBreak - 6. ИЛГЭЭХ
        // =================================

        const url =
          `${TIMEBREAK_URL}/` +
          `${encodeURIComponent(
            String(
              requestBreakId
            )
          )}` +
          `/send` +
          `?breakType=${encodeURIComponent(
            String(
              requestBreakType
            )
          )}`;

        console.log(
          "===================================="
        );

        console.log(
          "SEND REQUEST"
        );

        console.log(
          "SEND URL:",
          url
        );

        console.log(
          "BREAK ID:",
          requestBreakId
        );

        console.log(
          "BREAK TYPE:",
          requestBreakType
        );

        // =================================
        // REQUEST
        // =================================

        const response =
          await fetch(
            url,
            {
              method: "POST",

              headers: {
                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const responseText =
          await response.text();

        console.log(
          "SEND STATUS:",
          response.status
        );

        console.log(
          "SEND RESPONSE:",
          responseText
        );

        console.log(
          "===================================="
        );

        let data: any = {};

        if (
          responseText.trim()
        ) {
          try {
            data =
              JSON.parse(
                responseText
              );
          } catch {
            // Амжилттай мөртлөө text
            // буцааж болох тул response.ok
            // бол шууд алдаа гэж үзэхгүй.
            data = {
              message:
                responseText,
            };
          }
        }

        if (
          response.status === 401
        ) {
          throw new Error(
            "Нэвтрэх эрхийн хугацаа дууссан байна."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Хүсэлт илгээхэд алдаа гарлаа. HTTP ${response.status}`
          );
        }

        // =================================
        // ИЛГЭЭСНИЙ ДАРАА DETAIL REFRESH
        // =================================

        await loadDetail();

        showMessage(
          "Амжилттай",
          data?.message ||
            "Хүсэлт амжилттай илгээгдлээ."
        );
      } catch (
        error: unknown
      ) {
        const message =
          error instanceof Error
            ? error.message
            : "Хүсэлт илгээхэд алдаа гарлаа.";

        console.error(
          "SEND ERROR:",
          message
        );

        showMessage(
          "Алдаа",
          message
        );
      } finally {
        setSending(false);
      }
    };

  // ===================================================
  // SEND CONFIRM
  // ===================================================

  const handleSend = () => {
    if (
      Platform.OS === "web"
    ) {
      const confirmed =
        window.confirm(
          "Хүсэлтийг батлагчид илгээх үү?"
        );

      if (confirmed) {
        sendRequest();
      }

      return;
    }

    Alert.alert(
      "Хүсэлт илгээх",
      "Хүсэлтийг батлагчид илгээх үү?",
      [
        {
          text: "Болих",
          style: "cancel",
        },

        {
          text: "Илгээх",
          onPress:
            sendRequest,
        },
      ]
    );
  };

  // ===================================================
  // FILE
  // ===================================================

  const handleFile = () => {
    if (
      !detail?.fileId
    ) {
      showMessage(
        "Анхааруулга",
        "Хавсаргасан файл олдсонгүй."
      );

      return;
    }

    console.log(
      "FILE ID:",
      detail.fileId
    );

    console.log(
      "FILE NAME:",
      detail.fileNm
    );

    /*
      Танай backend-ийн файл татах API
      тодорхой болмогц энд fetch/open хийнэ.

      Одоогоор fileId болон fileNm
      зөв ирж байгаа эсэхийг харуулна.
    */

    showMessage(
      "Хавсаргасан файл",
      detail.fileNm
        ? getFileName(
            detail.fileNm
          )
        : `Файлын ID: ${detail.fileId}`
    );
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
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
            Хүсэлтийн мэдээлэл
            ачаалж байна...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // EMPTY
  // ===================================================

  if (!detail) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.center
          }
        >
          <Feather
            name="alert-circle"
            size={45}
            color="#94A3B8"
          />

          <Text
            style={
              styles.errorTitle
            }
          >
            Хүсэлтийн мэдээлэл
            олдсонгүй.
          </Text>

          <Pressable
            style={
              styles.retryButton
            }
            onPress={
              loadDetail
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

          <Pressable
            style={
              styles.backTextButton
            }
            onPress={goBack}
          >
            <Text
              style={
                styles.backText
              }
            >
              Буцах
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // VARIABLES
  // ===================================================

  const statusStyle =
    getStatusStyle(
      detail.prgsStatusNm
    );

  const isSaved =
    String(
      detail.prgsStatusCd ||
        ""
    ) === "10";

  const hasFile =
    Boolean(
      detail.fileId &&
        String(
          detail.fileId
        ) !== "null"
    );

  const fileName =
    getFileName(
      detail.fileNm
    );

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

        <View
          style={
            styles.headerRight
          }
        />
      </View>

      {/* ================================= */}
      {/* CONTENT */}
      {/* ================================= */}

      <ScrollView
        style={
          styles.scrollView
        }
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* =============================== */}
        {/* REQUEST INFO */}
        {/* =============================== */}

        <View
          style={
            styles.mainCard
          }
        >
          {/* CARD HEADER */}

          <View
            style={
              styles.cardHeader
            }
          >
            <Text
              style={
                styles.cardTitle
              }
            >
              Хүсэлтийн мэдээлэл
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
                {detail.prgsStatusNm ||
                  "-"}
              </Text>
            </View>
          </View>

          {/* TYPE */}

          <InfoRow
            label="Төрөл"
            value={
              detail.breakTypeNm ||
              "-"
            }
          />

          {/* NAME */}

          <InfoRow
            label="Овог, нэр"
            value={
              detail.regNm ||
              userNm ||
              "-"
            }
          />

          {/* ORGANIZATION */}

          <InfoRow
            label="ГТХ"
            value={
              detail.cstmNm ||
              detail.cstmorgCd ||
              cstmNm ||
              "-"
            }
            multiline
          />

          {/* SALARY */}

          <InfoRow
            label="Цалинтай эсэх"
            value={
              detail.breakSalaryNm ||
              (detail.breakSalary ===
              "Y"
                ? "Тийм"
                : detail.breakSalary ===
                  "N"
                ? "Үгүй"
                : "-")
            }
          />

          {/* START DATE */}

          <InfoRow
            label="Эхлэх огноо"
            value={
              formatDate(
                detail.breakstartDate
              )
            }
          />

          {/* END DATE */}

          <InfoRow
            label="Дуусах огноо"
            value={
              formatDate(
                detail.breakfinishDate
              )
            }
          />

          {/* WORK DAYS */}

          <InfoRow
            label="Ажлын өдөр"
            value={
              String(
                detail.workDays ??
                  "-"
              )
            }
          />

          {/* ============================= */}
          {/* FILE */}
          {/* ============================= */}

          {hasFile && (
            <View
              style={
                styles.fileSection
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Хавсаргасан файл
              </Text>

              <Pressable
                onPress={
                  handleFile
                }
                style={({
                  hovered,
                  pressed,
                }) => [
                  styles.fileCard,

                  (hovered ||
                    pressed) &&
                    styles.fileCardHover,
                ]}
              >
                <View
                  style={
                    styles.fileIcon
                  }
                >
                  <Feather
                    name="file-text"
                    size={21}
                    color="#FFFFFF"
                  />
                </View>

                <View
                  style={
                    styles.fileInfo
                  }
                >
                  <Text
                    style={
                      styles.fileName
                    }
                    numberOfLines={
                      1
                    }
                  >
                    {fileName ||
                      "Хавсаргасан файл"}
                  </Text>

                  <Text
                    style={
                      styles.fileId
                    }
                  >
                    ID:{" "}
                    {detail.fileId}
                  </Text>
                </View>

                <Feather
                  name="download"
                  size={21}
                  color={BLUE}
                />
              </Pressable>
            </View>
          )}

          {/* ============================= */}
          {/* NOTE */}
          {/* ============================= */}

          <View
            style={
              styles.noteSection
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Тайлбар
            </Text>

            <View
              style={
                styles.noteBox
              }
            >
              <Text
                style={
                  styles.noteText
                }
              >
                {detail.breakNote ||
                  "Тайлбар байхгүй."}
              </Text>
            </View>
          </View>
        </View>

        {/* =============================== */}
        {/* STATUS TIMELINE */}
        {/* =============================== */}

        <StatusTimeline
          statusCd={
            detail.prgsStatusCd
          }
          statusNm={
            detail.prgsStatusNm
          }
          regDate={
            detail.regDate
          }
          checkDate={
            detail.checkDate
          }
          confirmDate={
            detail.confirmDate
          }
        />
      </ScrollView>

      {/* ================================= */}
      {/* ACTION BUTTONS */}
      {/* ХАДГАЛСАН ҮЕД Л */}
      {/* ================================= */}

      {isSaved && (
        <View
          style={
            styles.actionContainer
          }
        >
          {/* EDIT */}

          <Pressable
            style={({
              hovered,
              pressed,
            }) => [
              styles.editButton,

              (hovered ||
                pressed) &&
                styles.editButtonHover,
            ]}
            onPress={
              handleEdit
            }
            disabled={
              sending
            }
          >
            <Feather
              name="edit-2"
              size={20}
              color={BLUE}
            />

            <Text
              style={
                styles.editButtonText
              }
            >
              Засах
            </Text>
          </Pressable>

          {/* SEND */}

          <Pressable
            style={({
              hovered,
              pressed,
            }) => [
              styles.sendButton,

              (hovered ||
                pressed ||
                sending) &&
                styles.sendButtonPressed,
            ]}
            onPress={
              handleSend
            }
            disabled={
              sending
            }
          >
            {sending ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Feather
                  name="send"
                  size={20}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.sendButtonText
                  }
                >
                  Илгээх
                </Text>
              </>
            )}
          </Pressable>
        </View>
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
// INFO ROW
// =====================================================

function InfoRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,

        multiline &&
          styles.infoRowMultiline,
      ]}
    >
      <Text
        style={
          styles.infoLabel
        }
      >
        {label}
      </Text>

      <Text
        style={[
          styles.infoValue,

          multiline &&
            styles.infoValueMultiline,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// =====================================================
// STATUS TIMELINE
// =====================================================

function StatusTimeline({
  statusCd,
  statusNm,
  regDate,
  checkDate,
  confirmDate,
}: {
  statusCd?: string;
  statusNm?: string;
  regDate?: string;
  checkDate?: string;
  confirmDate?: string;
}) {
  const currentStep =
    getCurrentStep(
      statusCd,
      statusNm
    );

  const steps = [
    {
      id: 1,
      title: "Хадгалсан",
      date: regDate || "",
    },

    {
      id: 2,
      title: "Илгээсэн",
      date: "",
    },

    {
      id: 3,
      title: "Шалгуулсан",
      date:
        checkDate || "",
    },

    {
      id: 4,
      title: "Шийдвэрлэсэн",
      date:
        confirmDate || "",
    },
  ];

  return (
    <View
      style={
        styles.timelineCard
      }
    >
      {/* HEADER */}

      <View
        style={
          styles.timelineHeader
        }
      >
        <Text
          style={
            styles.timelineHeaderText
          }
        >
          Шийдвэрийн мэдээлэл
        </Text>
      </View>

      {/* TIMELINE */}

      <View
        style={
          styles.timelineContainer
        }
      >
        {steps.map(
          (
            step,
            index
          ) => {
            const completed =
              step.id <=
              currentStep;

            const current =
              step.id ===
              currentStep;

            const lineActive =
              step.id <
              currentStep;

            return (
              <View
                key={
                  step.id
                }
                style={
                  styles.timelineStep
                }
              >
                {/* LINE */}

                {index <
                  steps.length -
                    1 && (
                  <View
                    style={[
                      styles.timelineLine,

                      lineActive
                        ? styles.timelineLineActive
                        : styles.timelineLineInactive,
                    ]}
                  />
                )}

                {/* CIRCLE */}

                <View
                  style={[
                    styles.timelineCircle,

                    completed
                      ? styles.timelineCircleActive
                      : styles.timelineCircleInactive,

                    current &&
                      styles.timelineCircleCurrent,
                  ]}
                >
                  {completed && (
                    <Feather
                      name="check"
                      size={13}
                      color={
                        current
                          ? "#FFFFFF"
                          : BLUE
                      }
                    />
                  )}
                </View>

                {/* TITLE */}

                <Text
                  style={[
                    styles.timelineTitle,

                    completed &&
                      styles.timelineTitleActive,
                  ]}
                  numberOfLines={
                    1
                  }
                >
                  {step.title}
                </Text>

                {/* DATE */}

                <Text
                  style={
                    styles.timelineDate
                  }
                >
                  {step.date
                    ? formatDate(
                        step.date
                      )
                    : " "}
                </Text>
              </View>
            );
          }
        )}
      </View>
    </View>
  );
}

// =====================================================
// STYLE
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

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 14,
      paddingBottom: 20,
    },

    // =================================================
    // HEADER
    // =================================================

    header: {
      height: 78,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#FFFFFF",
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 11,
    },

    headerTitle: {
      flex: 1,
      fontSize: 22,
      fontWeight: "700",
      color: "#1D2B43",
    },

    headerRight: {
      width: 42,
    },

    // =================================================
    // CARD
    // =================================================

    mainCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingTop: 8,
      paddingBottom: 18,
      borderWidth: 1,
      borderColor: "#EDF2FA",
    },

    cardHeader: {
      minHeight: 49,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 12,
      backgroundColor:
        "#F0F6FF",
      borderRadius: 13,
      marginBottom: 5,
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#15356A",
    },

    statusBadge: {
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 20,
    },

    statusText: {
      fontSize: 10,
      fontWeight: "600",
    },

    // =================================================
    // INFO ROW
    // =================================================

    infoRow: {
      minHeight: 41,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E0EAF7",
      paddingHorizontal: 11,
    },

    infoRowMultiline: {
      minHeight: 55,
      alignItems:
        "flex-start",
      paddingTop: 12,
      paddingBottom: 10,
    },

    infoLabel: {
      width: "44%",
      fontSize: 12,
      color: "#7589AB",
    },

    infoValue: {
      flex: 1,
      fontSize: 12,
      color: "#173D7A",
    },

    infoValueMultiline: {
      lineHeight: 17,
    },

    // =================================================
    // FILE
    // =================================================

    fileSection: {
      marginTop: 24,
      paddingHorizontal: 4,
    },

    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: "#17365D",
      marginBottom: 10,
    },

    fileCard: {
      minHeight: 66,
      borderRadius: 12,
      backgroundColor:
        "#F3F7FC",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        "#EDF2F7",
    },

    fileCardHover: {
      backgroundColor:
        "#EDF6FF",
      borderColor: BLUE,
    },

    fileIcon: {
      width: 42,
      height: 42,
      borderRadius: 8,
      backgroundColor:
        "#E8505B",
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 11,
    },

    fileInfo: {
      flex: 1,
      paddingRight: 10,
    },

    fileName: {
      fontSize: 12,
      fontWeight: "700",
      color: "#17365D",
    },

    fileId: {
      marginTop: 4,
      fontSize: 10,
      color: "#8A9AB2",
    },

    // =================================================
    // NOTE
    // =================================================

    noteSection: {
      marginTop: 20,
      paddingHorizontal: 4,
    },

    noteBox: {
      minHeight: 110,
      borderWidth: 1,
      borderColor:
        "#C9DDF8",
      borderRadius: 12,
      padding: 13,
      backgroundColor:
        "#FFFFFF",
    },

    noteText: {
      fontSize: 12,
      lineHeight: 18,
      color: "#173D7A",
    },

    // =================================================
    // TIMELINE
    // =================================================

    timelineCard: {
      marginTop: 14,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      paddingBottom: 20,
      borderWidth: 1,
      borderColor:
        "#EDF2FA",
    },

    timelineHeader: {
      minHeight: 47,
      justifyContent:
        "center",
      paddingHorizontal: 14,
      margin: 7,
      backgroundColor:
        "#F0F6FF",
      borderRadius: 13,
    },

    timelineHeaderText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#15356A",
    },

    timelineContainer: {
      flexDirection: "row",
      paddingHorizontal: 7,
      paddingTop: 18,
    },

    timelineStep: {
      flex: 1,
      position: "relative",
      alignItems: "center",
    },

    timelineCircle: {
      width: 25,
      height: 25,
      borderRadius: 13,
      borderWidth: 1.5,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        "#FFFFFF",
      zIndex: 5,
    },

    timelineCircleActive: {
      borderColor: BLUE,
    },

    timelineCircleInactive: {
      borderColor:
        "#CBD5E1",
    },

    timelineCircleCurrent: {
      backgroundColor: BLUE,
      borderColor:
        "#9ACBFA",
      borderWidth: 3,
    },

    timelineLine: {
      position: "absolute",
      top: 12,
      left: "62%",
      width: "76%",
      height: 2,
      zIndex: 1,
    },

    timelineLineActive: {
      backgroundColor: BLUE,
    },

    timelineLineInactive: {
      backgroundColor:
        "#DCE7F6",
    },

    timelineTitle: {
      marginTop: 7,
      fontSize: 9,
      color: "#8492A6",
      textAlign: "center",
    },

    timelineTitleActive: {
      color: "#173D7A",
      fontWeight: "600",
    },

    timelineDate: {
      marginTop: 3,
      minHeight: 11,
      fontSize: 8,
      color: "#8A9AB2",
      textAlign: "center",
    },

    // =================================================
    // ACTIONS
    // =================================================

    actionContainer: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 9,
      backgroundColor:
        "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor:
        "#EDF2F7",
    },

    editButton: {
      flex: 1,
      height: 50,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: BLUE,
      backgroundColor:
        "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 9,
    },

    editButtonHover: {
      backgroundColor:
        "#F0F7FF",
    },

    editButtonText: {
      color: BLUE,
      fontSize: 14,
      fontWeight: "700",
    },

    sendButton: {
      flex: 1,
      height: 50,
      borderRadius: 13,
      backgroundColor: BLUE,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 9,
    },

    sendButtonPressed: {
      opacity: 0.75,
    },

    sendButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    // =================================================
    // LOADING / ERROR
    // =================================================

    center: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 25,
      gap: 14,
    },

    loadingText: {
      fontSize: 13,
      color: "#64748B",
    },

    errorTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: "#334155",
      textAlign: "center",
    },

    retryButton: {
      marginTop: 5,
      paddingHorizontal: 20,
      height: 43,
      borderRadius: 11,
      backgroundColor: BLUE,
      justifyContent:
        "center",
      alignItems: "center",
    },

    retryText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },

    backTextButton: {
      paddingHorizontal: 20,
      height: 40,
      justifyContent:
        "center",
      alignItems: "center",
    },

    backText: {
      color: BLUE,
      fontSize: 13,
      fontWeight: "600",
    },
  });