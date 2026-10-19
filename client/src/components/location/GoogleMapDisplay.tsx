import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ShieldCheck, AlertCircle } from 'lucide-react';
import { loadGoogleMaps, isGoogleMapsConfigured } from '../../utils/googleMapsLoader';

interface GoogleMapDisplayProps {
  coordinates?: [number, number]; // [lng, lat] GeoJSON format
  address?: string;
  isApproximate?: boolean;
  title?: string;
  className?: string;
  height?: string;
}

export const GoogleMapDisplay: React.FC<GoogleMapDisplayProps> = ({
  coordinates,
  address,
  isApproximate = false,
  title,
  className = '',
  height = 'h-48',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!coordinates || coordinates.length < 2) return;
    if (!isGoogleMapsConfigured()) {
      setLoadError('Google Maps API key not configured');
      return;
    }

    let isMounted = true;
    loadGoogleMaps()
      .then((googleMaps) => {
        if (!isMounted || !mapContainerRef.current) return;
        setMapsLoaded(true);

        const [lng, lat] = coordinates;
        const center = { lat, lng };

        const map = new googleMaps.maps.Map(mapContainerRef.current, {
          center,
          zoom: isApproximate ? 13 : 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#cbd5e1' }],
            },
            { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#064e3b' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
          ],
        });

        if (isApproximate) {
          // Render privacy circle overlay (500m radius)
          new googleMaps.maps.Circle({
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            map,
            center,
            radius: 600, // 600 meters approximate area
          });
        } else {
          // Render exact location marker pin
          const marker = new googleMaps.maps.Marker({
            position: center,
            map,
            animation: googleMaps.maps.Animation.DROP,
            icon: {
              path: googleMaps.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#10b981',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          if (title || address) {
            const infoWindow = new googleMaps.maps.InfoWindow({
              content: `
                <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
                  <strong style="font-size: 13px;">${title || 'Location'}</strong>
                  ${address ? `<p style="font-size: 11px; margin-top: 4px; color: #475569;">${address}</p>` : ''}
                </div>
              `,
            });
            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err.message || 'Failed to load map');
      });

    return () => {
      isMounted = false;
    };
  }, [coordinates, isApproximate, title, address]);

  if (!coordinates || coordinates.length < 2) {
    return (
      <div className={`rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2 ${height} ${className}`}>
        <AlertCircle className="w-4 h-4 text-slate-500" />
        <span>Location coordinates not available</span>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 ${height} ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Banner (Privacy or Exact) */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
        {isApproximate ? (
          <span className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium text-sky-400 border border-sky-500/30 flex items-center gap-1.5 shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            Approximate Area (Privacy Protected)
          </span>
        ) : (
          <span className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
            <MapPin className="w-3.5 h-3.5" />
            Exact Meeting/Pickup Location
          </span>
        )}
      </div>

      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-4 text-center text-slate-400 text-xs">
          <MapPin className="w-6 h-6 text-emerald-400 mb-1" />
          <p className="font-semibold text-slate-300">{address || `${coordinates[1].toFixed(4)}°N, ${coordinates[0].toFixed(4)}°E`}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {isApproximate ? 'Approximate locality shown' : 'Coordinates verified'}
          </p>
        </div>
      )}

      {/* Bottom Address caption */}
      {address && (
        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-slate-300 border border-slate-700/60 flex items-center gap-2 shadow-lg truncate">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{address}</span>
        </div>
      )}
    </div>
  );
};
