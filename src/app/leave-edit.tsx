import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import BottomNav from "../components/BottomNav";
import { API_URL } from "../config/api";

// ========================================
// ТОХИРГОО
// ========================================

const BLUE = "#1985DE";
const TIMEBREAK_URL = `${API_URL}/api/mobile/timebreak`;

// Засах API.
// Сервер өөр method эсвэл URL ашигладаг бол ЗӨВХӨН энд солино.
// (Устгах нь DELETE /timebreak/{breakId} тул засах нь
//  PUT /timebreak/{breakId} гэж таамагласан.)
const UPDATE_METHOD = "PUT";
const getUpdateUrl = (breakId: string) =>
  `${TIMEBREAK_URL}/${encodeURIComponent(breakId)}`;

// ========================================
// TYPE
// ========================================

type SelectedFile = {
  name: string;
  uri: string;
  mimeType: string;
  size: number;
  webFile?: File;
};

type ExistingFile = {
  id: string;
  name: string;
};

type RequestType = {
  label: string;
  value: string;
};

const requestTypes: RequestType[] = [
  { label: "ТЕГ-ЫН ДАРГЫН ТУШААЛААР ЧӨЛӨӨТЭЙ", value: "16" },
  { label: "АКТ", value: "10" },
  { label: "ЦАХИМААР АЖИЛЛАХ", value: "21" },
  { label: "ЗББНДБ ЧӨЛӨӨ", value: "11" },
  { label: "ТОМИЛОЛТ", value: "12" },
  { label: "ЭЭЛЖИЙН АМРАЛТ", value: "13" },
  { label: "ХУРАЛ, ЗӨВЛӨГӨӨН, ХЭЛЭЛЦҮҮЛЭГ", value: "14" },
  { label: "ТАСАЛСАН", value: "15" },
  { label: "ЖИРЭМСНИЙ БОЛОН АМАРЖСАНЫ АМРАЛТ", value: "17" },
  {
    label:
      "ГААЛИЙН ГАЗАР, ХОРООНЫ ДАРГЫН ЧӨЛӨӨНИЙ ХУУДАС, ТУШААЛААР ЧӨЛӨӨТЭЙ",
    value: "18",
  },
  { label: "БУСАД", value: "19" },
  { label: "Хурлын өрөө хүсэлт", value: "20" },
];

// ========================================
// ОГНОО
// ========================================

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// API-аас "2026-09-24", "2026.09.24" эсвэл "20260924" хэлбэрээр ирж болно
const parseApiDate = (value?: string): Date | null => {
  if (!value) return null;

  const text = String(value).trim();

  if (/^\d{8}$/.test(text)) {
    return new Date(
      Number(text.substring(0, 4)),
      Number(text.substring(4, 6)) - 1,
      Number(text.substring(6, 8))
    );
  }

  const match = text.match(/^(\d{4})[-./](\d{2})[-./](\d{2})/);

  if (!match) return null;

  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );
};

// breakSalary = "Y"/"N", эсвэл зөвхөн breakSalaryNm = "Тийм"/"Үгүй" ирж болно
const parsePaid = (salary?: string, salaryNm?: string): boolean => {
  const code = String(salary || "").trim().toUpperCase();

  if (code === "Y") return true;
  if (code === "N") return false;

  return String(salaryNm || "").trim().toLowerCase() === "тийм";
};

// ========================================
// SCREEN
// ========================================

