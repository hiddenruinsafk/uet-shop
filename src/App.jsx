import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";


const LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAHYBCoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AIyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//9k=";
const DEFAULT_CATS = ["Pittura","Scultura","Fotografia","Illustrazione","Ceramica","Gioielli","Tessile","Altro"].map(name => ({ name, private: false }));
const PER = 12;
const DEF_PWD = "atelier2024";

const uid = () => Math.random().toString(36).slice(2,9) + Date.now().toString(36);
const resizeImg = (file, max = 1100) => new Promise(res => {
  const img = new Image(), c = document.createElement("canvas");
  img.onload = () => {
    const s = Math.min(max / Math.max(img.width, img.height), 1);
    c.width = img.width * s; c.height = img.height * s;
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    res(c.toDataURL("image/jpeg", 0.82));
  };
  img.src = URL.createObjectURL(file);
});
const eur = n => "€" + parseFloat(n||0).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/* ═══════════════════════════════════════════════════════════════
   FIREBASE CONFIG
   Sostituisci i valori con le credenziali del tuo progetto.
   Firebase Console → Project Settings → Your apps → Web app
═══════════════════════════════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAIzjsrOR5Ba0gsN3K0f-tEc1WF9ctjtH8",
  authDomain:        "uet-store.firebaseapp.com",
  projectId:         "uet-store",
  storageBucket:     "uet-store.firebasestorage.app",
  messagingSenderId: "521624004144",
  appId:             "1:521624004144:web:f1c9d51730b41842102ff5"
};

const _fbApp = initializeApp(FIREBASE_CONFIG);
const _fs    = getFirestore(_fbApp);
const _col   = "atelier"; // Firestore collection name

/* ─── STORAGE (Firestore — sincronizzato su tutti i dispositivi) ─── */
const db = {
  async get(k, d = null) {
    try {
      const snap = await getDoc(doc(_fs, _col, k));
      return snap.exists() ? JSON.parse(snap.data().v) : d;
    } catch { return d; }
  },
  async set(k, v) {
    try {
      await setDoc(doc(_fs, _col, k), { v: JSON.stringify(v) });
      return true;
    } catch { return false; }
  },
  // Ogni prodotto ha il suo documento separato (per gestire le immagini)
  async getProducts() {
    try {
      const listSnap = await getDoc(doc(_fs, _col, "__list"));
      if (!listSnap.exists()) return [];
      const ids = JSON.parse(listSnap.data().v);
      const snaps = await Promise.all(ids.map(id => getDoc(doc(_fs, _col, `__p_${id}`))));
      return snaps.filter(s => s.exists()).map(s => JSON.parse(s.data().v));
    } catch { return []; }
  },
  async saveProducts(products) {
    try {
      await Promise.all(products.map(p =>
        setDoc(doc(_fs, _col, `__p_${p.id}`), { v: JSON.stringify(p) })
      ));
      await setDoc(doc(_fs, _col, "__list"), { v: JSON.stringify(products.map(p => p.id)) });
      return true;
    } catch { return false; }
  }
};

