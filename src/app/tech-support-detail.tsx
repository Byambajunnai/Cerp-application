import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
  badgeNo?: string | null;
};
type TechSupportDetail = {
  workId: string;

  workResult?: string | null;

  callAnswer?: string | null;

  workType?: string | null;

  callType?: string | null;
  callTypeNm?: string | null;

  callPhone?: number | string | null;
  callerName?: string | null;

  userId?: string | null;
  roomNo?: string | null;

  regUserNm?: string | null;
  regDate?: string | null;

  decisionUserId?: string | null;
  decisionUserNm?: string | null;

  decisionComment?: string | null;

  decisionStatus?: string | null;
  decisionStatusNm?: string | null;

  decisionDate?: string | null;

  beforeCount?: string | null;

  transferUserNm?: string | null;
  transferDate?: string | null;
};

type TechSupportResponse = {
  pageNumber: number;
  totalPage: number;
  totalCount: number;
  hasNextPage: boolean;
  items: TechSupportDetail[];
};
export default function TechSupportDetailScreen() {
  const params = useLocalSearchParams<{
    workId?: string;
    callTypeNm?: string;
    callerName?: string;
    callPhone?: string;
    roomNo?: string;
    callAnswer?: string;
    regUserNm?: string;
    regDate?: string;
    decisionUserNm?: string;
    decisionStatus?: string;
    decisionStatusNm?: string;
    workResult?: string;
    decisionDate?: string;
    transferUserNm?: string;
    transferDate?: string;

    userNm?: string;
    cstmNm?: string;
    userId?: string;
    token?: string;
    roles?: string;
  }>();

  const userNm = params.userNm ?? '';
  const cstmNm = params.cstmNm ?? '';
  const userId = params.userId ?? '';
  const token = params.token ?? '';

  let roles: string[] = [];

  try {
    const parsedRoles = params.roles
      ? JSON.parse(params.roles)
      : [];

    roles = Array.isArray(parsedRoles)
      ? parsedRoles
      : [];
  } catch {
    roles = [];
  }

  const isEmpAdd = roles.includes('EMPADD');
  const isDcsnCall = roles.includes('DCSN_CALL');
  const isDcsnPrg = roles.includes('DCSN_PRG');
  const isRoot = roles.includes('ROOT');

  // Эрхийн матриц:
  // EMPADD    -> Хадгалах/Илгээх
  // DCSN_CALL -> Хадгалах/Илгээх + Шилжүүлэх + Шийдвэрлэх
  // DCSN_PRG  -> Хадгалах/Илгээх + Шийдвэрлэх
  // ROOT      -> Хадгалах/Илгээх + Шийдвэрлэх
  const canSaveAndSend =
    isEmpAdd || isDcsnCall || isDcsnPrg || isRoot;

  const canTransfer =
    isDcsnCall;

  const canResolve =
    isDcsnCall || isDcsnPrg || isRoot;

 const [detail, setDetail] = useState<TechSupportDetail | null>(null);
const [detailLoading, setDetailLoading] = useState(true);
const [detailError, setDetailError] = useState('');
const [sending, setSending] = useState(false);

const loadDetail = async () => {
  if (!token) {
    setDetailError('Нэвтрэх мэдээлэл олдсонгүй.');
    setDetailLoading(false);
    return;
  }

  if (!params.workId) {
    setDetailError('Хүсэлтийн дугаар олдсонгүй.');
    setDetailLoading(false);
    return;
  }

  try {
    setDetailLoading(true);
    setDetailError('');

    const response = await fetch(
      `${API_URL}/api/mobile/techsupport/${params.workId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    console.log('DETAIL STATUS:', response.status);
    console.log('DETAIL RESPONSE:', data);

    if (response.status === 401) {
      throw new Error(
        'Нэвтрэх эрхийн хугацаа дууссан байна.'
      );
    }

    if (response.status === 404) {
      throw new Error(
        data?.message || 'Тухайн хүсэлт олдсонгүй.'
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Хүсэлтийн мэдээлэл авахад алдаа гарлаа. (${response.status})`
      );
    }

    setDetail(data);

  } catch (error: any) {
    console.error('TECH SUPPORT DETAIL ERROR:', error);

    setDetailError(
      error?.message ||
        'Хүсэлтийн мэдээллийг авч чадсангүй.'
    );
  } finally {
    setDetailLoading(false);
  }
};

useEffect(() => {
  loadDetail();
}, [params.workId, token]);

const statusName =
  detail?.decisionStatusNm ??
  params.decisionStatusNm ??
  '-';

const normalizedStatus = statusName.toLowerCase().trim();

const isSaved =
  normalizedStatus.includes('хадгал');

const isSent =
  normalizedStatus.includes('илгээ');

