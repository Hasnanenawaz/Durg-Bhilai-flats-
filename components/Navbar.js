'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ModeSwitch from './ModeSwitch';
import Logo from './Logo';

const CITIES = [
  ['bhilai', 'Bhilai', 'भिलाई'], ['durg', 'Durg', 'दुर्ग'], ['raipur', 'Raipur', 'रायपुर'], ['bilaspur', 'Bilaspur', 'बिलासपुर'],
  ['rajnandgaon', 'Rajnandgaon', 'राजनांदगांव'], ['korba', 'Korba', 'कोरबा'],
];
const POPULAR = [
  ['/rent/bhilai/pg', 'PG in Bhilai', 'pg'], ['/rent/durg/flats', 'Flats in Durg', 'flat'],
  ['/rent/bhilai/rooms', 'Rooms in Bhilai', 'room'], ['/rent/bhilai/flatmates', 'Flatmates in Bhilai', 'flatmate'],
  ['/near/iit-bhilai', 'Near IIT Bhilai', 'flat'], ['/near/bit-durg', 'Near BIT Durg', 'pg'],
];
const TYPES = [['flat', 'Flats'], ['pg', 'PG'], ['room', 'Rooms'], ['flatmate', 'Flatmates']];

const Icon = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  plus: <><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M12 8v8M8 12h8" /></>,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
};
const Svg = ({ name, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{Icon[name]}</svg>
);

export default function Navbar({ user }) {
  const path = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [qtype, setQtype] = useState('');
  const navRef = useRef(null);
  const host = user?.mode === 'host';

  useEffect(() => {
    setDrawer(false);
    setMenu(null);
    setQtype(new URLSearchParams(window.location.search).get('type') || '');
  }, [path]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKey = (e) => e.key === 'Escape' && (setMenu(null), setDrawer(false));
    const onClick = (e) => navRef.current && !navRef.current.contains(e.target) && setMenu(null);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); };
  }, []);
  useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : ''; }, [drawer]);

  const active = (h) => (h === '/' ? path === '/' : path === h || path.startsWith(h + '/'));
  const typeActive = (t) => (path === '/search' && qtype === t) || path.endsWith(`/${{ flat: 'flats', pg: 'pg', room: 'rooms', flatmate: 'flatmates' }[t]}`);
  const listHref = user ? '/host/new' : '/list-your-property';
  const accountHref = host ? '/host' : '/account';
  const initial = (user?.name || 'U').trim()[0]?.toUpperCase();
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; };

  return (
    <>
      <header className={`navbar${scrolled ? ' is-scrolled' : ''}`} ref={navRef}>
        <div className="wrap navbar-inner">
          <Logo />

          <nav className="nav-desktop" aria-label="Main">
            <Link className="nav-link" href="/" aria-current={active('/') ? 'page' : undefined}>Home</Link>
            {TYPES.map(([t, l]) => (
              <Link key={t} className="nav-link" href={`/search?type=${t}`} aria-current={typeActive(t) ? 'page' : undefined}>{l}</Link>
            ))}
            <div className="nav-drop">
              <button type="button" className="nav-link" aria-expanded={menu === 'cities'} aria-haspopup="true" onClick={(e) => { e.stopPropagation(); setMenu(menu === 'cities' ? null : 'cities'); }} data-active={active('/rent') || active('/near') ? '' : undefined}>
                Cities <span className="caret" aria-hidden="true">▾</span>
              </button>
              <div className={`mega${menu === 'cities' ? ' open' : ''}`} role="menu">
                <div>
                  <p className="mega-title">Browse by city</p>
                  <div className="mega-cities">
                    {CITIES.map(([s, n, h]) => <Link key={s} href={`/rent/${s}`} className="mega-city" role="menuitem"><b>{n}</b><span>{h}</span></Link>)}
                  </div>
                </div>
                <div>
                  <p className="mega-title">Popular searches</p>
                  <ul className="mega-pop">
                    {POPULAR.map(([h, l, t]) => <li key={h}><Link href={h} role="menuitem"><i className={`dot t-${t}`} />{l}</Link></li>)}
                  </ul>
                </div>
              </div>
            </div>
            <Link className="nav-link" href="/blog" aria-current={active('/blog') ? 'page' : undefined}>Blog</Link>
            <Link className="nav-link" href="/about" aria-current={active('/about') ? 'page' : undefined}>About</Link>
          </nav>

          <div className="nav-right">
            {user ? (
              <>
                {user.name && <span className="hide-md"><ModeSwitch mode={user.mode} /></span>}
                <div className="nav-drop">
                  <button type="button" className="avatar" aria-label="Account menu" aria-expanded={menu === 'account'} onClick={(e) => { e.stopPropagation(); setMenu(menu === 'account' ? null : 'account'); }}>{initial}</button>
                  <div className={`menu${menu === 'account' ? ' open' : ''}`} role="menu">
                    <div className="menu-head"><b>{user.name || 'Your account'}</b><span>{host ? 'Host mode' : 'Guest mode'}</span></div>
                    <Link href="/account" role="menuitem"><Svg name="user" size={17} /> Profile & history</Link>
                    <Link href="/account/saved" role="menuitem"><Svg name="heart" size={17} /> Saved places</Link>
                    <Link href="/host" role="menuitem"><Svg name="list" size={17} /> My listings</Link>
                    <Link href="/host/new" role="menuitem"><Svg name="plus" size={17} /> Add a listing</Link>
                    {user.isAdmin && <Link href="/admin" role="menuitem" className="menu-admin">★ Admin panel</Link>}
                    <button type="button" role="menuitem" onClick={logout} className="menu-out">Log out</button>
                  </div>
                </div>
              </>
            ) : (
              <Link className="btn btn-login btn-shine" href="/login">Login / Sign up</Link>
            )}
            <button type="button" className="burger" aria-label={drawer ? 'Close menu' : 'Open menu'} aria-expanded={drawer} onClick={() => setDrawer(!drawer)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer-scrim${drawer ? ' open' : ''}`} onClick={() => setDrawer(false)} aria-hidden="true" />
      <aside className={`drawer${drawer ? ' open' : ''}`} aria-label="Menu" inert={!drawer}>
        <div className="drawer-top">
          <Logo compact />
          <button type="button" className="drawer-close" aria-label="Close menu" onClick={() => setDrawer(false)}>×</button>
        </div>
        {user?.name && <div className="drawer-mode"><span className="xs muted">I’m here to</span><ModeSwitch mode={user.mode} /></div>}
        <div className="drawer-types">
          {TYPES.map(([t, l]) => <Link key={t} href={`/search?type=${t}`} className={`t-${t}`}><i className={`dot t-${t}`} />{l}</Link>)}
        </div>
        <nav className="drawer-links">
          <Link href="/search"><Svg name="search" size={19} /> Find a place</Link>
          <Link href={listHref}><Svg name="plus" size={19} /> List your place free</Link>
          <Link href="/blog"><Svg name="list" size={19} /> Renting guides</Link>
          {user && <Link href="/account/saved"><Svg name="heart" size={19} /> Saved places</Link>}
          {user && <Link href="/host"><Svg name="home" size={19} /> My listings</Link>}
          {user?.isAdmin && <Link href="/admin">★ Admin panel</Link>}
        </nav>
        <p className="mega-title" style={{ marginTop: 20 }}>Cities</p>
        <div className="mega-cities">
          {CITIES.map(([s, n, h]) => <Link key={s} href={`/rent/${s}`} className="mega-city"><b>{n}</b><span>{h}</span></Link>)}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          {user ? <button type="button" className="btn btn-ghost btn-block" onClick={logout}>Log out</button>
            : <Link className="btn btn-amber btn-block" href="/login">Login / Sign up</Link>}
        </div>
      </aside>

      <nav className="tabbar" aria-label="Quick navigation">
        <Link href="/" aria-current={active('/') ? 'page' : undefined}><Svg name="home" /><span>Home</span></Link>
        <Link href="/search" aria-current={active('/search') || active('/rent') ? 'page' : undefined}><Svg name="search" /><span>Search</span></Link>
        <Link href={listHref} className="tabbar-cta" aria-current={active('/host/new') ? 'page' : undefined}><span className="tabbar-plus"><Svg name="plus" size={24} /></span><span>List free</span></Link>
        <Link href={user ? '/account/saved' : '/login?next=/account/saved'} aria-current={active('/account/saved') ? 'page' : undefined}><Svg name="heart" /><span>Saved</span></Link>
        <Link href={user ? accountHref : '/login'} aria-current={(active('/account') && !active('/account/saved')) || (active('/host') && !active('/host/new')) ? 'page' : undefined}><Svg name="user" /><span>{user ? 'Me' : 'Log in'}</span></Link>
      </nav>
    </>
  );
}
