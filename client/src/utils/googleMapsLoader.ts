import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let loaderPromise: Promise<typeof google> | null = null;

export const getGoogleMapsApiKey = (): string => {
  return (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
};

export const isGoogleMapsConfigured = (): boolean => {
  const key = getGoogleMapsApiKey();
  return Boolean(key && key.trim().length > 0 && key !== 'your_google_maps_api_key_here');
};

export const loadGoogleMaps = async (): Promise<typeof google> => {
  const apiKey = getGoogleMapsApiKey();

  if (!isGoogleMapsConfigured()) {
    throw new Error(
      'Google Maps API Key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in client/.env'
    );
  }

  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return (window as any).google;
  }

  if (!loaderPromise) {
    loaderPromise = (async () => {
      setOptions({
        key: apiKey,
        v: 'weekly',
      });
      await importLibrary('maps');
      await importLibrary('places');
      return (window as any).google;
    })();
  }

  return loaderPromise;
};
