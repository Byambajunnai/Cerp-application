import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import BottomNav from '../components/BottomNav';
import { API_URL } from '../config/api';


export default function TechSupportCreateScreen() {
  const params = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    token?: string;
  }>();

  const userNm = params.userNm ?? '';
  const cstmNm = params.cstmNm ?? '';
  const userId = params.userId ?? '';
  const token = params.token ?? '';

  const [callType, setCallType] = useState('');
const [callTypeNm, setCallTypeNm] = useState('');
const [showTypes, setShowTypes] = useState(false);

const [callerName, setCallerName] = useState(userNm);
const [roomNo, setRoomNo] = useState('');
const [callPhone, setCallPhone] = useState('');
const [description, setDescription] = useState('');

const [saving, setSaving] = useState(false);

const callTypes = [
  { code: '1', name: 'Принтер гэмтэл, холболт' },
  { code: '2', name: 'Компьютер засвар' },
  { code: '3', name: 'Программ суулгалт' },
  { code: '4', name: 'Сүлжээ, тоног төхөөрөмж' },
  { code: '5', name: 'Хурлын өрөө' },
  { code: '6', name: 'Серверийн өрөөтэй холбоотой' },
  { code: '7', name: 'Бусад' },
];

  const handleCancel = () => {
    router.back();
  };

 const showMessage = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(title, message);
  }
};



