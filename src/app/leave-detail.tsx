
import { Feather } from "@expo/vector-icons";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const BLUE = "#2075D2";

// ======================================
// ОГНОО ФОРМАТЛАХ
// ======================================

const formatDate = (
  date?: string
): string => {

  if (!date) return "-";

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
// ТӨЛӨВИЙН ӨНГӨ
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
    value.includes("зөвшөөр")
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
// МЭДЭЭЛЛИЙН МӨР
// ======================================

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<
    typeof Feather
  >["name"];
  label: string;
  value?: string | number;
}) {

  return (

    <View style={styles.infoRow}>

      <View style={styles.iconBox}>

        <Feather
          name={icon}
          size={19}
          color={BLUE}
        />

      </View>

      <View style={styles.infoContent}>

        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value === undefined ||
          value === null ||
          value === ""
            ? "-"
            : String(value)}
        </Text>

      </View>

    </View>

  );

}

// ======================================
// DETAIL SCREEN
// ======================================

export default function LeaveDetailScreen() {

  const params = useLocalSearchParams<{
    breakId?: string;
    breakTypeNm?: string;
    prgsStatusNm?: string;
    breakstartDate?: string;
    breakfinishDate?: string;
    regDate?: string;
    breakSalaryNm?: string;
    workDays?: string;
    breakNote?: string;

    userNm?: string;
    cstmNm?: string;
    userId?: string;
    cstmCd?: string;
    token?: string;
  }>();

  const {
    breakId,
    breakTypeNm,
    prgsStatusNm,
    breakstartDate,
    breakfinishDate,
    regDate,
    breakSalaryNm,
    workDays,
    breakNote,

    userNm,
    cstmNm,
    userId,
    cstmCd,
    token,
  } = params;

  const statusStyle =
    getStatusStyle(prgsStatusNm);

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
  // UI
  // ====================================

  return (

    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >

          <Feather
            name="arrow-left"
            size={23}
            color="#26364D"
          />

        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Хүсэлтийн дэлгэрэнгүй
        </Text>

        <TouchableOpacity
          onPress={goHome}
          style={styles.headerButton}
        >

          <Feather
            name="home"
            size={22}
            color="#26364D"
          />

        </TouchableOpacity>

      </View>

      {/* CONTENT */}

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >

        {/* ХҮСЭЛТИЙН ҮНДСЭН МЭДЭЭЛЭЛ */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.titleContent}>

              <Text style={styles.smallLabel}>
                ХҮСЭЛТИЙН ДУГААР
              </Text>

              <Text style={styles.requestNumber}>
                № {breakId || "-"}
              </Text>

            </View>

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
                {prgsStatusNm ||
                  "Тодорхойгүй"}
              </Text>

            </View>

          </View>

          <View style={styles.divider} />

          {/* ХҮСЭЛТИЙН ТӨРӨЛ */}

          <InfoRow
            icon="file-text"
            label="Хүсэлтийн төрөл"
            value={
              breakTypeNm ||
              "Амралтын хүсэлт"
            }
          />

          {/* ЭХЛЭХ ОГНОО */}

          <InfoRow
            icon="calendar"
            label="Эхлэх огноо"
            value={formatDate(
              breakstartDate
            )}
          />

          {/* ДУУСАХ ОГНОО */}

          <InfoRow
            icon="calendar"
            label="Дуусах огноо"
            value={formatDate(
              breakfinishDate
            )}
          />

          {/* АЖЛЫН ӨДӨР */}

          <InfoRow
            icon="clock"
            label="Ажлын өдөр"
            value={
              workDays === undefined
                ? "-"
                : `${workDays} өдөр`
            }
          />

          {/* ЦАЛИНТАЙ ЭСЭХ */}

          <InfoRow
            icon="credit-card"
            label="Цалинтай эсэх"
            value={breakSalaryNm || "-"}
          />

          {/* БҮРТГЭСЭН ОГНОО */}

          <InfoRow
            icon="calendar"
            label="Бүртгэсэн огноо"
            value={formatDate(regDate)}
          />

        </View>

        {/* ТАЙЛБАР */}

        <View style={styles.card}>

          <View style={styles.sectionHeader}>

            <Feather
              name="align-left"
              size={19}
              color={BLUE}
            />

            <Text style={styles.sectionTitle}>
              Хүсэлтийн тайлбар
            </Text>

          </View>

          <View style={styles.noteBox}>

            <Text style={styles.noteText}>
              {breakNote ||
                "Тайлбар оруулаагүй байна."}
            </Text>

          </View>

        </View>

        {/* ХҮСЭЛТИЙН ТӨЛӨВ */}

        <View style={styles.card}>

          <View style={styles.sectionHeader}>

            <Feather
              name="activity"
              size={19}
              color={BLUE}
            />

            <Text style={styles.sectionTitle}>
              Хүсэлтийн төлөв
            </Text>

          </View>

          <View style={styles.progressRow}>

            <View
              style={[
                styles.progressIcon,
                {
                  backgroundColor:
                    statusStyle.backgroundColor,
                },
              ]}
            >

              <Feather
                name="file-text"
                size={18}
                color={statusStyle.color}
              />

            </View>

            <View style={styles.progressContent}>

              <Text style={styles.progressTitle}>
                {prgsStatusNm ||
                  "Тодорхойгүй"}
              </Text>

              <Text style={styles.progressDate}>
                Бүртгэсэн:{" "}
                {formatDate(regDate)}
              </Text>

            </View>

          </View>

        </View>

        {/* БУЦАХ ТОВЧ */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >

          <Feather
            name="arrow-left"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.backButtonText}>
            Миний хүсэлтүүд рүү буцах
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>

  );

}

// ======================================
// STYLES
// ======================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  header: {
    height: 60,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF5",
  },

  headerButton: {
    width: 35,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#26364D",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 45,
    gap: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E7ECF3",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  titleContent: {
    flex: 1,
  },

  smallLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 5,
  },

  requestNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#26364D",
  },

  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#EDF0F5",
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 19,
    gap: 12,
  },

  iconBox: {
    width: 39,
    height: 39,
    borderRadius: 10,
    backgroundColor: "#EAF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    gap: 4,
  },

  infoLabel: {
    fontSize: 12,
    color: "#94A3B8",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#26364D",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#26364D",
  },

  noteBox: {
    backgroundColor: "#F8FAFD",
    borderRadius: 9,
    padding: 13,
  },

  noteText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#475569",
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  progressContent: {
    flex: 1,
    gap: 5,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#26364D",
  },

  progressDate: {
    fontSize: 12,
    color: "#94A3B8",
  },

  backButton: {
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 5,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

});
