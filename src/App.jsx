import { useState, useEffect } from "react";

const SUPABASE_URL = "https://vjlbzrayiuwlpssjlnon.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbGJ6cmF5aXV3bHBzc2psbm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Njc5OTYsImV4cCI6MjA4OTU0Mzk5Nn0.Pcl7rS90Cv4eg6fuy1TiAwbA3YS1WrR69DMZKd_UjFY";

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

const DATOS_INICIALES = [
  { nombre: "Baño Parque Central", categoria: "public", latitud: 0.01, longitud: 0.008, gratuito: true, accesible: true, valoracion: 4.2, num_resenas: 38, abierto: true, consejo: "Baño público gratuito, sin necesidad de consumir nada." },
  { nombre: "Biblioteca Municipal", categoria: "library", latitud: -0.005, longitud: 0.012, gratuito: true, accesible: true, valoracion: 4.5, num_resenas: 61, abierto: true, consejo: "Acceso libre al baño para todos los visitantes." },
  { nombre: "Centro Comercial Plaza", categoria: "mall", latitud: 0.007, longitud: -0.009, gratuito: true, accesible: true, valoracion: 4.3, num_resenas: 124, abierto: true, consejo: "Baños en planta baja y primera. No hace falta consumir." },
  { nombre: "Estación de Metro Central", categoria: "transport", latitud: -0.003, longitud: -0.006, gratuito: false, accesible: true, valoracion: 3.6, num_resenas: 91, abierto: true, consejo: "Requiere moneda o ticket de metro en algunos accesos." },
  { nombre: "Hospital General", categoria: "health", latitud: 0.014, longitud: 0.003, gratuito: true, accesible: true, valoracion: 4.1, num_resenas: 44, abierto: true, consejo: "Zona de urgencias y hall principal con aseos accesibles." },
  { nombre: "Ayuntamiento", categoria: "government", latitud: -0.009, longitud: 0.015, gratuito: true, accesible: true, valoracion: 4.0, num_resenas: 22, abierto: false, consejo: "Abierto en horario de oficina. Acceso libre al público." },
  { nombre: "Parque del Río", categoria: "park", latitud: 0.018, longitud: -0.004, gratuito: true, accesible: false, valoracion: 3.4, num_resenas: 17, abierto: true, consejo: "Instalaciones básicas junto a la zona de juegos." },
  { nombre: "Universidad Politécnica", categoria: "university", latitud: -0.012, longitud: -0.011, gratuito: true, accesible: true, valoracion: 4.4, num_resenas: 55, abierto: true, consejo: "Hall de la facultad principal, acceso libre durante el día." },
  { nombre: "Museo de Arte Moderno", categoria: "museum", latitud: 0.003, longitud: 0.018, gratuito: true, accesible: true, valoracion: 4.7, num_resenas: 88, abierto: true, consejo: "Baños disponibles para visitantes aunque no compres entrada." },
  { nombre: "Estación de Autobuses", categoria: "transport", latitud: 0.011, longitud: -0.015, gratuito: true, accesible: true, valoracion: 3.8, num_resenas: 39, abierto: true, consejo: "Acceso libre, bien señalizado en la planta baja." },
  { nombre: "Biblioteca Regional", categoria: "library", latitud: -0.016, longitud: 0.007, gratuito: true, accesible: true, valoracion: 4.6, num_resenas: 33, abierto: false, consejo: "Cierra los domingos. Baños amplios y limpios entre semana." },
  { nombre: "Centro Cultural La Nave", categoria: "museum", latitud: 0.006, longitud: -0.018, gratuito: true, accesible: true, valoracion: 4.3, num_resenas: 51, abierto: true, consejo: "Entrada libre al edificio, baños junto a la recepción." },
];

const CATEGORIES = [
  { id: "public", label: "Baño público", icon: "🚻", color: "#10b981" },
  { id: "library", label: "Biblioteca", icon: "📚", color: "#6366f1" },
  { id: "mall", label: "Centro comercial", icon: "🛍️", color: "#f59e0b" },
  { id: "transport", label: "Transporte", icon: "🚉", color: "#3b82f6" },
  { id: "health", label: "Hospital / Salud", icon: "🏥", color: "#ef4444" },
  { id: "government", label: "Edificio público", icon: "🏛️", color: "#8b5cf6" },
  { id: "park", label: "Parque", icon: "🌳", color: "#84cc16" },
  { id: "university", label: "Universidad", icon: "🎓", color: "#0ea5e9" },
  { id: "museum", label: "Museo / Cultural", icon: "🖼️", color: "#ec4899" },
];

