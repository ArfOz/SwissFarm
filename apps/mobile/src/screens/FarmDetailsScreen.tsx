import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Farm, CATEGORY_LABELS, CATEGORY_ORDER } from '@helvetfarm/types';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { t, fetchTranslations, translatePaymentMethod, getCurrentLocale } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'FarmDetails'>;

function getTypeLabel(types: Farm['types']): string {
  if (types.length === 0) return '🏡 ' + t('farms.noProducts') || 'Farm';
  const type = types[0];
  return t(`type.${type}`) || `🏡 ${type}`;
}

function formatOpeningHours(openingHours: Farm['openingHours']): string {
  if (!openingHours || openingHours.length === 0) return 'Unknown';
  return openingHours
    .map((entry) => {
      const dayLabel = t(`day.${entry.day}`) || entry.day;
      if (!entry.open || !entry.close) return `${dayLabel}: Unknown`;
      return `${dayLabel}: ${entry.open}–${entry.close}`;
    })
    .join('\n');
}

function formatPaymentMethods(methods: Farm['paymentMethods']): string {
  return methods.map((m) => translatePaymentMethod(m)).join(', ');
}

function groupProductsByCategory(products: Farm['products']): Record<string, { id: string; name: string }[]> {
  const grouped: Record<string, { id: string; name: string }[]> = {};
  products.forEach((p) => {
    const cat = p.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });
  return grouped;
}

export default function FarmDetailsScreen({ route, navigation }: Props) {
  const { farm } = route.params;

  useEffect(() => {
    fetchTranslations(getCurrentLocale());
    navigation.setOptions({ title: farm.name });
  }, [farm, navigation]);

  function openInMaps() {
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
    if (farm.website) {
      Linking.openURL(farm.website);
    }
  }

  const groupedProducts = useMemo(() => groupProductsByCategory(farm.products), [farm.products]);

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

      {/* Products - grouped by category */}
      {farm.products.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.label, styles.sectionLabel]}>Products</Text>
          {CATEGORY_ORDER
            .filter((cat) => groupedProducts[cat])
            .map((cat) => (
              <View key={cat} style={styles.productCategoryGroup}>
                <Text style={styles.productCategoryTitle}>
                  {CATEGORY_LABELS[cat] || cat}
                </Text>
                <View style={styles.chips}>
                  {groupedProducts[cat].map((p: { id: string; name: string }) => (
                    <View key={p.id} style={styles.chip}>
                      <Text style={[typography.bodySmall, styles.chipText]}>{p.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
        </View>
      )}

      {/* Opening Hours */}
      <View style={styles.section}>
        <Text style={[typography.label, styles.sectionLabel]}>Opening Hours</Text>
        <Text style={[typography.body, styles.sectionValue]}>
          {formatOpeningHours(farm.openingHours)}
        </Text>
      </View>

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

      {/* Suggest Button */}
      <TouchableOpacity
        style={styles.suggestButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Suggest', { farmId: farm.id, farmName: farm.name })}
      >
        <Text style={[typography.button, styles.suggestButtonText]}>{t('suggest.button')}</Text>
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
  productCategoryGroup: {
    marginBottom: spacing.sm,
  },
  productCategoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  link: { color: colors.info },
  mapsButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  mapsButtonText: { color: colors.textOnPrimary },
  suggestButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  suggestButtonText: { color: colors.textOnPrimary },
});