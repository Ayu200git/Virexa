/**
 * Utility functions for handling geolocation API
 */

export interface GeolocationError {
  code: number;
  message: string;
  userMessage: string;
}

/**
 * Check if geolocation is available and the context is secure
 */
export function isGeolocationAvailable(): boolean {
  if (typeof window === "undefined") return false;
  if (!navigator.geolocation) return false;
  
  // Check if we're in a secure context (HTTPS or localhost)
  return window.isSecureContext || 
         window.location.protocol === "https:" ||
         window.location.hostname === "localhost" ||
         window.location.hostname === "127.0.0.1";
}

/**
 * Get user-friendly error message based on geolocation error code
 */
export function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      // Code 1: Permission denied or not secure context
      if (!isGeolocationAvailable()) {
        return "Location access requires a secure connection (HTTPS). Please use HTTPS or enter your location manually.";
      }
      return "Location access was denied. Please enable location permissions in your browser settings or enter your location manually.";
    
    case error.POSITION_UNAVAILABLE:
      // Code 2: Position unavailable
      return "Your location could not be determined. Please enter your location manually.";
    
    case error.TIMEOUT:
      // Code 3: Request timeout
      return "Location request timed out. Please try again or enter your location manually.";
    
    default:
      return "Could not get your location. Please enter it manually.";
  }
}

/**
 * Get current position using geolocation API with proper error handling
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      const error: GeolocationPositionError = {
        code: 1, // PERMISSION_DENIED
        message: "Only secure origins are allowed",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError;
      reject(error);
      return;
    }

    if (!navigator.geolocation) {
      const error: GeolocationPositionError = {
        code: 2, // POSITION_UNAVAILABLE
        message: "Geolocation is not supported",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError;
      reject(error);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