/* ─── EMAIL ─── */
async function notifyOrder(cfg, order) {
  if (!cfg?.svcId || !cfg?.tplId || !cfg?.pubKey || !cfg?.ownerEmail) return false;
  try {
    const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: cfg.svcId, template_id: cfg.tplId, user_id: cfg.pubKey,
        template_params: {
          to_email: cfg.ownerEmail,
          ordine_id: order.id.slice(-8).toUpperCase(),
          data: new Date(order.date).toLocaleString("it-IT"),
          nome: order.s.name, email_cliente: order.s.email,
          telefono: order.s.phone || "—",
          indirizzo: `${order.s.address}, ${order.s.zip} ${order.s.city}, ${order.s.country}`,
          prodotti: order.items.map(i => `• ${i.title}: ${eur(i.price)}`).join("\n"),
          totale: eur(order.items.reduce((a, i) => a + parseFloat(i.price), 0)),
          pagamento: order.s.pay === "bonifico" ? "Bonifico Bancario" : "PayPal",
          note: order.s.notes || "—"
        }
      })
    });
    return r.ok;
  } catch { return false; }
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#F6F3EE;--surface:#FDFCFA;--text:#18170F;--muted:#7A7060;
  --accent:#8C6D48;--accent2:#C8A97A;--border:#DDD8CF;
  --serif:'Cormorant Garamond',Georgia,serif;
  --sans:'Outfit',-apple-system,sans-serif;
  --ease:cubic-bezier(.4,0,.2,1);--t:.32s;
  --shadow:0 2px 20px rgba(24,23,15,.07);
  --shadow-lg:0 12px 48px rgba(24,23,15,.14);
}
html{scroll-behavior:smooth;}
body{background:var(--bg);color:var(--text);font-family:var(--sans);font-weight:300;min-height:100vh;overflow-x:hidden;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes su{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes si{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes sc{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes shim{0%{background-position:-200% 0}100%{background-position:200% 0}}
.fi{animation:fi .5s ease forwards;}.su{animation:su .55s var(--ease) forwards;}.si{animation:si .42s var(--ease) forwards;}.sc{animation:sc .4s var(--ease) forwards;}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5px;background:var(--border);}
@media(min-width:600px){.grid{grid-template-columns:repeat(3,1fr);}}
@media(min-width:1000px){.grid{grid-template-columns:repeat(4,1fr);}}
.card{background:var(--surface);cursor:pointer;overflow:hidden;position:relative;transition:box-shadow var(--t) var(--ease);}
.card:hover{box-shadow:var(--shadow-lg);}
.card-img-wrap{aspect-ratio:3/4;overflow:hidden;background:var(--border);position:relative;}
.card-img{width:100%;height:100%;object-fit:cover;transition:transform .65s var(--ease);display:block;}
.card:hover .card-img{transform:scale(1.05);}
.sold-badge{position:absolute;top:11px;right:11px;background:rgba(253,252,250,.92);backdrop-filter:blur(6px);padding:3px 11px;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;font-family:var(--sans);}
.sold-dim{position:absolute;inset:0;background:rgba(246,243,238,.44);}
.private-badge{position:absolute;bottom:11px;left:11px;background:rgba(24,23,15,.62);backdrop-filter:blur(6px);padding:3px 9px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:500;font-family:var(--sans);color:#fff;display:flex;align-items:center;gap:5px;}
.cats{display:flex;gap:7px;overflow-x:auto;padding:0 20px;scrollbar-width:none;}
.cats::-webkit-scrollbar{display:none;}
.cat{padding:7px 18px;border-radius:100px;font-size:11px;letter-spacing:.07em;cursor:pointer;transition:all var(--t);border:1px solid var(--border);background:transparent;font-family:var(--sans);font-weight:400;color:var(--muted);white-space:nowrap;}
.cat:hover{color:var(--text);border-color:rgba(24,23,15,.4);}
.cat.on{background:var(--text);border-color:var(--text);color:#fff;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;cursor:pointer;font-family:var(--sans);letter-spacing:.1em;text-transform:uppercase;transition:all var(--t) var(--ease);font-weight:500;position:relative;overflow:hidden;}
.btn:disabled{opacity:.45;cursor:not-allowed;}
.btn-d{background:var(--text);color:#fff;padding:15px 34px;font-size:10.5px;}
.btn-d:not(:disabled):hover{background:var(--accent);transform:translateY(-1px);box-shadow:0 6px 22px rgba(24,23,15,.18);}
.btn-d:not(:disabled):active{transform:scale(.98);}
.btn-o{background:transparent;color:var(--text);border:1px solid var(--border);padding:14px 28px;font-size:10.5px;}
.btn-o:not(:disabled):hover{border-color:var(--text);background:var(--text);color:#fff;}
.btn-g{background:transparent;color:var(--muted);border:none;padding:8px 10px;font-size:11px;letter-spacing:.05em;font-weight:400;}
.btn-g:hover{color:var(--text);}
.field{width:100%;padding:12px 16px;border:1px solid var(--border);background:var(--bg);font-family:var(--sans);font-size:14px;font-weight:300;color:var(--text);transition:border-color var(--t);outline:none;border-radius:2px;-webkit-appearance:none;}
.field:focus{border-color:var(--text);}
.field::placeholder{color:var(--muted);}
.lbl{display:block;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;font-weight:500;}
.overlay{position:fixed;inset:0;background:rgba(24,23,15,.52);backdrop-filter:blur(10px);z-index:200;}
.drawer{position:fixed;bottom:0;left:0;right:0;background:var(--surface);border-radius:22px 22px 0 0;max-height:93vh;overflow-y:auto;z-index:201;animation:si .42s var(--ease);}
.handle{width:38px;height:4px;background:var(--border);border-radius:2px;margin:14px auto 22px;}
.admin-tabs{display:flex;border-bottom:1px solid var(--border);background:var(--surface);position:sticky;top:0;z-index:10;}
.admin-tab{flex:1;padding:14px 4px;font-size:10px;letter-spacing:.07em;text-align:center;cursor:pointer;border:none;background:transparent;font-family:var(--sans);color:var(--muted);border-bottom:2px solid transparent;transition:all var(--t);text-transform:uppercase;font-weight:500;}
.admin-tab.on{color:var(--text);border-bottom-color:var(--accent);}
.skel{background:linear-gradient(90deg,var(--border) 25%,#EAE5DC 50%,var(--border) 75%);background-size:200% 100%;animation:shim 1.6s infinite;}
`;

const Spin = ({ size = 18, col = "var(--accent)" }) => (
  <div style={{ width: size, height: size, border: `2px solid ${col}33`, borderTopColor: col, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
);

const Header = ({ cartCount = 0, onCart, onLogo, onBack }) => (
  <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(246,243,238,.9)", backdropFilter: "blur(18px)", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "0 18px", height: 60 }}>
    <div>{onBack && <button onClick={onBack} className="btn btn-g" style={{ padding: "8px 0", letterSpacing: 0 }}>← Indietro</button>}</div>
    <div onClick={onLogo} style={{ cursor: "pointer", textAlign: "center", userSelect: "none" }}>
      <img src={LOGO} alt="Logo" style={{ height: 20, objectFit: "contain" }} />
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <button onClick={onCart} className="btn btn-g" style={{ position: "relative", padding: 9 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {cartCount > 0 && <span style={{ position: "absolute", top: 3, right: 3, width: 15, height: 15, borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>{cartCount}</span>}
      </button>
    </div>
  </header>
);

function Slideshow({ images = [] }) {
  const [idx, setIdx] = useState(0);
  const sx = useRef(null);
  if (!images.length) return <div style={{ aspectRatio: "4/5", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>Nessuna immagine</div>;
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "var(--border)", aspectRatio: "4/5", userSelect: "none" }}
      onTouchStart={e => { sx.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (sx.current === null) return; const d = sx.current - e.changedTouches[0].clientX; if (Math.abs(d) > 40) d > 0 ? next() : prev(); sx.current = null; }}>
      {images.map((src, j) => (
        <div key={j} style={{ position: "absolute", inset: 0, opacity: j === idx ? 1 : 0, transition: "opacity .45s ease", zIndex: j === idx ? 1 : 0 }}>
          <img src={src} alt="" draggable="false" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      ))}
      {images.length > 1 && <>
        <button onClick={prev} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 2, background: "rgba(253,252,250,.88)", border: "none", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", fontSize: 20, color: "var(--text)" }}>‹</button>
        <button onClick={next} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 2, background: "rgba(253,252,250,.88)", border: "none", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", fontSize: 20, color: "var(--text)" }}>›</button>
        <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6, zIndex: 2 }}>
          {images.map((_, j) => <button key={j} onClick={() => setIdx(j)} style={{ width: j === idx ? 22 : 7, height: 7, borderRadius: 4, background: j === idx ? "#fff" : "rgba(255,255,255,.5)", border: "none", cursor: "pointer", transition: "width .32s var(--ease)", padding: 0 }} />)}
        </div>
        <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2, background: "rgba(24,23,15,.5)", color: "#fff", fontSize: 10, padding: "3px 9px", borderRadius: 100, letterSpacing: ".06em" }}>{idx+1}/{images.length}</div>
      </>}
    </div>
  );
}

const ProductCard = ({ p, onClick, idx, isPrivate }) => (
  <div className="card su" style={{ animationDelay: `${(idx % PER) * .05}s`, animationFillMode: "both" }} onClick={() => onClick(p)}>
    <div className="card-img-wrap">
      {p.images?.[0] ? <img className="card-img" src={p.images[0]} alt={p.title} loading="lazy" /> : <div className="card-img skel" />}
      {p.sold && <><div className="sold-dim" /><div className="sold-badge">Sold Out</div></>}
      {isPrivate && (
        <div className="private-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Privata
        </div>
      )}
    </div>
    <div style={{ padding: "12px 14px 16px" }}>
      <p style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: ".04em", marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
      <p style={{ fontFamily: "var(--serif)", fontSize: 21, fontWeight: 400, color: p.sold ? "var(--muted)" : "var(--text)", lineHeight: 1 }}>{eur(p.price)}</p>
    </div>
  </div>
);

function ShopView({ products, cat, onCat, onProduct, cartCount, onCart, onLogo, onMore, hasMore, categories, isAdmin }) {
  const privateCatNames = new Set(categories.filter(c => c.private).map(c => c.name));
  const visibleCats = isAdmin ? categories : categories.filter(c => !c.private);
  const allCats = ["Tutti", ...visibleCats.map(c => c.name)];
  const sentinel = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && hasMore) onMore(); }, { threshold: 0 });
    if (sentinel.current) obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [hasMore, onMore]);
  return (
    <div style={{ minHeight: "100vh" }}>
      <Header cartCount={cartCount} onCart={onCart} onLogo={onLogo} />
      <div style={{ padding: "14px 0", borderBottom: "1px solid var(--border)", background: "rgba(246,243,238,.9)", backdropFilter: "blur(12px)", position: "sticky", top: 60, zIndex: 40 }}>
        <div className="cats">
          {allCats.map(c => {
            const isPrivateCat = c !== "Tutti" && privateCatNames.has(c);
            return (
              <button key={c} className={`cat${cat === c ? " on" : ""}`} onClick={() => onCat(c)}
                style={isPrivateCat ? { borderStyle: "dashed", opacity: 0.7 } : {}}>
                {isPrivateCat && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 4, verticalAlign: "middle" }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
                {c}
              </button>
            );
          })}
        </div>
      </div>
      {products.length === 0
        ? <div style={{ padding: "90px 24px", textAlign: "center", color: "var(--muted)" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 300, marginBottom: 8 }}>Nessun prodotto</p>
            <p style={{ fontSize: 13 }}>Non ci sono opere in questa categoria.</p>
          </div>
        : <div className="grid">{products.map((p, i) => <ProductCard key={p.id} p={p} onClick={onProduct} idx={i} isPrivate={isAdmin && privateCatNames.has(p.category)} />)}</div>
      }
      <div ref={sentinel} style={{ height: 1 }} />
      {hasMore && <div style={{ padding: 36, display: "flex", justifyContent: "center" }}><Spin size={22} /></div>}
      <footer style={{ padding: "44px 24px", textAlign: "center", borderTop: "1px solid var(--border)", marginTop: 2 }}>
        <p style={{ fontFamily: "var(--serif)", fontSize: 19, fontWeight: 300, color: "var(--muted)", fontStyle: "italic" }}>Ogni opera è un pezzo unico e irripetibile</p>
      </footer>
    </div>
  );
}

function ProductView({ product, cart, cartCount, onBack, onLogo, onCart, onAddToCart }) {
  const [showDesc, setShowDesc] = useState(true);
  const [added, setAdded] = useState(false);
  const inCart = cart.some(c => c.id === product.id);
  const add = () => { if (inCart || product.sold) return; onAddToCart(product); setAdded(true); setTimeout(() => setAdded(false), 2200); };
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      <Header cartCount={cartCount} onCart={onCart} onLogo={onLogo} onBack={onBack} />
      <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: 14 }}>
        <Slideshow images={product.images} />
        <div className="fi" style={{ padding: "28px 24px 72px" }}>
          <span style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)", display: "block", marginBottom: 10, fontWeight: 500 }}>{product.category}</span>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 400, lineHeight: 1.15, marginBottom: 14 }}>{product.title}</h1>
          <p style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 300, marginBottom: 28, color: product.sold ? "var(--muted)" : "var(--text)" }}>{eur(product.price)}</p>
          {product.sold
            ? <div style={{ padding: 16, textAlign: "center", background: "var(--bg)", border: "1px solid var(--border)", marginBottom: 26, fontSize: 11, letterSpacing: ".13em", textTransform: "uppercase", color: "var(--muted)" }}>Questa opera è stata venduta</div>
            : <button onClick={add} className="btn btn-d" style={{ width: "100%", marginBottom: 26 }} disabled={inCart}>{inCart ? "✓ Nel Carrello" : added ? "✓ Aggiunto!" : "Aggiungi al Carrello"}</button>
          }
          {product.description && (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setShowDesc(s => !s)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "18px 0", fontFamily: "var(--sans)" }}>
                <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500 }}>Descrizione</span>
                <span style={{ display: "block", transition: "transform .3s", transform: showDesc ? "rotate(45deg)" : "none", fontSize: 22, color: "var(--muted)", lineHeight: 1 }}>+</span>
              </button>
              {showDesc && <p className="su" style={{ color: "var(--muted)", lineHeight: 1.85, fontSize: 14, fontWeight: 300, paddingBottom: 22, borderBottom: "1px solid var(--border)" }}>{product.description}</p>}
            </div>
          )}
          <div style={{ marginTop: 22, background: "var(--bg)", padding: "16px 18px", fontSize: 13, color: "var(--muted)", lineHeight: 2, fontWeight: 300 }}>
            <p>🎨 Pezzo unico e originale, certificato dall'artista</p>
            <p>📦 Spedizione in 3–5 giorni lavorativi, imballaggio curato</p>
            <p>💬 Per domande, non esitare a contattarci</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartModal({ cart, onRemove, onClose, onCheckout }) {
  const total = cart.reduce((a, i) => a + parseFloat(i.price), 0);
  return (
    <>
      <div className="overlay fi" onClick={onClose} />
      <div className="drawer">
        <div className="handle" />
        <div style={{ padding: "0 24px 52px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400 }}>Carrello</h2>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 24, lineHeight: 1 }}>×</button>
          </div>
          {cart.length === 0
            ? <div style={{ textAlign: "center", padding: "50px 0", color: "var(--muted)" }}><p style={{ fontFamily: "var(--serif)", fontSize: 24, marginBottom: 8 }}>Carrello vuoto</p><p style={{ fontSize: 13 }}>Aggiungi opere al carrello.</p></div>
            : <>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 58, height: 58, flexShrink: 0, borderRadius: 2, overflow: "hidden", background: "var(--border)" }}>
                        {item.images?.[0] && <img src={item.images[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{item.title}</p>
                        <p style={{ fontFamily: "var(--serif)", fontSize: 19 }}>{eur(item.price)}</p>
                      </div>
                      <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)" }}>Totale</span>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 300 }}>{eur(total)}</span>
                  </div>
                </div>
                <button onClick={onCheckout} className="btn btn-d" style={{ width: "100%" }}>Procedi all'Acquisto →</button>
              </>
          }
        </div>
      </div>
    </>
  );
}

function CheckoutModal({ cart, config, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [ordId, setOrdId] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", zip: "", country: "Italia", pay: "bonifico", notes: "" });
  const total = cart.reduce((a, i) => a + parseFloat(i.price), 0);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const valid1 = form.name && form.email && form.address && form.city && form.zip;
  const confirm = async () => { setBusy(true); const id = await onComplete({ ...form }); setOrdId(id); setStep(3); setBusy(false); };
  const Row = ({ children, cols = "1fr 1fr" }) => <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12 }}>{children}</div>;
  const Field = ({ label, children }) => <div><label className="lbl">{label}</label>{children}</div>;
  return (
    <>
      <div className="overlay fi" onClick={step < 3 ? onClose : null} />
      <div className="drawer" style={{ maxHeight: "95vh" }}>
        <div className="handle" />
        <div style={{ padding: "0 24px 52px" }}>
          {step < 3 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400 }}>{step === 1 ? "Dati di Spedizione" : "Pagamento"}</h2>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 22 }}>×</button>
            </div>
          )}
          {step < 3 && <div style={{ display: "flex", gap: 5, marginBottom: 26 }}>{[1,2].map(s => <div key={s} style={{ height: 3, flex: s <= step ? 2 : 1, borderRadius: 2, background: s <= step ? "var(--accent)" : "var(--border)", transition: "flex .4s var(--ease)" }} />)}</div>}
          {step === 1 && (
            <div className="su" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Row><Field label="Nome e Cognome *"><input className="field" value={form.name} onChange={upd("name")} placeholder="Mario Rossi" /></Field><Field label="Email *"><input className="field" type="email" value={form.email} onChange={upd("email")} placeholder="mario@mail.it" /></Field></Row>
              <Field label="Telefono"><input className="field" value={form.phone} onChange={upd("phone")} placeholder="+39 320 0000000" /></Field>
              <Field label="Indirizzo *"><input className="field" value={form.address} onChange={upd("address")} placeholder="Via Roma 1" /></Field>
              <Row cols="2fr 1fr"><Field label="Città *"><input className="field" value={form.city} onChange={upd("city")} placeholder="Milano" /></Field><Field label="CAP *"><input className="field" value={form.zip} onChange={upd("zip")} placeholder="20121" /></Field></Row>
              <Field label="Paese"><input className="field" value={form.country} onChange={upd("country")} /></Field>
              <button onClick={() => setStep(2)} className="btn btn-d" style={{ width: "100%", marginTop: 4 }} disabled={!valid1}>Continua →</button>
            </div>
          )}
          {step === 2 && (
            <div className="su" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ background: "var(--bg)", padding: "14px 16px", borderRadius: 2 }}>
                {cart.map(i => <div key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}><span style={{ color: "var(--muted)" }}>{i.title}</span><span style={{ fontFamily: "var(--serif)" }}>{eur(i.price)}</span></div>)}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: 11, letterSpacing: ".07em", textTransform: "uppercase" }}>Totale</strong>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 24 }}>{eur(total)}</span>
                </div>
              </div>
              <div>
                <label className="lbl">Metodo di Pagamento</label>
                {[{ v: "bonifico", label: "Bonifico Bancario", sub: "Riceverai le coordinate bancarie via email" }, { v: "paypal", label: "PayPal", sub: "Ti invieremo un link di pagamento sicuro" }].map(opt => (
                  <label key={opt.v} style={{ display: "flex", gap: 12, padding: "14px 16px", border: `1px solid ${form.pay === opt.v ? "var(--text)" : "var(--border)"}`, cursor: "pointer", borderRadius: 2, marginBottom: 8, transition: "border-color .2s", background: form.pay === opt.v ? "rgba(24,23,15,.025)" : "transparent" }}>
                    <input type="radio" name="pay" value={opt.v} checked={form.pay === opt.v} onChange={upd("pay")} style={{ marginTop: 3 }} />
                    <div><p style={{ fontSize: 14, fontWeight: 500 }}>{opt.label}</p><p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{opt.sub}</p></div>
                  </label>
                ))}
              </div>
              <div><label className="lbl">Note opzionali</label><textarea className="field" value={form.notes} onChange={upd("notes")} rows={3} style={{ resize: "none" }} /></div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} className="btn btn-o" style={{ flex: 1 }}>← Indietro</button>
                <button onClick={confirm} className="btn btn-d" style={{ flex: 2 }} disabled={busy}>{busy ? <Spin col="#fff" /> : "Conferma Ordine"}</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="sc" style={{ textAlign: "center", padding: "20px 0 12px" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg)", border: "1.5px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: 28, color: "var(--accent)" }}>✓</div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 400, marginBottom: 12 }}>Ordine Confermato</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.75, marginBottom: 8 }}>Grazie! Riceverai le istruzioni di pagamento via email.</p>
              <p style={{ fontSize: 11, letterSpacing: ".12em", color: "var(--accent2)", marginBottom: 32 }}>#{ordId.slice(-8).toUpperCase()}</p>
              <button onClick={onClose} className="btn btn-d" style={{ width: "100%" }}>Torna allo Shop</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AdminLogin({ password, onAuth, onClose }) {
  const [v, setV] = useState(""); const [err, setErr] = useState(false);
  const go = () => { if (v === password) onAuth(); else { setErr(true); setTimeout(() => setErr(false), 1400); } };
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div className="sc" style={{ background: "var(--surface)", padding: 40, width: "90%", maxWidth: 340, borderRadius: 4, boxShadow: "var(--shadow-lg)" }}>
        <p style={{ textAlign: "center", fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Pannello Admin</p>
        <img src={LOGO} alt="Logo" style={{ height: 30, objectFit: "contain", display: "block", margin: "0 auto 30px" }} />
        <label className="lbl">Password</label>
        <input className="field" type="password" value={v} onChange={e => setV(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} placeholder="••••••••" style={{ marginBottom: err ? 8 : 20, borderColor: err ? "#c0392b" : undefined }} autoFocus />
        {err && <p style={{ fontSize: 12, color: "#c0392b", marginBottom: 16 }}>Password errata.</p>}
        <button onClick={go} className="btn btn-d" style={{ width: "100%", marginBottom: 10 }}>Accedi</button>
        <button onClick={onClose} className="btn btn-g" style={{ width: "100%", textAlign: "center" }}>← Torna allo Shop</button>
      </div>
    </div>
  );
}

function AdminProductList({ products, onNew, onEdit, onDelete, onToggleSold }) {
  const [del, setDel] = useState(null);
  const Btn = ({ onClick, children, red }) => <button onClick={onClick} style={{ background: red ? "#c0392b" : "none", border: red ? "none" : "1px solid var(--border)", height: 32, padding: "0 10px", cursor: "pointer", borderRadius: 2, fontSize: 12, color: red ? "#fff" : "var(--muted)" }}>{children}</button>;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)" }}>Prodotti ({products.length})</span>
        <button onClick={onNew} className="btn btn-d" style={{ padding: "10px 18px", fontSize: 10 }}>+ Nuovo</button>
      </div>
      {products.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}><p style={{ fontFamily: "var(--serif)", fontSize: 24, marginBottom: 8 }}>Nessun prodotto</p><p style={{ fontSize: 13, marginBottom: 24 }}>Crea la tua prima opera.</p><button onClick={onNew} className="btn btn-d">+ Crea Prodotto</button></div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: "var(--surface)", padding: "13px 14px", display: "flex", gap: 12, alignItems: "center", borderRadius: 2, border: "1px solid var(--border)" }}>
                <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 2, overflow: "hidden", background: "var(--border)" }}>
                  {p.images?.[0] && <img src={p.images[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{p.title}</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{eur(p.price)}</span>
                    {p.sold && <span style={{ fontSize: 9, padding: "2px 8px", background: "var(--bg)", color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase", borderRadius: 100 }}>Venduto</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  <Btn onClick={() => onToggleSold(p.id)}>{p.sold ? "↺" : "✓"}</Btn>
                  <Btn onClick={() => onEdit(p)}>✎</Btn>
                  {del === p.id ? <Btn onClick={() => { onDelete(p.id); setDel(null); }} red>Elimina</Btn> : <Btn onClick={() => setDel(p.id)}>×</Btn>}
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

function AdminForm({ product, onCreate, onUpdate, onDone, categories }) {
  const [form, setForm] = useState({ title: product?.title||"", price: product?.price||"", category: product?.category||categories[0]?.name||"", description: product?.description||"" });
  const [previews, setPreviews] = useState(product?.images||[]);
  const [busy, setBusy] = useState(false); const [drag, setDrag] = useState(false);
  const fRef = useRef();
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const can = form.title && form.price && previews.length > 0;
  const addFiles = async files => { const imgs = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 10 - previews.length); if (!imgs.length) return; const b64s = await Promise.all(imgs.map(f => resizeImg(f))); setPreviews(p => [...p, ...b64s]); };
  const submit = async () => { setBusy(true); try { if (product) await onUpdate(product.id, form, previews); else await onCreate(form, previews); onDone(); } finally { setBusy(false); } };
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>{product ? "Modifica Opera" : "Nuova Opera"}</p>
      <div style={{ marginBottom: 18 }}>
        <label className="lbl">Foto *</label>
        <div onClick={() => previews.length < 10 && fRef.current?.click()} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }} style={{ border: `2px dashed ${drag ? "var(--text)" : "var(--border)"}`, borderRadius: 6, padding: previews.length ? 12 : 36, textAlign: "center", cursor: previews.length < 10 ? "pointer" : "default", transition: "border-color .2s", background: drag ? "rgba(140,109,72,.05)" : "var(--bg)" }}>
          {previews.length === 0 ? <div><div style={{ fontSize: 38, marginBottom: 10 }}>🖼️</div><p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Trascina le foto qui</p><p style={{ fontSize: 11, color: "var(--muted)" }}>o clicca · fino a 10 foto</p></div>
            : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {previews.map((src, i) => <div key={i} style={{ position: "relative", width: 74, height: 74 }}><img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} /><button onClick={e => { e.stopPropagation(); setPreviews(p => p.filter((_,j) => j !== i)); }} style={{ position: "absolute", top: -7, right: -7, width: 20, height: 20, borderRadius: "50%", background: "var(--text)", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button></div>)}
                {previews.length < 10 && <div style={{ width: 74, height: 74, border: "1.5px dashed var(--border)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 28 }}>+</div>}
              </div>
          }
        </div>
        <input ref={fRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
      </div>
      <div style={{ marginBottom: 14 }}><label className="lbl">Titolo *</label><input className="field" value={form.title} onChange={upd("title")} placeholder="Nome dell'opera" /></div>
      <div style={{ marginBottom: 14 }}><label className="lbl">Prezzo (€) *</label><input className="field" type="number" value={form.price} onChange={upd("price")} placeholder="150" min="0" step="0.01" /></div>
      <div style={{ marginBottom: 14 }}><label className="lbl">Categoria</label><select className="field" value={form.category} onChange={upd("category")}>{categories.map(c => <option key={c.name} value={c.name}>{c.name}{c.private ? " 🔒" : ""}</option>)}</select></div>
      <div style={{ marginBottom: 22 }}><label className="lbl">Descrizione</label><textarea className="field" value={form.description} onChange={upd("description")} placeholder="Tecnica, materiali, dimensioni, ispirazione..." rows={4} style={{ resize: "vertical" }} /></div>
      {can && <div style={{ background: "var(--bg)", padding: "14px 16px", borderRadius: 4, marginBottom: 22, display: "flex", gap: 14, alignItems: "center" }}><div style={{ width: 58, height: 58, borderRadius: 4, overflow: "hidden", flexShrink: 0 }}><img src={previews[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div><div><p style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{form.title}</p><p style={{ fontFamily: "var(--serif)", fontSize: 20 }}>{eur(form.price)}</p><p style={{ fontSize: 10, color: "var(--accent)", letterSpacing: ".09em", textTransform: "uppercase", marginTop: 3 }}>{form.category}</p></div><span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>{previews.length} foto</span></div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onDone} className="btn btn-o" style={{ flex: 1 }}>Annulla</button>
        <button onClick={submit} className="btn btn-d" style={{ flex: 2 }} disabled={!can || busy}>{busy ? <Spin col="#fff" /> : product ? "Salva Modifiche" : "✓ Pubblica"}</button>
      </div>
    </div>
  );
}

function AdminOrders({ orders }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>Ordini ({orders.length})</p>
      {orders.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}><p style={{ fontFamily: "var(--serif)", fontSize: 24 }}>Nessun ordine ancora</p></div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[...orders].reverse().map(o => (
              <div key={o.id} style={{ background: "var(--surface)", padding: 18, borderRadius: 2, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 600 }}>#{o.id.slice(-8).toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(o.date).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{o.s.name}</p>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>{o.s.email}</p>
                {o.s.phone && <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>{o.s.phone}</p>}
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, background: "var(--bg)", padding: "8px 10px", borderRadius: 2 }}>📦 {o.s.address}, {o.s.zip} {o.s.city}, {o.s.country}</p>
                {o.items?.map(i => <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span>{i.title}</span><span style={{ fontFamily: "var(--serif)" }}>{eur(i.price)}</span></div>)}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>{o.s.pay === "bonifico" ? "🏦 Bonifico" : "💳 PayPal"}</span>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 20 }}>{eur(o.items?.reduce((a,i) => a+parseFloat(i.price),0)||0)}</span>
                </div>
                {o.s.notes && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, fontStyle: "italic" }}>Note: {o.s.notes}</p>}
              </div>
            ))}
          </div>
      }
    </div>
  );
}

function AdminSettings({ config, onSave }) {
  const [f, setF] = useState({ ownerEmail:"",svcId:"",tplId:"",pubKey:"",adminPassword:"",shopName:"ATELIER",...config });
  const [ok, setOk] = useState(false);
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const save = async () => { await onSave(f); setOk(true); setTimeout(() => setOk(false), 2200); };
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>Impostazioni</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div><label className="lbl">Nome Shop</label><input className="field" value={f.shopName} onChange={upd("shopName")} /></div>
        <div><label className="lbl">Nuova Password Admin</label><input className="field" type="password" value={f.adminPassword} onChange={upd("adminPassword")} placeholder="Lascia vuoto per non cambiare" /></div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Email Notifiche (EmailJS)</p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.7 }}>Registrati su <a href="https://emailjs.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>emailjs.com</a> e inserisci le credenziali per ricevere email ad ogni ordine.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><label className="lbl">La tua email (riceve gli ordini)</label><input className="field" type="email" value={f.ownerEmail} onChange={upd("ownerEmail")} placeholder="tua@email.it" /></div>
            <div><label className="lbl">EmailJS Service ID</label><input className="field" value={f.svcId} onChange={upd("svcId")} placeholder="service_xxxxxxx" /></div>
            <div><label className="lbl">EmailJS Template ID</label><input className="field" value={f.tplId} onChange={upd("tplId")} placeholder="template_xxxxxxx" /></div>
            <div><label className="lbl">EmailJS Public Key</label><input className="field" value={f.pubKey} onChange={upd("pubKey")} placeholder="xxxxxxxxxxxxxxxxxxxx" /></div>
          </div>
        </div>
        <button onClick={save} className="btn btn-d" style={{ width: "100%" }}>{ok ? "✓ Salvato!" : "Salva Impostazioni"}</button>
      </div>
    </div>
  );
}

/* ── DRAG HANDLE SVG ── */
const DragHandle = () => (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" style={{ flexShrink: 0, cursor: "grab", color: "var(--border)" }}>
    <circle cx="4" cy="3"  r="1.5" fill="currentColor"/>
    <circle cx="8" cy="3"  r="1.5" fill="currentColor"/>
    <circle cx="4" cy="8"  r="1.5" fill="currentColor"/>
    <circle cx="8" cy="8"  r="1.5" fill="currentColor"/>
    <circle cx="4" cy="13" r="1.5" fill="currentColor"/>
    <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
  </svg>
);

/* ── EYE ICONS ── */
const EyeOpen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function CategoryManager({ categories, onSave }) {
  const [cats, setCats] = useState(categories.map(c => typeof c === "string" ? { name: c, private: false } : { ...c }));
  const [newCat, setNewCat] = useState("");
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [saved, setSaved] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const dragIdx = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const add = () => {
    const v = newCat.trim();
    if (!v || cats.map(c => c.name.toLowerCase()).includes(v.toLowerCase())) return;
    setCats(c => [...c, { name: v, private: false }]);
    setNewCat("");
  };

  const remove    = i => { setCats(c => c.filter((_,j) => j !== i)); setDelConfirm(null); };
  const startEdit = i => { setEditing(i); setEditVal(cats[i].name); };
  const saveEdit  = () => {
    const v = editVal.trim();
    if (!v) return;
    setCats(c => c.map((cat, i) => i === editing ? { ...cat, name: v } : cat));
    setEditing(null);
  };
  const togglePrivate = i => setCats(c => c.map((cat, j) => j === i ? { ...cat, private: !cat.private } : cat));

  const onDragStart = i => { dragIdx.current = i; };
  const onDragOver  = (e, i) => { e.preventDefault(); setDragOver(i); };
  const onDrop      = i => {
    const from = dragIdx.current;
    if (from === null || from === i) { setDragOver(null); return; }
    const updated = [...cats];
    const [moved] = updated.splice(from, 1);
    updated.splice(i, 0, moved);
    setCats(updated);
    dragIdx.current = null;
    setDragOver(null);
  };
  const onDragEnd = () => { dragIdx.current = null; setDragOver(null); };
  const save = () => { onSave(cats); setSaved(true); setTimeout(() => setSaved(false), 2200); };

  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>Sezioni</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          className="field"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Nuova sezione..."
        />
        <button onClick={add} className="btn btn-d" style={{ padding: "0 20px", flexShrink: 0, fontSize: 18, fontWeight: 300 }} disabled={!newCat.trim()}>+</button>
      </div>

      <button onClick={save} className="btn btn-d" style={{ width: "100%", marginBottom: 20 }}>
        {saved ? "✓ Salvato!" : "Salva Sezioni"}
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {cats.map((cat, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={e => onDragOver(e, i)}
            onDrop={() => onDrop(i)}
            onDragEnd={onDragEnd}
            style={{
              background: cat.private ? "rgba(24,23,15,.03)" : "var(--surface)",
              border: `1px solid ${dragOver === i ? "var(--accent)" : "var(--border)"}`,
              borderStyle: cat.private ? "dashed" : "solid",
              borderRadius: 2,
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all .2s",
              opacity: dragIdx.current === i ? 0.35 : 1,
              transform: dragOver === i ? "translateY(-2px)" : "none",
              boxShadow: dragOver === i ? "0 4px 16px rgba(24,23,15,.1)" : "none"
            }}
          >
            <DragHandle />

            {editing === i
              ? <input
                  className="field"
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); }}
                  autoFocus
                  style={{ flex: 1, padding: "5px 10px", fontSize: 13, height: 34 }}
                />
              : <span style={{ flex: 1, fontSize: 13, fontWeight: 400, userSelect: "none", color: cat.private ? "var(--muted)" : "var(--text)" }}>
                  {cat.name}
                </span>
            }

            <button
              onClick={() => togglePrivate(i)}
              title={cat.private ? "Rendi pubblica" : "Rendi privata"}
              style={{
                background: cat.private ? "rgba(24,23,15,.06)" : "none",
                border: "1px solid var(--border)",
                width: 32, height: 32, borderRadius: 2,
                cursor: "pointer",
                color: cat.private ? "var(--text)" : "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .2s"
              }}
            >
              {cat.private ? <EyeOff /> : <EyeOpen />}
            </button>

            {editing === i
              ? <button onClick={saveEdit} style={{ background: "none", border: "1px solid var(--border)", width: 32, height: 32, borderRadius: 2, cursor: "pointer", color: "var(--accent)", fontSize: 14, display:"flex", alignItems:"center", justifyContent:"center" }}>✓</button>
              : <button onClick={() => startEdit(i)} style={{ background: "none", border: "1px solid var(--border)", width: 32, height: 32, borderRadius: 2, cursor: "pointer", color: "var(--muted)", fontSize: 13, display:"flex", alignItems:"center", justifyContent:"center" }}>✎</button>
            }

            {delConfirm === i
              ? <button onClick={() => remove(i)} style={{ background: "#c0392b", border: "none", height: 32, padding: "0 10px", borderRadius: 2, cursor: "pointer", color: "#fff", fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Elimina</button>
              : <button onClick={() => setDelConfirm(i)} onBlur={() => setTimeout(() => setDelConfirm(null), 150)} style={{ background: "none", border: "1px solid var(--border)", width: 32, height: 32, borderRadius: 2, cursor: "pointer", color: "var(--muted)", fontSize: 14, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            }
          </div>
        ))}

        {cats.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)", fontSize: 13 }}>Nessuna sezione. Aggiungine una.</div>
        )}
      </div>
    </div>
  );
}

function AdminView({ authed, onAuth, products, orders, config, categories, tab, setTab, onCreate, onUpdate, onDelete, onToggleSold, onSaveConfig, onSaveCategories, onClose, editing, setEditing }) {
  if (!authed) return <AdminLogin password={config.adminPassword || DEF_PWD} onAuth={onAuth} onClose={onClose} />;
  const tabs = [
    { id:"list",     label:"Prodotti" },
    { id:"form",     label:editing?"Modifica":"Nuovo" },
    { id:"cats",     label:"Sezioni" },
    { id:"orders",   label:orders.length?`Ordini (${orders.length})`:"Ordini" },
    { id:"settings", label:"Config" }
  ];
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 300, letterSpacing: ".22em" }}>ADMIN</span>
        <button onClick={onClose} className="btn btn-g" style={{ fontSize: 11 }}>← Shop</button>
      </div>
      <div className="admin-tabs">{tabs.map(t => <button key={t.id} className={`admin-tab${tab===t.id?" on":""}`} onClick={() => { setTab(t.id); if (t.id !== "form") setEditing(null); }}>{t.label}</button>)}</div>
      <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
        {tab==="list"     && <AdminProductList products={products} onNew={() => { setEditing(null); setTab("form"); }} onEdit={p => { setEditing(p); setTab("form"); }} onDelete={onDelete} onToggleSold={onToggleSold} />}
        {tab==="form"     && <AdminForm key={editing?.id||"new"} product={editing} categories={categories} onCreate={onCreate} onUpdate={onUpdate} onDone={() => { setTab("list"); setEditing(null); }} />}
        {tab==="cats"     && <CategoryManager categories={categories} onSave={onSaveCategories} />}
        {tab==="orders"   && <AdminOrders orders={orders} />}
        {tab==="settings" && <AdminSettings config={config} onSave={onSaveConfig} />}
      </div>
    </div>
  );
}

export default function App() {
  const [view,setView]=useState("shop");
  const [products,setProducts]=useState([]);
  const [orders,setOrders]=useState([]);
  const [config,setConfig]=useState({});
  const [categories,setCategories]=useState(DEFAULT_CATS);
  const [cart,setCart]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(null);
  const [cat,setCat]=useState("Tutti");
  const [page,setPage]=useState(1);
  const [showCart,setShowCart]=useState(false);
  const [showCheckout,setShowCheckout]=useState(false);
  const [authed,setAuthed]=useState(false);
  const [adminTab,setAdminTab]=useState("list");
  const [editing,setEditing]=useState(null);
  const logoClicks=useRef(0); const logoTimer=useRef(null);

  useEffect(() => {
    (async () => {
      const p = await db.getProducts();
      const o = await db.get("orders",   []);
      const c = await db.get("config",   {});
      const rawCats = await db.get("categories", DEFAULT_CATS);
      const k = rawCats.map(c => typeof c === "string" ? { name: c, private: false } : c);
      setProducts(p); setOrders(o); setConfig(c); setCategories(k); setLoading(false);
    })();
  }, []);

  const handleLogo = () => { logoClicks.current++; clearTimeout(logoTimer.current); logoTimer.current=setTimeout(()=>{logoClicks.current=0;},2000); if(logoClicks.current>=5){logoClicks.current=0;setView("admin");} };
  const saveProds = p => { setProducts(p); db.saveProducts(p); };
  const saveOrds  = o => { setOrders(o);  db.set("orders",o); };
  const saveCfg   = c => { setConfig(c);  db.set("config",c); };
  const saveCats  = k => { setCategories(k); db.set("categories",k); };
  const addToCart  = p  => { if (!cart.find(i=>i.id===p.id)&&!p.sold) setCart(c=>[...c,p]); };
  const rmFromCart = id => setCart(c=>c.filter(i=>i.id!==id));
  const completeOrder = async s => {
    const order={id:uid(),items:cart,s,date:new Date().toISOString()};
    const upd=products.map(p=>cart.find(c=>c.id===p.id)?{...p,sold:true}:p);
    saveProds(upd); saveOrds([...orders,order]);
    await notifyOrder(config,order);
    setCart([]); return order.id;
  };
  const onCreate     = (form,imgs)     => { const p={id:uid(),...form,images:imgs,sold:false,createdAt:Date.now()}; saveProds([p,...products]); };
  const onUpdate     = (id,form,imgs)  => { saveProds(products.map(p=>p.id===id?{...p,...form,images:imgs??p.images}:p)); };
  const onDelete     = id              => { saveProds(products.filter(p=>p.id!==id)); };
  const onToggleSold = id              => { saveProds(products.map(p=>p.id===id?{...p,sold:!p.sold}:p)); };

  const privateCatNames = new Set(categories.filter(c => c.private).map(c => c.name));
  const visibleProducts = authed ? products : products.filter(p => !privateCatNames.has(p.category));
  const filtered = visibleProducts.filter(p => cat === "Tutti" || p.category === cat);
  const paged    = filtered.slice(0, page * PER);
  const hasMore  = paged.length < filtered.length;

  if (loading) return (<><style dangerouslySetInnerHTML={{__html:CSS}}/><div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:22,background:"var(--bg)"}}><img src={LOGO} alt="Logo" style={{ height: 28, objectFit: "contain" }} /><Spin size={20}/></div></>);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>
      {view==="shop" && <ShopView products={paged} cat={cat} onCat={c=>{setCat(c);setPage(1);}} onProduct={p=>{setSelected(p);setView("product");window.scrollTo(0,0);}} cartCount={cart.length} onCart={()=>setShowCart(true)} onLogo={handleLogo} onMore={()=>setPage(p=>p+1)} hasMore={hasMore} categories={categories} isAdmin={authed}/>}
      {view==="product"&&selected && <ProductView product={products.find(p=>p.id===selected.id)||selected} cart={cart} cartCount={cart.length} onBack={()=>setView("shop")} onLogo={handleLogo} onCart={()=>setShowCart(true)} onAddToCart={addToCart}/>}
      {view==="admin" && <AdminView authed={authed} onAuth={()=>setAuthed(true)} products={products} orders={orders} config={config} categories={categories} tab={adminTab} setTab={setAdminTab} onCreate={onCreate} onUpdate={onUpdate} onDelete={onDelete} onToggleSold={onToggleSold} onSaveConfig={saveCfg} onSaveCategories={saveCats} onClose={()=>setView("shop")} editing={editing} setEditing={setEditing}/>}
      {showCart && <CartModal cart={cart} onRemove={rmFromCart} onClose={()=>setShowCart(false)} onCheckout={()=>{setShowCart(false);setShowCheckout(true);}}/>}
      {showCheckout && <CheckoutModal cart={cart} config={config} onClose={()=>setShowCheckout(false)} onComplete={completeOrder}/>}
    </>
  );
}
