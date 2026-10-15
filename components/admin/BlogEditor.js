'use client';
import { useMemo, useState } from 'react';
import { marked } from 'marked';
import { CITIES } from '@/lib/locations';

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 70);

export default function BlogEditor({ initial }) {
  const editing = Boolean(initial?.id);
  const [b, setB] = useState({
    title: '', slug: '', excerpt: '', content: '', cover_image: '', tags: '', city: '', faq: [], status: 'draft', author: 'Durg Bhilai Flats Team', seo_title: '', seo_description: '',
    ...(initial || {}),
    tags: Array.isArray(initial?.tags) ? initial.tags.join(', ') : initial?.tags || '',
  });
  const [slugTouched, setSlugTouched] = useState(editing);
  const [tab, setTab] = useState('write');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setB((s) => ({ ...s, [k]: e.target.value }));
  const preview = useMemo(() => (tab === 'preview' ? marked.parse(b.content.replace(/</g, '&lt;')) : ''), [tab, b.content]);
  const words = b.content.split(/\s+/).filter(Boolean).length;

  async function uploadCover(file) {
    const fd = new FormData(); fd.append('file', file); fd.append('folder', 'blog');
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    const d = await r.json();
    if (r.ok) setB((s) => ({ ...s, cover_image: d.url })); else setMsg({ ok: false, t: d.error });
  }

  async function save(status) {
    setBusy(true); setMsg(null);
    const payload = { ...b, status: status || b.status, faq: b.faq.filter((f) => f.q && f.a) };
    const r = await fetch(editing ? `/api/admin/blogs/${initial.id}` : '/api/admin/blogs', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, t: d.error });
    if (!editing) { window.location.href = `/admin/blog/${d.blog.id}?created=1`; return; }
    setB((s) => ({ ...s, status: d.blog.status }));
    setMsg({ ok: true, t: d.blog.status === 'published' ? 'Saved and live.' : 'Draft saved.' });
  }

  async function del() {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/admin/blogs/${initial.id}`, { method: 'DELETE' });
    window.location.href = '/admin/blog';
  }

  const faq = b.faq || [];
  const setFaq = (i, k, v) => setB((s) => ({ ...s, faq: s.faq.map((f, j) => (j === i ? { ...f, [k]: v } : f)) }));

  return (
    <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0,1fr)', gap: 20 }}>
      {msg && <p className={`notice ${msg.ok ? 'notice-ok' : 'notice-err'}`}>{msg.t}</p>}
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1fr)' }} className="blog-editor">
        <section className="form-section">
          <label className="field"><span>Title</span>
            <input className="input" style={{ fontSize: '1.2rem', fontWeight: 600 }} value={b.title} onChange={(e) => { const t = e.target.value; setB((s) => ({ ...s, title: t, slug: slugTouched ? s.slug : slugify(t) })); }} placeholder="PG vs flat in Bhilai: which is better for students?" />
          </label>
          <label className="field" style={{ marginTop: 12 }}><span>URL</span>
            <div className="row" style={{ flexWrap: 'nowrap', gap: 6 }}><span className="small muted">/blog/</span><input className="input" value={b.slug} onChange={(e) => { setSlugTouched(true); setB((s) => ({ ...s, slug: slugify(e.target.value) })); }} /></div>
          </label>
          <label className="field" style={{ marginTop: 12 }}><span>Short summary (shown in lists and Google)</span><textarea className="input" style={{ minHeight: 70 }} maxLength={300} value={b.excerpt} onChange={set('excerpt')} /></label>
        </section>

        <section className="form-section">
          <div className="row between" style={{ marginBottom: 10 }}>
            <div className="mode-switch"><button type="button" aria-pressed={tab === 'write'} onClick={() => setTab('write')}>Write</button><button type="button" aria-pressed={tab === 'preview'} onClick={() => setTab('preview')}>Preview</button></div>
            <span className="xs muted">{words} words · Markdown: ## heading, **bold**, - list, [link](url)</span>
          </div>
          {tab === 'write'
            ? <textarea className="input" style={{ minHeight: 460, fontFamily: 'ui-monospace, monospace', fontSize: '0.92rem', lineHeight: 1.6 }} value={b.content} onChange={set('content')} placeholder={'Start with a 2–3 sentence direct answer to the question in the title.\n\n## First section\n\nText…'} />
            : <div className="prose" style={{ minHeight: 460 }} dangerouslySetInnerHTML={{ __html: preview || '<p class="muted">Nothing to preview.</p>' }} />}
          <p className="hint">Tip for Google & AI answers: open with a short, direct answer, use question-style ## headings, and name real areas (Supela, Smriti Nagar, near BIT Durg).</p>
        </section>

        <section className="form-section">
          <h2>FAQ (adds FAQ rich results)</h2>
          {faq.map((f, i) => (
            <div key={i} className="stack" style={{ borderTop: i ? '1px solid var(--line)' : 0, paddingTop: i ? 12 : 0, marginTop: i ? 12 : 0 }}>
              <input className="input" placeholder="Question" value={f.q} onChange={(e) => setFaq(i, 'q', e.target.value)} />
              <textarea className="input" style={{ minHeight: 70 }} placeholder="Answer (2–3 sentences)" value={f.a} onChange={(e) => setFaq(i, 'a', e.target.value)} />
              <button type="button" className="linkbtn xs" style={{ color: 'var(--danger)', justifySelf: 'start' }} onClick={() => setB((s) => ({ ...s, faq: s.faq.filter((_, j) => j !== i) }))}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setB((s) => ({ ...s, faq: [...(s.faq || []), { q: '', a: '' }] }))}>+ Add question</button>
        </section>

        <section className="form-section">
          <h2>Details & SEO</h2>
          <div className="grid-2">
            <label className="field"><span>Tags (comma separated)</span><input className="input" value={b.tags} onChange={set('tags')} placeholder="students, PG, Bhilai" /></label>
            <label className="field"><span>City</span><select className="input" value={b.city || ''} onChange={set('city')}><option value="">All Chhattisgarh</option>{CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
            <label className="field"><span>Author</span><input className="input" value={b.author} onChange={set('author')} /></label>
            <div className="field"><span className="label">Cover image (optional)</span>
              <div className="row">{b.cover_image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_image} alt="" style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 6 }} />}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files[0] && uploadCover(e.target.files[0])} className="small" />
                {b.cover_image && <button type="button" className="linkbtn xs" onClick={() => setB((s) => ({ ...s, cover_image: '' }))}>remove</button>}</div>
            </div>
          </div>
          <label className="field" style={{ marginTop: 14 }}><span>SEO title <span className="muted">({(b.seo_title || '').length}/60)</span></span><input className="input" maxLength={70} value={b.seo_title || ''} onChange={set('seo_title')} placeholder={b.title} /></label>
          <label className="field" style={{ marginTop: 12 }}><span>Meta description <span className="muted">({(b.seo_description || '').length}/160)</span></span><textarea className="input" style={{ minHeight: 70 }} maxLength={170} value={b.seo_description || ''} onChange={set('seo_description')} placeholder={b.excerpt} /></label>
        </section>
      </div>
      <div className="form-actions">
        {editing && <button type="button" className="btn btn-danger" onClick={del}>Delete</button>}
        <span className="grow small muted">Status: <b>{b.status}</b>{editing && b.status === 'published' && <> · <a href={`/blog/${b.slug}`} target="_blank">View post</a></>}</span>
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => save('draft')}>{b.status === 'published' ? 'Unpublish' : 'Save draft'}</button>
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save('published')}>{b.status === 'published' ? 'Update' : 'Publish'}</button>
      </div>
    </div>
  );
}
