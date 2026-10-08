import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { DEFAULT_STORAGE_KEY, readSavedLocations } from './storage';
import { createPortal } from 'react-dom';
import { searchLocations, type Location } from './data';
import { cellBackground, gridPosition, gridStart, HOUR_MS, isValidTimeZone, localParts, offsetLabel } from './time';
export interface TimeZoneWidgetProps {
  initialLocations?: readonly Location[];
  catalog?: readonly Location[];
  initialView?: 'list' | 'grid';
  storageKey?: string | null;
  locale?: string;
  className?: string;
  onLocationsChange?: (locations: readonly Location[]) => void;
  onOrderChange?: (ids: readonly string[]) => void;
}
export function TimeZoneWidget({ initialLocations = [], catalog, initialView = 'list', storageKey = DEFAULT_STORAGE_KEY, locale = 'pt-BR', className = '', onLocationsChange, onOrderChange }: TimeZoneWidgetProps) {
  const id = useId();
  const [localZone, setLocalZone] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [view, setView] = useState(initialView);
  const [selected, setSelected] = useState<Location[]>(() => initialLocations.filter((p, i, all) => p.id !== '__local' && isValidTimeZone(p.timeZone) && all.findIndex(x => x.id === p.id) === i));
  const [order, setOrder] = useState<string[]>(() => ['__local', ...selected.map(p => p.id)]);
  const defaults = useRef({ locations: selected, order });
  const [restoredKey, setRestoredKey] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let saved = null;
    if (storageKey !== null) {
      try { saved = readSavedLocations(window.localStorage.getItem(storageKey)); } catch { /* Storage may be unavailable. */ }
    }
    setSelected(saved?.locations ?? defaults.current.locations);
    setOrder(saved?.order ?? defaults.current.order);
    setRestoredKey(storageKey);
  }, [storageKey]);
  useEffect(() => {
    if (storageKey === null || restoredKey !== storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, locations: selected, order }));
    } catch { /* Keep the widget usable when storage is blocked or full. */ }
  }, [selected, order, storageKey, restoredKey]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const drag = useRef<{ id: string; x: number; y: number; moved: boolean; target: string | null } | null>(null);
  const root = useRef<HTMLElement>(null);
  const [popover, setPopover] = useState<CSSProperties | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [message, setMessage] = useState('');
  const grid = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchLocations(query, 12, catalog), [query, catalog]);
  useEffect(() => {
    const update = () => {
      setNow(Date.now());
      setLocalZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    };
    update();
    const timer = setInterval(update, 1000);
    window.addEventListener('focus', update);
    return () => { clearInterval(timer); window.removeEventListener('focus', update); };
  }, []);
  const reference = localZone ?? 'UTC';
  const start = now === null ? 0 : gridStart(now, reference);
  const marker = now === null ? 0 : gridPosition(now, start);
  useEffect(() => {
    const container = grid.current;
    if (view !== 'grid' || !container || now === null) return;
    const center = () => {
      const timeline = container.querySelector<HTMLElement>('.tzcg-timeline');
      const label = container.querySelector<HTMLElement>('.tzcg-grid-place');
      if (timeline && label) container.scrollLeft = Math.max(0, timeline.offsetWidth * gridPosition(Date.now(), start) / 100 - (container.clientWidth - label.offsetWidth) / 2);
    };
    center();
    const observer = new ResizeObserver(center);
    observer.observe(container);
    return () => observer.disconnect();
  }, [view, start, localZone]);
  const localName = localZone ? localZone.split('/').at(-1)!.replaceAll('_', ' ') : 'Horário local';
  const allRows: Location[] = [{ id: '__local', name: localName, timeZone: reference }, ...selected];
  const rows = order.map(rowId => allRows.find(p => p.id === rowId)!).filter(Boolean);
  useEffect(() => {
    if (!open || !query.trim()) { setPopover(null); return; }
    const position = () => {
      const rect = input.current?.closest('.tzcg-search')?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const showBelow = below >= 160 || below >= above;
      setPopover({ left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)), width: Math.min(rect.width, window.innerWidth - 16), ...(showBelow ? {top: rect.bottom + 6} : {bottom: window.innerHeight - rect.top + 6}), maxHeight: Math.max(60, Math.min(300, showBelow ? below : above)) });
    };
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => { window.removeEventListener('resize', position); window.removeEventListener('scroll', position, true); };
  }, [open, query, results.length]);
  function reorder(source: string, target: string) {
    const from = order.indexOf(source), to = order.indexOf(target);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...order]; next.splice(from, 1); next.splice(to, 0, source);
    const nextLocations = next.filter(id => id !== '__local').map(id => selected.find(p => p.id === id)!);
    setOrder(next); setSelected(nextLocations); onLocationsChange?.(nextLocations); onOrderChange?.(next);
    setMessage('Ordem dos locais atualizada.');
  }
  function remove(place: Location) {
    if (place.id === '__local') return;
    const next = selected.filter(p => p.id !== place.id);
    const nextOrder = order.filter(id => id !== place.id);
    setSelected(next); setOrder(nextOrder); onLocationsChange?.(next); onOrderChange?.(nextOrder);
    setMessage(`${place.name} removido.`);
  }
  function handle(place: Location) {
    return <button type="button" className="tzcg-drag" aria-label={`Reordenar ${place.name}`} title="Arraste para reordenar; use ↑ e ↓ pelo teclado" onPointerDown={e => {
      if (e.button !== 0) return;
      e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = {id:place.id,x:e.clientX,y:e.clientY,moved:false,target:place.id};
    }} onPointerMove={e => {
      const current = drag.current; if (!current) return;
      if (!current.moved && Math.hypot(e.clientX-current.x,e.clientY-current.y) < 5) return;
      current.moved = true; setDragging(current.id);
      const target = document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-tzcg-row]');
      current.target = target && root.current?.contains(target) ? target.dataset.tzcgRow! : null;
      setDropTarget(current.target);
    }} onPointerUp={() => {
      const current = drag.current;
      if (current?.moved && current.target) reorder(current.id,current.target);
      drag.current=null;setDragging(null);setDropTarget(null);
    }} onPointerCancel={() => {drag.current=null;setDragging(null);setDropTarget(null);}} onKeyDown={e => {
      if (e.key === 'Escape') {drag.current=null;setDragging(null);setDropTarget(null);}
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault(); const index = order.indexOf(place.id); const target = order[index+(e.key === 'ArrowUp'?-1:1)]; if(target) reorder(place.id,target);
      }
    }}><span aria-hidden="true">⠿</span></button>;
  }
  function removeButton(place: Location) {
    return place.id === '__local' ? <span className="tzcg-remove-spacer"/> : <button type="button" className="tzcg-remove" aria-label={`Excluir ${place.name}${place.iata ? ` ${place.iata}` : ''}`} onClick={() => remove(place)} title="Excluir cidade">×</button>;
  }
  function add(place: Location) {
    if (selected.some(x => x.id === place.id)) { setMessage('Este local já está na lista.'); return; }
    if (place.id === '__local') return;
    const next = [...selected, place]; const nextOrder = [...order, place.id]; setSelected(next); setOrder(nextOrder); onLocationsChange?.(next); onOrderChange?.(nextOrder);
    setQuery(''); setOpen(false); setActive(-1); setMessage(`${place.name} adicionado.`); input.current?.focus();
  }
  const dateLabel = (instant: number, zone: string) => new Intl.DateTimeFormat(locale, { timeZone: zone, day: '2-digit', month: 'short' }).format(instant);
  return <section ref={root} className={`tzcg ${className}`} aria-label="Comparador de fusos horários">
    <div className="tzcg-top"><header className="tzcg-header"><h2>Fusos horários</h2><span className="tzcg-live"><i/> Ao vivo</span></header>
    <div className="tzcg-toolbar"><div className="tzcg-tabs" role="tablist" aria-label="Visualização">
      {(['list','grid'] as const).map((tab, i) => <button key={tab} type="button" role="tab" id={`${id}-${tab}`} aria-controls={`${id}-panel`} aria-selected={view === tab} tabIndex={view === tab ? 0 : -1} onClick={() => setView(tab)} onKeyDown={e => { if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 'list' : e.key === 'End' ? 'grid' : i === 0 ? 'grid' : 'list'; setView(next); document.getElementById(`${id}-${next}`)?.focus(); } }}>{tab === 'list' ? '☷ Lista' : '▦ Grid'}</button>)}
    </div><span className="tzcg-count">{rows.length} {rows.length === 1 ? 'local' : 'locais'}</span></div></div>
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${view}`} tabIndex={0}>
      {now === null ? <p className="tzcg-loading">Detectando o fuso do navegador…</p> : view === 'list' ? <div className="tzcg-list">
        <div className="tzcg-list-head"><span>LOCAL / FUSO</span><span/><span>HORA LOCAL</span></div>
        {rows.map(place => <div className={`tzcg-list-row ${dragging === place.id ? 'tzcg-dragging' : ''} ${dropTarget === place.id && dragging !== place.id ? 'tzcg-drop-target' : ''}`} data-tzcg-row={place.id} key={place.id}>
          <div className="tzcg-row-label">{handle(place)}<div className="tzcg-place"><strong>{place.name} {place.iata && <span className="tzcg-iata">{place.iata}</span>} {place.id === '__local' && <span className="tzcg-local">Local</span>}</strong><small>{place.timeZone} · {offsetLabel(now, place.timeZone)}</small>{place.airport && <small>{place.airport}</small>}</div></div>{removeButton(place)}
          <div className="tzcg-clock"><time dateTime={new Date(now).toISOString()}>{localParts(now, place.timeZone).time}</time><small>{dateLabel(now, place.timeZone)}</small></div>
        </div>)}
      </div> : <><div className="tzcg-grid-info"><span>24 horas alinhadas pelo seu fuso local</span><span><i className="tzcg-key day"/> Dia 06–18 <i className="tzcg-key night"/> Noite 18–06</span></div>
        <div className="tzcg-grid-scroll" ref={grid}><div className="tzcg-grid-table" role="table" aria-label="Horas locais por instante">
          <div className="tzcg-grid-row tzcg-grid-heading" role="row"><div className="tzcg-grid-place" role="columnheader">LOCAL / FUSO</div><div className="tzcg-hours" role="presentation">{Array.from({length:24}, (_, h) => <div role="columnheader" key={h}>{localParts(start + h * HOUR_MS, reference).time}</div>)}</div></div>
          <div className="tzcg-grid-body"><div className="tzcg-timeline" aria-hidden="true"><div className="tzcg-now" style={{left:`${marker}%`}}><span>Agora</span></div></div>
          {rows.map(place => <div className={`tzcg-grid-row ${dragging === place.id ? 'tzcg-dragging' : ''} ${dropTarget === place.id && dragging !== place.id ? 'tzcg-drop-target' : ''}`} role="row" data-tzcg-row={place.id} key={place.id}><div className="tzcg-grid-place tzcg-row-label" role="rowheader">{handle(place)}<div className="tzcg-place"><strong>{place.name} {place.iata && <span className="tzcg-iata">{place.iata}</span>}{place.id === '__local' && <span className="tzcg-local">Local</span>}</strong><small>{place.timeZone}</small><small>{offsetLabel(now, place.timeZone)}</small></div>{removeButton(place)}</div><div className="tzcg-hours" role="presentation">{Array.from({length:24},(_,h) => {const instant = start + h * HOUR_MS; const p = localParts(instant,place.timeZone); const prev = localParts(instant-HOUR_MS,place.timeZone); return <div role="cell" className="tzcg-cell" key={h} style={{background:cellBackground(instant,place.timeZone)} as CSSProperties} title={`${place.name}: ${p.date} ${p.time} · ${offsetLabel(instant,place.timeZone)}`}><span>{p.minute ? p.time : String(p.hour).padStart(2,'0')}</span>{(h === 0 || p.date !== prev.date) && <small>{dateLabel(instant,place.timeZone)}</small>}</div>;})}</div></div>)}
          </div></div></div></>}
    </div>
    <div className="tzcg-add"><label htmlFor={`${id}-search`}>Adicionar cidade ou aeroporto</label><div className="tzcg-search"><span aria-hidden="true">⌕</span><input ref={input} id={`${id}-search`} role="combobox" aria-autocomplete="list" aria-expanded={open && results.length > 0} aria-controls={`${id}-results`} aria-activedescendant={open && active >= 0 ? `${id}-result-${active}` : undefined} placeholder="Busque uma cidade, aeroporto ou IATA…" value={query} onFocus={() => setOpen(true)} onBlur={() => { setOpen(false); setActive(-1); }} onChange={e => {setQuery(e.target.value);setOpen(true);setActive(-1);}} onKeyDown={e => {if(e.key === 'Escape'){setOpen(false);setActive(-1);}if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){e.preventDefault();setOpen(true);setActive(n => results.length ? (n < 0 ? (e.key === 'ArrowDown' ? 0 : results.length - 1) : (n + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length) : -1);}if(e.key === 'Enter' && open && active >= 0 && results[active]){e.preventDefault();add(results[active]);}}}/><span className="tzcg-offline">Offline</span></div>
      {open && query.trim() && popover && createPortal(<div className={`tzcg tzcg-popover ${className}`} style={popover}><div className="tzcg-results" id={`${id}-results`} role="listbox" aria-label="Locais encontrados">{results.length ? results.map((p,i) => <div key={p.id} id={`${id}-result-${i}`} role="option" aria-selected={active === i} className={active === i ? 'active' : ''} onPointerDown={e => e.preventDefault()} onMouseEnter={() => setActive(i)} onClick={() => add(p)}><div><strong>{p.name} {p.iata && <span className="tzcg-iata">{p.iata}</span>}</strong><small>{[p.airport,p.country,p.region,p.timeZone].filter(Boolean).join(' · ')}</small></div><span aria-hidden="true">＋</span></div>) : <p>Nenhum resultado no catálogo offline.</p>}</div></div>, document.body)}
      <span className="tzcg-sr" role="status">{message}</span>
    </div>
    <footer className="tzcg-footer"><span>Horários sincronizados · Fusos IANA</span><span>Dados: <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> / <a href="https://ourairports.com/data/" target="_blank" rel="noreferrer">OurAirports</a></span></footer>
  </section>;
}
