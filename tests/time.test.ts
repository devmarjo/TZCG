import { describe, expect, it } from 'vitest';
import { cellBackground, gridPosition, gridStart, HOUR_MS, isDay, localParts, offsetLabel } from '../src/time';
import { locations, searchLocations } from '../src/data';
describe('conversões de instantes IANA', () => {
  it('pula uma hora na primavera em Nova York', () => {
    expect(localParts(Date.parse('2026-03-08T06:30:00Z'), 'America/New_York').time).toBe('01:30');
    expect(localParts(Date.parse('2026-03-08T07:30:00Z'), 'America/New_York').time).toBe('03:30');
  });
  it('distingue as duas ocorrências de 01:30 no outono', () => {
    const a = Date.parse('2026-11-01T05:30:00Z'), b = a + HOUR_MS;
    expect(localParts(a,'America/New_York').time).toBe('01:30');
    expect(localParts(b,'America/New_York').time).toBe('01:30');
    expect(offsetLabel(a,'America/New_York')).toBe('UTC-4');
    expect(offsetLabel(b,'America/New_York')).toBe('UTC-5');
  });
  it('respeita fusos de meia hora e 45 minutos e virada de data', () => {
    const now = Date.parse('2026-01-01T20:00:00Z');
    expect(localParts(now,'Asia/Kolkata').time).toBe('01:30');
    expect(localParts(now,'Asia/Kathmandu').time).toBe('01:45');
    expect(localParts(now,'Asia/Kathmandu').date).toBe('2026-01-02');
  });
  it('posiciona a linha aos 30 minutos na metade da célula correta', () => {
    const now = Date.parse('2026-01-01T10:30:00Z');
    expect(gridPosition(now,gridStart(now,'UTC'))).toBeCloseTo(10.5 / 24 * 100);
  });
  it('mantém 12 horas de dia e inclui a transição parcial em Kathmandu', () => {
    expect(isDay(Date.parse('2026-01-01T06:00:00Z'),'UTC')).toBe(true);
    expect(isDay(Date.parse('2026-01-01T18:00:00Z'),'UTC')).toBe(false);
    expect(cellBackground(Date.parse('2026-01-01T00:00:00Z'),'Asia/Kathmandu')).toContain('25%');
    expect(cellBackground(Date.parse('2026-01-01T12:00:00Z'),'UTC')).toBe('var(--tzcg-day)');
  });
});
describe('catálogo offline', () => {
  it('busca sem acentos e prioriza IATA exato', () => {
    expect(searchLocations('sao paulo')[0].name).toBe('São Paulo');
    expect(searchLocations('GRU')[0].iata).toBe('GRU');
    expect(searchLocations('KTM')[0].timeZone).toBe('Asia/Kathmandu');
  });
  it('não duplica IDs e exclui da busca zonas não suportadas pelo ambiente', () => {
    expect(new Set(locations.map(x=>x.id)).size).toBe(locations.length);
    const zones = [...new Set(locations.map(x=>x.timeZone))];
    for (const zone of zones) {
      try { new Intl.DateTimeFormat('en',{timeZone:zone}); }
      catch { expect(searchLocations('teste', 12, [{id:'test',name:'teste',timeZone:zone}])).toEqual([]); }
    }
    expect(searchLocations('teste', 12, [{id:'test',name:'teste',timeZone:'Invalid/Zone'}])).toEqual([]);
  });
});