const isTransferred =
  normalizedStatus.includes('шилжүүл');

const isResolved =
  normalizedStatus.includes('шийдвэрлэсэн') &&
  !normalizedStatus.includes('боломжгүй');

const isImpossible =
  normalizedStatus.includes('боломжгүй') ||
  normalizedStatus.includes('татгалз');

const statusCode =
  detail?.decisionStatus ??
  params.decisionStatus ??
  '';

const isSavedStatus = statusCode === '30';
const isFinalStatus =
  statusCode === '10' ||
  statusCode === '20';

  /* =========================================================
     TRANSFER
  ========================================================= */

  const [transferVisible, setTransferVisible] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [usersLoading, setUsersLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');

  /* =========================================================
     RESOLVE
  ========================================================= */

  const [resolveVisible, setResolveVisible] = useState(false);
  const [resolveType, setResolveType] = useState<'resolved' | 'impossible'>('resolved');
  const [resolveComment, setResolveComment] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);



  const openResolveModal = () => {
  setResolveType('resolved');
  setResolveComment('');
  setResolveError('');
  setResolveVisible(true);
};

const closeResolveModal = () => {
  if (resolveLoading) return;

  setResolveVisible(false);
  setResolveComment('');
  setResolveError('');
};

  /* =========================================================
     STATUS TIMELINE
  ========================================================= */

 const steps = [
  {
    key: 'saved',
    title: 'Хадгалсан',
    date: detail?.regDate ?? params.regDate,
    active: true,
  },
  {
    key: 'sent',
    title: 'Илгээсэн',
    date: detail?.regDate ?? params.regDate,
    active:
      isSent ||
      isTransferred ||
      isResolved ||
      isImpossible,
  },
  {
    key: 'transfer',
    title: 'Шилжүүлсэн',
    date: detail?.transferDate ?? params.transferDate,
    active:
      isTransferred ||
      isResolved ||
      isImpossible,
  },
  {
    key: 'resolved',
    title: isImpossible
      ? 'Шийдвэрлэх боломжгүй'
      : 'Шийдвэрлэсэн',
    date: detail?.decisionDate ?? params.decisionDate,
    active: isResolved || isImpossible,
  },
];

  /* =========================================================
     USER LIST API
  ========================================================= */

  const loadUsers = async (keyword = '') => {
    if (!token) {
      setTransferError('Нэвтрэх мэдээлэл олдсонгүй.');
      return;
    }

    try {
      setUsersLoading(true);
      setTransferError('');

      const response = await fetch(
        `${API_URL}/api/mobile/techsupport/transfer-users`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 401) {
        throw new Error('Нэвтрэх эрхийн хугацаа дууссан байна.');
      }

      if (!response.ok) {
        throw new Error(
          `Шилжүүлэх ажилтны жагсаалт авахад алдаа гарлаа. (${response.status})`
        );
      }

      const data = await response.json();

      const allUsers: UserItem[] = Array.isArray(data?.items)
        ? data.items
        : [];

      const searchText = keyword.trim().toLowerCase();

      if (searchText) {
        setUsers(
          allUsers.filter((item) => {
            const name = item.userNm?.toLowerCase() ?? '';
            const id = item.userId?.toLowerCase() ?? '';
            const badge = item.badgeNo?.toLowerCase() ?? '';

            return (
              name.includes(searchText) ||
              id.includes(searchText) ||
              badge.includes(searchText)
            );
          })
        );
      } else {
        setUsers(allUsers);
      }
    } catch (error: any) {
      console.error('TRANSFER USER LIST ERROR:', error);
      setUsers([]);
      setTransferError(
        error?.message ||
          'Шилжүүлэх ажилтны жагсаалтыг авч чадсангүй.'
      );
    } finally {
      setUsersLoading(false);
    }
  };

  /* =========================================================
     OPEN TRANSFER
  ========================================================= */

  const openTransferModal = () => {
    setSelectedUser(null);
    setUserSearch('');
    setTransferError('');
    setTransferVisible(true);

    loadUsers();
  };

  const closeTransferModal = () => {
    if (transferLoading) return;

    setTransferVisible(false);
    setSelectedUser(null);
    setUserSearch('');
    setTransferError('');
  };

  /* =========================================================
     SEARCH USER
  ========================================================= */

  const handleSearchUser = () => {
    loadUsers(userSearch);
  };

  const clearSearch = () => {
    setUserSearch('');
    setSelectedUser(null);
    loadUsers('');
  };

  /* =========================================================
     TRANSFER API
  ========================================================= */

  const handleTransfer = async () => {
    if (!selectedUser) {
      setTransferError('Шилжүүлэх ажилтнаа сонгоно уу.');
      return;
    }

    if (!params.workId) {
      setTransferError('Хүсэлтийн дугаар олдсонгүй.');
      return;
    }

    if (!token) {
      setTransferError('Нэвтрэх мэдээлэл олдсонгүй.');
      return;
    }

    try {
      setTransferLoading(true);
      setTransferError('');

      const response = await fetch(
        `${API_URL}/api/mobile/techsupport/${params.workId}/transfer`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            transferUserId: selectedUser.userId,
          }),
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.status === 401) {
        throw new Error('Нэвтрэх эрхийн хугацаа дууссан байна.');
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Шилжүүлэх үед алдаа гарлаа. (${response.status})`
        );
      }

      setTransferVisible(false);

      const message =
        data?.message || 'Амжилттай шилжүүллээ.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Амжилттай', message);
      }
setTransferVisible(false);
setSelectedUser(null);
setUserSearch('');

await loadDetail();
    } catch (error: any) {
      console.error('TRANSFER ERROR:', error);

      setTransferError(
        error?.message || 'Шилжүүлэх үед алдаа гарлаа.'
      );
    } finally {
      setTransferLoading(false);
    }
  };

  const handleSend = async () => {
  if (!params.workId) {
    if (Platform.OS === 'web') {
      window.alert('Хүсэлтийн дугаар олдсонгүй.');
    } else {
      Alert.alert('Алдаа', 'Хүсэлтийн дугаар олдсонгүй.');
    }
    return;
  }

  if (!token) {
    if (Platform.OS === 'web') {
      window.alert('Нэвтрэх мэдээлэл олдсонгүй.');
    } else {
      Alert.alert('Алдаа', 'Нэвтрэх мэдээлэл олдсонгүй.');
    }
    return;
  }


  if (detail?.decisionStatus !== '30') {
    if (Platform.OS === 'web') {
      window.alert('Зөвхөн хадгалсан хүсэлтийг илгээх боломжтой.');
    } else {
      Alert.alert(
        'Анхааруулга',
        'Зөвхөн хадгалсан хүсэлтийг илгээх боломжтой.'
      );
    }
    return;
  }

  const confirmed =
    Platform.OS === 'web'
      ? window.confirm('Энэ хүсэлтийг илгээх үү?')
      : true;

  if (!confirmed) return;

  try {
    setSending(true);

    const response = await fetch(
      `${API_URL}/api/mobile/techsupport/${params.workId}/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    const responseText = await response.text();

    console.log('SEND STATUS:', response.status);
    console.log('SEND RESPONSE:', responseText);

    let data: any = null;

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          (responseText && responseText !== 'null'
            ? responseText
            : `Хүсэлт илгээх үед алдаа гарлаа. (${response.status})`)
      );
    }

    if (Platform.OS === 'web') {
      window.alert(data?.message || 'Хүсэлт амжилттай илгээгдлээ.');
    } else {
      Alert.alert(
        'Амжилттай',
        data?.message || 'Хүсэлт амжилттай илгээгдлээ.'
      );
    }

    await loadDetail();
  } catch (error: any) {
    console.error('SEND TECH SUPPORT ERROR:', error);

    if (Platform.OS === 'web') {
      window.alert(error?.message || 'Хүсэлт илгээж чадсангүй.');
    } else {
      Alert.alert(
        'Алдаа',
        error?.message || 'Хүсэлт илгээж чадсангүй.'
      );
    }
  } finally {
    setSending(false);
  }
};

  /* =========================================================
   RESOLVE API
========================================================= */

