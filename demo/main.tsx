import { createRoot } from 'react-dom/client';
import { TimeZoneWidget, searchLocations } from '../src';
import '../src/styles.css';
import './demo.css';
const cities = ['São Paulo','London','New York','Singapore'].map(name => searchLocations(name).find(p => !p.iata)).filter(p => p !== undefined);
createRoot(document.getElementById('root')!).render(<main><div className="demo-brand"><span>◷</span> TZCG <small>REACT LIBRARY</small></div><TimeZoneWidget initialLocations={cities}/><p className="demo-note">Uma janela para todos os seus destinos.</p></main>);
