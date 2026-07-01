import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Farm } from '@helvetfarm/types';
import { getFarms } from '../api/farms';
import FarmCard from '../components/FarmCard';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function ListScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFarms();
  }, []);

  async function loadFarms(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await getFarms();
      setFarms(data);
    } catch {
      setError('Could not load farms. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handlePress = useCallback(
    (farm: Farm) => navigation.navigate('FarmDetails', { farm }),
    [navigation],
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.bodySmall, styles.loadingText]}>Loading farms…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h2, styles.headerTitle]}>🌿 Swiss Farms</Text>
        <Text style={[typography.bodySmall, styles.headerSub]}>
          {farms.length} farm{farms.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <FlatList
        data={farms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FarmCard farm={item} onPress={handlePress} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFarms(true)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={[typography.body, styles.emptyText]}>
              {error ?? 'No farms found.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: { color: colors.textOnPrimary },
  headerSub: { color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs },
  list: { paddingVertical: spacing.sm },
  loadingText: { color: colors.textSecondary, marginTop: spacing.sm },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
});