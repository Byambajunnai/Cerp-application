import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const login = async () => {
    if (!username.trim() || !password) {
      Alert.alert(
        'Анхааруулга',
        'Нэвтрэх нэр, нууц үгээ оруулна уу.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:3001/api/mobile/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: username.trim(),
            password: password,
            deviceType: 'Android',
          }),
        }
      );

      const text = await response.text();

      console.log('STATUS:', response.status);

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Сервер JSON бус хариу буцаалаа.');
      }

     if (response.ok) {
  console.log('Login амжилттай');

  router.replace({
    pathname: '/home',
    params: {
      userNm: data.userNm || '',
      cstmNm: data.cstmNm || '',
      userId: data.userId || '',
      cstmCd: data.cstmCd || '',

      // News API
      token: data.token || '',
    },
  });
} else {
        Alert.alert(
          'Нэвтрэх боломжгүй',
          data.message ||
            'Нэвтрэх нэр эсвэл нууц үг буруу.'
        );
      }
    } catch (error) {
      console.error('Login error:', error);

      Alert.alert(
        'Алдаа',
        'Сервертэй холбогдож чадсангүй.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          {/* ================= ЛОГО ================= */}

          <View style={styles.logoArea}>
            <Image
              source={require('../../assets/images/customs_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* ================= СИСТЕМИЙН НЭР ================= */}

          <Text style={styles.systemName}>
            ГААЛИЙН ЗАХИРГАА,{'\n'}
            ДОТООД АЖЛЫН СИСТЕМ
          </Text>

          {/* ================= FORM ================= */}

          <View style={styles.form}>

            {/* НЭВТРЭХ НЭР */}

            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <Feather
                  name="user"
                  size={16}
                  color="#FFFFFF"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Нэвтрэх нэр / Хувийн дугаар"
                placeholderTextColor="rgba(255,255,255,0.88)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* НУУЦ ҮГ */}

            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <Feather
                  name="lock"
                  size={16}
                  color="#FFFFFF"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Нууц үг"
                placeholderTextColor="rgba(255,255,255,0.88)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={login}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowPassword(!showPassword)
                }
                activeOpacity={0.7}
              >
                <Feather
                  name={
                    showPassword
                      ? 'eye'
                      : 'eye-off'
                  }
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* ================= САНУУЛАХ ================= */}

            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() =>
                setRemember(!remember)
              }
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  remember &&
                    styles.checkboxChecked,
                ]}
              >
                {remember && (
                  <Feather
                    name="check"
                    size={12}
                    color="#1E8FDA"
                  />
                )}
              </View>

              <Text style={styles.rememberText}>
                Нэвтрэх нэр, нууц үг сануулах
              </Text>
            </TouchableOpacity>

            {/* ================= НЭВТРЭХ ================= */}

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading &&
                  styles.buttonDisabled,
              ]}
              onPress={login}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#1E8FDA"
                />
              ) : (
                <>
                  <Text style={styles.loginText}>
                    НЭВТРЭХ
                  </Text>

                  <View style={styles.faceId}>
                    <Feather
                      name="maximize"
                      size={17}
                      color="#1E8FDA"
                    />
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* ================= ТООН ГАРЫН ҮСЭГ ================= */}

            <TouchableOpacity
              style={styles.digitalButton}
              activeOpacity={0.85}
            >
              <Text style={styles.digitalText}>
                ТООН ГАРЫН ҮСГЭЭР НЭВТРЭХ
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  /* ================= BACKGROUND ================= */

  page: {
    flex: 1,
    backgroundColor: '#1E8FDA',
  },

  container: {
    flexGrow: 1,
    backgroundColor: '#1E8FDA',

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 26,
    paddingVertical: 30,
  },

  content: {
    width: '100%',
    maxWidth: 390,
    alignItems: 'center',
  },

  /* ================= LOGO ================= */

  logoArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 5,
  },

  logo: {
    width: 250,
    height: 150,
  },

  /* ================= SYSTEM NAME ================= */

  systemName: {
    color: '#FFFFFF',

    fontSize: 13,
    fontWeight: '600',

    lineHeight: 17,
    textAlign: 'center',

    marginTop: 2,
    marginBottom: 38,
  },

  /* ================= FORM ================= */

  form: {
    width: '100%',
  },

  /* ================= INPUT ================= */

  inputRow: {
    width: '100%',
    height: 52,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(255,255,255,0.75)',

    marginBottom: 10,
  },

  inputIcon: {
    width: 28,
    height: '100%',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 5,
  },

  input: {
    flex: 1,
    height: '100%',

    color: '#FFFFFF',
    fontSize: 12,

    paddingHorizontal: 3,

    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },

  /* ================= PASSWORD EYE ================= */

  eyeButton: {
    width: 42,
    height: '100%',

    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ================= REMEMBER ================= */

  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingLeft: 6,

    marginTop: 5,
    marginBottom: 33,
  },

  checkbox: {
    width: 16,
    height: 16,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
  },

  checkboxChecked: {
    backgroundColor: '#FFFFFF',
  },

  rememberText: {
    color: '#FFFFFF',

    fontSize: 10.5,
    fontWeight: '400',
  },

  /* ================= LOGIN BUTTON ================= */

  loginButton: {
    width: 210,
    height: 42,

    alignSelf: 'center',

    borderRadius: 22,

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginText: {
    color: '#1E8FDA',

    fontSize: 12,
    fontWeight: '700',
  },

  faceId: {
    marginLeft: 14,

    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  /* ================= DIGITAL SIGNATURE ================= */

  digitalButton: {
    minWidth: 210,
    height: 40,

    alignSelf: 'center',

    marginTop: 17,
    paddingHorizontal: 20,

    borderRadius: 21,

    backgroundColor:
      'rgba(255,255,255,0.95)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  digitalText: {
    color: '#1E8FDA',

    fontSize: 9,
    fontWeight: '700',
  },
});