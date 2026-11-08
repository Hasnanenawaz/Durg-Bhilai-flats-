'use client';
import { useEffect, useRef, useState } from 'react';

/** A bottom sheet on phones, opened from a button. From 960px wide the same panel is a plain sidebar (see globals.css). */
export default function FilterDrawer({ count = 0, children }) {
  const [open, setOpen] = useState(false);
  const opener = useRef(null);
  const closer = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closer.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const button = opener.current;
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      button?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={opener} type="button" className="btn btn-ghost btn-sm fd-open" aria-expanded={open} onClick={() => setOpen(true)}>
        Filters{count > 0 ? ` (${count})` : ''}
      </button>
      <div className={`fd-scrim${open ? ' on' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`fd-panel${open ? ' on' : ''}`} {...(open ? { role: 'dialog', 'aria-modal': true, 'aria-label': 'Filters' } : {})}>
        <div className="fd-head">
          <b>Filters</b>
          <button ref={closer} type="button" className="ls-clear" aria-label="Close filters" onClick={() => setOpen(false)}>×</button>
        </div>
        {children}
      </aside>
    </>
  );
}