const handleSave = async () => {
  if (saving) return;

  if (!callType) {
    showMessage('Анхааруулга', 'Дуудлагын төрлөө сонгоно уу.');
    return;
  }

  if (!callerName.trim()) {
    showMessage('Анхааруулга', 'Нэрээ оруулна уу.');
    return;
  }

  if (!roomNo.trim()) {
    showMessage('Анхааруулга', 'Өрөөний дугаараа оруулна уу.');
    return;
  }

  if (!callPhone.trim()) {
    showMessage('Анхааруулга', 'Утасны дугаараа оруулна уу.');
    return;
  }

  if (!description.trim()) {
    showMessage('Анхааруулга', 'Тайлбараа оруулна уу.');
    return;
  }

  if (!token) {
    showMessage(
      'Алдаа',
      'Нэвтрэх мэдээлэл олдсонгүй. Дахин нэвтэрнэ үү.'
    );
    return;
  }

  try {
    setSaving(true);

    const response = await fetch(
      `${API_URL}/api/mobile/techsupport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callType: callType,
          callPhone: callPhone.trim(),
          roomNo: roomNo.trim(),
          callerName: callerName.trim(),
          callAnswer: description.trim(),
        }),
      }
    );

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Хүсэлт хадгалахад алдаа гарлаа. (${response.status})`
      );
    }

    showMessage(
      'Амжилттай',
      data?.message || 'Дуудлага амжилттай бүртгэгдлээ.'
    );

    router.replace({
      pathname: '/tech-support',
      params: {
        userNm,
        cstmNm,
        userId,
        token,
        refresh: Date.now().toString(),
      },
    });
  } catch (error: any) {
    console.error('CREATE TECH SUPPORT ERROR:', error);

    showMessage(
      'Алдаа',
      error?.message || 'Хүсэлт хадгалахад алдаа гарлаа.'
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={30} color="#172B55" />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.title}>Техникийн тусламж</Text>
              <Text style={styles.subtitle}>Шинэ хүсэлт үүсгэх</Text>
            </View>
          </View>

          {/* ДУУДЛАГЫН ТӨРӨЛ */}
          <View style={styles.card}>
            <Text style={styles.label}>Дуудлагын төрөл</Text>

            <Pressable
  style={styles.selectBox}
  onPress={() => setShowTypes(!showTypes)}
>
  <Text
    style={[
      styles.selectText,
      !callType && styles.placeholderText,
    ]}
  >
    {callTypeNm || '-- Сонго --'}
  </Text>

  <Feather
    name={showTypes ? 'chevron-up' : 'chevron-down'}
    size={22}
    color="#7185A8"
  />
</Pressable>

{showTypes && (
  <View style={styles.dropdown}>
    {callTypes.map((item, index) => (
      <Pressable
        key={item.code}
        style={[
          styles.dropdownItem,
          index !== callTypes.length - 1 &&
            styles.dropdownItemBorder,
        ]}
        onPress={() => {
          setCallType(item.code);
          setCallTypeNm(item.name);
          setShowTypes(false);
        }}
      >
        <Text style={styles.dropdownText}>
          {item.name}
        </Text>

        {callType === item.code && (
          <Feather
            name="check"
            size={18}
            color="#428CE5"
          />
        )}
      </Pressable>
    ))}
  </View>
)}
          </View>

          {/* НЭР */}
          <View style={styles.card}>
            <Text style={styles.label}>Нэр</Text>

            <TextInput
              style={styles.input}
              value={callerName}
              onChangeText={setCallerName}
              placeholder="Нэр оруулна уу"
              placeholderTextColor="#9AA8C0"
            />
          </View>

          {/* ӨРӨӨ + УТАС */}
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Өрөөний дугаар</Text>

                <TextInput
                  style={styles.input}
                  value={roomNo}
                  onChangeText={setRoomNo}
                  placeholder="Өрөөний №"
                  placeholderTextColor="#9AA8C0"
                />
              </View>

              <View style={styles.half}>
                <Text style={styles.label}>Утасны дугаар</Text>

                <TextInput
                  style={styles.input}
                  value={callPhone}
                  onChangeText={setCallPhone}
                  placeholder="0"
                  placeholderTextColor="#9AA8C0"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* ТАЙЛБАР */}
          <View style={styles.card}>
            <Text style={styles.label}>Тайлбар</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={'Тайлбар оруулна уу...'}
              placeholderTextColor="#9AA8C0"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* INFO */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Feather name="info" size={13} color="#428CE5" />
            </View>

            <Text style={styles.infoText}>
              Шаардлагатай мэдээллийг бүрэн оруулна уу.
            </Text>
          </View>

          {/* BUTTONS */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Болих</Text>
            </Pressable>

           <Pressable
  style={[
    styles.actionButton,
    styles.saveButton,
    saving && styles.disabledButton,
  ]}
  onPress={handleSave}
  disabled={saving}
>
  {saving ? (
    <View style={styles.loadingRow}>
      <ActivityIndicator size="small" color="#FFFFFF" />
      <Text style={styles.saveButtonText}>
        Хадгалж байна...
      </Text>
    </View>
  ) : (
    <Text style={styles.saveButtonText}>
      Хадгалах
    </Text>
  )}
</Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav
        active="request"
        userNm={userNm}
        cstmNm={cstmNm}
        userId={userId}
        token={token}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#F6F9FE',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#172B55',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#91A0BA',
  },

  /* CARD */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20345D',
    marginBottom: 10,
  },

  /* INPUT */

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D7E2F3',
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#172B55',
    backgroundColor: '#FFFFFF',
  },

  /* SELECT */

  selectBox: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D7E2F3',
    borderRadius: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectText: {
    fontSize: 14,
    color: '#172B55',
  },

  placeholderText: {
    color: '#9AA8C0',
  },

  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E1E8F4',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',

    ...Platform.select({
      web: {
        boxShadow: '0px 5px 16px rgba(34, 66, 120, 0.10)',
      },
      default: {
        elevation: 3,
      },
    }),
  },

  dropdownItem: {
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F8',
  },

  dropdownText: {
    fontSize: 14,
    color: '#20345D',
  },

  /* TWO COLUMNS */

  row: {
    flexDirection: 'row',
    gap: 14,
  },

  half: {
    flex: 1,
  },

  /* DESCRIPTION */

  textArea: {
    height: 130,
    paddingTop: 14,
    paddingBottom: 14,
  },

  /* INFO */

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: -2,
    marginBottom: 14,
  },

  infoIcon: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#E7F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#8C9BB4',
  },

  /* BUTTONS */

  buttonRow: {
    flexDirection: 'row',
    gap: 14,
  },

  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#428CE5',
  },

  saveButton: {
    backgroundColor: '#4E8FE7',
  },

  cancelButtonText: {
    color: '#428CE5',
    fontSize: 14,
    fontWeight: '700',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  disabledButton: {
  opacity: 0.65,
},

loadingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
});