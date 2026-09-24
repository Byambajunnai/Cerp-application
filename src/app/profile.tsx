import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomNav from '../components/BottomNav';


export default function ProfileScreen() {

  const {
    userNm,
    cstmNm,
    userId,
    token,
  } = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
    token?: string;
  }>();


  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = () => {
  const logout = () => {
    // Login page рүү буцаана.
    // Ингэснээр одоогийн user/token params дараагийн route руу
    // дамжихаа болино.
    router.replace('/');
  };

  // Browser
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(
      'Та системээс гарах уу?'
    );

    if (confirmed) {
      logout();
    }

    return;
  }

  // Android / iOS
  Alert.alert(
    'Системээс гарах',
    'Та системээс гарах уу?',
    [
      {
        text: 'Үгүй',
        style: 'cancel',
      },
      {
        text: 'Тийм',
        style: 'destructive',
        onPress: logout,
      },
    ],
    {
      cancelable: true,
    }
  );
};

  /* ============================================================
     UI
  ============================================================ */

  return (

    <SafeAreaView
      style={styles.safeArea}
    >


      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={styles.header}
      >

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
          activeOpacity={0.7}
        >

          <Feather
            name="arrow-left"
            size={22}
            color="#273248"
          />

        </TouchableOpacity>


        <Text
          style={styles.headerTitle}
        >
          Миний
        </Text>


        <View
          style={styles.headerSpace}
        />

      </View>


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={styles.content}
      >


        {/* ====================================================
            PROFILE
        ==================================================== */}

        <View
          style={styles.profileHeader}
        >

          <View
            style={styles.avatar}
          >

            <Feather
              name="user"
              size={42}
              color="#428CE5"
            />

          </View>


          <Text
            style={styles.profileName}
          >
            {userNm || '-'}
          </Text>


          <Text
            style={styles.department}
          >
            {cstmNm || '-'}
          </Text>

        </View>


        {/* ====================================================
            МИНИЙ МЭДЭЭЛЭЛ
        ==================================================== */}

        <Text
          style={styles.sectionTitle}
        >
          Миний мэдээлэл
        </Text>


        <View
          style={styles.infoCard}
        >


          {/* ================================
              ХУВИЙН ДУГААР
          ================================ */}

          <View
            style={styles.infoRow}
          >

            <View
              style={styles.iconBox}
            >

              <Feather
                name="credit-card"
                size={20}
                color="#428CE5"
              />

            </View>


            <View
              style={styles.infoContent}
            >

              <Text
                style={styles.label}
              >
                Хувийн дугаар
              </Text>


              <Text
                style={styles.value}
              >
                {userId || '-'}
              </Text>

            </View>

          </View>


          <View
            style={styles.divider}
          />


          {/* ================================
              НЭР
          ================================ */}

          <View
            style={styles.infoRow}
          >

            <View
              style={styles.iconBox}
            >

              <Feather
                name="user"
                size={20}
                color="#428CE5"
              />

            </View>


            <View
              style={styles.infoContent}
            >

              <Text
                style={styles.label}
              >
                Нэр
              </Text>


              <Text
                style={styles.value}
              >
                {userNm || '-'}
              </Text>

            </View>

          </View>


          <View
            style={styles.divider}
          />


          {/* ================================
              БАЙГУУЛЛАГА / ХЭЛТЭС
          ================================ */}

          <View
            style={styles.infoRow}
          >

            <View
              style={styles.iconBox}
            >

              <Feather
                name="briefcase"
                size={20}
                color="#428CE5"
              />

            </View>


            <View
              style={styles.infoContent}
            >

              <Text
                style={styles.label}
              >
                Байгууллага / нэгж
              </Text>


              <Text
                style={styles.value}
              >
                {cstmNm || '-'}
              </Text>

            </View>

          </View>

        </View>


        {/* ====================================================
            LOGOUT
        ==================================================== */}

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >

          <Feather
            name="log-out"
            size={21}
            color="#E5484D"
          />


          <Text
            style={styles.logoutText}
          >
            Системээс гарах
          </Text>

        </TouchableOpacity>


      </View>


      {/* ======================================================
          COMMON BOTTOM NAV
      ====================================================== */}

      <BottomNav
        active="profile"
        userNm={userNm}
        cstmNm={cstmNm}
        userId={userId}
        token={token}
      />


    </SafeAreaView>
  );
}


/* ============================================================
   STYLE
============================================================ */

const styles = StyleSheet.create({

  /* ========================================================
     PAGE
  ======================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },


  /* ========================================================
     HEADER
  ======================================================== */

  header: {
    height: 60,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 20,

    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF2',
  },


  backButton: {
    width: 40,
    height: 40,

    alignItems: 'flex-start',
    justifyContent: 'center',
  },


  headerTitle: {
    fontSize: 18,
    fontWeight: '700',

    color: '#273248',
  },


  headerSpace: {
    width: 40,
  },


  /* ========================================================
     CONTENT
  ======================================================== */

  content: {
    flex: 1,

    paddingHorizontal: 25,
    paddingTop: 28,
  },


  /* ========================================================
     PROFILE
  ======================================================== */

  profileHeader: {
    alignItems: 'center',

    marginBottom: 35,
  },


  avatar: {
    width: 82,
    height: 82,

    borderRadius: 41,

    backgroundColor: '#EAF4FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 12,
  },


  profileName: {
    fontSize: 21,
    fontWeight: '700',

    color: '#273248',

    textAlign: 'center',
  },


  department: {
    maxWidth: 280,

    fontSize: 11,
    lineHeight: 16,

    color: '#8B95A5',

    marginTop: 5,

    textAlign: 'center',
  },


  /* ========================================================
     INFORMATION
  ======================================================== */

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',

    color: '#273248',

    marginBottom: 12,
  },


  infoCard: {
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E0E5EC',

    borderRadius: 14,

    paddingHorizontal: 15,

    overflow: 'hidden',
  },


  infoRow: {
    minHeight: 75,

    flexDirection: 'row',
    alignItems: 'center',
  },


  iconBox: {
    width: 42,
    height: 42,

    borderRadius: 10,

    backgroundColor: '#EAF4FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,
  },


  infoContent: {
    flex: 1,

    paddingVertical: 12,
  },


  label: {
    fontSize: 11,

    color: '#8B95A5',

    marginBottom: 4,
  },


  value: {
    fontSize: 14,
    lineHeight: 19,

    fontWeight: '600',

    color: '#273248',
  },


  divider: {
    height: 1,

    backgroundColor: '#EEF1F5',
  },


  /* ========================================================
     LOGOUT
  ======================================================== */

  logoutButton: {
    height: 52,

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#F1C5C7',

    backgroundColor: '#FFF7F7',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 30,
  },


  logoutText: {
    fontSize: 14,
    fontWeight: '700',

    color: '#E5484D',

    marginLeft: 9,
  },

});