export default function LeaveEditScreen() {
  const params = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    cstmCd?: string;
    token?: string;

    breakId?: string;
    breakType?: string;
    breakstartDate?: string;
    breakfinishDate?: string;
    breakSalary?: string;
    breakSalaryNm?: string;
    breakNote?: string;
    fileId?: string;
    fileNm?: string;
  }>();

  const { userNm, cstmNm, userId, cstmCd, token, breakId } = params;

  // ======================================
  // STATE (хуучин утгаар бөглөнө)
  // ======================================

  const [selectedType, setSelectedType] = useState(
    params.breakType || ""
  );

  const [typeOpen, setTypeOpen] = useState(false);

  const [isPaid, setIsPaid] = useState(() =>
    parsePaid(params.breakSalary, params.breakSalaryNm)
  );

  // Серверт аль хэдийн байгаа файл
  const [existingFile, setExistingFile] =
    useState<ExistingFile | null>(() =>
      params.fileId
        ? { id: params.fileId, name: params.fileNm || "Хавсралт" }
        : null
    );

  // Шинээр сонгосон файл
  const [file, setFile] = useState<SelectedFile | null>(null);

  const [startDate, setStartDate] = useState<Date | null>(() =>
    parseApiDate(params.breakstartDate)
  );

  const [returnDate, setReturnDate] = useState<Date | null>(() =>
    parseApiDate(params.breakfinishDate)
  );

  const [activeDate, setActiveDate] =
    useState<"start" | "return" | null>(null);

  const [note, setNote] = useState(params.breakNote || "");

  const [saving, setSaving] = useState(false);

  const selectedTypeLabel =
    requestTypes.find((item) => item.value === selectedType)?.label ||
    "Сонгох";

  const navigationParams = {
    userNm: userNm || "",
    cstmNm: cstmNm || "",
    userId: userId || "",
    cstmCd: cstmCd || "",
    token: token || "",
  };

  // ======================================
  // MESSAGE
  // ======================================

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // ======================================
  // BACK
  // ======================================

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: "/leave-request",
        params: navigationParams,
      });
    }
  };

  // ======================================
  // FILE PICKER
  // ======================================

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      if (!asset) return;

      const fileSize = asset.size || 0;

      if (fileSize > 10 * 1024 * 1024) {
        showMessage(
          "Анхааруулга",
          "Файлын хэмжээ 10MB-аас их байж болохгүй."
        );
        return;
      }

      setFile({
        name: asset.name,
        uri: asset.uri,
        mimeType: asset.mimeType || "application/octet-stream",
        size: fileSize,
        webFile:
          Platform.OS === "web"
            ? (asset.file as File | undefined)
            : undefined,
      });

      // Шинэ файл сонговол хуучныг солино
      setExistingFile(null);
    } catch (error) {
      console.error("FILE PICKER ERROR:", error);
      showMessage("Алдаа", "Файл сонгоход алдаа гарлаа.");
    }
  };

  // ======================================
  // DATE PICKER
  // ======================================

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setActiveDate(null);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    if (activeDate === "start") {
      setStartDate(selectedDate);

      if (returnDate && returnDate < selectedDate) {
        setReturnDate(null);
      }
    }

    if (activeDate === "return") {
      setReturnDate(selectedDate);
    }

    if (Platform.OS === "ios") {
      setActiveDate(null);
    }
  };

  // ======================================
  // SAVE
  // ======================================

  const saveRequest = async () => {
    if (saving) return;

    if (!breakId) {
      showMessage("Алдаа", "Хүсэлтийн дугаар олдсонгүй.");
      return;
    }

    if (!selectedType) {
      showMessage("Анхааруулга", "Хүсэлтийн төрлөө сонгоно уу.");
      return;
    }

    // JSON-оор шинэ файл илгээх боломжгүй тул
    // одоохондоо зөвхөн хуучин хавсралтаа хадгална.
    if (isPaid && file) {
      showMessage(
        "Анхааруулга",
        "Засах үед файл солих боломжгүй байна. Шинэ файлаа устгаад хуучин хавсралтаар хадгална уу."
      );
      return;
    }

    if (isPaid && !existingFile) {
      showMessage(
        "Анхааруулга",
        "Цалинтай хүсэлт хавсралттай байх ёстой."
      );
      return;
    }

    if (!startDate) {
      showMessage("Анхааруулга", "Эхлэх огноог сонгоно уу.");
      return;
    }

    if (!returnDate) {
      showMessage("Анхааруулга", "Ажилд орох огноог сонгоно уу.");
      return;
    }

    if (returnDate < startDate) {
      showMessage(
        "Анхааруулга",
        "Ажилд орох огноо эхлэх огнооноос өмнө байж болохгүй."
      );
      return;
    }

    if (!token) {
      showMessage(
        "Алдаа",
        "Нэвтрэх мэдээлэл олдсонгүй. Дахин нэвтэрнэ үү."
      );
      return;
    }

    try {
      setSaving(true);

      const url = getUpdateUrl(String(breakId));

      const requestBody = {
        breakType: selectedType,
        breakSalary: isPaid ? "Y" : "N",
        breakstartDate: formatDate(startDate),
        breakfinishDate: formatDate(returnDate),
        breakNote: note.trim(),
        fileId: isPaid && existingFile ? existingFile.id : null,
      };

      console.log("UPDATE URL:", UPDATE_METHOD, url);
      console.log("UPDATE BODY:", requestBody);

      const response = await fetch(url, {
        method: UPDATE_METHOD,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      console.log("UPDATE STATUS:", response.status);
      console.log("UPDATE RESPONSE:", responseText);

      let result: {
        message?: string;
        success?: boolean;
        error?: string;
      } = {};

      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Сервер JSON бус хариу буцаалаа. HTTP ${response.status}`
          );
        }
      }

      if (response.status === 404 || response.status === 405) {
        throw new Error(
          `Засах API олдсонгүй (HTTP ${response.status}). ` +
            "leave-edit.tsx дахь UPDATE_METHOD, getUpdateUrl-ийг шалгана уу."
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Хүсэлт засахад алдаа гарлаа. HTTP ${response.status}`
        );
      }

      if (result.success === false) {
        throw new Error(result.message || "Хүсэлт засахад алдаа гарлаа.");
      }

      showMessage(
        "Амжилттай",
        result.message || "Хүсэлт амжилттай засагдлаа."
      );

      // Жагсаалт useFocusEffect-ээр автоматаар шинэчлэгдэнэ
      goBack();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Хүсэлт засахад алдаа гарлаа.";

      console.error("UPDATE REQUEST ERROR:", message);
      showMessage("Алдаа", message);
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // UI
  // ======================================

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <Feather name="chevron-left" size={27} color="#1D2B43" />
        </Pressable>

        <Text style={styles.headerTitle}>Хүсэлт засах</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ТӨРӨЛ */}
        <View style={styles.typeCard}>
          <Text style={styles.label}>Төрөл</Text>

          <Pressable
            style={styles.selectBox}
            onPress={() => setTypeOpen(!typeOpen)}
          >
            <Text
              style={[
                styles.selectText,
                !selectedType && styles.placeholderText,
              ]}
            >
              {selectedTypeLabel}
            </Text>

            <Feather
              name={typeOpen ? "chevron-up" : "chevron-down"}
              size={21}
              color="#64748B"
            />
          </Pressable>

          {typeOpen && (
            <View style={styles.dropdown}>
              {requestTypes.map((item) => (
                <Pressable
                  key={item.value}
                  style={[
                    styles.dropdownItem,
                    item.value === selectedType &&
                      styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedType(item.value);
                    setTypeOpen(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* ЦАЛИНТАЙ ЭСЭХ */}
        <View style={styles.salaryRow}>
          <Text style={styles.sectionLabel}>Цалинтай эсэх</Text>

          <Pressable
            style={styles.radioOption}
            onPress={() => setIsPaid(true)}
          >
            <View style={[styles.radio, isPaid && styles.radioSelected]}>
              {isPaid && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.radioText}>Тийм</Text>
          </Pressable>

          <Pressable
            style={styles.radioOption}
            onPress={() => {
              setIsPaid(false);
              setFile(null);
            }}
          >
            <View style={[styles.radio, !isPaid && styles.radioSelected]}>
              {!isPaid && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.radioText}>Үгүй</Text>
          </Pressable>
        </View>

        {/* ФАЙЛ */}
        {isPaid && (
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>
              Файл хавсаргах
              <Text style={{ color: "#E5484D" }}>{" *"}</Text>
            </Text>

            <Pressable style={styles.uploadBox} onPress={pickFile}>
              <Feather name="paperclip" size={23} color={BLUE} />
              <Text style={styles.uploadTitle}>
                {existingFile || file ? "Файл солих" : "Файл хавсаргах"}
              </Text>
              <Text style={styles.uploadHint}>
                PDF, JPG, PNG (10MB хүртэл)
              </Text>
            </Pressable>

            {existingFile && !file && (
              <View style={styles.fileCard}>
                <View style={styles.pdfIcon}>
                  <Text style={styles.pdfIconText}>FILE</Text>
                </View>

                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {existingFile.name}
                  </Text>
                  <Text style={styles.fileSize}>Одоо хавсаргасан файл</Text>
                </View>

                <Pressable
                  onPress={() => setExistingFile(null)}
                  style={styles.removeFileButton}
                >
                  <Feather name="x" size={20} color="#64748B" />
                </Pressable>
              </View>
            )}

            {file && (
              <View style={styles.fileCard}>
                <View style={styles.pdfIcon}>
                  <Text style={styles.pdfIconText}>FILE</Text>
                </View>

                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {(file.size / 1024).toFixed(1)} KB
                  </Text>
                </View>

                <Pressable
                  onPress={() => setFile(null)}
                  style={styles.removeFileButton}
                >
                  <Feather name="x" size={20} color="#64748B" />
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* ЭХЛЭХ ОГНОО */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Эхлэх огноо</Text>

          <Pressable
            style={styles.dateBox}
            onPress={() => setActiveDate("start")}
          >
            <Feather name="calendar" size={20} color="#64748B" />
            <Text
              style={[styles.dateText, !startDate && styles.placeholderText]}
            >
              {startDate ? formatDate(startDate) : "Огноо сонгох"}
            </Text>
          </Pressable>
        </View>

        {/* АЖИЛД ОРОХ ОГНОО */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Ажилд орох огноо</Text>

          <Pressable
            style={styles.dateBox}
            onPress={() => setActiveDate("return")}
          >
            <Feather name="calendar" size={20} color="#64748B" />
            <Text
              style={[styles.dateText, !returnDate && styles.placeholderText]}
            >
              {returnDate ? formatDate(returnDate) : "Огноо сонгох"}
            </Text>
          </Pressable>
        </View>

        {/* ТАЙЛБАР */}
        <View style={styles.noteCard}>
          <Text style={styles.sectionLabel}>Тайлбар</Text>

          <TextInput
            style={styles.noteInput}
            multiline
            numberOfLines={4}
            placeholder="Тайлбар оруулна уу"
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
        </View>
      </ScrollView>

      {/* DATE PICKER */}
      {Platform.OS === "web" ? (
        activeDate && (
          <View style={styles.webDateOverlay}>
            <View style={styles.webDateCard}>
              <Text style={styles.dateModalTitle}>
                {activeDate === "start" ? "Эхлэх огноо" : "Ажилд орох огноо"}
              </Text>

              <input
                type="date"
                min={
                  activeDate === "return" && startDate
                    ? formatDate(startDate)
                    : undefined
                }
                value={
                  activeDate === "start"
                    ? startDate
                      ? formatDate(startDate)
                      : ""
                    : returnDate
                      ? formatDate(returnDate)
                      : ""
                }
                onChange={(event) => {
                  const value = event.currentTarget.value;

                  if (!value) return;

                  const date = parseDate(value);

                  if (activeDate === "start") {
                    setStartDate(date);

                    if (returnDate && returnDate < date) {
                      setReturnDate(null);
                    }
                  } else {
                    setReturnDate(date);
                  }

                  setActiveDate(null);
                }}
                style={{
                  width: "100%",
                  padding: 12,
                  fontSize: 16,
                  borderRadius: 10,
                  border: "1px solid #D6E3F8",
                }}
              />

              <Pressable
                style={styles.dateCloseButton}
                onPress={() => setActiveDate(null)}
              >
                <Text style={styles.dateCloseText}>Болих</Text>
              </Pressable>
            </View>
          </View>
        )
      ) : (
        activeDate && (
          <DateTimePicker
            value={
              activeDate === "start"
                ? startDate || new Date()
                : returnDate || startDate || new Date()
            }
            mode="date"
            display="default"
            // Хуучин хүсэлт өнгөрсөн огноотой байж болох тул
            // эхлэх огноонд доод хязгаар тавихгүй
            minimumDate={
              activeDate === "return" && startDate ? startDate : undefined
            }
            onChange={handleDateChange}
          />
        )
      )}

      {/* BUTTONS */}
      <View style={styles.actionBar}>
        <Pressable
          style={styles.cancelButton}
          onPress={goBack}
          disabled={saving}
        >
          <Text style={styles.cancelText}>Болих</Text>
        </Pressable>

        <Pressable
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={saveRequest}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Өөрчлөлт хадгалах</Text>
          )}
        </Pressable>
      </View>

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

// ========================================
// STYLES (leave-create.tsx-тэй ижил)
// ========================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFF" },

  header: {
    height: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: { flex: 1, fontSize: 21, fontWeight: "700", color: "#1D2B43" },
  headerSpace: { width: 30 },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 30 },

  typeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 14,
    marginBottom: 20,
    zIndex: 10,
  },
  label: { fontSize: 13, fontWeight: "700", color: "#1D2B43", marginBottom: 11 },
  selectBox: {
    height: 49,
    borderWidth: 1,
    borderColor: "#D6E3F8",
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { flex: 1, fontSize: 13, color: "#1D2B43" },
  placeholderText: { color: "#94A3B8" },
  dropdown: {
    marginTop: 5,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6E3F8",
    borderRadius: 10,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownItemActive: { backgroundColor: "#EDF7FF" },
  dropdownText: { fontSize: 13, color: "#26364D" },

  salaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 23,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D2B43",
    marginBottom: 10,
  },
  radioOption: { flexDirection: "row", alignItems: "center", gap: 8 },
  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: BLUE },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: BLUE },
  radioText: { fontSize: 13, color: "#26364D" },

  formSection: { marginHorizontal: 10, marginBottom: 20 },
  uploadBox: {
    height: 100,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#83B5FF",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  uploadTitle: { fontSize: 13, fontWeight: "700", color: BLUE },
  uploadHint: { fontSize: 10, color: "#94A3B8" },
  fileCard: {
    marginTop: 8,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#F2F6FC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 9,
  },
  pdfIcon: {
    width: 28,
    height: 28,
    backgroundColor: "#E5484D",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  pdfIconText: { color: "#FFFFFF", fontSize: 9, fontWeight: "700" },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 11, fontWeight: "600", color: "#1D2B43" },
  fileSize: { fontSize: 10, color: "#94A3B8", marginTop: 2 },
  removeFileButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  dateBox: {
    height: 51,
    borderWidth: 1,
    borderColor: "#D6E3F8",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 16,
  },
  dateText: { fontSize: 13, color: "#26364D" },

  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    marginBottom: 15,
  },
  noteInput: {
    minHeight: 105,
    borderWidth: 1,
    borderColor: "#D6E3F8",
    borderRadius: 12,
    padding: 13,
    fontSize: 13,
    color: "#26364D",
  },

  actionBar: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 13,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EDF0F5",
  },
  cancelButton: {
    flex: 1,
    height: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 13, fontWeight: "700", color: BLUE },
  saveButton: {
    flex: 1,
    height: 49,
    borderRadius: 13,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  disabledButton: { opacity: 0.6 },

  webDateOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  webDateCard: {
    width: "85%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    gap: 15,
  },
  dateModalTitle: { fontSize: 17, fontWeight: "700", color: "#1D2B43" },
  dateCloseButton: {
    padding: 12,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  dateCloseText: { fontSize: 14, fontWeight: "600", color: "#1D2B43" },
});
