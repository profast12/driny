"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');

  const categorias = [
    { nombre: "Electronica", icono: "💻" },
    { nombre: "Ropa", icono: "👕" },
    { nombre: "Hogar", icono: "🏠" },
    { nombre: "Deportes", icono: "⚽" },
    { nombre: "Juguetes", icono: "🎮" },
    { nombre: "Autos", icono: "🚗" },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('username, avatar_url, tipo')
          .eq('email', session.user.email)
          .single();
        setUsuario({ ...session.user, username: perfil?.username || null, avatar_url: perfil?.avatar_url || null, tipo: perfil?.tipo || 'comprador' });
        cargarNotificaciones(session.user.id);
      } else {
        setUsuario(null);
      }
    });
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);
    if (data) setProductos(data);
  };

  const cargarNotificaciones = async (userId: string) => {
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNotificaciones(data);
  };

  const marcarLeidas = async () => {
    if (!usuario) return;
    await supabase.from('notificaciones').update({ leida: true }).eq('usuario_id', usuario.id).eq('leida', false);
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
  };

  const buscar = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && busqueda.trim()) {
      window.location.href = '/busqueda?q=' + busqueda;
    }
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .nav-link:hover { color: #f90 !important; }
        .cat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important; transform: translateY(-2px); }
        .prod-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12) !important; transform: translateY(-3px); }
        .notif-item:hover { background-color: #f9f9f9 !important; }
        .search-btn:hover { background-color: #e68a00 !important; }
        .quick-btn:hover { background-color: #fff5e6 !important; border-color: #f90 !important; }
      `}</style>

      {/* BARRA SUPERIOR */}
      <div style={{ backgroundColor: '#fff8f0', borderBottom: '1px solid #ffe0b2', padding: '6px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', gap: '20px', fontSize: '12px', color: '#666' }}>
          {usuario?.tipo !== 'vendedor' && (
            <a href="/mis-pedidos" className="nav-link" style={{ textDecoration: 'none', color: '#666' }}>Mis pedidos</a>
          )}
          <a href="/subastas-real" className="nav-link" style={{ textDecoration: 'none', color: '#666' }}>Subastas</a>
          <a href="/vende-con-nosotros" className="nav-link" style={{ textDecoration: 'none', color: '#666' }}>Vender en Driny</a>
          <a href="/perfil" className="nav-link" style={{ textDecoration: 'none', color: '#666' }}>Ayuda</a>
        </div>
      </div>

      {/* NAVBAR PRINCIPAL */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '24px' }}>

          {/* LOGO */}
          <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#111', letterSpacing: '-1px', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#f90', borderRadius: '50%', marginBottom: '16px', marginLeft: '2px' }}></div>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #f90, #ff6b00)', borderRadius: '2px', marginTop: '-6px' }}></div>
          </a>

          {/* BUSCADOR */}
          <div style={{ flex: 1, display: 'flex', maxWidth: '600px' }}>
            <input
              type="text"
              placeholder="Buscar productos, marcas y mas..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={buscar}
              style={{ flex: 1, padding: '12px 18px', border: '2px solid #f90', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '14px', outline: 'none', backgroundColor: 'white', color: '#333' }}
            />
            <button
              className="search-btn"
              onClick={() => busqueda.trim() && (window.location.href = '/busqueda?q=' + busqueda)}
              style={{ padding: '12px 20px', backgroundColor: '#f90', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>

          {/* ACCIONES */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>

            {usuario ? (
              <>
                {/* USUARIO */}
                <a href="/perfil" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 'bold', color: '#111', flexShrink: 0, border: '2px solid #f90' }}>
                    {usuario.avatar_url ? (
                      <img src={usuario.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (usuario.username || usuario.email).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Hola,</p>
                    <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#f90', margin: 0 }}>{usuario.username || usuario.email.split('@')[0]}</p>
                  </div>
                </a>

                {/* NOTIFICACIONES */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => { setMostrarNotif(!mostrarNotif); if (!mostrarNotif) marcarLeidas(); }}
                    style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {noLeidas > 0 && (
                      <span style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
                        {noLeidas}
                      </span>
                    )}
                  </button>

                  {mostrarNotif && (
                    <div style={{ position: 'absolute', right: 0, top: '44px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', width: '340px', zIndex: 200, border: '1px solid #f0f0f0', animation: 'slideDown 0.2s ease', overflow: 'hidden' }}>
                      <div style={{ padding: '16px 18px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#111', margin: 0 }}>Notificaciones</h3>
                        <button onClick={() => setMostrarNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '18px' }}>✕</button>
                      </div>
                      {notificaciones.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                          </svg>
                          <p style={{ fontSize: '14px' }}>Sin notificaciones</p>
                        </div>
                      ) : (
                        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                          {notificaciones.map(n => (
                            <div
                              key={n.id}
                              className="notif-item"
                              onClick={() => {
                                setMostrarNotif(false);
                                if (n.subasta_id) {
                                  window.location.href = '/subasta-resultado?id=' + n.subasta_id;
                                } else if (n.pedido_id) {
                                  window.location.href = usuario?.tipo === 'vendedor' ? '/pedido/' + n.pedido_id : '/mis-pedidos';
                                }
                              }}
                              style={{ padding: '14px 18px', borderBottom: '1px solid #f9f9f9', backgroundColor: n.leida ? 'white' : '#fff8f0', cursor: 'pointer', transition: 'background 0.2s' }}
                            >
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#fff0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <span style={{ fontSize: '16px' }}>{n.titulo.includes('venta') || n.titulo.includes('Venta') ? '💰' : n.titulo.includes('subasta') || n.titulo.includes('Subasta') || n.titulo.includes('oferta') ? '🔨' : '📦'}</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#111', marginBottom: '3px' }}>{n.titulo}</p>
                                  <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.4 }}>{n.mensaje}</p>
                                  <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>
                                    {new Date(n.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                                {!n.leida && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f90', flexShrink: 0, marginTop: '4px' }}></div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* CERRAR SESION */}
                <button onClick={cerrarSesion} style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', color: '#888', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <a href="/login" style={{ color: '#333', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Ingresar</a>
                <a href="/registro" style={{ backgroundColor: '#f90', color: '#111', padding: '9px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                  Crear cuenta
                </a>
              </>
            )}

            {/* CARRITO */}
            <a href="/carrito" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#555', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Carrito</span>
            </a>
          </div>
        </div>

        {/* CATEGORIAS NAVBAR */}
        <div style={{ borderTop: '1px solid #f5f5f5', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {categorias.map(cat => (
              <a key={cat.nombre} href={'/productos?cat=' + cat.nombre} className="nav-link" style={{ padding: '10px 16px', textDecoration: 'none', color: '#555', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', borderBottom: '2px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#555'; }}
              >
                {cat.icono} {cat.nombre}
              </a>
            ))}
            <a href="/subastas-real" className="nav-link" style={{ padding: '10px 16px', textDecoration: 'none', color: '#f90', fontSize: '13px', fontWeight: '800', whiteSpace: 'nowrap', borderBottom: '2px solid #f90', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Subastas en vivo
            </a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* BANNER PRINCIPAL */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a00 50%, #1a1a1a 100%)', display: 'flex', alignItems: 'center', minHeight: '220px', padding: '40px', position: 'relative', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'inline-block', backgroundColor: '#f90', color: '#111', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', marginBottom: '14px', letterSpacing: '1px' }}>
              BIENVENIDO A DRINY
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'white', marginBottom: '10px', lineHeight: 1.2, fontFamily: 'Arial Black, sans-serif' }}>
              Todo lo que necesitas,<br />
              <span style={{ background: 'linear-gradient(135deg, #f90, #ff6b00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en un solo lugar</span>
            </h1>
            <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '24px' }}>Compra, vende y subasta productos en Colombia</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="/productos" style={{ backgroundColor: '#f90', color: '#111', padding: '12px 28px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>
                Ver productos
              </a>
              <a href="/subastas-real" style={{ backgroundColor: 'transparent', color: '#f90', padding: '12px 28px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', border: '2px solid #f90' }}>
                Subastas en vivo
              </a>
            </div>
          </div>
          <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', textAlign: 'center', opacity: 0.15 }}>
            <div style={{ fontSize: '120px', fontWeight: '900', color: '#f90', fontFamily: 'Arial Black, sans-serif', lineHeight: 1 }}>DRINY</div>
          </div>
        </div>

        {/* ACCESOS RAPIDOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'Envio gratis', sub: 'En tu primera compra', icon: '📦', href: '/productos' },
            { label: 'Pago seguro', sub: 'Con PayPal', icon: '🔒', href: '/productos' },
            { label: 'Vendedores', sub: 'Verificados', icon: '✓', href: '/productos', iconStyle: { backgroundColor: '#22c55e', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' } },
            { label: 'Subastas', sub: 'En tiempo real', icon: '🔨', href: '/subastas-real' },
            { label: 'Vender', sub: 'Gratis en Driny', icon: '🏪', href: '/vende-con-nosotros' },
            { label: 'Soporte', sub: '24/7 disponible', icon: '💬', href: '/perfil' },
          ].map((item, i) => (
            <a key={i} href={item.href} className="quick-btn" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', textDecoration: 'none', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '28px' }}>{item.icon}</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '2px' }}>{item.label}</p>
                <p style={{ fontSize: '11px', color: '#888' }}>{item.sub}</p>
              </div>
            </a>
          ))}
        </div>

        {/* PRODUCTOS DESTACADOS */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Productos destacados</h2>
              <div style={{ height: '3px', width: '60px', backgroundColor: '#f90', borderRadius: '2px', marginTop: '4px' }}></div>
            </div>
            <a href="/productos" style={{ color: '#f90', textDecoration: 'none', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Ver todos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {productos.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #eee' }}>
              <p style={{ color: '#888', fontSize: '15px', marginBottom: '16px' }}>No hay productos publicados todavia</p>
              <a href="/vende-con-nosotros" style={{ backgroundColor: '#f90', color: '#111', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                Publicar el primero
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {productos.map(p => (
                <div
                  key={p.id}
                  className="prod-card"
                  onClick={() => window.location.href = '/producto/' + p.id}
                  style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ height: '160px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', overflow: 'hidden' }}>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.nombre} />
                    ) : (
                      p.emoji || '🛍️'
                    )}
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{p.categoria}</p>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '8px', lineHeight: 1.3 }}>{p.nombre}</p>
                    <p style={{ fontWeight: '800', fontSize: '18px', color: '#111' }}>
                      ${Number(p.precio).toLocaleString('es-CO')}
                      <span style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}> COP</span>
                    </p>
                    <button style={{ marginTop: '10px', width: '100%', padding: '9px', backgroundColor: '#fff5e6', color: '#f90', border: '1px solid #ffe0b2', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff5e6'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BANNER SUBASTAS */}
        <div style={{ background: 'linear-gradient(135deg, #0f0f0f, #1a1000)', borderRadius: '16px', padding: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div>
            <div style={{ display: 'inline-block', backgroundColor: '#22c55e', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '1px', animation: 'pulse 2s infinite' }}>
              EN VIVO AHORA
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '8px', fontFamily: 'Arial Black, sans-serif' }}>
              Subastas en tiempo real
            </h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Oferta por productos unicos y consiguelos al mejor precio</p>
            <a href="/subastas-real" style={{ backgroundColor: '#f90', color: '#111', padding: '11px 24px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>
              Ver subastas activas
            </a>
          </div>
          <div style={{ fontSize: '80px', opacity: 0.15, fontWeight: '900', color: '#f90', fontFamily: 'Arial Black, sans-serif' }}>LIVE</div>
        </div>

        {/* BANNER VENDEDOR */}
        <div style={{ background: 'linear-gradient(135deg, #fff8f0, #fff5e6)', borderRadius: '16px', padding: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ffe0b2', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111', marginBottom: '8px', fontFamily: 'Arial Black, sans-serif' }}>
              Vende en Driny gratis
            </h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Llega a miles de compradores en Colombia. Sin costo de registro.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="/vende-con-nosotros" style={{ backgroundColor: '#f90', color: '#111', padding: '11px 24px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>
                Empezar a vender
              </a>
              <a href="/registro" style={{ backgroundColor: 'transparent', color: '#f90', padding: '11px 24px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', border: '2px solid #f90' }}>
                Crear cuenta
              </a>
            </div>
          </div>
          <div style={{ fontSize: '72px', opacity: 0.2 }}>🏪</div>
        </div>

        {/* CATEGORIAS */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Explorar categorias</h2>
            <div style={{ height: '3px', width: '60px', backgroundColor: '#f90', borderRadius: '2px', marginTop: '4px' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {categorias.map(cat => (
              <a key={cat.nombre} href={'/productos?cat=' + cat.nombre} className="cat-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', textDecoration: 'none', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '36px' }}>{cat.icono}</span>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#333' }}>{cat.nombre}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#111', color: '#888', padding: '48px 24px 24px', marginTop: '16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '32px', marginBottom: '40px' }}>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '22px', fontWeight: '900', color: 'white', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
                <div style={{ height: '3px', width: '40px', background: 'linear-gradient(90deg, #f90, #ff6b00)', borderRadius: '2px', marginTop: '4px' }}></div>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#666' }}>El marketplace colombiano para comprar, vender y subastar.</p>
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>Comprar</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Todos los productos', 'Ofertas del dia', 'Subastas'].map(item => (
                  <a key={item} href="/productos" style={{ color: '#666', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.color = '#f90'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.color = '#666'}
                  >{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>Vender</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Crear cuenta vendedor', 'Como funciona', 'Tarifas'].map(item => (
                  <a key={item} href="/vende-con-nosotros" style={{ color: '#666', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.color = '#f90'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.color = '#666'}
                  >{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>Ayuda</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Centro de ayuda', 'Devoluciones', 'Contactanos'].map(item => (
                  <a key={item} href="/perfil" style={{ color: '#666', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.color = '#f90'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.color = '#666'}
                  >{item}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #222', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: '#555' }}>© 2025 Driny — Todos los derechos reservados | Colombia</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ color: '#555', textDecoration: 'none', fontSize: '12px' }}>Terminos</a>
              <a href="#" style={{ color: '#555', textDecoration: 'none', fontSize: '12px' }}>Privacidad</a>
              <a href="#" style={{ color: '#555', textDecoration: 'none', fontSize: '12px' }}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}