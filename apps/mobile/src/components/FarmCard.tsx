import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Farm, TYPE_LABELS } from '@swissfarm/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface FarmCardProps {
  farm: Farm;
  onPress: (farm: Farm) => void;
}

function getTypeLabel(types: Farm['types']): string {
  if (types.length === 0) return '🏡 Farm';
  const type = types[0];
  return TYPE_LABELS[type] ?? `🏡 ${type}`;
}

export default function FarmCard({ farm, onPress }: FarmCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(farm)} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={[typography.h3, styles.name]} numberOfLines={1}>
          {farm.name}
        </Text>
        <View style={styles.typeBadge}>
          <Text style={[typography.caption, styles.typeText]}>
            {getTypeLabel(farm.types)}
          </Text>
        </View>
      </View>

      <Text style={[typography.bodySmall, styles.address]} numberOfLines={1}>
        📍 {farm.address}, {farm.canton}
      </Text>

      {farm.products.length > 0 && (
        <View style={styles.products}>
          {farm.products.slice(0, 3).map((product) => (
            <View key={product.id} style={styles.productChip}>
              <Text style={[typography.caption, styles.productText]}>{product.name}</Text>
            </View>
          ))}
          {farm.products.length > 3 && (
            <Text style={[typography.caption, styles.moreText]}>+{farm.products.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  typeBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  typeText: {
    color: colors.textOnPrimary,
  },
  address: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  products: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  productChip: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productText: {
    color: colors.textSecondary,
  },
  moreText: {
    color: colors.textSecondary,
    alignSelf: 'center',
  },
});