const handleResolve = async () => {
  if (!resolveComment.trim()) {
    setResolveError('Тайлбараа оруулна уу.');
    return;
  }

  if (!params.workId) {
    setResolveError('Хүсэлтийн дугаар олдсонгүй.');
    return;
  }

  if (!token) {
    setResolveError('Нэвтрэх мэдээлэл олдсонгүй.');
    return;
  }

  try {
    setResolveLoading(true);
    setResolveError('');

    const response = await fetch(
      `${API_URL}/api/mobile/techsupport/${params.workId}/decision`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          decisionStatus:
            resolveType === 'resolved' ? '10' : '20',
          decisionComment: resolveComment.trim(),
        }),
      }
    );

    let data: any = null;

    try {
      data = await response.json();
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
          `Шийдвэрлэх үед алдаа гарлаа. (${response.status})`
      );
    }

    // Modal хаах
    setResolveVisible(false);
    setResolveComment('');
    setResolveError('');

    const message =
      data?.message ||
      (resolveType === 'resolved'
        ? 'Дуудлага амжилттай шийдвэрлэгдлээ.'
        : 'Шийдвэрлэх боломжгүй төлөвт шилжлээ.');

    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Амжилттай', message);
    }

    // Detail дахин унших
    await loadDetail();

  } catch (error: any) {
    console.error('RESOLVE ERROR:', error);

    setResolveError(
      error?.message || 'Шийдвэрлэх үед алдаа гарлаа.'
    );
  } finally {
    setResolveLoading(false);
  }
};

  return (
    <View style={styles.container}>
      {/* =====================================================
          DETAIL CONTENT
      ===================================================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather
              name="chevron-left"
              size={29}
              color="#172B55"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Техникийн тусламж
          </Text>
        </View>

        {/* ===================================================
            REQUEST INFORMATION
        =================================================== */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Хүсэлтийн мэдээлэл
            </Text>

            <StatusBadge status={statusName} />
          </View>

        <InfoRow
  label="Дуудлагын төрөл"
  value={value(detail?.callTypeNm ?? params.callTypeNm)}
/>

<InfoRow
  label="Нэр"
  value={value(
    detail?.callerName ??
      detail?.regUserNm ??
      params.callerName ??
      params.regUserNm
  )}
/>

<InfoRow
  label="Өрөөний дугаар"
  value={value(detail?.roomNo ?? params.roomNo)}
/>

<InfoRow
  label="Утасны дугаар"
  value={value(
    String(detail?.callPhone ?? params.callPhone ?? '')
  )}
/>

<InfoRow
  label="Тайлбар"
  value={value(detail?.callAnswer ?? params.callAnswer)}
  last
  multiline
/>
        </View>

        {/* ===================================================
            DECISION INFORMATION
        =================================================== */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Шийдвэрийн мэдээлэл
            </Text>
          </View>

          {/* TIMELINE */}

          <View style={styles.timeline}>
            {steps.map((step, index) => (
              <View key={step.key} style={styles.stepWrapper}>
                {index !== steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      step.active &&
                        steps[index + 1]?.active &&
                        styles.stepLineActive,
                    ]}
                  />
                )}

                <View
                  style={[
                    styles.stepCircle,
                    step.active && styles.stepCircleActive,
                    index === steps.length - 1 &&
                      step.active &&
                      styles.stepCircleCurrent,
                  ]}
                >
                  {step.active ? (
                    <Feather
                      name="check"
                      size={15}
                      color={
                        index === steps.length - 1
                          ? '#FFFFFF'
                          : '#428CE5'
                      }
                    />
                  ) : (
                    <View style={styles.emptyDot} />
                  )}
                </View>

                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDate}>
                  {step.date ? formatDate(step.date) : '-'}
                </Text>
              </View>
            ))}
          </View>

          {/* RESULT */}

          <View style={styles.resultBox}>
            <InfoRow
  label="Шийдвэрлэх хүн"
  value={value(
    isTransferred
      ? detail?.transferUserNm ?? params.transferUserNm
      : detail?.decisionUserNm ??
          params.decisionUserNm ??
          detail?.transferUserNm ??
          params.transferUserNm
  )}
