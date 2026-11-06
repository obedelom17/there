import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { saveYes } from "@/lib/admin.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thérèse, veux-tu m'épouser ? — Wilfried" },
      { name: "description", content: "Une lettre d'amour de Wilfried pour AGOUDA Thérèse." },
      { property: "og:title", content: "Thérèse, veux-tu m'épouser ?" },
      { property: "og:description", content: "Une question, un cœur, une vie entière." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const NO_TEXTS = [
  "Non", "Tu es sûre ?", "Vraiment ?", "Réfléchis encore…", "Mon cœur tremble 🥺",
  "Impossible !", "Le destin dit oui", "Attrape-moi si tu peux 😜", "Même les étoiles refusent",
  "Essaie encore…", "Non n'existe pas ici 💕",
];

const POEM = [
  "Thérèse, depuis que tes yeux ont croisé les miens,",
  "les jours ont pris la couleur des matins sereins.",
  "Ton rire est une rivière où mon âme se baigne,",
  "ta voix, une prière que le ciel enseigne.",
  "J'ai cherché dans les astres un mot assez grand,",
  "ils m'ont tous répondu : « Offre-lui ton serment. »",
];

function Hearts() {
  const hearts = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({
      left: Math.random() * 100, size: 12 + Math.random() * 26,
      dur: 9 + Math.random() * 12, delay: -Math.random() * 20, i,
    })), []);
  const stars = useMemo(
    () => Array.from({ length: 60 }, () => ({
      left: Math.random() * 100, top: Math.random() * 100, d: Math.random() * 3,
    })), []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span key={`s${i}`} className="absolute h-0.5 w-0.5 rounded-full bg-gold animate-twinkle"
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.d}s` }} />
      ))}
      {hearts.map((h) => (
        <span key={h.i} className="absolute bottom-[-40px] text-primary animate-float-up"
          style={{ left: `${h.left}%`, fontSize: h.size, animationDuration: `${h.dur}s`, animationDelay: `${h.delay}s`, opacity: 0.6 }}>
          ❤
        </span>
      ))}
    </div>
  );
}

function Burst() {
  const parts = useMemo(() => Array.from({ length: 70 }, () => {
    const a = Math.random() * Math.PI * 2, r = 200 + Math.random() * 500;
    return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, s: 14 + Math.random() * 26, e: ["❤", "💖", "✨", "💍", "🌹"][Math.floor(Math.random() * 5)] };
  }), []);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {parts.map((p, i) => (
        <span key={i} className="absolute animate-burst"
          style={{ fontSize: p.s, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px` }}>{p.e}</span>
      ))}
    </div>
  );
}

function Petals() {
  const petals = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    left: Math.random() * 100, dur: 10 + Math.random() * 10, delay: -Math.random() * 20, s: 14 + Math.random() * 14, i,
  })), []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {petals.map((p) => (
        <span key={p.i} className="absolute top-[-40px] animate-petal-fall"
          style={{ left: `${p.left}%`, fontSize: p.s, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>🌸</span>
      ))}
    </div>
  );
}

