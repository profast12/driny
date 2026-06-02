"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function PerfilVendedor() {
  const [id, setId] = useState('');
  const [vendedor, setVendedor] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [subastas, setSubastas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState<'productos' | 'subastas'>('productos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const parts = window.location.pathname.split('/');
    const vendId = parts[parts.length - 1];
    setId(vendId);
    if (vendId) cargarPerfil(vendId);
  }, []);

  const cargarPerfil = async (vendId: string) => {
    const { data: v } = await supabase.from('usuarios').select('*').eq('id', vendId).single();
    if (v) setVendedor(v);
    const { data: p } = await supabase.from('productos').select('*').eq('vendedor_id', vendId).order('created_at', { ascending: false });
    if (p) setProductos(p);
    const { data: s } = await supabase.from('subastas_real').select('*').eq('vendedor_id', vendId).eq('activa', true).order('created_at', { ascending: false });
    if (s) setSubastas(s);
    setCargando(false);
  };

  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  if (cargando) return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '14px 24px' }}>
        <a href="/" style={{ fontSize: '22px', fontWeight: '900', color: '#111', textDecoration: 'none', fontFamily: 'Arial Black, sans-serif' }}>DRINY</a>
      </nav>
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{ height: '200px', backgroundColor: '#e8e8e8', borderRadius: '16px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}></div>
      </div>
    </main>
  );

  if (!vendedor) return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '14px 24px' }}>
        <a href="/" style={{ fontSize: '22px', fontWeight: '900', color: '#111', textDecoration: 'none', fontFamily: 'Arial Black, sans-serif' }}>DRINY</a>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>Vendedor no encontrado</p>
        <a href="/productos" style={{ color: '#f90', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>Ver productos</a>
      </div>
    </main>
  );

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .prod-card-v { transition: all 0.22s; }
        .prod-card-v:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .tab-btn:hover { color: #f90 !important; }
        @media (max-width: 768px) {
          .prod-grid-v { grid-template-columns: repeat(2, 1fr) !important; }
          .header-flex { flex-direction: column !important; text-align: center !important; align-items: center !important; }
          .stats-flex { justify-content: center !important; }
        }
        @media (max-width: 480px) {
          .prod-grid-v { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ fontSize: '22px', fontWeight: '900', color: '#111', textDecoration: 'none', fontFamily: 'Arial Black, sans-serif', flexShrink: 0 }}>
            DRINY<span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#f90', borderRadius: '50%', marginLeft: '2px', marginBottom: '12px' }}></span>
          </a>
          <div style={{ flex: 1 }}></div>
          <a href="/productos" style={{ color: '#555', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Productos</a>
          <a href="/carrito" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#555', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Carrito
          </a>
        </div>

        {/* BREADCRUMB */}
        <div style={{ borderTop: '1px solid #f5f5f5' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a>
              {' › '}
              <a href="/productos" style={{ color: '#888', textDecoration: 'none' }}>Productos</a>
              {' › '}
              <span style={{ color: '#333', fontWeight: '600' }}>{vendedor.nombre_tienda || vendedor.nombre || 'Vendedor'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* HEADER VENDEDOR */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #eee', marginBottom: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', animation: 'fadeIn 0.4s ease' }}>
          <div className="header-flex" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>

            {/* AVATAR */}
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: '#111', flexShrink: 0, border: '3px solid #ffe0b2', boxShadow: '0 4px 16px rgba(255,153,0,0.2)' }}>
              {vendedor.avatar_url ? <img src={vendedor.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (vendedor.nombre || 'V').charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>
                  {vendedor.nombre_tienda || vendedor.nombre || 'Vendedor'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '700' }}>Verificado</span>
                </div>
              </div>
              {vendedor.username && <p style={{ color: '#f90', fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>@{vendedor.username}</p>}
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Vendedor en Driny</p>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-flex" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Productos', valor: productos.length, color: '#f90' },
              { label: 'Subastas activas', valor: subastas.length, color: '#22c55e' },
              { label: 'Calificacion', valor: '5.0', color: '#3b82f6' },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '14px 20px', border: '1px solid #eee', textAlign: 'center', minWidth: '100px' }}>
                <p style={{ fontSize: '22px', fontWeight: '900', color: stat.color, margin: 0, fontFamily: 'Arial Black, sans-serif' }}>{stat.valor}</p>
                <p style={{ fontSize: '12px', color: '#888', margin: 0, marginTop: '2px' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '4px', borderTop: '1px solid #f5f5f5' }}>
          {[
            { id: 'productos', label: `Productos (${productos.length})` },
            { id: 'subastas', label: `Subastas activas (${subastas.length})` },
          ].map(t => (
            <button key={t.id} className="tab-btn" onClick={() => setTab(t.id as any)} style={{ padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: tab === t.id ? '#f90' : '#888', borderBottom: tab === t.id ? '2px solid #f90' : '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px', animation: 'fadeIn 0.3s ease' }}>

        {/* BUSCADOR */}
        {tab === 'productos' && (
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, maxWidth: '400px', display: 'flex' }}>
              <input
                type="text"
                placeholder={`Buscar en ${vendedor.nombre_tienda || vendedor.nombre || 'esta tienda'}...`}
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', border: '2px solid #f90', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '13px', outline: 'none' }}
              />
              <div style={{ padding: '10px 14px', backgroundColor: '#f90', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </div>
            <span style={{ fontSize: '13px', color: '#888' }}>{filtrados.length} productos</span>
          </div>
        )}

        {/* PRODUCTOS */}
        {tab === 'productos' && (
          filtrados.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #eee' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>
                {busqueda ? 'No se encontraron productos' : 'Este vendedor no tiene productos publicados'}
              </p>
              {busqueda && <button onClick={() => setBusqueda('')} style={{ backgroundColor: '#f90', color: '#111', padding: '9px 20px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Ver todos</button>}
            </div>
          ) : (
            <div className="prod-grid-v" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
              {filtrados.map(p => (
                <div key={p.id} className="prod-card-v" onClick={() => window.location.href = '/producto/' + p.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ height: '160px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} alt={p.nombre}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
                        onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                      />
                    ) : (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.categoria}</p>
                    <p style={{ fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '10px', lineHeight: 1.3, height: '34px', overflow: 'hidden' }}>{p.nombre}</p>
                    <p style={{ fontWeight: '800', fontSize: '17px', color: '#111', marginBottom: '10px' }}>
                      ${Number(p.precio).toLocaleString('es-CO')}
                      <span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}> COP</span>
                    </p>
                    <button style={{ width: '100%', padding: '9px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', transition: 'all 0.2s' }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                    >
                      Ver producto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* SUBASTAS */}
        {tab === 'subastas' && (
          subastas.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #eee' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>No hay subastas activas</p>
            </div>
          ) : (
            <div className="prod-grid-v" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {subastas.map(s => (
                <div key={s.id} className="prod-card-v" onClick={() => window.location.href = '/subasta/' + s.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ height: '160px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {s.imagenes && s.imagenes.length > 0 ? (
                      <img src={s.imagenes[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={s.nombre} />
                    ) : (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    )}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#22c55e', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>EN VIVO</div>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>{s.categoria}</p>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '8px' }}>{s.nombre}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: '#888' }}>Precio actual</p>
                        <p style={{ fontWeight: '800', fontSize: '16px', color: '#111' }}>${Number(s.precio_actual).toLocaleString('es-CO')} <span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}>COP</span></p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: '#888' }}>Ofertas</p>
                        <p style={{ fontWeight: '800', fontSize: '16px', color: '#f90' }}>{s.total_ofertas}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <footer style={{ backgroundColor: '#111', color: '#888', padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px' }}>© 2026 Driny — Todos los derechos reservados | Colombia</p>
      </footer>

    </main>
  );
}