/>
      

            <InfoRow
              label="Шийдвэрлэсэн огноо"
              value={value(
                detail?.decisionDate ?? params.decisionDate
              )}
            />

           <InfoRow
  label="Тайлбар"
  value={value(
    detail?.decisionComment ??
    detail?.workResult ??
    params.workResult
  )}
  last
  multiline
/>
          </View>
        </View>

        {/* ===================================================
            ACTION BUTTONS
        =================================================== */}

        {/* ХАДГАЛСАН (30): эрхтэй хэрэглэгч Засах / Илгээх */}
        {isSavedStatus && canSaveAndSend ? (
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionButton,
                styles.editButton,
              ]}
              disabled={sending}
              onPress={() =>
                router.push({
                  pathname: '/tech-support-edit',
                  params: {
                    workId: params.workId,
                    userNm,
                    cstmNm,
                    userId,
                    token,
                    roles: params.roles,
                  },
                })
              }
            >
              <Feather
                name="edit-2"
                size={21}
                color="#428CE5"
              />

              <Text style={styles.editText}>
                Засах
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                styles.sendButton,
                sending &&
                  styles.actionButtonDisabled,
              ]}
              disabled={sending}
              onPress={handleSend}
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
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text style={styles.sendText}>
                    Илгээх
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}

        {/* DCSN_CALL: шийдэгдээгүй хүсэлтийг Шилжүүлэх / Шийдвэрлэх */}
        {!isSavedStatus &&
        !isFinalStatus &&
        canTransfer ? (
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionButton,
                styles.transferButton,
              ]}
              onPress={openTransferModal}
            >
              <Feather
                name="repeat"
                size={23}
                color="#428CE5"
              />

              <Text style={styles.transferText}>
                Шилжүүлэх
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                styles.resolveButton,
              ]}
              onPress={openResolveModal}
            >
              <Feather
                name="check"
                size={25}
                color="#FFFFFF"
              />

              <Text style={styles.resolveText}>
                Шийдвэрлэх
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* DCSN_PRG: Шилжүүлэх эрхгүй, зөвхөн Шийдвэрлэх */}
        {!isSavedStatus &&
        !isFinalStatus &&
        !canTransfer &&
        canResolve ? (
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionButton,
                styles.resolveButton,
              ]}
              onPress={openResolveModal}
            >
              <Feather
                name="check"
                size={25}
                color="#FFFFFF"
              />

              <Text style={styles.resolveText}>
                Шийдвэрлэх
              </Text>
            </Pressable>
          </View>
        ) : null}

      </ScrollView>

      {/* =====================================================
          TRANSFER MODAL
      ===================================================== */}

      <Modal
        visible={transferVisible}
        transparent
        animationType="slide"
        onRequestClose={closeTransferModal}
      >
        <View style={styles.modalOverlay}>
          {/* DARK BACKGROUND */}

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeTransferModal}
          />

          {/* SHEET */}

          <View style={styles.transferSheet}>
            <View style={styles.sheetHandle} />

            {/* HEADER */}

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Шилжүүлэх
              </Text>

              <TouchableOpacity
                style={styles.sheetClose}
                onPress={closeTransferModal}
                disabled={transferLoading}
              >
                <Feather
                  name="x"
                  size={24}
                  color="#687A98"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.transferLabel}>
              Шилжүүлэх хүн{' '}
              <Text style={styles.required}>
                *
              </Text>
            </Text>

            {/* SEARCH */}

            <View style={styles.userSearchBox}>
              <Feather
                name="search"
                size={20}
                color="#7890B7"
              />

              <TextInput
                value={userSearch}
                onChangeText={setUserSearch}
                placeholder="Ажилтны нэрээр хайх..."
                placeholderTextColor="#9AA8C0"
                style={styles.userSearchInput}
                returnKeyType="search"
                onSubmitEditing={handleSearchUser}
              />

              {userSearch.length > 0 && (
                <TouchableOpacity
                  onPress={clearSearch}
                >
                  <Feather
                    name="x"
                    size={18}
                    color="#9AA8C0"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* USER LIST */}

            <View style={styles.userList}>
              {usersLoading ? (
                <View style={styles.userLoading}>
                  <ActivityIndicator
                    size="small"
                    color="#428CE5"
                  />

                  <Text style={styles.userLoadingText}>
                    Ажилтнуудыг уншиж байна...
                  </Text>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator
                  keyboardShouldPersistTaps="handled"
                >
                  {users.map((item) => {
                    const selected =
                      selectedUser?.userId ===
                      item.userId;

                    return (
                      <TouchableOpacity
                        key={item.userId}
                        style={[
                          styles.userRow,
                          selected &&
                            styles.userRowSelected,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedUser(item);
                          setTransferError('');
                        }}
                      >
                        <View style={styles.userIcon}>
                          <Feather
                            name="user"
                            size={17}
                            color="#428CE5"
                          />
                        </View>

                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {item.userNm}
                          </Text>


                        </View>

                        <View
                          style={[
                            styles.radio,
                            selected &&
                              styles.radioSelected,
                          ]}
                        >
                          {selected && (
                            <View
                              style={
                                styles.radioInner
                              }
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {!usersLoading &&
                    users.length === 0 && (
                      <View style={styles.noUsers}>
                        <Text
                          style={styles.noUsersText}
                        >
                          Ажилтан олдсонгүй.
                        </Text>
                      </View>
                    )}
                </ScrollView>
              )}
            </View>

            {/* ERROR */}

            {!!transferError && (
              <View style={styles.errorBox}>
                <Feather
                  name="alert-circle"
                  size={15}
                  color="#D9535F"
                />

                <Text style={styles.transferError}>
                  {transferError}
                </Text>
              </View>
            )}

            {/* BUTTONS */}

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetCancelButton}
                disabled={transferLoading}
                onPress={closeTransferModal}
              >
                <Text style={styles.sheetCancelText}>
                  Болих
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sheetTransferButton,
                  (!selectedUser ||
                    transferLoading) &&
                    styles.sheetTransferButtonDisabled,
                ]}
                disabled={
                  !selectedUser || transferLoading
                }
                onPress={handleTransfer}
              >
                {transferLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Feather
                      name="repeat"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.sheetTransferText
                      }
                    >
                      Шилжүүлэх
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

<Modal
  visible={resolveVisible}
  transparent
  animationType="slide"
  onRequestClose={closeResolveModal}
>
  <View style={styles.resolveOverlay}>
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={closeResolveModal}
    />

    <View style={styles.resolveSheet}>
      <View style={styles.resolveHandle} />

      {/* HEADER */}

      <View style={styles.resolveHeader}>
        <Text style={styles.resolveTitle}>
          Шийдвэрлэх
        </Text>

        <TouchableOpacity
          style={styles.resolveClose}
          onPress={closeResolveModal}
        >
          <Feather
            name="x"
            size={24}
            color="#687A98"
          />
        </TouchableOpacity>
      </View>

      {/* ШИЙДВЭР */}

      <Text style={styles.resolveLabel}>
        Шийдвэр <Text style={styles.resolveRequired}>*</Text>
      </Text>

      {/* ШИЙДВЭРЛЭСЭН */}

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.resolveOption,
          styles.resolveOptionSuccess,
          resolveType === 'resolved' &&
            styles.resolveOptionSuccessSelected,
        ]}
        onPress={() => {
          setResolveType('resolved');
          setResolveError('');
        }}
      >
        <View
          style={[
            styles.resolveRadio,
            resolveType === 'resolved' &&
              styles.resolveRadioSuccess,
          ]}
        >
          {resolveType === 'resolved' && (
            <View style={styles.resolveRadioDotSuccess} />
          )}
        </View>

        <View style={styles.resolveIconSuccess}>
          <Feather
            name="check"
            size={24}
            color="#42B96B"
          />
        </View>

        <View style={styles.resolveOptionContent}>
          <Text style={styles.resolveOptionTitle}>
            Шийдвэрлэсэн
          </Text>

          <Text style={styles.resolveOptionDescription}>
            Асуудал бүрэн шийдэгдсэн
          </Text>
        </View>
      </TouchableOpacity>

      {/* ШИЙДВЭРЛЭХ БОЛОМЖГҮЙ */}

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.resolveOption,
          styles.resolveOptionDanger,
          resolveType === 'impossible' &&
            styles.resolveOptionDangerSelected,
        ]}
        onPress={() => {
          setResolveType('impossible');
          setResolveError('');
        }}
      >
        <View
          style={[
            styles.resolveRadio,
            resolveType === 'impossible' &&
              styles.resolveRadioDanger,
          ]}
        >
          {resolveType === 'impossible' && (
            <View style={styles.resolveRadioDotDanger} />
          )}
        </View>

        <View style={styles.resolveIconDanger}>
          <Feather
            name="x"
            size={24}
            color="#E23C43"
          />
        </View>

        <View style={styles.resolveOptionContent}>
          <Text style={styles.resolveOptionTitle}>
            Шийдвэрлэх боломжгүй
          </Text>

          <Text style={styles.resolveOptionDescription}>
            Асуудлыг шийдвэрлэх боломжгүй
          </Text>
        </View>
      </TouchableOpacity>

      {/* ТАЙЛБАР */}

      <Text
        style={[
          styles.resolveLabel,
          styles.resolveCommentLabel,
        ]}
      >
        Тайлбар <Text style={styles.resolveRequired}>*</Text>
      </Text>

      <View
        style={[
          styles.resolveTextAreaBox,
          !!resolveError && styles.resolveTextAreaError,
        ]}
      >
        <TextInput
          value={resolveComment}
          onChangeText={(text) => {
            if (text.length <= 500) {
              setResolveComment(text);
              setResolveError('');
            }
          }}
          placeholder="Тайлбараа оруулна уу..."
          placeholderTextColor="#A5B2C8"
          multiline
          maxLength={500}
          textAlignVertical="top"
          style={styles.resolveTextArea}
        />
      </View>

      <Text style={styles.resolveCounter}>
        {resolveComment.length}/500
      </Text>

      {!!resolveError && (
        <Text style={styles.resolveError}>
          {resolveError}
        </Text>
      )}

      {/* BUTTONS */}

      <View style={styles.resolveActions}>
        <TouchableOpacity
          style={styles.resolveCancelButton}
          onPress={closeResolveModal}
        >
          <Text style={styles.resolveCancelText}>
            Болих
          </Text>
        </TouchableOpacity>
