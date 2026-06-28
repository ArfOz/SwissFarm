import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { submitSuggestion } from '../api/farms';
import { t } from '../i18n/translations';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Suggest'>;

export default function SuggestScreen({ route, navigation }: Props) {
  const { farmId, farmName } = route.params;
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].base64 ?? result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('suggest.permission'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].base64 ?? result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert(t('suggest.required'));
      return;
    }
    if (!author.trim()) {
      Alert.alert('Lütfen adınızı girin.');
      return;
    }
    setSending(true);
    try {
      await submitSuggestion(farmId, {
        author: author.trim(),
        email: email.trim() || undefined,
        message: message.trim(),
        photo: photo ?? undefined,
      });
      Alert.alert(t('suggest.success'), '', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert(t('suggest.error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📝 {farmName}</Text>
      <Text style={styles.subtitle}>{t('suggest.title')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('suggest.author')}
        placeholderTextColor="#999"
        value={author}
        onChangeText={setAuthor}
      />

      <TextInput
        style={styles.input}
        placeholder={t('suggest.email')}
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.messageContainer}>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder={t('suggest.message')}
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          maxLength={1000}
          value={message}
          onChangeText={setMessage}
        />
        <Text style={styles.charCounter}>{message.length}/1000</Text>
      </View>

      <View style={styles.photoRow}>
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
          <Text style={styles.photoBtnText}>{t('suggest.gallery')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
          <Text style={styles.photoBtnText}>{t('suggest.camera')}</Text>
        </TouchableOpacity>
      </View>

      {photo && (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri: photo.startsWith('data:') ? photo : `data:image/jpeg;base64,${photo}` }} style={styles.photoPreview} />
          <TouchableOpacity onPress={() => setPhoto(null)}>
            <Text style={styles.removePhoto}>{t('suggest.remove')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, sending && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={sending}
      >
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{t('suggest.submit')}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  messageContainer: { position: 'relative', marginBottom: spacing.md },
  messageInput: { minHeight: 100, textAlignVertical: 'top', marginBottom: 0 },
  charCounter: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 11,
    color: colors.textSecondary,
  },
  photoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  photoBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  photoPreviewContainer: { alignItems: 'center', marginBottom: spacing.md },
  photoPreview: { width: 200, height: 200, borderRadius: 12, marginBottom: spacing.xs },
  removePhoto: { color: colors.error, fontWeight: '600', fontSize: 13 },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: colors.textOnPrimary, fontWeight: '700', fontSize: 16 },
});