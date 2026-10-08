const HOUR = 3_600_000;
const backgrounds = new Map<string, string>();
const offsets = new Map<string, Intl.DateTimeFormat>();
const formatters = new Map<string, Intl.DateTimeFormat>();
export function isValidTimeZone(zone: string): boolean {
  try { new Intl.DateTimeFormat('en', { timeZone: zone }); return true; } catch { return false; }
}
export function localParts(instant: number, timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    formatters.set(timeZone, formatter);
  }
  const p = Object.fromEntries(formatter.formatToParts(instant).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minute: Number(p.minute), second: Number(p.second), time: `${p.hour}:${p.minute}` };
}
export function offsetLabel(instant: number, timeZone: string) {
  let formatter = offsets.get(timeZone);
  if (!formatter) { formatter = new Intl.DateTimeFormat('en', { timeZone, timeZoneName: 'shortOffset' }); offsets.set(timeZone, formatter); }
  return formatter.formatToParts(instant).find(p => p.type === 'timeZoneName')!.value.replace('GMT', 'UTC');
}
/** Start at local midnight's hour on the UTC timeline; never construct a local date. */
export function gridStart(instant: number, referenceZone: string) {
  const p = localParts(instant, referenceZone);
  return instant - (p.hour * HOUR + p.minute * 60_000 + p.second * 1000 + ((instant % 1000 + 1000) % 1000));
}
export function gridPosition(instant: number, start: number) { return (instant - start) / (24 * HOUR) * 100; }
export function isDay(instant: number, zone: string) { const h = localParts(instant, zone).hour; return h >= 6 && h < 18; }
/** Sample each minute so half/quarter-hour zones and DST boundaries color correctly. */
export function cellBackground(start: number, zone: string) {
  const key = `${start}:${zone}`;
  const cached = backgrounds.get(key);
  if (cached) return cached;
  const stops: string[] = [];
  let previous = isDay(start, zone);
  let segmentStart = 0;
  for (let minute = 1; minute <= 60; minute++) {
    const day = minute < 60 ? isDay(start + minute * 60_000, zone) : !previous;
    if (day !== previous) {
      stops.push(`var(--tzcg-${previous ? 'day' : 'night'}) ${segmentStart / 60 * 100}% ${minute / 60 * 100}%`);
      segmentStart = minute; previous = day;
    }
  }
  const result = stops.length === 1 ? (isDay(start, zone) ? 'var(--tzcg-day)' : 'var(--tzcg-night)') : `linear-gradient(90deg, ${stops.join(', ')})`;
  if (backgrounds.size >= 2048) backgrounds.clear();
  backgrounds.set(key, result);
  return result;
}
export const HOUR_MS = HOUR;
