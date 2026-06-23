import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface SplashOverlayProps {
  visible: boolean;
  onFadeOutComplete?: () => void;
}

/**
 * Full-screen splash overlay with SwissFarm logo + name.
 * Fades out when `visible` becomes false.
 * The app renders underneath while the splash is visible (preloading).
 */
export default function SplashOverlay({ visible, onFadeOutComplete }: SplashOverlayProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!visible && !hidden) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setHidden(true);
        onFadeOutComplete?.();
      });
    }
  }, [visible, hidden, opacity, onFadeOutComplete]);

  if (hidden) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {/* Logo circle */}
      <View style={styles.logoCircle}>
        <Text style={styles.logoEmoji}>🌾</Text>
      </View>

      {/* App name */}
      <Text style={styles.title}>SwissFarm</Text>
      <Text style={styles.subtitle}>Local farms, fresh products</Text>

      {/* Loading indicator */}
      <View style={styles.dotsRow}>
        <Dot delay={0} />
        <Dot delay={300} />
        <Dot delay={600} />
      </View>
    </Animated.View>
  );
}

/** Animated bouncing dot */
function Dot({ delay }: { delay: number }) {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, opacityAnim]);

  return <Animated.View style={[styles.dot, { opacity: opacityAnim }]} />;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});