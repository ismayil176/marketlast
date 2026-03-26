import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Məkan xidməti dəstəklənmir', loading: false }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      let message = 'Məkan məlumatı alınmadı';
      if (error.code === error.PERMISSION_DENIED) {
        message = 'Məkana giriş icazəsi rədd edildi';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = 'Məkan məlumatı mövcud deyil';
      } else if (error.code === error.TIMEOUT) {
        message = 'Məkan məlumatı üçün vaxt bitdi';
      }
      setState(s => ({ ...s, error: message, loading: false }));
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }, []);

  return state;
}
