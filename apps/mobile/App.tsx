import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import SplashOverlay from './src/components/SplashOverlay';

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);

  // Auto-dismiss splash after 3 seconds — enough time for BBOX to load
  useEffect(() => {
    const timer = setTimeout(() => setSplashVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
      <SplashOverlay visible={splashVisible} />
    </SafeAreaProvider>
  );
}