// Illustrated Bhilai skyline at sunset: steel-plant chimneys with drifting smoke,
// lit windows, a glowing sun over the water, clouds and birds. Pure SVG + CSS, no images.

function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const W = 1440;
const H = 720;
const SHORE = 560;

function buildings(seed, count, minH, maxH, minW, maxW) {
  const r = rng(seed);
  const out = [];
  let x = -20;
  while (x < W + 20 && out.length < count) {
    const w = minW + r() * (maxW - minW);
    const h = minH + r() * (maxH - minH);
    out.push({ x, w, h, r: r() });
    x += w + r() * 6;
  }
  return out;
}

export default function Skyline() {
  const far = buildings(7, 80, 40, 120, 26, 60);
  const near = buildings(42, 60, 60, 170, 34, 74);
  const r = rng(99);
  const stars = Array.from({ length: 46 }, () => ({ x: r() * W, y: r() * 230, s: 0.6 + r() * 1.4, d: r() * 4 }));
  const chimneys = [
    { x: 760, h: 300, w: 16 }, { x: 800, h: 340, w: 18 }, { x: 842, h: 320, w: 16 },
    { x: 884, h: 360, w: 18 }, { x: 1180, h: 280, w: 14 }, { x: 1214, h: 250, w: 14 },
  ];

  // Windows on near buildings, deterministic
  const wr = rng(123);
  const windows = [];
  near.forEach((b) => {
    if (b.x > 700 && b.x < 1260) return; // keep plant area clean
    for (let yy = SHORE - b.h + 12; yy < SHORE - 12; yy += 14) {
      for (let xx = b.x + 6; xx < b.x + b.w - 8; xx += 11) {
        if (wr() < 0.28) windows.push({ x: xx, y: yy, d: (wr() * 5).toFixed(2) });
      }
    }
  });

  return (
    <svg className="skyline" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#071428" />
          <stop offset=".22" stopColor="#13305a" />
          <stop offset=".42" stopColor="#47397a" />
          <stop offset=".58" stopColor="#b25a6e" />
          <stop offset=".7" stopColor="#ee8650" />
          <stop offset=".8" stopColor="#ffbd5c" />
          <stop offset="1" stopColor="#ffe2a3" />
        </linearGradient>
        <radialGradient id="sk-sunglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="1" />
          <stop offset=".35" stopColor="#ffcf6b" stopOpacity=".7" />
          <stop offset="1" stopColor="#ff9b4a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sk-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8676a" />
          <stop offset=".4" stopColor="#4a3561" />
          <stop offset="1" stopColor="#0b1f3a" />
        </linearGradient>
        <filter id="sk-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
        <filter id="sk-blur2" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="4" /></filter>
        <linearGradient id="sk-smokeg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3d9c4" />
          <stop offset="1" stopColor="#c99b8e" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#sk-sky)" />

      {stars.map((s, i) => (
        <circle key={i} className="sk-star" cx={s.x} cy={s.y} r={s.s} fill="#fff" style={{ animationDelay: `${s.d}s` }} opacity=".9" />
      ))}

      {/* Sun */}
      <circle className="sk-sun" cx="1090" cy="452" r="230" fill="url(#sk-sunglow)" />
      <circle cx="1090" cy="452" r="58" fill="#fff3cc" />

      {/* Clouds */}
      <g filter="url(#sk-blur2)" className="sk-cloud" opacity=".55">
        <ellipse cx="200" cy="170" rx="120" ry="16" fill="#f7b796" />
        <ellipse cx="260" cy="158" rx="70" ry="12" fill="#fbc8a6" />
      </g>
      <g filter="url(#sk-blur2)" className="sk-cloud slow" opacity=".45" style={{ animationDelay: '-40s' }}>
        <ellipse cx="520" cy="250" rx="160" ry="14" fill="#f29a7e" />
        <ellipse cx="600" cy="240" rx="80" ry="10" fill="#f7b796" />
      </g>
      <g filter="url(#sk-blur2)" className="sk-cloud" opacity=".4" style={{ animationDelay: '-20s' }}>
        <ellipse cx="900" cy="320" rx="140" ry="10" fill="#ffc690" />
      </g>

      {/* Far hills + far city */}
      <path d={`M0 ${SHORE - 40} Q 240 ${SHORE - 110} 480 ${SHORE - 60} T 960 ${SHORE - 70} T 1440 ${SHORE - 50} V ${SHORE} H 0 Z`} fill="#7b4f73" opacity=".55" />
      {far.map((b, i) => <rect key={i} x={b.x} y={SHORE - b.h * 0.8} width={b.w} height={b.h * 0.8} fill="#4a3461" opacity=".85" />)}

      {/* Steel plant */}
      <g fill="#22213f">
        {chimneys.map((c, i) => (
          <g key={i}>
            <path d={`M${c.x} ${SHORE} L${c.x + 2} ${SHORE - c.h} H${c.x + c.w - 2} L${c.x + c.w} ${SHORE} Z`} />
            <rect x={c.x + 1} y={SHORE - c.h + 16} width={c.w - 2} height="7" fill="#c4473b" opacity=".85" />
            <rect x={c.x + 1} y={SHORE - c.h + 34} width={c.w - 2} height="5" fill="#e9dccf" opacity=".5" />
            <circle className="sk-beacon" cx={c.x + c.w / 2} cy={SHORE - c.h - 4} r="3" fill="#ff4d3d" style={{ animationDelay: `${i * 0.3}s` }} />
          </g>
        ))}
        {/* blast furnaces & sheds */}
        <rect x="700" y={SHORE - 120} width="60" height="120" />
        <rect x="910" y={SHORE - 150} width="110" height="150" />
        <path d={`M940 ${SHORE - 150} L955 ${SHORE - 210} H985 L1000 ${SHORE - 150} Z`} />
        <rect x="1020" y={SHORE - 95} width="160" height="95" />
        <path d={`M1030 ${SHORE - 95} L1030 ${SHORE - 125} L1080 ${SHORE - 95} L1080 ${SHORE - 125} L1130 ${SHORE - 95} L1130 ${SHORE - 125} L1180 ${SHORE - 95} Z`} />
        {/* cooling tower */}
        <path d={`M1250 ${SHORE} C1262 ${SHORE - 70} 1262 ${SHORE - 120} 1255 ${SHORE - 170} H1335 C1328 ${SHORE - 120} 1328 ${SHORE - 70} 1340 ${SHORE} Z`} />
        {/* pipes */}
        <rect x="760" y={SHORE - 90} width="150" height="8" />
        <rect x="1020" y={SHORE - 130} width="230" height="6" />
      </g>
      {/* plant lights */}
      {[[720, 470], [735, 500], [930, 440], [960, 470], [990, 455], [1050, 500], [1100, 510], [1150, 500], [1290, 470]].map(([x, y], i) => (
        <circle key={i} className="sk-win" cx={x} cy={y} r="2.4" fill="#ffd27a" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}

      {/* Smoke */}
      <g filter="url(#sk-blur)" opacity=".8">
      {chimneys.slice(0, 4).map((c, i) =>
        [0, 1, 2].map((k) => (
          <circle key={`${i}-${k}`} className="sk-smoke" cx={c.x + c.w / 2} cy={SHORE - c.h - 10} r="14" fill="url(#sk-smokeg)" style={{ animationDelay: `${i * 0.9 + k * 2.3}s` }} />
        )),
      )}
      {[0, 1, 2].map((k) => (
        <circle key={`ct-${k}`} className="sk-smoke" cx="1295" cy={SHORE - 180} r="22" fill="#f3e2d4" style={{ animationDelay: `${k * 2.4}s`, animationDuration: '8s' }} />
      ))}
      </g>

      {/* Near city */}
      {near.filter((b) => b.x < 700 || b.x > 1360).map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={SHORE - b.h} width={b.w} height={b.h} fill="#0f1c36" />
          {b.r > 0.7 && <rect x={b.x + b.w / 2 - 1} y={SHORE - b.h - 18} width="2" height="18" fill="#0f1c36" />}
        </g>
      ))}
      {windows.map((w, i) => (
        <rect key={i} className="sk-win" x={w.x} y={w.y} width="5" height="7" fill="#ffd27a" style={{ animationDelay: `${w.d}s` }} opacity=".9" />
      ))}

      {/* Water */}
      <rect y={SHORE} width={W} height={H - SHORE} fill="url(#sk-water)" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} className="sk-shimmer" x={1090 - (70 - i * 6)} y={SHORE + 8 + i * 15} width={(70 - i * 6) * 2} height="3" rx="1.5" fill="#ffe4a3" opacity={0.9 - i * 0.08} style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={`l${i}`} className="sk-shimmer" x={(i * 113) % W} y={SHORE + 20 + ((i * 37) % 120)} width={40 + (i % 4) * 18} height="2" rx="1" fill="#ffd27a" opacity=".35" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}

      {/* Shore trees, left */}
      <g fill="#081429">
        <path d={`M0 ${SHORE + 6} Q 80 ${SHORE - 30} 160 ${SHORE + 4} Q 220 ${SHORE - 20} 300 ${SHORE + 8} V ${SHORE + 14} H0 Z`} />
        {[30, 70, 120, 190, 240].map((x, i) => (
          <g key={i}>
            <rect x={x} y={SHORE - 40} width="4" height="40" />
            <circle cx={x + 2} cy={SHORE - 48} r={16 + (i % 2) * 6} />
          </g>
        ))}
      </g>

      {/* Birds */}
      <g className="sk-birds" stroke="#1b1633" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path className="sk-wing" d="M0 200 q8 -8 16 0 q8 -8 16 0" />
        <path className="sk-wing" d="M40 220 q6 -6 12 0 q6 -6 12 0" style={{ animationDelay: '.2s' }} />
        <path className="sk-wing" d="M-30 232 q6 -6 12 0 q6 -6 12 0" style={{ animationDelay: '.1s' }} />
      </g>
    </svg>
  );
}
