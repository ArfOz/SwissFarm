import axios from 'axios';
import { Platform } from 'react-native';

function resolveBaseUrl(): string {
  const fallback = 'http://localhost:3300/api';
  const raw = process.env.EXPO_PUBLIC_API_URL ?? fallback;
  const androidOverride = process.env.EXPO_PUBLIC_API_URL_ANDROID;
  const iosOverride = process.env.EXPO_PUBLIC_API_URL_IOS;

  if (Platform.OS === 'android' && androidOverride) return androidOverride;
  if (Platform.OS === 'ios' && iosOverride) return iosOverride;

  // Android emulator cannot reach host machine via localhost.
  if (Platform.OS === 'android') {
    return raw.replace('://localhost', '://10.0.2.2').replace('://127.0.0.1', '://10.0.2.2');
  }

  return raw;
}

const BASE_URL = resolveBaseUrl();

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default apiClient;