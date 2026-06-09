"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Favoritos() {
  const [usuario, setUsuario] = useState<any>(null);
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return; }
      setUsuario(session.user);
      cargarFavoritos(session.user.id);
    });
  }, []);

  const cargarFavoritos = async (userId: string) => {
    const { data } = await supabase
      .from('favoritos')
      .select('*, productos(*)')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });
    if (data) setFavoritos(data);
    setCargando(false);
  };

  const eliminarFavorito = async (e: React.MouseEvent, favoritoId: string, productoId: string) => {
    e.stopPropagation();
    await supabase.from('favoritos').delete().eq('id', favoritoId);
    setFavoritos(prev => prev.filter(f => f.id !== favoritoId));
  };

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .fav-card { transition: all 0.22s; }
        .fav-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .del-btn:hover { background-color: #ef4444 !important; color: white !important; border-color: #ef4444 !important; }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
        @media (max-width: 768px) {
          .fav-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#111', letterSpacing: '-1px', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#f90', borderRadius: '50%', marginBottom: '3px', marginLeft: '1px' }}></div>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #f90, #ff6b00)', borderRadius: '2px', marginTop: '1px' }}></div>
          </a>
          <div style={{ flex: 1 }}></div>
          <a href="/productos" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Productos</a>
          <a href="/carrito" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e5e5', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Carrito
          </a>
        </div>
        <div style={{ borderTop: '1px solid #f5f5f5' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '7px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a>{' › '}
              <span style={{ color: '#333', fontWeight: '600' }}>Mis favoritos</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px', animation: 'fadeIn 0.4s ease' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111', marginBottom: '6px', fontFamily: 'Arial Black, sans-serif' }}>
              Mis favoritos
            </h1>
            <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
              {cargando ? 'Cargando...' : `${favoritos.length} producto${favoritos.length !== 1 ? 's' : ''} guardado${favoritos.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <a href="/productos" style={{ backgroundColor: '#f90', color: '#111', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '13px', fontFamily: 'Arial Black, sans-serif' }}>
            Explorar productos
          </a>
        </div>

        {cargando ? (
          <div className="fav-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '300px' }}></div>)}
          </div>
        ) : favoritos.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '80px 40px', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '72px', height: '72px', backgroundColor: '#fff0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #fecaca' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#333', marginBottom: '10px' }}>No tienes favoritos todavia</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
              Cuando encuentres un producto que te guste dale al corazon para guardarlo aqui
            </p>
            <a href="/productos" style={{ backgroundColor: '#f90', color: '#111', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
              Explorar productos
            </a>
          </div>
        ) : (
          <div className="fav-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {favoritos.map(fav => {
              const p = fav.productos;
              if (!p) return null;
              return (
                <div key={fav.id} className="fav-card" style={{ backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative' }}>

                  {/* BOTON ELIMINAR */}
                  <button
                    className="del-btn"
                    onClick={e => eliminarFavorito(e, fav.id, p.id)}
                    title="Eliminar de favoritos"
                    style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'white', border: '1.5px solid #fecaca', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>

                  {/* IMAGEN */}
                  <div onClick={() => window.location.href = '/producto/' + p.id} style={{ height: '170px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} alt={p.nombre}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
                        onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ fontSize: '48px' }}>{p.emoji || '🛍️'}</div>
                    )}
                  </div>

                  {/* INFO */}
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{p.categoria}</p>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '8px', height: '36px', overflow: 'hidden', lineHeight: 1.3 }}>{p.nombre}</p>
                    <p style={{ fontWeight: '800', fontSize: '18px', color: '#111', marginBottom: '12px' }}>
                      ${Number(p.precio).toLocaleString('es-CO')}
                      <span style={{ fontSize: '11px', color: '#888', fontWeight: 'normal' }}> COP</span>
                    </p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => window.location.href = '/producto/' + p.id}
                        style={{ flex: 1, padding: '9px', backgroundColor: '#f90', color: '#111', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', transition: 'all 0.2s' }}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
                        onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                      >
                        Ver producto
                      </button>
                      <button
                        onClick={async e => {
                          e.stopPropagation();
                          const { data: session } = await supabase.auth.getSession();
                          if (!session.session) { window.location.href = '/login'; return; }
                          await supabase.from('carrito').insert([{ usuario_id: session.session.user.id, producto_id: p.id, cantidad: 1 }]);
                          const btn = e.currentTarget as HTMLElement;
                          btn.textContent = 'Agregado';
                          btn.style.backgroundColor = '#22c55e';
                          btn.style.color = 'white';
                          btn.style.borderColor = '#22c55e';
                          setTimeout(() => { btn.textContent = '🛒'; btn.style.backgroundColor = 'white'; btn.style.color = '#f90'; btn.style.borderColor = '#f90'; }, 2000);
                        }}
                        style={{ width: '38px', height: '38px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      </button>
                    </div>

                    <p style={{ fontSize: '11px', color: '#bbb', marginTop: '10px', margin: '10px 0 0' }}>
                      Guardado el {new Date(fav.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer style={{ backgroundColor: '#111', color: '#888', padding: '20px', textAlign: 'center', marginTop: '32px' }}>
        <p style={{ fontSize: '12px', margin: 0 }}>© 2026 Driny — Todos los derechos reservados | Colombia</p>
      </footer>
    </main>
  );
}