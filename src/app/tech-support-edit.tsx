import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import BottomNav from '../components/BottomNav';
import { API_URL } from '../config/api';

/* =========================================================
   TYPES
========================================================= */

type TechSupportDetail = {
  workId: string;

  callType?: string | null;
  callTypeNm?: string | null;

  callerName?: string | null;
  callPhone?: string | number | null;
  roomNo?: string | null;
  callAnswer?: string | null;

  decisionStatus?: string | null;
  decisionStatusNm?: string | null;
};

/* =========================================================
   CALL TYPES
========================================================= */

const CALL_TYPES = [
  {
    code: '1',
    name: 'Принтер гэмтэл, холболт',
  },
  {
    code: '2',
    name: 'Компьютер засвар',
  },
  {
    code: '3',
    name: 'Программ суулгалт',
  },
  {
    code: '4',
    name: 'Сүлжээ, тоног төхөөрөмж',
  },
  {
    code: '5',
    name: 'Хурлын өрөө',
  },
  {
    code: '6',
    name: 'Серверийн өрөөтэй холбоотой',
  },
  {
    code: '7',
    name: 'Бусад',
  },
];

/* =========================================================
   SCREEN
========================================================= */

export default function TechSupportEditScreen() {
  const {
    workId,
    userNm,
    cstmNm,
    userId,
    token,
  } = useLocalSearchParams<{
    workId?: string;
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    token?: string;
  }>();

  /* =====================================================
     STATE
  ===================================================== */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [callType, setCallType] =
    useState('');

  const [callTypeNm, setCallTypeNm] =
    useState('');

  const [showTypes, setShowTypes] =
    useState(false);

  const [callerName, setCallerName] =
    useState('');

  const [roomNo, setRoomNo] =
    useState('');

  const [callPhone, setCallPhone] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [decisionStatus, setDecisionStatus] =
    useState('');

  /* =====================================================
     MESSAGE
  ===================================================== */

  const showMessage = (
    title: string,
    message: string
  ) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  /* =====================================================
     LOAD DETAIL
  ===================================================== */

  const loadDetail = async () => {
    if (!workId) {
      setError(
        'Хүсэлтийн дугаар олдсонгүй.'
      );
      setLoading(false);
      return;
    }

    if (!token) {
      setError(
        'Нэвтрэх мэдээлэл олдсонгүй.'
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_URL}/api/mobile/techsupport/${workId}`,
        {
          method: 'GET',

          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              'application/json',
          },
        }
      );

      let data: TechSupportDetail | null =
        null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      console.log(
        'EDIT DETAIL STATUS:',
        response.status
      );

      console.log(
        'EDIT DETAIL RESPONSE:',
        data
      );

      if (response.status === 401) {
        throw new Error(
          'Нэвтрэх эрхийн хугацаа дууссан байна.'
        );
      }

      if (response.status === 404) {
        throw new Error(
          'Тухайн хүсэлт олдсонгүй.'
        );
      }

      if (!response.ok) {
        throw new Error(
          `Мэдээлэл авах үед алдаа гарлаа. (${response.status})`
        );
      }

      if (!data) {
        throw new Error(
          'Хүсэлтийн мэдээлэл хоосон байна.'
        );
      }

      /*
        Засах боломжийг frontend дээр бас шалгана.
        Backend мөн адил 30 төлөв дээр шалгана.
      */

      if (
        data.decisionStatus &&
        data.decisionStatus !== '30'
      ) {
        throw new Error(
          'Зөвхөн хадгалсан хүсэлтийг засах боломжтой.'
        );
      }

      setDecisionStatus(
        data.decisionStatus ?? ''
      );

      /*
        Backend detail API-аас ирсэн
        callType кодыг шууд хадгална.
      */

      const typeCode =
        String(data.callType ?? '');

      setCallType(typeCode);

      /*
        Нэр API-аас ирвэл түүнийг ашиглана.
        Байхгүй бол кодоор CALL_TYPES-с олно.
      */

      const foundType =
        CALL_TYPES.find(
          (item) =>
            item.code === typeCode
        );

      setCallTypeNm(
        data.callTypeNm ??
          foundType?.name ??
          ''
      );

      setCallerName(
        data.callerName ?? ''
      );

      setRoomNo(
        data.roomNo ?? ''
      );

      setCallPhone(
        data.callPhone !== null &&
          data.callPhone !== undefined
          ? String(data.callPhone)
          : ''
      );

      setDescription(
        data.callAnswer ?? ''
      );
    } catch (err: any) {
      console.error(
        'EDIT DETAIL ERROR:',
        err
      );

      setError(
        err?.message ||
          'Хүсэлтийн мэдээллийг авч чадсангүй.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [workId, token]);

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validate = () => {
    if (!callType) {
      showMessage(
        'Анхааруулга',
        'Дуудлагын төрлөө сонгоно уу.'
      );

      return false;
    }

    if (!callerName.trim()) {
      showMessage(
        'Анхааруулга',
        'Нэрээ оруулна уу.'
      );

      return false;
    }

    if (!roomNo.trim()) {
      showMessage(
        'Анхааруулга',
        'Өрөөний дугаараа оруулна уу.'
      );

      return false;
    }

    if (!callPhone.trim()) {
      showMessage(
        'Анхааруулга',
        'Утасны дугаараа оруулна уу.'
      );

      return false;
    }

    if (!description.trim()) {
      showMessage(
        'Анхааруулга',
        'Тайлбараа оруулна уу.'
      );

      return false;
    }

    return true;
  };

  /* =====================================================
     SAVE / PUT API
  ===================================================== */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!validate()) {
      return;
    }

    if (!workId) {
      showMessage(
        'Алдаа',
        'Хүсэлтийн дугаар олдсонгүй.'
      );

      return;
    }

    if (!token) {
      showMessage(
        'Алдаа',
        'Нэвтрэх мэдээлэл олдсонгүй.'
      );

      return;
    }

    /*
      30 = Хадгалсан
    */

    if (
      decisionStatus &&
      decisionStatus !== '30'
    ) {
      showMessage(
        'Анхааруулга',
        'Зөвхөн хадгалсан хүсэлтийг засах боломжтой.'
      );

      return;
    }

    try {
      setSaving(true);

      const requestBody = {
        callType,
        callPhone:
          callPhone.trim(),

        roomNo:
          roomNo.trim(),

        callerName:
          callerName.trim(),

        callAnswer:
          description.trim(),
      };

      console.log(
        'EDIT REQUEST:',
        requestBody
      );

      const response = await fetch(
        `${API_URL}/api/mobile/techsupport/${workId}`,
        {
          method: 'PUT',

          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              'application/json',

            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify(
              requestBody
            ),
        }
      );

      const responseText =
        await response.text();

      console.log(
        'EDIT STATUS:',
        response.status
      );

      console.log(
        'EDIT RESPONSE:',
        responseText
      );

      let data: any = null;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        data = null;
      }

      if (response.status === 401) {
        throw new Error(
          'Нэвтрэх эрхийн хугацаа дууссан байна.'
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            (
              responseText &&
              responseText !== 'null'
                ? responseText
                : `Хүсэлт засах үед алдаа гарлаа. (${response.status})`
            )
        );
      }

      showMessage(
        'Амжилттай',
        data?.message ||
          'Дуудлага амжилттай засагдлаа.'
      );

      /*
        Жагсаалт руу refresh параметртэй буцна.
      */

      router.replace({
        pathname:
          '/tech-support',

        params: {
          userNm,
          cstmNm,
          userId,
          token,

          refresh:
            Date.now().toString(),
        },
      });
    } catch (err: any) {
      console.error(
        'EDIT TECH SUPPORT ERROR:',
        err
      );

      showMessage(
        'Алдаа',
        err?.message ||
          'Хүсэлтийг засаж чадсангүй.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.centerBox}
        >
          <ActivityIndicator
            size="large"
            color="#428CE5"
          />

          <Text
            style={styles.loadingText}
          >
            Хүсэлтийн мэдээллийг
            уншиж байна...
          </Text>
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

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.header}
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Feather
              name="chevron-left"
              size={26}
              color="#152750"
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitle
            }
          >
            Хүсэлтийг засах
          </Text>

          <View
            style={
              styles.headerRight
            }
          />
        </View>

        <View
          style={styles.centerBox}
        >
          <Feather
            name="alert-circle"
            size={34}
            color="#E05B65"
          />

          <Text
            style={styles.errorText}
          >
            {error}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={loadDetail}
          >
            <Text
              style={
                styles.retryText
              }
            >
              Дахин оролдох
            </Text>
          </TouchableOpacity>
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

  /* =====================================================
     UI
  ===================================================== */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
            activeOpacity={0.7}
          >
            <Feather
              name="chevron-left"
              size={26}
              color="#152750"
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitle
            }
          >
            Хүсэлтийг засах
          </Text>

          <View
            style={
              styles.headerRight
            }
          />
        </View>

        {/* CONTENT */}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* CALL TYPE */}

          <Text
            style={styles.label}
          >
            Дуудлагын төрөл
            <Text
              style={
                styles.required
              }
            >
              *
            </Text>
          </Text>

          <View
            style={
              styles.selectWrapper
            }
          >
            <TouchableOpacity
              style={
                styles.selectBox
              }
              activeOpacity={0.8}
              onPress={() =>
                setShowTypes(
                  !showTypes
                )
              }
            >
              <Text
                style={[
                  styles.selectText,
                  !callType &&
                    styles.placeholderText,
                ]}
              >
                {callTypeNm ||
                  '-- Сонго --'}
              </Text>

              <Feather
                name={
                  showTypes
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={20}
                color="#7890B3"
              />
            </TouchableOpacity>

            {showTypes && (
              <View
                style={
                  styles.dropdown
                }
              >
                {CALL_TYPES.map(
                  (
                    item,
                    index
                  ) => (
                    <TouchableOpacity
                      key={
                        item.code
                      }
                      style={[
                        styles.dropdownItem,

                        index !==
                          CALL_TYPES.length -
                            1 &&
                          styles.dropdownItemBorder,
                      ]}
                      activeOpacity={
                        0.7
                      }
                      onPress={() => {
                        setCallType(
                          item.code
                        );

                        setCallTypeNm(
                          item.name
                        );

                        setShowTypes(
                          false
                        );
                      }}
                    >
                      <Text
                        style={
                          styles.dropdownText
                        }
                      >
                        {item.name}
                      </Text>

                      {callType ===
                        item.code && (
                        <Feather
                          name="check"
                          size={17}
                          color="#428CE5"
                        />
                      )}
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
          </View>

          {/* NAME */}

          <Text
            style={styles.label}
          >
            Нэр
            <Text
              style={
                styles.required
              }
            >
              *
            </Text>
          </Text>

          <TextInput
            value={callerName}
            onChangeText={
              setCallerName
            }
            style={styles.input}
            placeholder="Нэр"
            placeholderTextColor="#A2AEC0"
          />

          {/* ROOM */}

          <Text
            style={styles.label}
          >
            Өрөөний дугаар
            <Text
              style={
                styles.required
              }
            >
              *
            </Text>
          </Text>

          <TextInput
            value={roomNo}
            onChangeText={
              setRoomNo
            }
            style={styles.input}
            placeholder="Өрөөний дугаар"
            placeholderTextColor="#A2AEC0"
          />

          {/* PHONE */}

          <Text
            style={styles.label}
          >
            Утасны дугаар
            <Text
              style={
                styles.required
              }
            >
              *
            </Text>
          </Text>

          <TextInput
            value={callPhone}
            onChangeText={
              setCallPhone
            }
            style={styles.input}
            placeholder="Утасны дугаар"
            placeholderTextColor="#A2AEC0"
            keyboardType="phone-pad"
          />

          {/* DESCRIPTION */}

          <Text
            style={styles.label}
          >
            Тайлбар
            <Text
              style={
                styles.required
              }
            >
              *
            </Text>
          </Text>

          <View
            style={
              styles.textAreaWrapper
            }
          >
            <TextInput
              value={description}
              onChangeText={
                setDescription
              }
              style={
                styles.textArea
              }
              placeholder="Тайлбараа оруулна уу..."
              placeholderTextColor="#A2AEC0"
              multiline
              maxLength={500}
              textAlignVertical="top"
            />

            <Text
              style={
                styles.counter
              }
            >
              {description.length}/500
            </Text>
          </View>

          {/* SAVE */}

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.disabledButton,
            ]}
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleSave}
          >
            {saving ? (
              <View
                style={
                  styles.loadingRow
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Хадгалж байна...
                </Text>
              </View>
            ) : (
              <Text
                style={
                  styles.saveButtonText
                }
              >
                Хадгалах
              </Text>
            )}
          </TouchableOpacity>

          {/* BACK */}

          <TouchableOpacity
            style={
              styles.cancelButton
            }
            activeOpacity={0.8}
            disabled={saving}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.cancelButtonText
              }
            >
              Буцах
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* BOTTOM NAV */}

        <BottomNav
          active="request"
          userNm={userNm}
          cstmNm={cstmNm}
          userId={userId}
          token={token}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        '#F8FAFD',
    },

    flex: {
      flex: 1,
    },

    header: {
      height: 68,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      backgroundColor:
        '#F8FAFD',
    },

    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: '#152750',
      marginLeft: 2,
    },

    headerRight: {
      width: 38,
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 6,
      paddingBottom: 25,
    },

    label: {
      fontSize: 11,
      fontWeight: '600',
      color: '#536888',
      marginBottom: 7,
      marginTop: 11,
    },

    required: {
      color: '#E35D68',
    },

    input: {
      height: 48,
      borderWidth: 1,
      borderColor:
        '#D8E4F5',
      borderRadius: 10,
      backgroundColor:
        '#FFFFFF',
      paddingHorizontal: 13,
      fontSize: 12,
      color: '#273B5E',

      ...(Platform.OS ===
      'web'
        ? ({
            outlineStyle:
              'none',
          } as any)
        : {}),
    },

    selectWrapper: {
      position: 'relative',
      zIndex: 100,
    },

    selectBox: {
      height: 48,
      borderWidth: 1,
      borderColor:
        '#D8E4F5',
      borderRadius: 10,
      backgroundColor:
        '#FFFFFF',
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    selectText: {
      flex: 1,
      fontSize: 12,
      color: '#273B5E',
      paddingRight: 10,
    },

    placeholderText: {
      color: '#A2AEC0',
    },

    dropdown: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 52,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        '#D8E4F5',
      borderRadius: 10,
      overflow: 'hidden',
      zIndex: 999,

      ...(Platform.OS ===
      'web'
        ? ({
            boxShadow:
              '0px 5px 18px rgba(30, 55, 90, 0.12)',
          } as any)
        : {
            elevation: 8,
          }),
    },

    dropdownItem: {
      minHeight: 43,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    dropdownItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        '#EEF2F7',
    },

    dropdownText: {
      flex: 1,
      paddingRight: 10,
      fontSize: 11,
      color: '#334A70',
    },

    textAreaWrapper: {
      minHeight: 135,
      borderWidth: 1,
      borderColor:
        '#D8E4F5',
      borderRadius: 10,
      backgroundColor:
        '#FFFFFF',
      position: 'relative',
    },

    textArea: {
      minHeight: 105,
      paddingHorizontal: 13,
      paddingTop: 12,
      paddingBottom: 25,
      fontSize: 12,
      color: '#273B5E',

      ...(Platform.OS ===
      'web'
        ? ({
            outlineStyle:
              'none',
            resize: 'none',
          } as any)
        : {}),
    },

    counter: {
      position: 'absolute',
      right: 10,
      bottom: 8,
      fontSize: 9,
      color: '#A2AEC0',
    },

    saveButton: {
      height: 48,
      borderRadius: 9,
      backgroundColor:
        '#428CE5',
      marginTop: 20,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },

    cancelButton: {
      height: 46,
      borderRadius: 9,
      backgroundColor:
        '#EDF2F8',
      marginTop: 9,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    cancelButtonText: {
      color: '#587092',
      fontSize: 12,
      fontWeight: '600',
    },

    disabledButton: {
      opacity: 0.6,
    },

    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    centerBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 25,
    },

    loadingText: {
      marginTop: 10,
      fontSize: 12,
      color: '#8492A8',
      textAlign: 'center',
    },

    errorText: {
      marginTop: 10,
      fontSize: 12,
      color: '#75849B',
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 15,
      backgroundColor:
        '#428CE5',
      paddingHorizontal: 17,
      paddingVertical: 10,
      borderRadius: 9,
    },

    retryText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
    },
  });