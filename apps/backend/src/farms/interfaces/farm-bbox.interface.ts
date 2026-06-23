/**
 * Bounding box coordinates.
 */
export interface BBox {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

/**
 * Lightweight marker returned by the bbox endpoint.
 * At low zoom levels, returned data may be sampled/aggregated.
 */
export interface BBoxFarmMarker {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  canton: string;
  types: string[];
  /** Number of farms at this location (for clustering). Always ≥1 */
  count: number;
}