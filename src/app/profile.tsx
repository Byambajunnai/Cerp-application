
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {

  const {
    userNm,
    cstmNm,
    userId,
  } = useLocalSearchParams<{
    userNm?: string;
    cstmNm?: string;
    userId?: string;
  }>();

  const handleLogout = () => {

    Alert.alert(
      'Гарах',
      'Та системээс гарах уу?',
      [
        {
          text: 'Үгүй',
          style: 'cancel',
        },
        {
          text: 'Тийм',
          style: 'destructive',
          onPress: () => {

            // Login page рүү буцна
            router.replace('/');

          },
        },
      ]
    );

  };


  return (

    <SafeAreaView style={styles.safeArea}>

      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >

          <Feather
            name="arrow-left"
            size={22}
            color="#273248"
          />

        </TouchableOpacity>


        <Text style={styles.headerTitle}>
          Миний
        </Text>


        <View style={styles.headerSpace} />

      </View>


      {/* ================= PROFILE ================= */}

      <View style={styles.content}>

        <View style={styles.profileHeader}>

          <View style={styles.avatar}>

            <Feather
              name="user"
              size={42}
              color="#428CE5"
            />

          </View>


          <Text style={styles.profileName}>
            {userNm || '-'}
          </Text>


          <Text style={styles.department}>
            {cstmNm || '-'}
          </Text>

        </View>


        {/* ================= МИНИЙ МЭДЭЭЛЭЛ ================= */}

        <Text style={styles.sectionTitle}>
          Миний мэдээлэл
        </Text>


        <View style={styles.infoCard}>

          {/* ХУВИЙН ДУГААР */}

          <View style={styles.infoRow}>

            <View style={styles.iconBox}>

              <Feather
                name="credit-card"
                size={20}
                color="#428CE5"
              />

            </View>


            <View style={styles.infoContent}>

              <Text style={styles.label}>
                Хувийн дугаар
              </Text>

              <Text style={styles.value}>
                {userId || '-'}
              </Text>

            </View>

          </View>


          <View style={styles.divider} />


          {/* НЭР */}

          <View style={styles.infoRow}>

            <View style={styles.iconBox}>

              <Feather
                name="user"
                size={20}
                color="#428CE5"
              />

            </View>


            <View style={styles.infoContent}>

              <Text style={styles.label}>
                Нэр
              </Text>

              <Text style={styles.value}>
                {userNm || '-'}
              </Text>

            </View>

          </View>


          <View style={styles.divider} />


         
        </View>


        {/* ================= ГАРАХ ================= */}

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

          <Text style={styles.logoutText}>
            Системээс гарах
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>

  );
}


const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },


  /* HEADER */

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

    width: 30,

    height: 40,

    justifyContent: 'center',

    marginRight: 3,

  },



  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#273248',
  },


  headerSpace: {
    width: 40,
  },


  /* CONTENT */

  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 28,
  },


  /* PROFILE */

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
  },


  department: {
    fontSize: 11,
    color: '#8B95A5',

    marginTop: 5,

    textAlign: 'center',
  },


  /* INFORMATION */

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
  },


  label: {
    fontSize: 11,
    color: '#8B95A5',

    marginBottom: 4,
  },


  value: {
    fontSize: 15,
    fontWeight: '600',

    color: '#273248',
  },


  divider: {
    height: 1,
    backgroundColor: '#EEF1F5',
  },


  /* LOGOUT */

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

