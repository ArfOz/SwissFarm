'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Farm, FarmType } from '@swissfarm/types';

// Fix Leaflet default icon paths broken by webpack/Next.js bundling
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const TYPE_COLORS: Record<FarmType, string> = {
  milk: '#3b82f6',
  'self-service': '#f59e0b',
  'pick-your-own': '#10b981',
  kids: '#ec4899',
};

const TYPE_LABELS: Record<FarmType, string> = {
  milk: 'Milk Farm',
  'self-service': 'Self-Service',
  'pick-your-own': 'Pick Your Own',
  kids: 'Kids Farm',
};

function createColoredIcon(color: string) {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path fill="${color}" stroke="#fff" stroke-width="1.5"
        d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="5"/>
    </svg>`;
  return L.divIcon({
    html: svgIcon,
    className: '',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

interface FarmsMapProps {
  farms: Farm[];
}

export default function FarmsMap({ farms }: FarmsMapProps) {
  useEffect(() => {
    // Patch default icon (fallback)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
  }, []);

  // Center on Switzerland
  const center: [number, number] = [46.8182, 8.2275];

  return (
    <MapContainer
      center={center}
      zoom={8}
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {farms.map((farm) => (
        <Marker
          key={farm.id}
          position={[farm.location.lat, farm.location.lng]}
          icon={createColoredIcon(TYPE_COLORS[farm.type])}
        >
          <Popup minWidth={220}>
            <div className="font-sans">
              <p className="font-bold text-base text-gray-900 mb-1">{farm.name}</p>
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2"
                style={{ backgroundColor: TYPE_COLORS[farm.type] }}
              >
                {TYPE_LABELS[farm.type]}
              </span>
              <p className="text-xs text-gray-600 mb-1">📍 {farm.address}</p>
              <p className="text-xs text-gray-600 mb-1">🏔 {farm.canton}</p>
              {farm.openingHours && (
                <p className="text-xs text-gray-600 mb-1">🕐 {farm.openingHours}</p>
              )}
              {farm.products.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{farm.products.join(', ')}</p>
              )}
              {farm.website && (
                <a
                  href={farm.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 block"
                >
                  🌐 Website
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
