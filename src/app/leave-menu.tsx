
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import BottomNav from '../components/BottomNav';

export default function LeaveMenuScreen() {
  const { userNm, cstmNm, userId, token } =
    useLocalSearchParams<{
      userNm?: string;
      cstmNm?: string;
      userId?: string;
      token?: string;
    }>();

  const params = {
    userNm,
    cstmNm,
    userId,
    token,
  };

  const menuItems = [
    {
      title: 'Хүсэлт',
      icon: 'file-text' as const,
      color: '#12B76A',
      background: '#E6F8F1',
      cardBackground: '#F0FCF7',
      route: '/leave-request',
    },
    {
      title: 'Ажилчдын хүсэлт',
      icon: 'file-text' as const,
      color: '#2388EF',
      background: '#E8F2FF',
      cardBackground: '#FFFFFF',
      route: '/employee-requests',
    },
    {
      title: 'Нийт ажилчдын хүсэлт',
      icon: 'file-text' as const,
      color: '#2388EF',
      background: '#E8F2FF',
      cardBackground: '#FFFFFF',
      route: '/all-employee-requests',
    },
    {
      title: 'Дарга нарын хүсэлт',
      icon: 'file-text' as const,
      color: '#2388EF',
      background: '#E8F2FF',
      cardBackground: '#FFFFFF',
      route: '/manager-requests',
    },
  ];

  const openPage = (route: string) => {
    router.push({
      pathname: route as any,
      params,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            router.replace({
              pathname: '/request',
              params,
            });
          }}
        >
          <Feather
            name="chevron-left"
            size={27}
            color="#1D2B43"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Хүсэлт
        </Text>
      </View>

      {/* MENU */}
      <View style={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuCard,
              {
                backgroundColor: item.cardBackground,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => openPage(item.route)}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: item.background,
                },
              ]}
            >
              <Feather
                name={item.icon}
                size={24}
                color={item.color}
              />
            </View>

            <Text style={styles.menuTitle}>
              {item.title}
            </Text>

            <Feather
              name="chevron-right"
              size={24}
              color="#24476F"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* BOTTOM NAVIGATION */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
  },

  header: {
    height: 110,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1D2B43',
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  menuCard: {
    height: 67,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 11,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1D2B43',
  },
});