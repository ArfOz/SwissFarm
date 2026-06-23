import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { FarmLocation } from '@swissfarm/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface MemoizedMarkerData {
  id: string;
  name: string;
  location: FarmLocation;
  canton: string;
  types: string[];
}

interface MemoizedFarmMarkerProps {
  marker: MemoizedMarkerData;
  onPress: (id: string) => void;
}

/**
 * Memoized marker component — only re-renders when its props actually change.
 * This is critical for performance when showing hundreds/thousands of markers.
 */
const MemoizedFarmMarker: React.FC<MemoizedFarmMarkerProps> = ({ marker, onPress }) => {
  return (
    <Marker
      key={marker.id}
      identifier={marker.id}
      coordinate={{
        latitude: marker.location.lat,
        longitude: marker.location.lng,
      }}
      pinColor={colors.mapMarker}
      tracksViewChanges={false}
      onCalloutPress={() => onPress(marker.id)}
    >
      <Callout tooltip={false}>
        <View style={styles.callout}>
          <Text style={[typography.label, styles.calloutName]}>{marker.name}</Text>
          <Text style={[typography.caption, styles.calloutSub]}>
            {marker.canton}
            {' · Tap to open'}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  callout: {
    padding: spacing.sm,
    minWidth: 140,
    maxWidth: 220,
  },
  calloutName: {
    color: colors.textPrimary,
    marginBottom: 2,
  },
  calloutSub: {
    color: colors.textSecondary,
  },
});

/**
 * Custom comparison function for React.memo.
 * Only re-render if the marker id, name, or coordinates actually changed.
 */
function arePropsEqual(
  prevProps: MemoizedFarmMarkerProps,
  nextProps: MemoizedFarmMarkerProps,
): boolean {
  const a = prevProps.marker;
  const b = nextProps.marker;
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.location.lat === b.location.lat &&
    a.location.lng === b.location.lng &&
    a.canton === b.canton &&
    prevProps.onPress === nextProps.onPress
  );
}

export default memo(MemoizedFarmMarker, arePropsEqual);