'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { localSuggestions, parseQuery, propertiesHref } from '@/lib/search-parse';

const CARRIED = ['type', 'bhk', 'furnishing', 'tenant', 'min', 'max', 'notice'];
const newSession = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`);

const Pin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);

/**
 * The search box. Picking a suggestion goes straight to the results; pressing Search sends the text to
 * /properties?q=..., which reads it, so the form also works without JavaScript.
 * `keep` holds filters to carry over to the new location.
 */
export default function LocationSearch({ defaultValue = '', keep = {}, plain = false }) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState([]);
  const [source, setSource] = useState('local');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [busy, setBusy] = useState(false);
  const typing = useRef(false);
  const session = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    if (!typing.current) return undefined;
    const text = value.trim();
    if (text.length < 2) { setItems([]); return undefined; }
    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      session.current ||= newSession();
      try {
        const r = await fetch(`/api/places/autocomplete?${new URLSearchParams({ input: text, session: session.current })}`, { signal: ctl.signal });
        if (!r.ok) throw new Error(String(r.status));
        const d = await r.json();
        setItems(d.suggestions || []);
        setSource(d.source);
      } catch (e) {
        if (e.name === 'AbortError') return;
        setItems(localSuggestions(text));
        setSource('local');
      }
      setActive(-1);
    }, 220);
    return () => { clearTimeout(timer); ctl.abort(); };
  }, [value]);

  // Filters typed alongside the place ("2 BHK in Durg") survive picking "Durg" from the list.
  const go = (href) => {
    const u = new URL(href, window.location.origin);
    const typed = parseQuery(value);
    for (const k of CARRIED) {
      const v = typed[k] || keep[k];
      if (v && !u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    if (keep.sort) u.searchParams.set('sort', keep.sort);
    router.push(`${u.pathname}${u.search}`);
  };

  const choose = async (item) => {
    typing.current = false;
    setOpen(false);
    setValue(item.main);
    if (item.href) { go(item.href); return; }
    setBusy(true);
    try {
      const r = await fetch(`/api/places/details?${new URLSearchParams({ id: item.id, main: item.main, session: session.current || '' })}`);
      if (!r.ok) throw new Error(String(r.status));
      go((await r.json()).href);
    } catch {
      go(propertiesHref({ q: `${item.main} ${item.secondary}` }));
    } finally {
      session.current = null; // the details call ends this billing session
      setBusy(false);
    }
  };

  const shown = open && items.length > 0;

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); setActive(-1); return; }
    if (!shown) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % items.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? items.length : a) - 1); }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(items[active]); }
  };

  return (
    <form
      className={`ls${plain ? ' ls-plain' : ''}`}
      action="/properties"
      method="get"
      role="search"
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
    >
      {Object.entries(keep).filter(([, v]) => v).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="ls-field">
        <Pin />
        <input
          ref={input}
          className="ls-input"
          name="q"
          value={value}
          onChange={(e) => { typing.current = true; setValue(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search a city, area or college"
          aria-label="Search by city, area or college"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={shown}
          aria-controls={`${id}-list`}
          aria-activedescendant={shown && active >= 0 ? `${id}-${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
        />
        {value && (
          <button type="button" className="ls-clear" aria-label="Clear search" onClick={() => { typing.current = true; setValue(''); setItems([]); input.current?.focus(); }}>×</button>
        )}
      </div>
      <button className="btn sb-btn btn-shine" type="submit" disabled={busy}>{busy ? '…' : 'Search'}</button>
      {shown && (
        // Pressing the list must not blur the input, or it would close before the click lands.
        <div className="ls-pop" onMouseDown={(e) => e.preventDefault()}>
          <ul id={`${id}-list`} role="listbox" aria-label="Suggested places">
            {items.map((it, i) => (
              <li key={it.id} id={`${id}-${i}`} role="option" aria-selected={i === active} className={i === active ? 'on' : undefined} onClick={() => choose(it)} onMouseEnter={() => setActive(i)}>
                <Pin />
                <span><b>{it.main}</b>{it.secondary && <small>{it.secondary}</small>}</span>
              </li>
            ))}
          </ul>
          {source === 'google' && <div className="ls-attrib">Google Maps</div>}
        </div>
      )}
    </form>
  );
}