<TouchableOpacity
  style={[
    styles.resolveSubmitButton,
    resolveLoading && { opacity: 0.6 },
  ]}
  onPress={handleResolve}
  disabled={resolveLoading}
>
  {resolveLoading ? (
    <ActivityIndicator
      size="small"
      color="#FFFFFF"
    />
  ) : (
    <>
      <Feather
        name="check"
        size={20}
        color="#FFFFFF"
      />

      <Text style={styles.resolveSubmitText}>
        Шийдвэрлэх
      </Text>
    </>
  )}
</TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
      {/* =====================================================
          BOTTOM NAV
      ===================================================== */}

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

/* ===========================================================
   STATUS BADGE
=========================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status?.toLowerCase().trim() ?? '';

  let backgroundColor = '#F8FAFC';
  let color = '#7E8795';

  if (
    normalized.includes('боломжгүй') ||
    normalized.includes('татгалз')
  ) {
    backgroundColor = '#FFE8E8';
    color = '#D94B55';
  } else if (
    normalized.includes('шийдвэрлэсэн') ||
    normalized.includes('хийгдсэн')
  ) {
    backgroundColor = '#E8F8ED';
    color = '#43A66D';
  } else if (normalized.includes('шилжүүл')) {
    backgroundColor = '#FFF3D6';
    color = '#D59A1F';
  } else if (normalized.includes('илгээ')) {
    backgroundColor = '#E7F1FF';
    color = '#4E82E8';
  }

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          { color },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

/* ===========================================================
   INFO ROW
=========================================================== */

