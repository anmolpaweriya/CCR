import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, MapPin, Wrench, HandHeart, Sparkles, Navigation } from 'lucide-react';
import { loadGoogleMaps, isGoogleMapsConfigured } from '../../utils/googleMapsLoader';

export interface MapItem {
  id: string;
  type: 'assistance' | 'resource';
  title: string;
  category: string;
  coordinates: [number, number]; // [lng, lat]
  address?: string;
  credits: number;
  creditType?: string;
  isGoodwillEligible?: boolean;
}

interface ExploreMapViewProps {
  items: MapItem[];
  selectedItemId?: string;
  onSelectItem?: (item: MapItem) => void;
  className?: string;
}

export const ExploreMapView: React.FC<ExploreMapViewProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  className = '',
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<MapItem | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!isGoogleMapsConfigured()) {
      setLoadError('Google Maps API key is not configured');
      return;
    }

    let isMounted = true;
    loadGoogleMaps()
      .then((googleMaps) => {
        if (!isMounted || !mapContainerRef.current) return;
        setMapsLoaded(true);

        const map = new googleMaps.maps.Map(mapContainerRef.current, {
          center: { lat: 40.7128, lng: -74.006 }, // Default NYC/center
          zoom: 12,
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
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#475569' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
          ],
        });

        mapInstanceRef.current = map;
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err.message || 'Failed to load map');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Markers when items or google maps changes
  useEffect(() => {
    if (!mapInstanceRef.current || typeof google === 'undefined' || !google.maps) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasCoords = false;

    items.forEach((item) => {
      if (!item.coordinates || item.coordinates.length < 2) return;
      const [lng, lat] = item.coordinates;
      const pos = { lat, lng };
      bounds.extend(pos);
      hasCoords = true;

      const isSelected = item.id === selectedItemId;
      const isAssistance = item.type === 'assistance';

      const marker = new google.maps.Marker({
        position: pos,
        map: mapInstanceRef.current,
        title: item.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 10 : 7,
          fillColor: isAssistance ? '#10b981' : '#38bdf8', // Emerald for assistance, Sky for resources
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: isSelected ? 3 : 1.5,
        },
      });

      marker.addListener('click', () => {
        setActiveItem(item);
        if (onSelectItem) onSelectItem(item);
      });

      markersRef.current.push(marker);
    });

    if (hasCoords && items.length > 0) {
      if (items.length === 1) {
        mapInstanceRef.current.setCenter(bounds.getCenter());
        mapInstanceRef.current.setZoom(14);
      } else {
        mapInstanceRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      }
    }
  }, [items, selectedItemId, onSelectItem]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-950 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />

      {/* Legend */}
      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/60 shadow-xl flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-300 font-medium">Assistance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
          <span className="text-slate-300 font-medium">Resources</span>
        </div>
        <div className="text-[11px] text-slate-400 border-l border-slate-700 pl-3">
          {items.length} mapped items
        </div>
      </div>

      {/* Active Item Card Overlay */}
      {activeItem && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-700/80 shadow-2xl transition-all">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                activeItem.type === 'assistance'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
              }`}
            >
              {activeItem.type === 'assistance' ? 'Assistance' : 'Resource'}
            </span>
            <button
              onClick={() => setActiveItem(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          <h4 className="text-sm font-bold text-white line-clamp-1">{activeItem.title}</h4>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{activeItem.category}</p>

          {activeItem.address && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{activeItem.address}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
            <div className="text-xs">
              <span className="font-bold text-emerald-400">{activeItem.credits}</span>{' '}
              <span className="text-slate-400 text-[10px]">
                {activeItem.creditType === 'GOODWILL' ? 'Goodwill' : 'Credits'}
              </span>
            </div>
            <button
              onClick={() => {
                navigate(
                  activeItem.type === 'assistance'
                    ? `/assistance/${activeItem.id}`
                    : `/resources/${activeItem.id}`
                );
              }}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              View Details →
            </button>
          </div>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center">
          <Layers className="w-10 h-10 text-slate-600 mb-3" />
          <h4 className="text-sm font-semibold text-slate-200">Interactive Discovery Map</h4>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
            To view assistance requests and shared resources on Google Maps with real-time markers, configure{' '}
            <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
            in <code className="text-slate-300">client/.env</code>.
          </p>
          <div className="grid grid-cols-2 gap-2 text-left max-w-sm w-full bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Assistance items:</span>
              <span className="font-semibold text-emerald-400">
                {items.filter((i) => i.type === 'assistance').length} active
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Resource items:</span>
              <span className="font-semibold text-sky-400">
                {items.filter((i) => i.type === 'resource').length} listed
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
