//calculate distance
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;  

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export function getBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): BoundingBox {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

export function isWithinRadius(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(userLat, userLng, targetLat, targetLng);
  return distance <= radiusKm;
}

export function filterVenuesByDistance<
  T extends { address?: { lat?: number | null; lng?: number | null } | null }
>(
  venues: T[],
  userLat: number,
  userLng: number,
  radiusKm: number
): (T & { distance: number })[] {
  const results: (T & { distance: number })[] = [];

  for (const venue of venues) {
    const lat = venue.address?.lat;
    const lng = venue.address?.lng;

    if (lat == null || lng == null) continue;

    if (isWithinRadius(userLat, userLng, lat, lng, radiusKm)) {
      results.push({
        ...venue,
        distance: calculateDistance(userLat, userLng, lat, lng),
      });
    }
  }

  return results.sort((a, b) => a.distance - b.distance);
}
export function filterSessionsByDistance<
  T extends {
    startTime: string;
    venue?: {
      address?: { lat?: number | null; lng?: number | null } | null;
    } | null;
  }
>(
  sessions: T[],
  userLat: number,
  userLng: number,
  radiusKm: number
): (T & { distance: number })[] {
  const results: (T & { distance: number })[] = [];

  for (const session of sessions) {
    const lat = session.venue?.address?.lat;
    const lng = session.venue?.address?.lng;

    if (lat == null || lng == null) continue;

    if (isWithinRadius(userLat, userLng, lat, lng, radiusKm)) {
      results.push({
        ...session,
        distance: calculateDistance(userLat, userLng, lat, lng),
      });
    }
  }
  return results.sort((a, b) => {
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.distance - b.distance;
  });
}

//display distance
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