function InfoRow({
  label,
  value,
  last = false,
  multiline = false,
}: {
  label: string;
  value: string;
  last?: boolean;
  multiline?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        last && styles.infoRowLast,
        multiline && styles.infoRowMultiline,
      ]}
    >
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

/* ===========================================================
   HELPERS
=========================================================== */

function value(text?: string) {
  if (
    !text ||
    text === 'null' ||
    text === 'undefined'
  ) {
    return '-';
  }

  return text;
}

function formatDate(date?: string) {
  if (!date) return '-';

  if (date.length >= 16) {
    return date.substring(0, 16);
  }

  return date;
}

/* ===========================================================
   STYLES
=========================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9FE',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 24,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#172B55',
  },

  /* CARD */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
  },

  sectionHeader: {
    minHeight: 45,
    borderRadius: 14,
    backgroundColor: '#F0F5FF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172F66',
  },

  /* STATUS */

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },

  /* INFO */

  infoRow: {
    minHeight: 43,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF7',
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoRowMultiline: {
    alignItems: 'flex-start',
    minHeight: 58,
  },

  infoLabel: {
    width: '43%',
    paddingRight: 8,
    fontSize: 12,
    color: '#7D90B1',
  },

  infoValue: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#173274',
  },

  /* TIMELINE */

  timeline: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 18,
  },

  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },

  stepLine: {
    position: 'absolute',
    top: 12,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#D8E2F2',
  },

  stepLineActive: {
    backgroundColor: '#4B91F1',
  },

  stepCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#C7D5E9',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  stepCircleActive: {
    borderColor: '#428CE5',
  },

  stepCircleCurrent: {
    backgroundColor: '#428CE5',
    borderColor: '#428CE5',
    borderWidth: 3,
  },

  emptyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#C7D5E9',
  },

  stepTitle: {
    marginTop: 7,
    fontSize: 10,
    fontWeight: '600',
    color: '#31446C',
    textAlign: 'center',
  },

  stepDate: {
    marginTop: 2,
    fontSize: 8,
    color: '#91A0B8',
    textAlign: 'center',
  },

  /* RESULT */

  resultBox: {
    backgroundColor: '#F8FAFE',
    borderRadius: 15,
    paddingHorizontal: 4,
    marginHorizontal: 2,
    marginBottom: 2,
  },

  /* DETAIL BUTTONS */

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },

  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  transferButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#428CE5',
  },

  editButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#428CE5',
  },

  editText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#428CE5',
  },

  sendButton: {
    backgroundColor: '#2697DD',
  },

  sendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  actionButtonDisabled: {
    opacity: 0.6,
  },

  resolveButton: {
    backgroundColor: '#69C600',
  },

  transferText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#428CE5',
  },

  resolveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* =======================================================
     TRANSFER MODAL
  ======================================================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 27, 50, 0.45)',
    justifyContent: 'flex-end',
  },

  transferSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: '72%',
  },

  sheetHandle: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D7DDE7',
    alignSelf: 'center',
    marginBottom: 14,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sheetTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#172F66',
  },

  sheetClose: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  transferLabel: {
    fontSize: 12,
    color: '#788BAA',
    marginBottom: 8,
  },

  required: {
    color: '#E65A64',
  },

  /* SEARCH */

  userSearchBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D5E1F3',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  userSearchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    fontSize: 12,
    color: '#20345D',

    ...(Platform.OS === 'web'
      ? ({ outlineStyle: 'none' } as any)
      : {}),
  },

  /* USER LIST */

  userList: {
    height: 320,
  },

  userLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  userLoadingText: {
    marginTop: 8,
    fontSize: 11,
    color: '#8292AA',
  },

  userRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EDF6',
    paddingHorizontal: 7,
  },

  userRowSelected: {
    backgroundColor: '#F5F9FF',
  },

  userIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  userInfo: {
    flex: 1,
    paddingRight: 10,
  },

  userName: {
    fontSize: 12,
    color: '#173274',
    fontWeight: '500',
  },

  userDepartment: {
    marginTop: 2,
    fontSize: 9,
    color: '#94A3B8',
  },

  /* RADIO */

  radio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#B7C7DE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: '#428CE5',
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#428CE5',
  },

  /* EMPTY */

  noUsers: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noUsersText: {
    fontSize: 11,
    color: '#8D9CB3',
  },

  /* ERROR */

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },

  transferError: {
    flex: 1,
    color: '#D9535F',
    fontSize: 11,
    marginLeft: 6,
  },

  /* MODAL BUTTONS */

  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
  },

  sheetCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#428CE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetCancelText: {
    color: '#428CE5',
    fontSize: 13,
    fontWeight: '700',
  },

  sheetTransferButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#428CE5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  sheetTransferButtonDisabled: {
    opacity: 0.45,
  },

  sheetTransferText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
