import records from './locations.json';
import { isValidTimeZone } from './time';
export interface Location { id: string; name: string; country?: string; region?: string; timeZone: string; iata?: string; airport?: string; aliases?: string }
export const locations: readonly Location[] = records;
const normalize = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
const index = locations.map(location => ({ location, text: normalize([location.name, location.aliases, location.country, location.region, location.timeZone, location.iata, location.airport].filter(Boolean).join(' ')) }));
export function searchLocations(query: string, limit = 12, catalog?: readonly Location[]): Location[] {
  const q = normalize(query);
  if (!q) return [];
  const pool = catalog ? catalog.map(location => ({ location, text: normalize(Object.values(location).join(' ')) })) : index;
  const hits = pool.filter(x => q.split(/\s+/).every(token => x.text.includes(token)));
  hits.sort((a, b) => Number(normalize(b.location.iata ?? '') === q) - Number(normalize(a.location.iata ?? '') === q) || Number(normalize(b.location.name) === q) - Number(normalize(a.location.name) === q));
  return hits.filter(x => isValidTimeZone(x.location.timeZone)).slice(0, limit).map(x => x.location);
}
