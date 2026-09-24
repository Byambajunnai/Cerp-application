import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

type TechSupportItem = {
  workId: string;
  callTypeNm: string | null;
  callerName: string | null;
  callPhone: number | string | null;
  roomNo: string | null;
  callAnswer: string | null;

  regUserNm: string | null;
  regDate: string | null;

  decisionUserNm: string | null;
  decisionStatus: string | null;
  decisionStatusNm: string | null;

  workResult: string | null;
  decisionDate: string | null;

  beforeCount: string | null;

  transferUserNm: string | null;
  transferDate?: string | null;
};

type TechSupportResponse = {
  pageNumber: number;
  totalPage: number;
  totalCount: number;
  hasNextPage: boolean;
  items: TechSupportItem[];
};

type FilterType =
  | 'Бүгд'
  | 'Хадгалсан'
  | 'Илгээсэн'
  | 'Шилжүүлсэн'
  | 'Шийдвэрлэсэн'
  | 'Боломжгүй';

const FILTERS: FilterType[] = [
  'Бүгд',
  'Хадгалсан',
  'Илгээсэн',
  'Шилжүүлсэн',
  'Шийдвэрлэсэн',
  'Боломжгүй',
];

/* =========================================================
   SCREEN
========================================================= */

export default function TechSupportScreen() {
  const {
    userNm,
    cstmNm,
    userId,
    token,
    refresh,
    roles,
  } = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    token?: string;
    refresh?: string;
    roles?: string;
  }>();

  const [items, setItems] =
    useState<TechSupportItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState<FilterType>('Бүгд');


    const [menuWorkId, setMenuWorkId] =
  useState<string | null>(null);

