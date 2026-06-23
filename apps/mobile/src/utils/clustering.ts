/**
 * Airbnb-style clustering for SwissFarm.
 *
 * Grid sizes control how clusters break apart as user zooms in:
 *   Zoom < 10  → 0.35° grid (~35km) → big clusters
 *   Zoom 10-12 → 0.1° grid (~10km)  → medium clusters
 *   Zoom 13+   → no grid → individual pins
 */

export interface ClusterPoint {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  canton?: string;
}

export interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  markerIds: string[];
  sampleName?: string;
  sampleCanton?: string;
}

function gridForZoom(z: number): number {
  if (z >= 13) return 0;
  if (z >= 10) return 0.1;
  return 0.35;
}

export function clusterMarkers<T extends ClusterPoint>(points: T[], zoom: number): Cluster[] {
  if (!points.length) return [];
  const gs = gridForZoom(zoom);

  // No clustering at zoom 13+
  if (gs === 0) {
    return points.map((p) => ({
      id: p.id,
      latitude: p.latitude,
      longitude: p.longitude,
      count: 1,
      markerIds: [p.id],
      sampleName: p.name,
      sampleCanton: p.canton,
    }));
  }

  const map = new Map<string, { slat: number; slng: number; ids: string[]; first: T; gridKey: string }>();

  for (const p of points) {
    const k = `${Math.floor(p.latitude / gs)}:${Math.floor(p.longitude / gs)}`;
    const e = map.get(k);
    if (e) {
      e.slat += p.latitude;
      e.slng += p.longitude;
      e.ids.push(p.id);
    } else {
      map.set(k, { slat: p.latitude, slng: p.longitude, ids: [p.id], first: p, gridKey: k });
    }
  }

  const out: Cluster[] = [];
  for (const [, v] of map) {
    const cnt = v.ids.length;
    out.push({
      id: cnt === 1 ? v.ids[0] : `c_${v.gridKey}`,
      latitude: v.slat / cnt,
      longitude: v.slng / cnt,
      count: cnt,
      markerIds: v.ids,
      ...(cnt === 1 ? { sampleName: v.first.name, sampleCanton: v.first.canton } : {}),
    });
  }
  return out;
}