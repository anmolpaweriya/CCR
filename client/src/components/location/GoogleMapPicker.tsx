import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ILocationData } from '../../types';
import { loadGoogleMaps, isGoogleMapsConfigured } from '../../utils/googleMapsLoader';

interface GoogleMapPickerProps {
  value?: ILocationData;
  onChange: (location: ILocationData) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  value,
  onChange,
  label = 'Location',
  placeholder = 'Search address, place, or area...',
  required = false,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState(value?.address || '');
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    value?.coordinates && value.coordinates.length === 2 ? value.coordinates : null
  );
  const [isLocating, setIsLocating] = useState(false);

  // Sync addressInput if value changes externally
  useEffect(() => {
    if (value?.address && value.address !== addressInput) {
      setAddressInput(value.address);
    }
    if (value?.coordinates && value.coordinates.length === 2) {
      setSelectedCoords(value.coordinates);
    }
  }, [value?.address, value?.coordinates]);

  const updateLocationFromLatLng = useCallback(
    (lat: number, lng: number, formattedAddress?: string, placeDetails?: any) => {
      setSelectedCoords([lng, lat]);

      let address = formattedAddress || addressInput;
      let locality: string | undefined;
      let city: string | undefined;
      let postalCode: string | undefined;

      if (placeDetails?.address_components) {
        for (const comp of placeDetails.address_components) {
          if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) {
            locality = comp.long_name;
          }
          if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) {
            city = comp.long_name;
          }
          if (comp.types.includes('postal_code')) {
            postalCode = comp.long_name;
          }
        }
      }

      if (!address) {
        address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }

      setAddressInput(address);

      onChange({
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON [lng, lat]
        address,
        locality,
        city,
        postalCode,
      });
    },
    [addressInput, onChange]
  );

  // Initialize Google Maps & Autocomplete
  useEffect(() => {
    let isMounted = true;

    if (!isGoogleMapsConfigured()) {
      setLoadError(
        'Google Maps API Key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in client/.env'
      );
      return;
    }

    loadGoogleMaps()
      .then((googleMaps) => {
        if (!isMounted) return;
        setMapsLoaded(true);
        setLoadError(null);

        // Center on existing coords or default to New York / San Francisco
        const initialLat = selectedCoords ? selectedCoords[1] : 40.7128;
        const initialLng = selectedCoords ? selectedCoords[0] : -74.006;

        if (mapContainerRef.current && !mapInstanceRef.current) {
          const map = new googleMaps.maps.Map(mapContainerRef.current, {
            center: { lat: initialLat, lng: initialLng },
            zoom: selectedCoords ? 15 : 12,
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

          const marker = new googleMaps.maps.Marker({
            position: { lat: initialLat, lng: initialLng },
            map: selectedCoords ? map : null,
            draggable: true,
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

          markerInstanceRef.current = marker;

          // Drag marker listener
          marker.addListener('dragend', () => {
            const pos = marker.getPosition();
            if (pos) {
              const lat = pos.lat();
              const lng = pos.lng();
              const geocoder = new googleMaps.maps.Geocoder();
              geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                const formatted =
                  status === 'OK' && results && results[0]
                    ? results[0].formatted_address
                    : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                updateLocationFromLatLng(lat, lng, formatted, results ? results[0] : undefined);
              });
            }
          });

          // Click map listener to move pin
          map.addListener('click', (e: any) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              marker.setPosition(e.latLng);
              marker.setMap(map);

              const geocoder = new googleMaps.maps.Geocoder();
              geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                const formatted =
                  status === 'OK' && results && results[0]
                    ? results[0].formatted_address
                    : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                updateLocationFromLatLng(lat, lng, formatted, results ? results[0] : undefined);
              });
            }
          });
        }

        // Initialize Places Autocomplete
        if (inputRef.current && !autocompleteRef.current) {
          const autocomplete = new googleMaps.maps.places.Autocomplete(inputRef.current, {
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
          });
          autocompleteRef.current = autocomplete;

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              const formatted = place.formatted_address || place.name || '';

              if (mapInstanceRef.current) {
                mapInstanceRef.current.setCenter({ lat, lng });
                mapInstanceRef.current.setZoom(15);
              }
              if (markerInstanceRef.current) {
                markerInstanceRef.current.setPosition({ lat, lng });
                markerInstanceRef.current.setMap(mapInstanceRef.current);
              }

              updateLocationFromLatLng(lat, lng, formatted, place);
            }
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err.message || 'Failed to load Google Maps');
      });

    return () => {
      isMounted = false;
    };
  }, [updateLocationFromLatLng, selectedCoords]);

  // Handle current location GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setIsLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(15);
        }
        if (markerInstanceRef.current) {
          markerInstanceRef.current.setPosition({ lat, lng });
          markerInstanceRef.current.setMap(mapInstanceRef.current);
        }

        const gMaps = typeof window !== 'undefined' && (window as any).google?.maps;
        if (gMaps && gMaps.Geocoder) {
          const geocoder = new gMaps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            const formatted =
              status === 'OK' && results && results[0]
                ? results[0].formatted_address
                : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            updateLocationFromLatLng(lat, lng, formatted, results ? results[0] : undefined);
          });
        } else {
          updateLocationFromLatLng(lat, lng, `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }
      },
      (err) => {
        setIsLocating(false);
        alert(`Location permission denied or unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Fallback manual input when API key is missing
  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setAddressInput(text);
    // Maintain coords if already set, or default
    onChange({
      type: 'Point',
      coordinates: selectedCoords || [-74.006, 40.7128],
      address: text,
      city: text.split(',')[0]?.trim(),
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        {selectedCoords && (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {selectedCoords[1].toFixed(4)}°N, {selectedCoords[0].toFixed(4)}°E
          </span>
        )}
      </div>

      {/* Autocomplete Input & GPS Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={addressInput}
            onChange={handleManualAddressChange}
            placeholder={placeholder}
            required={required}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 placeholder-slate-500"
          />
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          title="Detect my current location"
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Locate Me'}</span>
        </button>
      </div>

      {/* Google Maps Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 h-56 w-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {!mapsLoaded && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 text-xs gap-2">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Google Maps...</span>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-xs font-semibold text-slate-200 mb-1">Google Maps Platform Integration</p>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              To enable interactive map pin selection & Places Autocomplete, configure{' '}
              <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
              in <code className="text-slate-300">client/.env</code>.
            </p>
            <div className="text-[11px] text-slate-500 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              Address above is accepted and will be geocoded or stored with request coordinates.
            </div>
          </div>
        )}

        {mapsLoaded && (
          <div className="absolute bottom-2 left-2 pointer-events-none bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-slate-300 border border-slate-700/50 flex items-center gap-1.5 shadow-lg">
            <MapPin className="w-3 h-3 text-emerald-400" />
            Click anywhere on the map or drag the pin to adjust position
          </div>
        )}
      </div>
    </div>
  );
};