const [deletingWorkId, setDeletingWorkId] =
  useState<string | null>(null);
  /* =====================================================
     LOAD TECH SUPPORT
  ===================================================== */

  const loadTechSupport = async () => {
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
        `${API_URL}/api/mobile/techsupport?page=1&pageSize=100`,
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

      if (response.status === 401) {
        setError(
          'Нэвтрэх эрхийн хугацаа дууссан байна.'
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data: TechSupportResponse =
        await response.json();

      setItems(data.items ?? []);
    } catch (err) {
      console.error(
        'TECH SUPPORT ERROR:',
        err
      );

      setError(
        'Техникийн тусламжийн мэдээллийг авч чадсангүй.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workId: string) => {
  const confirmed =
    Platform.OS === 'web'
      ? window.confirm(
          'Энэ хүсэлтийг устгахдаа итгэлтэй байна уу?'
        )
      : true;

  if (!confirmed) {
    return;
  }

  if (!token) {
    if (Platform.OS === 'web') {
      window.alert('Нэвтрэх мэдээлэл олдсонгүй.');
    }
    return;
  }

  try {
    setDeletingWorkId(workId);
    setMenuWorkId(null);

    const response = await fetch(
      `${API_URL}/api/mobile/techsupport/${workId}`,
      {
        method: 'DELETE',
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

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Устгах үед алдаа гарлаа. (${response.status})`
      );
    }

    if (Platform.OS === 'web') {
      window.alert(
        data?.message ||
          'Дуудлага амжилттай устгагдлаа.'
      );
    }

    await loadTechSupport();
  } catch (error: any) {
    console.error(
      'DELETE TECH SUPPORT ERROR:',
      error
    );

    if (Platform.OS === 'web') {
      window.alert(
        error?.message ||
          'Хүсэлтийг устгаж чадсангүй.'
      );
    }
  } finally {
    setDeletingWorkId(null);
  }
};

  /* =====================================================
     INITIAL LOAD / REFRESH
  ===================================================== */

  useEffect(() => {
    loadTechSupport();
  }, [token, refresh]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredItems = useMemo(() => {
    let result = [...items];

    const keyword =
      search.trim().toLowerCase();

    /* SEARCH */

    if (keyword) {
      result = result.filter(
        (item) => {
          const text = [
            item.callTypeNm,
            item.callerName,
            item.regUserNm,
            item.callAnswer,
            item.callPhone,
            item.roomNo,
            item.regDate,
            item.decisionStatusNm,
            item.transferUserNm,
            item.decisionUserNm,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return text.includes(
            keyword
          );
        }
      );
    }

    /* STATUS FILTER */

    if (
      activeFilter !== 'Бүгд'
    ) {
      result = result.filter(
        (item) =>
          statusMatchesFilter(
            item.decisionStatusNm,
            activeFilter
          )
      );
    }

    return result;
  }, [
    items,
    search,
    activeFilter,
  ]);

  /* =====================================================
     COUNT
  ===================================================== */

  const getCount = (
    filter: FilterType
  ) => {
    if (filter === 'Бүгд') {
      return items.length;
    }

    return items.filter(
      (item) =>
        statusMatchesFilter(
          item.decisionStatusNm,
          filter
        )
    ).length;
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
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
          style={styles.headerTitle}
        >
          Техникийн тусламж
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname:
                '/tech-support-create',

              params: {
                userNm,
                cstmNm,
                userId,
                token,
                roles,
              },
            })
          }
        >
          <Feather
            name="plus"
            size={21}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.addButtonText
            }
          >
            Нэмэх
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}

      <View
        style={
          styles.searchSection
        }
      >
        <View
          style={styles.searchBox}
        >
          <Feather
            name="search"
            size={20}
            color="#7690BD"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Дуудлагын төрөл, нэр, тайлбар..."
            placeholderTextColor="#94A3BD"
            style={
              styles.searchInput
            }
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setSearch('')
              }
            >
              <Feather
                name="x"
                size={18}
                color="#94A3BD"
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={
            styles.filterButton
          }
          activeOpacity={0.8}
        >
          <Feather
            name="sliders"
            size={19}
            color="#4F82D9"
          />
        </TouchableOpacity>
      </View>

      {/* FILTERS */}

     <View style={styles.filterRow}>
  {FILTERS.map((filter) => {
    const selected = activeFilter === filter;

    return (
      <TouchableOpacity
        key={filter}
        activeOpacity={0.8}
        onPress={() => setActiveFilter(filter)}
        style={[
          styles.filterChip,
          selected && styles.filterChipActive,
        ]}
      >
        <Text
          style={[
            styles.filterChipText,
            selected && styles.filterChipTextActive,
          ]}
          numberOfLines={1}
        >
          {filter} {getCount(filter)}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>

      {/* CONTENT */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* LOADING */}

        {loading && (
          <View
            style={
              styles.centerBox
            }
          >
            <ActivityIndicator
              size="large"
              color="#428CE5"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Хүсэлтүүдийг
              уншиж байна...
            </Text>
          </View>
        )}

        {/* ERROR */}

        {!loading &&
          error !== '' && (
            <View
              style={
                styles.messageBox
              }
            >
              <Feather
                name="alert-circle"
                size={28}
                color="#E05B65"
              />

              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>

              <TouchableOpacity
                style={
                  styles.retryButton
                }
                onPress={
                  loadTechSupport
                }
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
          )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredItems.length ===
            0 && (
            <View
              style={
                styles.messageBox
              }
            >
              <Feather
                name="inbox"
                size={30}
                color="#9AA8BC"
              />

              <Text
                style={
                  styles.emptyText
                }
              >
                Техникийн хүсэлт
                олдсонгүй.
              </Text>
            </View>
          )}

        {/* CARDS */}

        {!loading &&
          !error &&
          filteredItems.map(
            (item) => {
              const status =
                getStatusStyle(
                  item.decisionStatusNm
                );

              return (
                <TouchableOpacity
                  key={
                    item.workId
                  }
                  style={
                    styles.card
                  }
                  activeOpacity={
                    0.8
                  }
                  onPress={() =>
                    router.push({
                      pathname:
                        '/tech-support-detail',

                      params: {
                        workId:
                          item.workId,

                        callTypeNm:
                          item.callTypeNm ??
                          '',

                        callerName:
                          item.callerName ??
                          '',

                        callPhone:
                          String(
                            item.callPhone ??
                              ''
                          ),

                        roomNo:
                          item.roomNo ??
                          '',

                        callAnswer:
                          item.callAnswer ??
                          '',

                        regUserNm:
                          item.regUserNm ??
                          '',

                        regDate:
                          item.regDate ??
                          '',

                        decisionUserNm:
                          item.decisionUserNm ??
                          '',

                        decisionStatus:
                          item.decisionStatus ??
                          '',

                        decisionStatusNm:
                          item.decisionStatusNm ??
                          '',

                        workResult:
                          item.workResult ??
                          '',

                        decisionDate:
                          item.decisionDate ??
                          '',

                        transferUserNm:
                          item.transferUserNm ??
                          '',

                        transferDate:
                          item.transferDate ??
                          '',

                        userNm,
                        cstmNm,
                        userId,
                        token,
                        roles,
                      },
                    })
                  }
                >
                  {/* TOP */}

                  <View
                    style={
                      styles.cardTop
                    }
                  >
                    <Text
                      style={
                        styles.cardTitle
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {item.callTypeNm ||
                        'Техникийн тусламж'}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,

                        {
                          backgroundColor:
                            status.backgroundColor,
                        },
                      ]}
                    >
                      <Feather
                        name={
                          status.icon
                        }
                        size={11}
                        color={
                          status.color
                        }
                      />

                      <Text
                        style={[
                          styles.statusText,

                          {
                            color:
                              status.color,
                          },
                        ]}
                      >
                        {getDisplayStatus(
                          item.decisionStatusNm
                        )}
                      </Text>
                    </View>

                    {item.decisionStatus === '30' ? (
  <View style={styles.menuWrapper}>
    <TouchableOpacity
      style={styles.moreButton}
      activeOpacity={0.7}
      onPress={(event) => {
        event.stopPropagation();

        setMenuWorkId(
          menuWorkId === item.workId
            ? null
            : item.workId
        );
      }}
    >
      {deletingWorkId === item.workId ? (
        <ActivityIndicator
          size="small"
          color="#8495B0"
        />
      ) : (
        <Feather
          name="more-vertical"
          size={20}
          color="#8495B0"
        />
      )}
    </TouchableOpacity>

    {menuWorkId === item.workId && (
      <View style={styles.actionMenu}>

        {/* ЗАСАХ */}

        <TouchableOpacity
          style={styles.actionMenuItem}
          activeOpacity={0.7}
          onPress={(event) => {
            event.stopPropagation();

            setMenuWorkId(null);

            router.push({
              pathname: '/tech-support-edit',
              params: {
                workId: item.workId,
                userNm,
                cstmNm,
                userId,
                token,
                roles,
              },
            });
          }}
        >
          <Feather
            name="edit-2"
            size={15}
            color="#428CE5"
          />

          <Text style={styles.editMenuText}>
            Засах
          </Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        {/* УСТГАХ */}

        <TouchableOpacity
          style={styles.actionMenuItem}
          activeOpacity={0.7}
          onPress={(event) => {
            event.stopPropagation();

            handleDelete(item.workId);
          }}
        >
          <Feather
            name="trash-2"
            size={15}
            color="#E05B65"
          />

          <Text style={styles.deleteMenuText}>
            Устгах
          </Text>
        </TouchableOpacity>

      </View>
    )}
  </View>
) : (
  <Feather
    name="chevron-right"
    size={20}
    color="#8495B0"
  />
)}
                  </View>

                  {/* USER */}

                  <Text
                    style={
                      styles.callerName
                    }
                  >
                    {item.callerName ||
                      item.regUserNm ||
                      '-'}
                  </Text>

                  {/* DESCRIPTION */}

                  <Text
                    style={
                      styles.description
                    }
                    numberOfLines={
                      1
                    }
                  >
                    {item.callAnswer ||
                      'Тайлбар байхгүй.'}
                  </Text>

                  {/* FOOTER */}

                  <View
                    style={
                      styles.cardFooter
                    }
                  >
                    <Text
                      style={
                        styles.footerText
                      }
                    >
                      {item.regDate ||
                        '-'}
                    </Text>

                    {!!item.roomNo && (
                      <>
                        <View
                          style={
                            styles.footerDot
                          }
                        />

                        <Text
                          style={
                            styles.footerText
                          }
                        >
                          Өрөө:{' '}
                          {
                            item.roomNo
                          }
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }
          )}
      </ScrollView>

      {/* BOTTOM NAV */}

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

/* =========================================================
   STATUS FILTER
========================================================= */

function statusMatchesFilter(
  status:
    | string
    | null
    | undefined,

  filter: FilterType
) {
  const value =
    status
      ?.toLowerCase()
      .trim() ?? '';

  if (filter === 'Бүгд') {
    return true;
  }

  if (
    filter === 'Хадгалсан'
  ) {
    return value.includes(
      'хадгал'
    );
  }

  if (
    filter === 'Илгээсэн'
  ) {
    return value.includes(
      'илгээ'
    );
  }

  if (
    filter === 'Шилжүүлсэн'
  ) {
    return value.includes(
      'шилжүүл'
    );
  }

  if (
    filter ===
    'Шийдвэрлэсэн'
  ) {
    return (
      value.includes(
        'шийдвэрлэсэн'
      ) ||
      value.includes(
        'хийгдсэн'
      )
    );
  }

  if (
    filter === 'Боломжгүй'
  ) {
    return (
      value.includes(
        'боломжгүй'
      ) ||
      value.includes(
        'татгалз'
      )
    );
  }

  return false;
}

/* =========================================================
   DISPLAY STATUS
========================================================= */

function getDisplayStatus(
  status?:
    | string
    | null
) {
  const value =
    status
      ?.toLowerCase()
      .trim() ?? '';

  if (
    value.includes(
      'боломжгүй'
    ) ||
    value.includes(
      'татгалз'
    )
  ) {
    return 'Шийдвэрлэх боломжгүй';
  }

  if (
    value.includes(
      'шийдвэрлэсэн'
    ) ||
    value.includes(
      'хийгдсэн'
    )
  ) {
    return 'Шийдвэрлэсэн';
  }

  if (
    value.includes(
      'шилжүүл'
    )
  ) {
    return 'Шилжүүлсэн';
  }

  if (
    value.includes(
      'илгээ'
    )
  ) {
    return 'Илгээсэн';
  }

  if (
    value.includes(
      'хадгал'
    )
  ) {
    return 'Хадгалсан';
  }

  /*
    Backend-ээс бидний мэдэхгүй
    шинэ төлөв ирвэл нэрийг нь
    өөрчлөхгүйгээр харуулна.
  */

  return (
    status || 'Хадгалсан'
  );
}

/* =========================================================
   STATUS STYLE
========================================================= */

function getStatusStyle(
  status?:
    | string
    | null
) {
  const value =
    status
      ?.toLowerCase()
      .trim() ?? '';

  /* ШИЙДВЭРЛЭХ БОЛОМЖГҮЙ */

  if (
    value.includes(
      'боломжгүй'
    ) ||
    value.includes(
      'татгалз'
    )
  ) {
    return {
      backgroundColor:
        '#FFE8E8',

      color:
        '#D94B55',

      icon:
        'slash' as const,
    };
  }

  /* ШИЙДВЭРЛЭСЭН */

  if (
    value.includes(
      'шийдвэрлэсэн'
    ) ||
    value.includes(
      'хийгдсэн'
    )
  ) {
    return {
      backgroundColor:
        '#E8F8ED',

      color:
        '#43A66D',

      icon:
        'check-circle' as const,
    };
  }

  /* ШИЛЖҮҮЛСЭН */

  if (
    value.includes(
      'шилжүүл'
    )
  ) {
    return {
      backgroundColor:
        '#FFF7E6',

      color:
        '#D49A24',

      icon:
        'repeat' as const,
    };
  }

  /* ИЛГЭЭСЭН */

  if (
    value.includes(
      'илгээ'
    )
  ) {
    return {
      backgroundColor:
        '#E7F1FF',

      color:
        '#4E82E8',

      icon:
        'send' as const,
    };
  }

  /* ХАДГАЛСАН */

  return {
    backgroundColor:
      '#F8FAFC',

    color:
      '#7E8795',

    icon:
      'clock' as const,
  };
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

    /* HEADER */

    header: {
      height: 70,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    headerTitle: {
      flex: 1,
      fontSize: 19,
      fontWeight: '700',
      color: '#152750',
      marginLeft: 2,
    },

    addButton: {
      height: 38,
      paddingHorizontal: 12,
      borderRadius: 11,
      backgroundColor:
        '#4E88F7',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    addButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 3,
    },

    /* SEARCH */

    searchSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 10,
    },

    searchBox: {
      flex: 1,
      height: 44,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        '#D8E4F5',
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 11,
    },

    searchInput: {
      flex: 1,
      height: 44,
      marginLeft: 8,
      fontSize: 12,
      color: '#253858',

      ...(Platform.OS ===
      'web'
        ? ({
            outlineStyle:
              'none',
          } as any)
        : {}),
    },

    filterButton: {
      width: 38,
      height: 42,
      borderRadius: 10,
      marginLeft: 7,
      backgroundColor:
        '#E9F1FF',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    /* FILTER */

   filterRow: {
  flexDirection: 'row',
  paddingHorizontal: 13,
  marginBottom: 10,
  gap: 5,
},

filterChip: {
  flex: 1,
  minHeight: 30,
  borderRadius: 15,
  backgroundColor: '#F0F2F5',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 4,
},

    filterChipActive: {
      backgroundColor:
        '#EEF4FF',
      borderWidth: 1,
      borderColor:
        '#5D8EFF',
    },

    filterChipText: {
      fontSize: 9,
      color: '#7C8491',
    },

    filterChipTextActive: {
      color: '#477DF0',
    },

    /* CONTENT */

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 18,
      paddingBottom: 25,
    },

    /* CARD */

    card: {
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        '#D9E6F7',
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 11,
      marginBottom: 10,
    },

    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    cardTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: '#172B58',
      paddingRight: 8,
    },

    /* STATUS */

    statusBadge: {
      minHeight: 27,
      borderRadius: 14,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 5,
    },

    statusText: {
      fontSize: 9,
      marginLeft: 3,
    },

    callerName: {
      marginTop: 4,
      fontSize: 12,
      color: '#40547B',
    },

    description: {
      marginTop: 7,
      fontSize: 11,
      color: '#8292AE',
    },

    cardFooter: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },

    footerText: {
      fontSize: 9.5,
      color: '#94A4BE',
    },

    footerDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor:
        '#B7C2D2',
      marginHorizontal: 6,
    },

    /* LOADING */

    centerBox: {
      minHeight: 280,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    loadingText: {
      marginTop: 10,
      fontSize: 12,
      color: '#8492A8',
    },

    /* MESSAGE */

    messageBox: {
      minHeight: 250,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 25,
    },

    errorText: {
      marginTop: 10,
      textAlign: 'center',
      fontSize: 12,
      color: '#75849B',
    },

    emptyText: {
      marginTop: 10,
      fontSize: 12,
      color: '#8492A8',
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

    menuWrapper: {
  position: 'relative',
  zIndex: 20,
},

moreButton: {
  width: 30,
  height: 30,
  alignItems: 'center',
  justifyContent: 'center',
},

actionMenu: {
  position: 'absolute',
  right: 0,
  top: 30,
  width: 120,
  backgroundColor: '#FFFFFF',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#E1E8F2',
  zIndex: 999,

  ...(Platform.OS === 'web'
    ? ({
        boxShadow:
          '0px 4px 14px rgba(24, 43, 77, 0.14)',
      } as any)
    : {
        elevation: 6,
      }),
},

actionMenuItem: {
  minHeight: 42,
  paddingHorizontal: 13,
  flexDirection: 'row',
  alignItems: 'center',
},

editMenuText: {
  marginLeft: 9,
  fontSize: 12,
  color: '#35547D',
  fontWeight: '500',
},

deleteMenuText: {
  marginLeft: 9,
  fontSize: 12,
  color: '#E05B65',
  fontWeight: '500',
},

menuDivider: {
  height: 1,
  backgroundColor: '#EEF2F7',
  marginHorizontal: 10,
},
  });