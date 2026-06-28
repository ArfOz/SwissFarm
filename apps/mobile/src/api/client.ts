import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveBaseUrl(): string {
  const fallback = 'http://localhost:3300/api';
  const env = (globalThis as any).process?.env;
  const raw = env?.EXPO_PUBLIC_API_URL ?? fallback;
  const androidOverride = env?.EXPO_PUBLIC_API_URL_ANDROID;
  const iosOverride = env?.EXPO_PUBLIC_API_URL_IOS;

  // Use environment overrides if set
  if (Platform.OS === 'android' && androidOverride) return androidOverride;
  if (Platform.OS === 'ios' && iosOverride) return iosOverride;

  // Try to get the Expo dev server host (the machine running the backend)
  // This is the actual LAN IP when testing on a real device
  const expoHost = Constants.expoConfig?.hostUri;
  if (expoHost) {
    const hostIp = expoHost.split(':')[0]; // e.g. "192.168.1.100"
    return `http://${hostIp}:3300/api`;
  }

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