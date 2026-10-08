import { expect, it } from 'vitest';
import { readSavedLocations } from '../src/storage';
it('limpa dados inválidos, duplicatas e mantém exatamente um local', () => {
 const saved=readSavedLocations(JSON.stringify({version:1,locations:[{id:'a',name:'A',timeZone:'UTC'},{id:'a',name:'Duplicate',timeZone:'UTC'},{id:'x',name:'Invalid',timeZone:'Invalid/Zone'},{id:'__local',name:'Old local',timeZone:'UTC'},null],order:['a','__local','__local','x','unknown']}));
 expect(saved?.locations).toEqual([{id:'a',name:'A',timeZone:'UTC'}]);
 expect(saved?.order).toEqual(['a','__local']);
 expect(readSavedLocations('{')).toBeNull();
 expect(readSavedLocations(JSON.stringify({version:2,locations:[],order:[]}))).toBeNull();
});
