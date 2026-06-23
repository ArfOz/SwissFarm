import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Cluster } from '../utils/clustering';

interface Props {
  cluster: Cluster;
  onPress: (c: Cluster) => void;
}

/**
 * Airbnb-style cluster marker.
 * - Airbnb red (#FF5A5F) with opacity tiers based on count
 * - Clean white text on red circle
 * - Flat, modern look with subtle shadow
 */
const ClusterMarker: React.FC<Props> = ({ cluster, onPress }) => {
  const { count } = cluster;

  // Airbnb red tones
  const bgColor = count <= 10 ? '#FF385C' : count <= 50 ? '#E31C5F' : '#B0120E';
  const borderColor = '#fff';

  // Daha büyük boyutlar (Airbnb seviyesinde)
  const size = count > 99 ? 72 : count > 20 ? 64 : 56;
  const fontSize = count > 99 ? 24 : count > 20 ? 22 : 20;

  return (
    <Marker
      identifier={cluster.id}
      coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
      onPress={() => onPress(cluster)}
      tracksViewChanges={false}
    >
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
            borderColor: borderColor,
          },
        ]}
      >
        <Text style={[styles.count, { fontSize }]}>{count}</Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4, // daha görünür
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  count: {
    color: '#fff',
    fontWeight: '800',
    includeFontPadding: false,
    textAlign: 'center',
  },
});



function eq(p: Props, n: Props) {
  const a = p.cluster;
  const b = n.cluster;
  return (
    a.id === b.id &&
    a.count === b.count &&
    a.latitude === b.latitude &&
    a.longitude === b.longitude
  );
}

export default memo(ClusterMarker, eq);