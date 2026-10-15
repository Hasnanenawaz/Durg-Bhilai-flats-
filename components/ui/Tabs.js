'use client';
import { useId, useRef, useState } from 'react';

/** Accessible tabs. tabs = [{ id, label, color?, count?, content }]. Panels stay in the HTML (good for SEO). */
export default function Tabs({ tabs, variant = 'pill', className = '', initial }) {
  const [cur, setCur] = useState(initial || tabs[0]?.id);
  const uid = useId();
  const refs = useRef({});
  function onKey(e, i) {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    setCur(next.id);
    refs.current[next.id]?.focus();
  }
  return (
    <div className={`tabset tabset-${variant} ${className}`}>
      <div className="tablist" role="tablist">
        {tabs.map((t, i) => (
          <button key={t.id} ref={(el) => (refs.current[t.id] = el)} type="button" role="tab" id={`${uid}-t-${t.id}`} aria-controls={`${uid}-p-${t.id}`}
            aria-selected={cur === t.id} tabIndex={cur === t.id ? 0 : -1} onClick={() => setCur(t.id)} onKeyDown={(e) => onKey(e, i)}
            className={t.color ? `t-${t.color}` : undefined}>
            {t.icon && <span aria-hidden="true">{t.icon}</span>}{t.label}{t.count != null && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`${uid}-p-${t.id}`} aria-labelledby={`${uid}-t-${t.id}`} hidden={cur !== t.id} className="tabpanel">
          {t.content}
        </div>
      ))}
    </div>
  );
}
