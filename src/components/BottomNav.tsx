import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type BottomNavProps = {
  active?: 'home' | 'phone' | 'request' | 'attendance' | 'profile';

  userNm?: string;
  cstmNm?: string;
  userId?: string;
  token?: string;
};

export default function BottomNav({
  active = 'home',
  userNm = '',
  cstmNm = '',
  userId = '',
  token = '',
}: BottomNavProps) {

  const commonParams = {
    userNm,
    cstmNm,
    userId,
    token,
  };


  /* =========================
     НҮҮР
  ========================= */

  const goHome = () => {
    router.replace({
      pathname: '/home',
      params: commonParams,
    });
  };


  /* =========================
     УТАСНЫ ЖАГСААЛТ
  ========================= */

  const goPhone = () => {
    router.push({
      pathname: '/phone',
      params: commonParams,
    });
  };


  /* =========================
     ХҮСЭЛТ
  ========================= */

  const goRequest = () => {
    router.push({
      pathname: '/request',
      params: commonParams,
    });
  };


  /* =========================
     ЦАГ БҮРТГЭЛ
  ========================= */

  const goAttendance = () => {
    router.push({
      pathname: '/attendance',
      params: commonParams,
    });
  };


  /* =========================
     ХУВИЙН МЭДЭЭЛЭЛ
  ========================= */

  const goProfile = () => {
    router.push({
      pathname: '/profile',
      params: commonParams,
    });
  };


  return (

    <View style={styles.container}>


      {/* ================= НҮҮР ================= */}

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={goHome}
      >

        <Feather
          name="grid"
          size={24}
          color={
            active === 'home'
              ? '#428CE5'
              : '#8A96AA'
          }
        />

        <Text
          style={[
            styles.navText,
            active === 'home' &&
              styles.activeText,
          ]}
        >
          Нүүр
        </Text>

      </TouchableOpacity>


      {/* ================= УТАС ================= */}

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={goPhone}
      >

        <Feather
          name="book"
          size={23}
          color={
            active === 'phone'
              ? '#428CE5'
              : '#8A96AA'
          }
        />

        <Text
          style={[
            styles.navText,
            active === 'phone' &&
              styles.activeText,
          ]}
        >
          Утас
        </Text>

      </TouchableOpacity>


      {/* ================= ХҮСЭЛТ ================= */}

      <View style={styles.centerWrapper}>

        <TouchableOpacity
          style={styles.plusButton}
          activeOpacity={0.85}
          onPress={goRequest}
        >

          <Feather
            name="plus"
            size={34}
            color="#FFFFFF"
          />

        </TouchableOpacity>

        <Text
          style={[
            styles.navText,
            styles.centerText,
            active === 'request' &&
              styles.activeText,
          ]}
        >
          Хүсэлт
        </Text>

      </View>


      {/* ================= ЦАГ БҮРТГЭЛ ================= */}

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={goAttendance}
      >

        <Feather
          name="file-text"
          size={24}
          color={
            active === 'attendance'
              ? '#428CE5'
              : '#8A96AA'
          }
        />

        <Text
          style={[
            styles.navText,
            active === 'attendance' &&
              styles.activeText,
          ]}
        >
          Цаг
        </Text>

      </TouchableOpacity>


      {/* ================= PROFILE ================= */}

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={goProfile}
      >

        <Feather
          name="user"
          size={25}
          color={
            active === 'profile'
              ? '#428CE5'
              : '#8A96AA'
          }
        />

        <Text
          style={[
            styles.navText,
            active === 'profile' &&
              styles.activeText,
          ]}
        >
          Миний
        </Text>

      </TouchableOpacity>


    </View>

  );
}


const styles = StyleSheet.create({

  container: {
    height: 82,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E6EAF0',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 6,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,

    elevation: 5,
  },


  navItem: {
    flex: 1,

    height: '100%',

    alignItems: 'center',
    justifyContent: 'center',
  },


  navText: {
    marginTop: 5,

    fontSize: 9,

    color: '#8A96AA',
  },


  activeText: {
    color: '#428CE5',

    fontWeight: '600',
  },


  /* ================= CENTER ================= */

  centerWrapper: {
    flex: 1,

    height: '100%',

    alignItems: 'center',
    justifyContent: 'center',

    position: 'relative',
  },


  plusButton: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: '#428CE5',

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: -25,

    shadowColor: '#428CE5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 7,

    elevation: 7,
  },


  centerText: {
    marginTop: 3,
  },

});