function CursorTrail() {
  const [items, setItems] = useState<{ id: number; x: number; y: number }[]>([]);
  useEffect(() => {
    let id = 0, last = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      const it = { id: id++, x: e.clientX, y: e.clientY };
      setItems((a) => [...a.slice(-14), it]);
      setTimeout(() => setItems((a) => a.filter((x) => x.id !== it.id)), 1000);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {items.map((it) => (
        <span key={it.id} className="absolute text-primary animate-trail" style={{ left: it.x, top: it.y }}>❤</span>
      ))}
    </div>
  );
}

function Index() {
  const [yes, setYes] = useState(false);
  const [count, setCount] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(() => setReady(true), 5200);
    return () => clearTimeout(t);
  }, [opened]);

  const flee = (cx?: number, cy?: number) => {
    const b = noRef.current;
    if (!b || !ready) return;
    const r = b.getBoundingClientRect();
    const W = window.innerWidth, H = window.innerHeight, m = 20;
    let x = 0, y = 0;
    for (let t = 0; t < 20; t++) {
      x = m + Math.random() * (W - r.width - 2 * m);
      y = m + Math.random() * (H - r.height - 2 * m);
      if (cx === undefined || Math.hypot(x + r.width / 2 - cx, y + r.height / 2 - (cy ?? 0)) > 220) break;
    }
    setPos({ x, y });
    setCount((c) => c + 1);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const b = noRef.current;
      if (!b || yes || !ready) return;
      const r = b.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (d < 110) flee(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  });

  const noBtn = (
<button ref={noRef}
            onMouseEnter={(e) => flee(e.clientX, e.clientY)}
            onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; flee(t?.clientX, t?.clientY); }}
            onFocus={() => flee()}
            onClick={(e) => { e.preventDefault(); flee(); }}
            style={pos ? { position: "fixed", left: pos.x, top: pos.y, zIndex: 40, transition: "left .35s cubic-bezier(.2,.9,.3,1.3), top .35s cubic-bezier(.2,.9,.3,1.3)" } : undefined}
            className="rounded-full border border-border bg-muted/60 px-8 py-4 font-body text-lg text-muted-foreground backdrop-blur ">
            {NO_TEXTS[count % NO_TEXTS.length]}
          </button>
  );

  const yesScale = Math.min(1 + count * 0.08, 1.9);

  if (yes) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Hearts /><Petals /><CursorTrail /><Burst />
        <div className="relative z-10 max-w-2xl animate-fade-rise">
          <div className="mb-6 text-7xl animate-pulse-heart">💍</div>
          <h1 className="font-script text-6xl md:text-8xl text-love leading-tight">Elle a dit oui</h1>
          <p className="mt-8 font-display text-2xl md:text-3xl italic text-foreground/90 leading-relaxed">
            Thérèse, à partir d'aujourd'hui,<br />chaque aube portera ton nom,<br />
            chaque étoile gardera notre promesse,<br />et mon cœur, pour toujours, sera ta maison.
          </p>
          <p className="mt-10 font-script text-4xl text-gold">— Wilfried, à jamais tien</p>
        </div>
      </main>
    );
  }

  if (!opened) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Hearts /><CursorTrail />
        <div className="relative z-10 flex flex-col items-center animate-fade-rise">
          <p className="font-body text-xs uppercase tracking-[0.5em] text-gold">Une lettre scellée pour</p>
          <h1 className="mt-4 font-script text-6xl md:text-7xl text-love">Thérèse</h1>
          <button onClick={() => setOpened(true)} aria-label="Ouvrir la lettre"
            className="group relative mt-12 h-48 w-72 rounded-xl bg-envelope shadow-glow transition-transform duration-700 ease-out hover:-translate-y-2 hover:rotate-[-2deg] animate-float-soft">
            <span className="absolute inset-x-0 top-0 h-0 border-x-[144px] border-t-[100px] border-x-transparent border-t-envelope-flap" />
            <span className="absolute left-1/2 top-[78px] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-love text-2xl shadow-glow transition-transform duration-500 group-hover:scale-110 animate-pulse-heart">❤</span>
          </button>
          <p className="mt-10 font-display text-xl italic text-muted-foreground">Touche le sceau, mon amour…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <Hearts /><Petals /><CursorTrail />
      {pos && noBtn}
      <div className="relative z-10 max-w-3xl rounded-[2rem] border border-border bg-letter px-6 py-14 shadow-glow backdrop-blur-md md:px-16 animate-letter-open">
        <p className="font-body text-xs uppercase tracking-[0.5em] text-gold animate-fade-rise">Pour AGOUDA Thérèse</p>
        <h1 className="mt-6 font-script text-6xl md:text-8xl text-love animate-fade-rise" style={{ animationDelay: ".3s" }}>
          Ma Thérèse
        </h1>
        <div className="mt-10 space-y-3">
          {POEM.map((l, i) => (
            <p key={i} className="font-display text-xl md:text-2xl italic text-muted-foreground animate-fade-rise"
              style={{ animationDelay: `${0.8 + i * 0.45}s` }}>{l}</p>
          ))}
        </div>
        <h2 className="mt-14 font-display text-4xl md:text-6xl font-semibold animate-fade-rise" style={{ animationDelay: "3.8s" }}>
          Veux-tu m'épouser ?
        </h2>
        <div className="mt-12 flex min-h-24 items-center justify-center gap-6 animate-fade-rise" style={{ animationDelay: "4.4s" }}>
          <button onClick={() => { setYes(true); saveYes({ data: { noAttempts: count } }).catch(() => {}); }}
            style={{ transform: `scale(${yesScale})` }}
            className="rounded-full bg-love px-10 py-4 font-body text-lg font-semibold text-primary-foreground shadow-glow transition-transform duration-500 ease-out hover:brightness-110 animate-pulse-heart">
            Oui, pour toujours ❤
          </button>
          {!pos && noBtn}
          {pos && <span className="invisible px-8 py-4">Non</span>}
        </div>
        <p className="mt-16 font-script text-3xl text-gold animate-fade-rise" style={{ animationDelay: "5s" }}>— Wilfried</p>
      </div>
    </main>
  );
}