resolveOverlay: {
  flex: 1,
  backgroundColor: 'rgba(15, 18, 25, 0.68)',
  justifyContent: 'flex-end',
},

resolveSheet: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: 10,
  paddingHorizontal: 20,
  paddingBottom: 20,
  maxHeight: '78%',
},

resolveHandle: {
  width: 50,
  height: 5,
  borderRadius: 3,
  backgroundColor: '#D1D6DE',
  alignSelf: 'center',
  marginBottom: 18,
},

resolveHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 22,
},

resolveTitle: {
  flex: 1,
  fontSize: 20,
  fontWeight: '700',
  color: '#172F66',
},

resolveClose: {
  width: 38,
  height: 38,
  alignItems: 'center',
  justifyContent: 'center',
},

resolveLabel: {
  fontSize: 12,
  color: '#788BAA',
  marginBottom: 10,
},

resolveRequired: {
  color: '#E5535E',
},

resolveOption: {
  minHeight: 66,
  borderRadius: 12,
  borderWidth: 1,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  marginBottom: 10,
},

resolveOptionSuccess: {
  borderColor: '#B7E8C8',
  backgroundColor: '#F1FCF5',
},

resolveOptionSuccessSelected: {
  borderColor: '#54D384',
},

resolveOptionDanger: {
  borderColor: '#F2C4C4',
  backgroundColor: '#FFF7F7',
},