const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];

function distancia(lugar) {
  return Math.round(Math.sqrt(lugar.latitud ** 2 + lugar.longitud ** 2) * 10000);
}

function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: size, color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </span>
  );
}

function MapView({ places, selected, onSelect }) {
  const allLats = [...places.map(b => b.latitud), 0];
  const allLngs = [...places.map(b => b.longitud), 0];
  const minLat = Math.min(...allLats) - 0.004, maxLat = Math.max(...allLats) + 0.004;
  const minLng = Math.min(...allLngs) - 0.004, maxLng = Math.max(...allLngs) + 0.004;
  const toX = (lng) => ((lng - minLng) / (maxLng - minLng)) * 90 + 5;
  const toY = (lat) => (1 - (lat - minLat) / (maxLat - minLat)) * 80 + 10;

  return (
    <div style={{ background: "#e8f4f0", borderRadius: 16, overflow: "hidden", border: "1.5px solid #c3ddd4", position: "relative", height: 240 }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c8dfd7" strokeWidth="0.5"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#b2cec5" strokeWidth="5" opacity="0.5"/>
        <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#b2cec5" strokeWidth="3" opacity="0.4"/>
        <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#b2cec5" strokeWidth="5" opacity="0.5"/>
        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#b2cec5" strokeWidth="3" opacity="0.4"/>
        <circle cx="50%" cy="50%" r="8" fill="#3b82f6" opacity="0.2"/>
        <circle cx="50%" cy="50%" r="5" fill="#3b82f6"/>
        <circle cx="50%" cy="50%" r="2" fill="white"/>
      </svg>
      {places.map((b) => {
        const cat = getCat(b.categoria);
        const x = toX(b.longitud), y = toY(b.latitud);
        const isSel = selected?.id === b.id;
        return (
          <button key={b.id} onClick={() => onSelect(b)} title={b.nombre}
            style={{
              position: "absolute", left: `${x}%`, top: `${y}%`,
              transform: "translate(-50%, -100%)",
              background: isSel ? "#1e3a34" : cat.color,
              border: isSel ? "2.5px solid white" : "2px solid white",
              borderRadius: "50% 50% 50% 0",
              width: isSel ? 34 : 28, height: isSel ? 34 : 28,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isSel ? 14 : 12,
              boxShadow: isSel ? "0 4px 16px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease", zIndex: isSel ? 10 : 1,
            }}
          >{cat.icon}</button>
        );
      })}
      <div style={{ position: "absolute", bottom: 8, left: 10, background: "rgba(255,255,255,0.9)", borderRadius: 8, padding: "4px 8px", fontSize: 10, color: "#3b82f6", fontWeight: 700, border: "1px solid #bfdbfe" }}>
        📍 Tú estás aquí
      </div>
    </div>
  );
}

function PlaceCard({ b, isSelected, onClick }) {
  const cat = getCat(b.categoria);
  const dist = distancia(b);
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left",
      background: isSelected ? "#f0faf6" : "white",
      border: isSelected ? `1.5px solid ${cat.color}` : "1.5px solid #e5e7eb",
      borderRadius: 14, padding: "11px 13px", cursor: "pointer",
      transition: "all 0.18s", boxShadow: isSelected ? `0 2px 12px ${cat.color}22` : "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ background: cat.color + "22", borderRadius: 8, padding: "4px 7px", fontSize: 18 }}>{cat.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#1a2e28", lineHeight: 1.3 }}>{b.nombre}</div>
            <div style={{ fontSize: 10, color: cat.color, fontWeight: 600 }}>{cat.label}</div>
          </div>
        </div>
        <span style={{ background: b.abierto ? "#dcfce7" : "#fee2e2", color: b.abierto ? "#16a34a" : "#dc2626", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700, marginLeft: 6, whiteSpace: "nowrap" }}>
          {b.abierto ? "Abierto" : "Cerrado"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        <Stars rating={b.valoracion} size={11} />
        <span style={{ fontSize: 11, color: "#6b7280" }}>{b.valoracion} ({b.num_resenas})</span>
        <span style={{ color: "#d1d5db" }}>·</span>
        <span style={{ fontSize: 11, color: "#6b7280" }}>📍 {dist}m</span>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        <span style={{ background: b.gratuito ? "#dcfce7" : "#fef3c7", color: b.gratuito ? "#16a34a" : "#d97706", border: `1px solid ${b.gratuito ? "#bbf7d0" : "#fde68a"}`, borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 600 }}>
          {b.gratuito ? "✓ Gratuito" : "$ De pago"}
        </span>
        {b.accesible && <span style={{ background: "#dbeafe", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 600 }}>♿ Accesible</span>}
      </div>
    </button>
  );
}

