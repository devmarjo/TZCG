import type { Location } from './data';
import { isValidTimeZone } from './time';
export const DEFAULT_STORAGE_KEY = 'tzcg:locations:v1';
export interface SavedLocations { version: 1; locations: Location[]; order: string[] }
/** Validate storage as external input; never restore the machine's zone. */
export function readSavedLocations(value: string | null): SavedLocations | null {
  if (!value) return null;
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== 'object') return null;
    const record = data as Record<string, unknown>;
    if (record.version !== 1 || !Array.isArray(record.locations) || !Array.isArray(record.order)) return null;
    const seen = new Set<string>();
    const locations: Location[] = [];
    for (const entry of record.locations) {
      if (!entry || typeof entry !== 'object') continue;
      const p = entry as Record<string, unknown>;
      if (typeof p.id !== 'string' || !p.id || p.id === '__local' || seen.has(p.id) || typeof p.name !== 'string' || !p.name.trim() || typeof p.timeZone !== 'string' || !isValidTimeZone(p.timeZone)) continue;
      const place: Location = { id: p.id, name: p.name, timeZone: p.timeZone };
      for (const field of ['country','region','iata','airport','aliases'] as const) if (typeof p[field] === 'string') place[field] = p[field];
      seen.add(p.id); locations.push(place);
    }
    const allowed = new Set(['__local', ...locations.map(p => p.id)]);
    const order = [...new Set(record.order.filter((id): id is string => typeof id === 'string' && allowed.has(id)))];
    if (!order.includes('__local')) order.unshift('__local');
    for (const p of locations) if (!order.includes(p.id)) order.push(p.id);
    return { version: 1, locations: order.filter(id => id !== '__local').map(id => locations.find(p => p.id === id)!), order };
  } catch { return null; }
}