resolveOptionDangerSelected: {
  borderColor: '#F08A8A',
},

resolveRadio: {
  width: 19,
  height: 19,
  borderRadius: 10,
  borderWidth: 1.5,
  borderColor: '#AFC0D8',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},

resolveRadioSuccess: {
  borderColor: '#48B96F',
  backgroundColor: '#48B96F',
},

resolveRadioDanger: {
  borderColor: '#E5535E',
  backgroundColor: '#E5535E',
},

resolveRadioDotSuccess: {
  width: 7,
  height: 7,
  borderRadius: 4,
  backgroundColor: '#FFFFFF',
},

resolveRadioDotDanger: {
  width: 7,
  height: 7,
  borderRadius: 4,
  backgroundColor: '#FFFFFF',
},

resolveIconSuccess: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: '#DDF7E6',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 10,
},

resolveIconDanger: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: '#FFE2E2',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 10,
},

resolveOptionContent: {
  flex: 1,
},

resolveOptionTitle: {
  fontSize: 13,
  fontWeight: '700',
  color: '#173274',
},

resolveOptionDescription: {
  marginTop: 3,
  fontSize: 10,
  color: '#8192AD',
},

resolveCommentLabel: {
  marginTop: 14,
},

resolveTextAreaBox: {
  height: 126,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#D5E1F3',
  backgroundColor: '#FBFCFF',
},

resolveTextAreaError: {
  borderColor: '#E05B65',
},

resolveTextArea: {
  flex: 1,
  paddingHorizontal: 12,
  paddingVertical: 12,
  fontSize: 12,
  lineHeight: 18,
  color: '#20345D',

  ...(Platform.OS === 'web'
    ? ({ outlineStyle: 'none' } as any)
    : {}),
},

resolveCounter: {
  marginTop: 5,
  textAlign: 'right',
  fontSize: 9,
  color: '#7E8DA7',
},

resolveError: {
  marginTop: 4,
  fontSize: 10,
  color: '#D9535F',
},

resolveActions: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 18,
  paddingTop: 16,
  borderTopWidth: 1,
  borderTopColor: '#EEF1F5',
},

resolveCancelButton: {
  flex: 1,
  height: 50,
  borderRadius: 12,
  borderWidth: 1.5,
  borderColor: '#428CE5',
  alignItems: 'center',
  justifyContent: 'center',
},

resolveCancelText: {
  fontSize: 13,
  fontWeight: '700',
  color: '#428CE5',
},

resolveSubmitButton: {
  flex: 1,
  height: 50,
  borderRadius: 12,
  backgroundColor: '#428CE5',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
},

resolveSubmitText: {
  fontSize: 13,
  fontWeight: '700',
  color: '#FFFFFF',
},
 
});