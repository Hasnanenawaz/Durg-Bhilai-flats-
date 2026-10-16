// Small illustrated rooms used for category cards, listing thumbnails and
// listings without photos. kind: flat | pg | room | flatmate. uid keeps gradient ids unique.

function Flat({ u }) {
  return (
    <>
      <defs>
        <linearGradient id={`${u}-win`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b4b86" /><stop offset=".55" stopColor="#f08a5d" /><stop offset="1" stopColor="#ffd27a" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="#f3e6d6" />
      <rect y="196" width="400" height="54" fill="#c98f5b" />
      <rect y="192" width="400" height="6" fill="#e9d3b8" />
      {/* window with city view */}
      <rect x="34" y="34" width="124" height="112" rx="6" fill={`url(#${u}-win)`} />
      <path d="M34 146 V118 h14 v-12 h12 v18 h10 v-30 h8 v30 h14 v-16 h10 v-14 h6 v30 h14 v-8 h12 v22 h20 v10 z" fill="#1b2a4a" opacity=".85" />
      <circle cx="128" cy="98" r="12" fill="#fff1c6" opacity=".9" />
      <rect x="34" y="34" width="124" height="112" rx="6" fill="none" stroke="#fff" strokeWidth="6" />
      <line x1="96" y1="34" x2="96" y2="146" stroke="#fff" strokeWidth="4" />
      <rect className="sc-curtain" x="20" y="24" width="22" height="134" rx="4" fill="#1d4a86" />
      <rect className="sc-curtain" x="150" y="24" width="22" height="134" rx="4" fill="#1d4a86" style={{ animationDelay: '-3s' }} />
      <rect x="14" y="20" width="166" height="6" rx="3" fill="#0b1f3a" />
      {/* frame on wall */}
      <rect x="246" y="52" width="70" height="46" rx="4" fill="#fff" stroke="#0b1f3a" strokeWidth="3" />
      <path d="M252 92 l18 -20 12 12 10 -8 18 16z" fill="#ffc21a" />
      {/* rug */}
      <ellipse cx="250" cy="226" rx="120" ry="14" fill="#e8663a" opacity=".85" />
      {/* sofa */}
      <rect x="176" y="122" width="168" height="54" rx="16" fill="#13305a" />
      <rect x="168" y="150" width="184" height="40" rx="12" fill="#1d4a86" />
      <rect x="162" y="140" width="24" height="50" rx="10" fill="#13305a" />
      <rect x="334" y="140" width="24" height="50" rx="10" fill="#13305a" />
      <rect x="196" y="134" width="40" height="30" rx="8" fill="#ffc21a" transform="rotate(-8 216 149)" />
      <rect x="290" y="134" width="40" height="30" rx="8" fill="#e8663a" transform="rotate(8 310 149)" />
      <rect x="178" y="190" width="8" height="10" fill="#0b1f3a" /><rect x="336" y="190" width="8" height="10" fill="#0b1f3a" />
      {/* plant */}
      <g className="sc-sway">
        <path d="M120 186 C 108 160 92 150 86 132 C 104 140 116 156 122 176 Z" fill="#2f8f5b" />
        <path d="M126 186 C 130 156 142 140 160 130 C 152 152 140 168 130 184 Z" fill="#3fa96c" />
        <path d="M122 186 C 118 150 120 130 124 112 C 132 132 132 160 126 186 Z" fill="#257a4c" />
      </g>
      <path d="M106 184 h36 l-6 26 h-24 z" fill="#e0740b" />
      {/* floor lamp */}
      <circle className="sc-glow" cx="378" cy="96" r="34" fill="#ffd27a" opacity=".6" />
      <line x1="378" y1="104" x2="378" y2="198" stroke="#0b1f3a" strokeWidth="4" />
      <rect x="366" y="196" width="24" height="5" rx="2" fill="#0b1f3a" />
      <path d="M362 104 l8 -26 h16 l8 26 z" fill="#ffc21a" />
    </>
  );
}

function Room({ u }) {
  return (
    <>
      <defs>
        <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc0f0" /><stop offset="1" stopColor="#d9efff" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="#e6eefb" />
      <rect y="200" width="400" height="50" fill="#b07a50" />
      <rect y="196" width="400" height="6" fill="#d9c2a5" />
      {/* window */}
      <rect x="276" y="36" width="96" height="92" rx="6" fill={`url(#${u}-sky)`} />
      <ellipse className="sc-curtain" cx="304" cy="64" rx="18" ry="6" fill="#fff" opacity=".9" />
      <rect x="276" y="36" width="96" height="92" rx="6" fill="none" stroke="#fff" strokeWidth="6" />
      <line x1="324" y1="36" x2="324" y2="128" stroke="#fff" strokeWidth="4" />
      {/* shelf with books */}
      <rect x="60" y="54" width="120" height="6" rx="2" fill="#0b1f3a" />
      {[['#e0740b', 14, 30], ['#4353d9', 12, 36], ['#0d8a87', 16, 28], ['#d43f69', 10, 34], ['#ffc21a', 14, 30]].map(([c, w, h], i, a) => {
        const x = 66 + a.slice(0, i).reduce((s, b) => s + b[1] + 3, 0);
        return <rect key={i} x={x} y={54 - h} width={w} height={h} rx="2" fill={c} />;
      })}
      <circle cx="160" cy="40" r="10" fill="#2f8f5b" /><rect x="154" y="44" width="12" height="10" rx="2" fill="#e8663a" />
      {/* bed */}
      <rect x="56" y="100" width="210" height="72" rx="14" fill="#13305a" />
      <rect x="50" y="150" width="228" height="42" rx="10" fill="#ffffff" />
      <rect x="140" y="146" width="138" height="48" rx="10" fill="#ffc21a" />
      <path d="M140 160 h138" stroke="#f2a900" strokeWidth="3" />
      <rect x="70" y="132" width="56" height="26" rx="12" fill="#fff" stroke="#e1e7f0" strokeWidth="2" />
      <rect x="62" y="190" width="10" height="12" fill="#0b1f3a" /><rect x="258" y="190" width="10" height="12" fill="#0b1f3a" />
      {/* side table + lamp */}
      <rect x="290" y="160" width="58" height="40" rx="4" fill="#8a5a3a" />
      <rect x="296" y="172" width="46" height="4" fill="#6c442b" />
      <circle className="sc-glow" cx="320" cy="132" r="26" fill="#ffd27a" opacity=".55" />
      <rect x="317" y="138" width="6" height="22" fill="#0b1f3a" />
      <path d="M304 140 l6 -22 h20 l6 22 z" fill="#ffc21a" />
      {/* slippers */}
      <ellipse cx="200" cy="222" rx="12" ry="5" fill="#d43f69" /><ellipse cx="222" cy="226" rx="12" ry="5" fill="#d43f69" />
    </>
  );
}

function Pg({ u }) {
  return (
    <>
      <defs>
        <linearGradient id={`${u}-scr`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9fd3ff" /><stop offset="1" stopColor="#4353d9" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="#fdf0e2" />
      <rect y="204" width="400" height="46" fill="#9c6b48" />
      <rect y="200" width="400" height="6" fill="#e8cfb2" />
      {/* bunk bed */}
      <g fill="#0b1f3a">
        <rect x="24" y="40" width="8" height="166" /><rect x="150" y="40" width="8" height="166" />
      </g>
      <rect x="32" y="84" width="118" height="22" rx="6" fill="#4353d9" />
      <rect x="38" y="74" width="34" height="14" rx="6" fill="#fff" />
      <rect x="32" y="160" width="118" height="22" rx="6" fill="#0d8a87" />
      <rect x="38" y="150" width="34" height="14" rx="6" fill="#fff" />
      <rect x="26" y="104" width="130" height="5" fill="#0b1f3a" /><rect x="26" y="180" width="130" height="5" fill="#0b1f3a" />
      {[50, 70, 90].map((y) => <rect key={y} x="150" y={y + 60} width="20" height="3" fill="#0b1f3a" />)}
      {/* notice board */}
      <rect x="196" y="36" width="96" height="62" rx="6" fill="#c98f5b" stroke="#8a5a3a" strokeWidth="4" />
      <rect x="206" y="46" width="22" height="20" fill="#ffc21a" transform="rotate(-6 217 56)" />
      <rect x="236" y="48" width="22" height="20" fill="#d43f69" transform="rotate(5 247 58)" />
      <rect x="264" y="46" width="20" height="20" fill="#9fd3ff" transform="rotate(-4 274 56)" />
      <rect x="218" y="72" width="26" height="18" fill="#fff" transform="rotate(4 231 81)" />
      {/* desk */}
      <rect x="190" y="150" width="190" height="10" rx="3" fill="#6c442b" />
      <rect x="198" y="160" width="8" height="44" fill="#6c442b" /><rect x="364" y="160" width="8" height="44" fill="#6c442b" />
      {/* laptop */}
      <rect className="sc-screen" x="214" y="108" width="72" height="44" rx="4" fill={`url(#${u}-scr)`} stroke="#0b1f3a" strokeWidth="4" />
      <rect x="206" y="148" width="88" height="5" rx="2" fill="#0b1f3a" />
      {/* thali with steam */}
      <ellipse cx="336" cy="146" rx="32" ry="7" fill="#c9ccd6" />
      <ellipse cx="336" cy="143" rx="28" ry="5" fill="#e8ebf2" />
      <circle cx="324" cy="142" r="5" fill="#e0740b" /><circle cx="338" cy="141" r="5" fill="#ffc21a" /><circle cx="350" cy="142" r="5" fill="#2f8f5b" />
      <ellipse cx="336" cy="137" rx="9" ry="4" fill="#fff" />
      {[322, 336, 350].map((x, i) => (
        <path key={x} className="sc-steam" d={`M${x} 128 q-6 -10 0 -20 q6 -10 0 -20`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
      {/* chair */}
      <rect x="250" y="168" width="48" height="8" rx="3" fill="#e0740b" />
      <rect x="254" y="176" width="5" height="28" fill="#0b1f3a" /><rect x="289" y="176" width="5" height="28" fill="#0b1f3a" />
      {/* hanging bulb */}
      <line x1="330" y1="0" x2="330" y2="40" stroke="#0b1f3a" strokeWidth="2" />
      <circle className="sc-glow" cx="330" cy="48" r="22" fill="#ffd27a" opacity=".55" />
      <circle cx="330" cy="48" r="8" fill="#ffc21a" />
    </>
  );
}

function Flatmate() {
  const bulbs = [30, 80, 130, 180, 230, 280, 330, 380];
  return (
    <>
      <rect width="400" height="250" fill="#e3f4f0" />
      <rect y="206" width="400" height="44" fill="#c98f5b" />
      <rect y="202" width="400" height="6" fill="#e9d3b8" />
      {/* string lights */}
      <path d="M0 22 Q 100 52 200 26 T 400 24" stroke="#0b1f3a" strokeWidth="2" fill="none" />
      {bulbs.map((x, i) => (
        <circle key={x} className="sc-blink" cx={x} cy={i % 2 ? 36 : 40} r="5" fill={['#ffc21a', '#d43f69', '#4353d9', '#0d8a87'][i % 4]} style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
      {/* person left (waving) */}
      <circle cx="96" cy="104" r="20" fill="#8d5a3b" />
      <path d="M76 96 q20 -24 40 0 q-6 -14 -20 -14 q-14 0 -20 14z" fill="#1b1633" />
      <rect x="70" y="126" width="52" height="64" rx="20" fill="#4353d9" />
      <rect className="sc-wave" x="60" y="92" width="12" height="40" rx="6" fill="#4353d9" />
      <circle className="sc-wave" cx="66" cy="88" r="7" fill="#8d5a3b" />
      {/* person middle */}
      <circle cx="200" cy="92" r="22" fill="#c68b62" />
      <path d="M178 92 q2 -30 22 -30 q22 0 24 30 q-4 -16 -24 -16 q-18 0 -22 16z" fill="#2a1c14" />
      <rect x="172" y="116" width="56" height="70" rx="22" fill="#d43f69" />
      {/* person right */}
      <circle cx="304" cy="104" r="20" fill="#e2b48c" />
      <path d="M284 100 q2 -26 20 -26 q20 0 22 26 q-2 30 6 40 q-14 -6 -14 -30 q-10 -10 -26 -6z" fill="#3a2418" />
      <rect x="278" y="126" width="52" height="64" rx="20" fill="#ffc21a" />
      {/* table */}
      <rect x="40" y="168" width="320" height="14" rx="6" fill="#13305a" />
      <rect x="70" y="182" width="10" height="26" fill="#0b1f3a" /><rect x="320" y="182" width="10" height="26" fill="#0b1f3a" />
      {/* chai cups with steam */}
      {[120, 200, 280].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 10} 152 h20 l-3 16 h-14 z`} fill="#fff" stroke="#c9ccd6" strokeWidth="1.5" />
          <path d={`M${x + 10} 156 q8 2 0 8`} stroke="#c9ccd6" strokeWidth="2" fill="none" />
          <path className="sc-steam" d={`M${x} 148 q-5 -8 0 -16 q5 -8 0 -16`} stroke="#8aa3c2" strokeWidth="2.5" fill="none" strokeLinecap="round" style={{ animationDelay: `${i * 0.5}s` }} />
        </g>
      ))}
      {/* snacks */}
      <ellipse cx="240" cy="166" rx="16" ry="4" fill="#e0740b" />
      <ellipse cx="160" cy="166" rx="14" ry="4" fill="#2f8f5b" />
    </>
  );
}

const MAP = { flat: Flat, room: Room, pg: Pg, flatmate: Flatmate };

export default function Scene({ kind = 'flat', uid, title, className }) {
  const C = MAP[kind] || Flat;
  const u = `sc-${kind}-${uid || 'x'}`;
  return (
    <svg className={className} viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <C u={u} />
    </svg>
  );
}
