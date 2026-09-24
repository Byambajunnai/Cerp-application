
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomNav from '../components/BottomNav';

type RequestType = {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  color: string;
  background: string;
  route: string;
};

const requestTypes: RequestType[] = [
  {
    title: 'Техникийн хүсэлт',
    description:
      'Компьютер, принтер, сүлжээ болон техникийн тусламж үйлчилгээ',
    icon: 'tool',
    color: '#1677FF',
    background: '#EAF3FF',
    route: '/tech-support',
  },
  {
    title: 'Программын өөрчлөлтийн хүсэлт',
    description:
      'Системийн өөрчлөлт, шинэ функц болон хөгжүүлэлтийн хүсэлт',
    icon: 'file-text',
    color: '#7856FF',
    background: '#F2EDFF',
    route: '/software-request',
  },
  {
    title: 'Амралт чөлөө, томилолт хүсэлт',
    description:
      'Амралт, чөлөө болон албан томилолтын хүсэлт',
    icon: 'calendar',
    color: '#16A36C',
    background: '#EAF9F3',
    route: '/leave-request',
  },
];

export default function RequestScreen() {
 const { userNm, cstmNm, userId, token, roles } =
  useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    token?: string;
    roles?: string;
  }>();

  const openRequest = (route: string) => {
    router.push({
      pathname: route as any,
      params: {
        userNm,
        cstmNm,
        userId,
        token,
        roles,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace({
                pathname: '/home',
                params: {
                  userNm,
                  cstmNm,
                  userId,
                  token,
                  roles,
                },
              });
            }
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Шаардлагатай хүсэлтээ сонгон илгээнэ үү
        </Text>

        {requestTypes.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.requestCard}
            activeOpacity={0.75}
            onPress={() => openRequest(item.route)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.background },
              ]}
            >
              <Feather
                name={item.icon}
                size={27}
                color={item.color}
              />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {item.title}
              </Text>

              <Text style={styles.cardDescription}>
                {item.description}
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={23}
              color="#94A5BC"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 15,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },

  headerTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#1D2B43',
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  subtitle: {
    fontSize: 14,
    color: '#73839D',
    marginHorizontal: 12,
    marginBottom: 24,
    marginTop: 2,
  },

  requestCard: {
    minHeight: 124,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE7FA',
    borderRadius: 22,
    paddingHorizontal: 17,
    paddingVertical: 18,
    marginBottom: 12,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  cardContent: {
    flex: 1,
    paddingRight: 5,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D2B43',
    lineHeight: 21,
    marginBottom: 7,
  },

  cardDescription: {
    fontSize: 13,
    color: '#73839D',
    lineHeight: 19,
  },
});