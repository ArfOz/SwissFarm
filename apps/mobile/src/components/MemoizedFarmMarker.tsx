import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';
import { FarmLocation } from '@helvetfarm/types';
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
  isSelected?: boolean;
}

/**
 * Airbnb-style pill marker.
 * Default: white bg + dark text pill.
 * Selected: dark bg + white text pill.
 */
const MemoizedFarmMarker: React.FC<MemoizedFarmMarkerProps> = ({ marker, onPress, isSelected }) => {
  return (
    <Marker
      id={marker.id}
      lngLat={[marker.location.lng, marker.location.lat]}
      anchor="center"
      onPress={() => onPress(marker.id)}
    >
      <View style={[styles.pill, isSelected ? styles.pillSelected : styles.pillDefault]}>
        <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : styles.pillTextDefault]}>
          {marker.name}
        </Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pillDefault: {
    backgroundColor: '#FFFFFF',
  },
  pillSelected: {
    backgroundColor: '#222222',
    borderColor: '#222222',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextDefault: {
    color: '#222222',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});

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
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onPress === nextProps.onPress
  );
}

export default memo(MemoizedFarmMarker, arePropsEqual);