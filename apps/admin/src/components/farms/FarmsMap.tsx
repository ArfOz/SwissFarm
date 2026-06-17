'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Farm, FarmType } from '@swissfarm/types';
import { useI18n } from '@/lib/i18n';

// Fix Leaflet default icon paths broken by webpack/Next.js bundling
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const TYPE_COLORS: Record<FarmType, string> = {
  milk: '#3b82f6',
  self_service: '#f59e0b',
  pick_your_own: '#10b981',
  kids: '#ec4899',
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
  const router = useRouter();
  const { t, tps } = useI18n();

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
          <Popup minWidth={260}>
            <div className="font-sans">
              <p className="font-bold text-base text-gray-900 mb-1">{farm.name}</p>
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2"
                style={{ backgroundColor: TYPE_COLORS[farm.type] }}
              >
                {t(`type.${farm.type}`) || farm.type}
              </span>
              <div className="space-y-1 text-xs text-gray-600">
                <p>📍 {farm.address}</p>
                <p>🏔 {farm.canton}</p>
                <p>✅ {farm.isActive ? t('farms.active') : t('farms.passive')}</p>
                {farm.products.length > 0 && (
                  <p className="text-gray-500">📦 {tps(farm.products).join(', ')}</p>
                )}
                {farm.website && (
                  <a
                    href={farm.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    🌐 {farm.website}
                  </a>
                )}
              </div>
              <button
                onClick={() => router.push(`/farms/${farm.id}`)}
                className="mt-2 w-full text-center text-xs font-medium text-white bg-green-700 hover:bg-green-800 rounded px-3 py-1.5 transition-colors"
              >
                {t('farms.viewDetails')}
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
