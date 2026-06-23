import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Farm } from '@swissfarm/types';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { t, fetchTranslations, translatePaymentMethod, getCurrentLocale } from '../i18n/translations';
import { getFarmById } from '../api/farms';

type Props = NativeStackScreenProps<RootStackParamList, 'FarmDetails'>;

function getTypeLabel(types: Farm['types']): string {
  if (types.length === 0) return '🏡 ' + t('farms.noProducts') || 'Farm';
  const type = types[0];
  return t(`type.${type}`) || `🏡 ${type}`;
}

function formatOpeningHours(openingHours: Farm['openingHours']): string {
  if (!openingHours || openingHours.length === 0) return t('farms.noProducts') || 'Not specified';
  return openingHours
    .map((entry) => {
      const dayLabel = t(`day.${entry.day}`) || entry.day;
      if (!entry.open || !entry.close) return `${dayLabel}: ${t('farms.form.close') || 'Closed'}`;
      return `${dayLabel}: ${entry.open}–${entry.close}`;
    })
    .join('\n');
}

function formatPaymentMethods(methods: Farm['paymentMethods']): string {
  return methods.map((m) => translatePaymentMethod(m)).join(', ');
}

export default function FarmDetailsScreen({ route, navigation }: Props) {
  const { farmId } = route.params;
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch farm details on mount
  useEffect(() => {
    fetchTranslations(getCurrentLocale());
    getFarmById(farmId)
      .then((data) => {
        setFarm(data);
        navigation.setOptions({ title: data.name });
      })
      .catch(() => Alert.alert('Error', 'Failed to load farm details'))
      .finally(() => setLoading(false));
  }, [farmId, navigation]);

  function openInMaps() {
    if (!farm) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${farm.location.lat},${farm.location.lng}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open Maps app.');
      }
    });
  }

  function openWebsite() {
    if (farm?.website) {
      Linking.openURL(farm.website);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!farm) {
    return (
      <View style={styles.centered}>
        <Text style={[typography.body, { color: colors.error }]}>Farm not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Type badge */}
      <View style={styles.typeBadge}>
        <Text style={[typography.label, styles.typeText]}>
          {getTypeLabel(farm.types)}
        </Text>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>Location</Text>
        <Text style={[typography.body, styles.sectionValue]}>{farm.address}</Text>
        <Text style={[typography.bodySmall, styles.canton]}>Canton: {farm.canton}</Text>
      </View>

      {/* Payment Methods */}
      {farm.paymentMethods.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>Payment Methods</Text>
          <Text style={[typography.body, styles.sectionValue]}>
            {formatPaymentMethods(farm.paymentMethods)}
          </Text>
        </View>
      )}

      {/* Phone */}
      {farm.phone && (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>Phone</Text>
          <Text style={[typography.body, styles.sectionValue]}>{farm.phone}</Text>
        </View>
      )}

      {/* Products */}
      {farm.products.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>Products</Text>
          <View style={styles.chips}>
            {farm.products.map((p) => (
              <View key={p.id} style={styles.chip}>
                <Text style={[typography.bodySmall, styles.chipText]}>{p.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Opening Hours */}
      {farm.openingHours && farm.openingHours.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>Opening Hours</Text>
          <Text style={[typography.body, styles.sectionValue]}>
            {formatOpeningHours(farm.openingHours)}
          </Text>
        </View>
      )}

      {/* Website */}
      {farm.website && (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>Website</Text>
          <TouchableOpacity onPress={openWebsite}>
            <Text style={[typography.body, styles.link]}>{farm.website}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity style={styles.mapsButton} onPress={openInMaps} activeOpacity={0.8}>
        <Text style={[typography.button, styles.mapsButtonText]}>📍 Open in Maps</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  typeText: { color: colors.textOnPrimary },
  section: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
  },
  sectionValue: { color: colors.textPrimary },
  canton: { color: colors.textSecondary, marginTop: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { color: colors.textPrimary },
  link: { color: colors.info },
  mapsButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  mapsButtonText: { color: colors.textOnPrimary },
});