import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

const INTRO_PAGES = [
  {
    icon: '🌿',
    title: 'Welcome to SwissFarm',
    description: 'Discover local farms across Switzerland. Find fresh products directly from farmers near you.',
  },
  {
    icon: '🗺️',
    title: 'Explore Nearby Farms',
    description: 'Use the map to find farms close to your location. Filter by products, types, and more.',
  },
  {
    icon: '🥛',
    title: 'Fresh Local Products',
    description: 'From milk and cheese to fruits and vegetables — buy directly from the source.',
  },
];

const INTRO_STORAGE_KEY = '@swissfarm_intro_seen';

interface IntroScreenProps {
  onDone: () => void;
}

export default function IntroScreen({ onDone }: IntroScreenProps) {
  const [page, setPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Mark intro as seen (silently — no persistent storage needed for now)
  }, []);

  const goNext = () => {
    if (page < INTRO_PAGES.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPage(page + 1);
        fadeAnim.setValue(1);
        slideAnim.setValue(width);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      onDone();
    }
  };

  const skip = () => {
    onDone();
  };

  const current = INTRO_PAGES[page];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={skip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Text style={styles.icon}>{current.icon}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.description}>{current.description}</Text>
      </Animated.View>

      {/* Dots */}
      <View style={styles.dots}>
        {INTRO_PAGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === page && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {page < INTRO_PAGES.length - 1 ? (
          <>
            <TouchableOpacity onPress={skip} style={styles.skipTextButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goNext} style={styles.nextButton}>
              <Text style={styles.nextText}>Next →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={onDone} style={styles.getStartedButton}>
            <Text style={styles.getStartedText}>Get Started 🚀</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.md,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: spacing.xxl * 2,
  },
  skipTextButton: {
    padding: spacing.sm,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  nextText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  getStartedText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});