function DetailPanel({ b, onClose, onReseña }) {
  const cat = getCat(b.categoria);
  const dist = distancia(b);
  const [newReview, setNewReview] = useState({ stars: 0, text: "" });
  const [submitted, setSubmitted] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!newReview.stars || !newReview.text.trim()) return;
    setSaving(true);
    const nuevaVal = ((b.valoracion * b.num_resenas) + newReview.stars) / (b.num_resenas + 1);
    await fetch(`${SUPABASE_URL}/rest/v1/lugares?id=eq.${b.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ valoracion: Math.round(nuevaVal * 10) / 10, num_resenas: b.num_resenas + 1 }),
    });
    setSaving(false);
    setSubmitted(true);
    onReseña();
  };

  return (
    <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      <div style={{ background: `linear-gradient(135deg, #1e3a34 0%, ${cat.color} 100%)`, padding: "16px 16px 12px", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 26, marginBottom: 4 }}>{cat.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{b.nombre}</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{cat.label}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <Stars rating={b.valoracion} size={13} />
          <span style={{ fontSize: 11, opacity: 0.85 }}>{b.valoracion} ({b.num_resenas} reseñas)</span>
        </div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        {b.consejo && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "9px 12px", marginBottom: 12, display: "flex", gap: 8 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>{b.consejo}</span>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { icon: "📍", label: "Distancia", value: `${dist} metros` },
            { icon: "🕐", label: "Estado", value: b.abierto ? "Abierto ahora" : "Cerrado" },
            { icon: b.gratuito ? "🆓" : "💰", label: "Coste", value: b.gratuito ? "Gratuito" : "De pago" },
            { icon: "♿", label: "Accesibilidad", value: b.accesible ? "Adaptado" : "Sin adaptar" },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background: "#f8faf9", borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, marginBottom: 2 }}>{label.toUpperCase()}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1a2e28" }}>{icon} {value}</div>
            </div>
          ))}
        </div>
        <button style={{ width: "100%", background: "linear-gradient(90deg, #10b981, #059669)", color: "white", border: "none", borderRadius: 12, padding: "11px", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
          🧭 Cómo llegar
        </button>
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#1a2e28", marginBottom: 10 }}>Añadir reseña</div>
          {!submitted ? (
            <div style={{ background: "#f0faf6", borderRadius: 12, padding: 12, border: "1px solid #d1ede5" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setNewReview(r => ({ ...r, stars: s }))}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, padding: 0, color: s <= (hoverStar || newReview.stars) ? "#f59e0b" : "#d1d5db" }}>★</button>
                ))}
              </div>
              <textarea value={newReview.text} onChange={e => setNewReview(r => ({ ...r, text: e.target.value }))}
                placeholder="¿Cómo estuvo? Cuéntanos..."
                style={{ width: "100%", borderRadius: 8, border: "1.5px solid #d1ede5", padding: "8px 10px", fontSize: 12, resize: "none", height: 60, fontFamily: "inherit", color: "#1a2e28", boxSizing: "border-box", background: "white" }}
              />
              <button onClick={handleSubmit} disabled={saving}
                style={{ marginTop: 8, background: saving ? "#9ca3af" : "#1e3a34", color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Enviando..." : "Enviar reseña"}
              </button>
            </div>
          ) : (
            <div style={{ background: "#dcfce7", borderRadius: 10, padding: 10, textAlign: "center", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
              ✓ ¡Reseña guardada en la base de datos!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(null);
  const [activeCats, setActiveCats] = useState([]);
  const [filterFree, setFilterFree] = useState(false);
  const [filterAccessible, setFilterAccessible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [showCatFilter, setShowCatFilter] = useState(false);

  const fetchPlaces = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/lugares?select=*`, { headers });
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setPlaces(data);
      setError(null);
    } catch (e) {
      setError("No se pudieron cargar los lugares.");
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    setSeeding(true);
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/lugares`, {
        method: "POST",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify(DATOS_INICIALES),
      });
      await fetchPlaces();
    } catch (e) {
      setError("Error al cargar datos iniciales.");
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => { fetchPlaces(); }, []);

  const toggleCat = (id) => setActiveCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const filtered = places.filter(b => {
    if (activeCats.length > 0 && !activeCats.includes(b.categoria)) return false;
    if (filterFree && !b.gratuito) return false;
    if (filterAccessible && !b.accesible) return false;
    if (search && !b.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => distancia(a) - distancia(b));

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #0f2420 0%, #1e3a34 60%, #2d6a5e 100%)", fontFamily: "'Georgia', serif" }}>
      <div style={{ fontSize: 56, marginBottom: 20, animation: "pulse 1.2s ease-in-out infinite" }}>🚻</div>
      <div style={{ color: "white", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>¿El baño por favor?</div>
      <div style={{ color: "#7ec8b4", fontSize: 13 }}>Conectando con la base de datos...</div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f7f4", fontFamily: "'Georgia', serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0f2420 0%, #1e3a34 100%)", padding: "16px 14px 12px", color: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 26 }}>🚻</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em" }}>¿El baño por favor?</div>
            <div style={{ fontSize: 11, color: "#7ec8b4", marginTop: 1 }}>
              {places.length > 0 ? `📍 ${filtered.length} lugares cercanos` : "⚠️ Base de datos vacía"}
            </div>
          </div>
        </div>
        {places.length === 0 && !error && (
          <button onClick={seedData} disabled={seeding} style={{ width: "100%", background: "#10b981", border: "none", borderRadius: 12, padding: "11px", color: "white", fontWeight: 700, fontSize: 13, cursor: seeding ? "not-allowed" : "pointer", marginBottom: 10 }}>
            {seeding ? "⏳ Cargando datos..." : "🚀 Cargar datos de ejemplo"}
          </button>
        )}
        {error && <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 10, padding: "8px 12px", fontSize: 12, marginBottom: 8 }}>⚠️ {error}</div>}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar lugar..."
          style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 14px", color: "white", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 8 }}
        />
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {[
            { label: "🆓 Gratuito", active: filterFree, color: "#10b981", toggle: () => setFilterFree(f => !f) },
            { label: "♿ Accesible", active: filterAccessible, color: "#3b82f6", toggle: () => setFilterAccessible(f => !f) },
            { label: `🏷️ Categoría${activeCats.length > 0 ? ` (${activeCats.length})` : ""}`, active: activeCats.length > 0, color: "#f59e0b", toggle: () => setShowCatFilter(s => !s) },
          ].map(({ label, active, color, toggle }) => (
            <button key={label} onClick={toggle} style={{ background: active ? color : "rgba(255,255,255,0.12)", border: active ? "none" : "1.5px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "5px 12px", color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.18s" }}>{label}</button>
          ))}
          {activeCats.length > 0 && <button onClick={() => setActiveCats([])} style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 10px", color: "#fca5a5", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✕ Limpiar</button>}
        </div>
        {showCatFilter && (
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => toggleCat(cat.id)} style={{ background: activeCats.includes(cat.id) ? cat.color : "rgba(255,255,255,0.08)", border: activeCats.includes(cat.id) ? "none" : "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 11px", color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: 14, maxWidth: 480, margin: "0 auto" }}>
        {places.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <MapView places={filtered.length > 0 ? filtered : places} selected={selected} onSelect={b => setSelected(s => s?.id === b.id ? null : b)} />
          </div>
        )}
        {selected && (
          <div style={{ marginBottom: 14 }}>
            <DetailPanel b={selected} onClose={() => setSelected(null)} onReseña={fetchPlaces} />
          </div>
        )}
        {places.length > 0 && (
          <>
            <div style={{ fontWeight: 700, fontSize: 11, color: "#6b7280", marginBottom: 8, letterSpacing: "0.06
