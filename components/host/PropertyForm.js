'use client';
import { useMemo, useRef, useState } from 'react';
import { CITIES, LISTING_TYPES, BHK, FURNISHING, TENANT_PREFS, AMENITIES, cityBySlug } from '@/lib/locations';

// Shrinks photos in the browser before upload: faster on mobile data, cheaper storage.
async function shrink(file, max = 1600) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Only JPG, PNG or WebP photos.');
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.82));
  return blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file;
}

const EMPTY = {
  listing_type: 'flat', title: '', description: '', bhk: '1 BHK', furnishing: 'Semi-furnished', tenant_pref: 'any',
  rent: '', deposit: '', maintenance: '', food_included: false, available_from: '',
  city: 'bhilai', locality: '', address: '', landmark: '', pincode: '', lat: '', lng: '',
  amenities: [], images: [], contact_name: '', contact_phone: '', whatsapp: '',
};

export default function PropertyForm({ initial, user }) {
  const editing = Boolean(initial?.id);
  const [f, setF] = useState(() => ({
    ...EMPTY,
    contact_name: user.name || '', contact_phone: user.phone || '', whatsapp: user.whatsapp || user.phone || '',
    ...(initial || {}),
  }));
  const [uploading, setUploading] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const city = cityBySlug(f.city);
  const suggestedTitle = useMemo(() => {
    const what = f.listing_type === 'flat' ? `${f.bhk} flat` : f.listing_type === 'pg' ? 'PG' : f.listing_type === 'flatmate' ? 'Flatmate wanted' : 'Room';
    const extra = f.furnishing && f.listing_type !== 'flatmate' ? `${f.furnishing.toLowerCase()} ` : '';
    return `${extra}${what} in ${f.locality || 'your area'}, ${city?.name || ''}`.replace(/^\w/, (c) => c.toUpperCase());
  }, [f.listing_type, f.bhk, f.furnishing, f.locality, city]);

  function toggleAmenity(a) {
    setF((s) => ({ ...s, amenities: s.amenities.includes(a) ? s.amenities.filter((x) => x !== a) : [...s.amenities, a] }));
  }

  async function addPhotos(files) {
    setError('');
    const list = Array.from(files).slice(0, 10 - f.images.length);
    if (!list.length) return setError('You can add up to 10 photos.');
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const small = await shrink(file);
        const fd = new FormData();
        fd.append('file', small);
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setF((s) => ({ ...s, images: [...s.images, { url: d.url, path: d.path }] }));
      } catch (e) {
        setError(e.message || 'A photo failed to upload.');
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }
  const move = (i, d) => setF((s) => {
    const imgs = [...s.images]; const j = i + d;
    if (j < 0 || j >= imgs.length) return s;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    return { ...s, images: imgs };
  });
  const drop = (i) => setF((s) => ({ ...s, images: s.images.filter((_, k) => k !== i) }));

  function useMyLocation() {
    if (!navigator.geolocation) return setError('Location is not available on this device.');
    navigator.geolocation.getCurrentPosition(
      (pos) => setF((s) => ({ ...s, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })),
      () => setError('Could not read your location. You can skip this.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...f, title: f.title.trim() || suggestedTitle };
    setBusy(true);
    const r = await fetch(editing ? `/api/properties/${initial.id}` : '/api/properties', {
      method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setError(d.error || 'Could not save.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    window.location.href = `/host?saved=${d.property.id}`;
  }

  return (
    <form onSubmit={submit}>
      {error && <p className="notice notice-err" role="alert" style={{ marginBottom: 16 }}>{error}</p>}

      <section className="form-section">
        <h2>What are you listing?</h2>
        <p className="muted">Pick “Flatmate wanted” if you already rent a flat and want someone to share it.</p>
        <div className="chips" role="radiogroup" aria-label="Listing type">
          {LISTING_TYPES.map((t) => (
            <label key={t.value} className="chip-toggle">
              <input type="radio" name="listing_type" value={t.value} checked={f.listing_type === t.value} onChange={set('listing_type')} />
              <span>{t.value === 'flatmate' ? 'Flatmate wanted' : t.label}</span>
            </label>
          ))}
        </div>
        <div className="grid-3" style={{ marginTop: 16 }}>
          <label className="field"><span>Size</span><select className="input" value={f.bhk || ''} onChange={set('bhk')}>{BHK.map((b) => <option key={b}>{b}</option>)}</select></label>
          <label className="field"><span>Furnishing</span><select className="input" value={f.furnishing || ''} onChange={set('furnishing')}>{FURNISHING.map((b) => <option key={b}>{b}</option>)}</select></label>
          <label className="field"><span>Who is it for?</span><select className="input" value={f.tenant_pref} onChange={set('tenant_pref')}>{TENANT_PREFS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
        </div>
      </section>

      <section className="form-section">
        <h2>Rent</h2>
        <p className="muted">Monthly amounts in rupees. Tenants filter by rent, so keep it accurate.</p>
        <div className="grid-3">
          <label className="field"><span>Rent per month *</span><input className="input" inputMode="numeric" required value={f.rent} onChange={set('rent')} placeholder="7000" /></label>
          <label className="field"><span>Security deposit</span><input className="input" inputMode="numeric" value={f.deposit} onChange={set('deposit')} placeholder="14000" /></label>
          <label className="field"><span>Maintenance per month</span><input className="input" inputMode="numeric" value={f.maintenance} onChange={set('maintenance')} placeholder="0" /></label>
        </div>
        <div className="row" style={{ marginTop: 14, gap: 20 }}>
          <label className="field" style={{ minWidth: 200 }}><span>Available from</span><input className="input" type="date" value={f.available_from || ''} onChange={set('available_from')} /></label>
          <label className="check" style={{ marginTop: 20 }}><input type="checkbox" checked={Boolean(f.food_included)} onChange={set('food_included')} /> Food / tiffin included</label>
        </div>
      </section>

      <section className="form-section">
        <h2>Location</h2>
        <p className="muted">We show the area publicly. Share the exact address with tenants on call.</p>
        <div className="grid-2">
          <label className="field"><span>City *</span><select className="input" value={f.city} onChange={set('city')}>{CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
          <label className="field"><span>Locality / area *</span>
            <input className="input" list="host-localities" required value={f.locality} onChange={set('locality')} placeholder={city?.localities[0]} />
            <datalist id="host-localities">{city?.localities.map((l) => <option key={l} value={l} />)}</datalist>
          </label>
          <label className="field"><span>Nearby landmark</span><input className="input" value={f.landmark} onChange={set('landmark')} placeholder="e.g. near Supela Chowk, BIT Durg" /></label>
          <label className="field"><span>PIN code</span><input className="input" inputMode="numeric" maxLength={6} value={f.pincode || ''} onChange={set('pincode')} placeholder="490020" /></label>
        </div>
        <label className="field" style={{ marginTop: 14 }}><span>Full address (private, only for our team)</span><input className="input" value={f.address} onChange={set('address')} placeholder="House no., street" /></label>
        <div className="row" style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={useMyLocation}>📍 Use my current location</button>
          {f.lat && f.lng ? <span className="small muted">Pinned at {f.lat}, {f.lng} <button type="button" className="linkbtn" onClick={() => setF((s) => ({ ...s, lat: '', lng: '' }))}>remove</button></span> : <span className="xs muted">Optional. Only use this while standing at the property.</span>}
        </div>
      </section>

      <section className="form-section">
        <h2>Photos</h2>
        <p className="muted">3–6 clear photos are enough: room, kitchen, bathroom, outside. The first photo is the cover.</p>
        <div className="uploader" onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addPhotos(e.dataTransfer.files); }} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}>
          <b>{uploading ? `Uploading ${uploading} photo${uploading > 1 ? 's' : ''}…` : 'Tap to add photos'}</b>
          <div className="xs muted">JPG, PNG or WebP · up to 10 photos</div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }} />
        </div>
        {f.images.length > 0 && (
          <div className="thumbs">
            {f.images.map((img, i) => (
              <div className="thumb" key={img.path || img.url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={`Photo ${i + 1}`} />
                {i === 0 && <span className="badge badge-dark cover">Cover</span>}
                <div className="tools">
                  <button type="button" onClick={() => move(i, -1)} aria-label="Move left">←</button>
                  <button type="button" onClick={() => move(i, 1)} aria-label="Move right">→</button>
                  <button type="button" onClick={() => drop(i)} aria-label="Remove photo">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="form-section">
        <h2>Amenities</h2>
        <p className="muted">Tick what’s actually there.</p>
        <div className="chips">
          {AMENITIES.map((a) => (
            <label key={a} className="chip-toggle"><input type="checkbox" checked={f.amenities.includes(a)} onChange={() => toggleAmenity(a)} /><span>{a}</span></label>
          ))}
        </div>
      </section>

      <section className="form-section">
        <h2>Title and description</h2>
        <label className="field"><span>Title</span><input className="input" value={f.title} onChange={set('title')} placeholder={suggestedTitle} maxLength={120} /></label>
        <p className="hint">Leave empty to use: “{suggestedTitle}”</p>
        <label className="field" style={{ marginTop: 14 }}><span>Description</span>
          <textarea className="input" value={f.description} onChange={set('description')} maxLength={3000} placeholder="Floor, water timing, rules, distance to college or market, who lives nearby…" />
        </label>
      </section>

      <section className="form-section">
        <h2>Contact details</h2>
        <p className="muted">Shown only to logged-in tenants who tap “Show owner’s number”.</p>
        <div className="grid-3">
          <label className="field"><span>Contact name</span><input className="input" value={f.contact_name} onChange={set('contact_name')} /></label>
          <label className="field"><span>Phone *</span><input className="input" inputMode="numeric" maxLength={10} required value={f.contact_phone || ''} onChange={set('contact_phone')} /></label>
          <label className="field"><span>WhatsApp</span><input className="input" inputMode="numeric" maxLength={10} value={f.whatsapp || ''} onChange={set('whatsapp')} /></label>
        </div>
      </section>

      <div className="form-actions">
        <a className="btn btn-ghost" href="/host">Cancel</a>
        <button className="btn btn-primary btn-lg" disabled={busy || uploading > 0}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Publish listing'}</button>
      </div>
    </form>
  );
}
