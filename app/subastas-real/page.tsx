"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const categorias = ["Todas", "Electronica", "Ropa", "Hogar", "Deportes", "Juguetes", "Autos", "Arte", "Coleccionables", "Otro"];

export default function SubastasReal() {
  const [subastas, setSubastas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [ordenar, setOrdenar] = useState("recientes");
  const [tiempos, setTiempos] = useState<any>({});
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    cargarSubastas();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUsuario(session.user);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nuevos: any = {};
      subastas.forEach(s => {
        const diff = new Date(s.tiempo_fin).getTime() - new Date().getTime();
        if (diff <= 0) { nuevos[s.id] = 'Finalizada'; return; }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const seg = Math.floor((diff % 60000) / 1000);
        nuevos[s.id] = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(seg).padStart(2,'0')}`;
      });
      setTiempos(nuevos);
    }, 1000);
    return () => clearInterval(interval);
  }, [subastas]);

  const cargarSubastas = async () => {
    const { data } = await supabase
      .from('subastas_real')
      .select('*')
      .eq('activa', true)
      .gt('tiempo_fin', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (data) setSubastas(data);
    setCargando(false);
  };

  const filtradas = subastas
    .filter(s => categoriaActiva === "Todas" || s.categoria === categoriaActiva)
    .filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (ordenar === "precio_asc") return a.precio_actual - b.precio_actual;
      if (ordenar === "precio_desc") return b.precio_actual - a.precio_actual;
      if (ordenar === "ofertas") return b.total_ofertas - a.total_ofertas;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: 'white' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .card-subasta { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
        .card-subasta:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(255,153,0,0.15); border-color: rgba(255,153,0,0.4) !important; }
        .skeleton { background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#111', borderBottom: '1px solid #1f1f1f', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', gap: '20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ color: '#f90', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none', letterSpacing: '-0.5px' }}>Driny</a>
        <span style={{ color: '#2a2a2a' }}>|</span>
        <span style={{ color: '#888', fontSize: '14px', fontWeight: '600' }}>Subastas en vivo</span>
        <div style={{ flex: 1, maxWidth: '400px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Buscar subastas..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ width: '100%', padding: '8px 16px', borderRadius: '8px', border: '1px solid #2a2a2a', backgroundColor: '#1a1a1a', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const }}
            onFocus={e => e.target.style.border = '1px solid #f90'}
            onBlur={e => e.target.style.border = '1px solid #2a2a2a'}
          />
        </div>
        <div style={{ flex: 1 }}></div>
        {usuario ? (
          <a href="/perfil" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Mi perfil</a>
        ) : (
          <a href="/login" style={{ backgroundColor: '#f90', color: '#111', padding: '6px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>Entrar</a>
        )}
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #0f0f0f 50%, #001a0a 100%)', padding: '60px 24px', textAlign: 'center', borderBottom: '1px solid #1f1f1f' }}>
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#22c55e22', border: '1px solid #22c55e44', borderRadius: '20px', padding: '6px 16px', marginBottom: '20px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', animation: 'pulse 2s infinite' }}></div>
            <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600', letterSpacing: '1px' }}>{subastas.length} SUBASTAS EN VIVO</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '14px', lineHeight: 1.2 }}>
            Subastas en{' '}
            <span style={{ background: 'linear-gradient(135deg, #f90, #ff6b00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              tiempo real
            </span>
          </h1>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '28px', maxWidth: '500px', margin: '0 auto 28px' }}>
            Oferta por productos unicos y consiguelos al mejor precio
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/subastas-panel" style={{ backgroundColor: '#f90', color: '#111', padding: '12px 28px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>
              Subastar mis productos
            </a>
            <a href="/productos" style={{ backgroundColor: 'transparent', color: '#f90', padding: '12px 28px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', border: '1px solid #f9030' }}>
              Ver productos
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* FILTROS */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: 1 }}>
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                style={{ padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', transition: 'all 0.2s', backgroundColor: categoriaActiva === cat ? '#f90' : '#1a1a1a', color: categoriaActiva === cat ? '#111' : '#666' }}
              >
                {cat}
              </button>
            ))}
          </div>
          <select
            value={ordenar}
            onChange={e => setOrdenar(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #2a2a2a', backgroundColor: '#1a1a1a', color: 'white', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="recientes">Mas recientes</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
            <option value="ofertas">Mas ofertas</option>
          </select>
        </div>

        <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
          {cargando ? 'Cargando subastas...' : `${filtradas.length} subastas encontradas`}
        </p>

        {/* GRID */}
        {cargando ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ borderRadius: '16px', height: '320px' }}></div>
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: '#111', borderRadius: '20px', border: '1px solid #1f1f1f' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No hay subastas activas</p>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Se el primero en subastar un producto</p>
            <a href="/subastas-panel" style={{ backgroundColor: '#f90', color: '#111', padding: '12px 28px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>
              Crear subasta
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', animation: 'fadeIn 0.4s ease' }}>
            {filtradas.map(s => {
              const tiempo = tiempos[s.id] || '';
              const urgente = tiempo !== 'Finalizada' && tiempo !== '' && parseInt(tiempo.split(':')[0]) === 0 && parseInt(tiempo.split(':')[1]) < 30;
              return (
                <div
                  key={s.id}
                  className="card-subasta"
                  onClick={() => window.location.href = '/subasta/' + s.id}
                  style={{ backgroundColor: '#111', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1f1f1f', cursor: 'pointer' }}
                >
                  {/* IMAGEN */}
                  <div style={{ height: '180px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', position: 'relative', overflow: 'hidden' }}>
                    {s.imagen_url ? (
                      <img src={s.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={s.nombre} />
                    ) : (
                      <span>{s.emoji || '🛍️'}</span>
                    )}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#22c55e', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                      EN VIVO
                    </div>
                    <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: urgente ? '#ef4444' : '#111', color: urgente ? 'white' : '#f90', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace', border: urgente ? 'none' : '1px solid #2a2a2a' }}>
                      {tiempo || '--:--:--'}
                    </div>
                  </div>

                  {/* INFO */}
                  <div style={{ padding: '18px' }}>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.categoria}</p>
                    <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '12px', lineHeight: 1.3 }}>{s.nombre}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Precio actual</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', background: 'linear-gradient(135deg, #f90, #ff6b00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          ${Number(s.precio_actual).toLocaleString('es-CO')}
                        </p>
                        <p style={{ fontSize: '10px', color: '#666' }}>COP</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>Ofertas</p>
                        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{s.total_ofertas}</p>
                      </div>
                    </div>

                    <div style={{ marginTop: '14px', width: '100%', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#f90', border: '1px solid #2a2a2a' }}>
                      Ver subasta
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}