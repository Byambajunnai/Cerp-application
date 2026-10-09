import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
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

import { createAndSend } from '../services/notifications';

export default function NotificationCreateScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending;

  const send = async () => {
    if (!canSend) return;
    try {
      setSending(true);
      await createAndSend(title, body);
      router.back(); // жагсаалт руу буцахад шинэ мэдэгдэл дээр нь харагдана
    } catch (e) {
      console.error('Мэдэгдэл илгээх алдаа:', e);
      Alert.alert('Илгээж чадсангүй', 'Дахин оролдоно уу.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn} activeOpacity={0.7}>
          <Feather name="x" size={22} color="#1D2E4A" />
        </TouchableOpacity>
        <Text style={s.title}>Шинэ мэдэгдэл</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={s.label}>Гарчиг</Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Жишээ: Мэдээллийн цаг"
            placeholderTextColor="#A7B1C2"
            maxLength={80}
          />

          <Text style={s.label}>Мессеж</Text>
          <TextInput
            style={[s.input, s.multi]}
            value={body}
            onChangeText={setBody}
            placeholder="Жишээ: 09:00 мэдээллийн цагтай тул 9 давхрын хурлын зааланд бэлэн байна уу?"
            placeholderTextColor="#A7B1C2"
            multiline
            maxLength={500}
          />
          <Text style={s.counter}>{body.length}/500</Text>

          <TouchableOpacity
            style={[s.btn, !canSend && s.btnDisabled]}
            onPress={send}
            disabled={!canSend}
            activeOpacity={0.85}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="send" size={17} color="#FFFFFF" />
                <Text style={s.btnText}>Илгээх</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FD' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1D2E4A', marginLeft: 6 },

  content: { paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontSize: 13.5, fontWeight: '600', color: '#1D2E4A', marginTop: 18, marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1D2E4A',
  },
  multi: { minHeight: 130, textAlignVertical: 'top' },
  counter: { alignSelf: 'flex-end', fontSize: 11, color: '#98A2B3', marginTop: 6 },

  btn: {
    marginTop: 26,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#428CE5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnDisabled: { backgroundColor: '#A9C8F0' },
  btnText: { color: '#FFFFFF', fontSize: 15.5, fontWeight: '700' },
});