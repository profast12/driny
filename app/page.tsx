"use client";
import { useState, useEffect } from "react";
import DrinyBot from './DrinyBot';
import Image from "next/image"
import { supabase } from "../lib/supabase";

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');

  const [idiomaAbierto, setIdiomaAbierto] = useState(false);
  const [idiomaActual, setIdiomaActual] = useState('es');

const idiomas = [
  { codigo: 'es', nombre: 'Español', bandera: '🇨🇴' },
  { codigo: 'en', nombre: 'English', bandera: '🇺🇸' },
  { codigo: 'fr', nombre: 'Français', bandera: '🇫🇷' },
  { codigo: 'pt', nombre: 'Português', bandera: '🇧🇷' },
  { codigo: 'de', nombre: 'Deutsch', bandera: '🇩🇪' },
  { codigo: 'it', nombre: 'Italiano', bandera: '🇮🇹' },
  { codigo: 'zh-CN', nombre: '中文', bandera: '🇨🇳' },
  { codigo: 'ja', nombre: '日本語', bandera: '🇯🇵' },
  { codigo: 'ko', nombre: '한국어', bandera: '🇰🇷' },
  { codigo: 'ar', nombre: 'العربية', bandera: '🇸🇦' },
  { codigo: 'ru', nombre: 'Русский', bandera: '🇷🇺' },
];

const cambiarIdioma = (codigo: string) => {
  setIdiomaAbierto(false);

  // Google Translate usa la cookie googtrans con formato /es/CODIGO
  const valor = codigo === 'es' ? '/es/es' : `/es/${codigo}`;

  // Setear en dominio actual y dominio raíz
  document.cookie = `googtrans=${valor}; path=/`;
  document.cookie = `googtrans=${valor}; path=/; domain=${window.location.hostname}`;

  window.location.reload();
};

  const categorias = [
    { nombre: "Electrónica", icono: "" },
    { nombre: "Ropa", icono: "" },
    { nombre: "Hogar", icono: "" },
    { nombre: "Deportes", icono: "" },
    { nombre: "Juguetes", icono: "" },
    { nombre: "Autos", icono: "" },
  ];

  useEffect(() => {
  const cerrar = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-idioma]')) setIdiomaAbierto(false);
  };
  document.addEventListener('click', cerrar);
  return () => document.removeEventListener('click', cerrar);
}, []);

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
    setMostrarMenu(false);
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
        @keyframes slideRight { from { opacity: 0; transform: translateX(-100%); } to { opacity: 1; transform: translateX(0); } }

        .prod-card { transition: all 0.22s; }
        .prod-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .cat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important; transform: translateY(-2px); }
        .add-btn:hover { background-color: #f90 !important; color: #111 !important; border-color: #f90 !important; }
        .nav-link:hover { color: #f90 !important; }

        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-search { display: flex !important; }
          .nav-categories { display: none !important; }
          .hero-title { font-size: 24px !important; }
          .hero-subtitle { font-size: 13px !important; }
          .hero-padding { padding: 28px 20px !important; }
          .quick-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .prod-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .banner-flex { flex-direction: column !important; gap: 16px !important; }
          .banner-watermark { display: none !important; }
          .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 480px) {
          .quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .prod-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-title { font-size: 20px !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* BARRA SUPERIOR - solo desktop */}
      <div className="desktop-only" style={{ backgroundColor: '#fff8f0', borderBottom: '1px solid #ffe0b2', padding: '6px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', gap: '20px', fontSize: '12px', color: '#666' }}>
          {usuario?.tipo !== 'vendedor' && (
            <a href="/mis-pedidos" className="nav-link" style={{ textDecoration: 'none', color: '#666' }}>Mis pedidos</a>
          )}
          <a href="/subastas-real" className="nav-link" style={{ textDecoration: 'none', color: '#666' }}>Subastas</a>
          <a href="/vende-con-nosotros" className="nav-link" style={{ textDecoration: 'none', color: '#666' }}>Vender en Driny</a>
        </div>
      </div>

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* MENU HAMBURGUESA - mobile */}
          <button
            onClick={() => setMostrarMenu(!mostrarMenu)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', flexShrink: 0 }}
            className="mobile-menu-btn"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* LOGO */}
          <a href="/">
  <Image
    src="/logo.png"
    alt="Driny"
    width={75}
    height={75}
    style={{
      width: 'auto',
      height: '75px'
    }}
  />
</a>

          {/* BUSCADOR desktop */}
          <div className="desktop-only" style={{ flex: 1, display: 'flex', maxWidth: '560px' }}>
            <input
              type="text"
              placeholder="Buscar productos, marcas y mas..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={buscar}
              style={{ flex: 1, padding: '11px 16px', border: '2px solid #f90', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '14px', outline: 'none', backgroundColor: 'white', color: '#333' }}
            />
            <button
              onClick={() => busqueda.trim() && (window.location.href = '/busqueda?q=' + busqueda)}
              style={{ padding: '11px 18px', backgroundColor: '#f90', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>

          <div style={{ flex: 1 }}></div>

          {/* ACCIONES */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {usuario ? (
              <>
                <a href="/perfil" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#111', flexShrink: 0, border: '2px solid #f90' }}>
                    {usuario.avatar_url ? (
                      <img src={usuario.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (usuario.username || usuario.email).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="desktop-only">
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
                    <div style={{ position: 'fixed', right: '16px', top: '70px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', width: 'calc(100vw - 32px)', maxWidth: '340px', zIndex: 200, border: '1px solid #f0f0f0', animation: 'slideDown 0.2s ease', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#111', margin: 0 }}>Notificaciones</h3>
                        <button onClick={() => setMostrarNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '18px' }}>✕</button>
                      </div>
                      {notificaciones.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                          <p style={{ fontSize: '14px' }}>Sin notificaciones</p>
                        </div>
                      ) : (
                        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                          {notificaciones.map(n => (
                            <div
                              key={n.id}
                              onClick={() => {
                                setMostrarNotif(false);
                                if (n.subasta_id) window.location.href = '/subasta-resultado?id=' + n.subasta_id;
                                else if (n.pedido_id) window.location.href = usuario?.tipo === 'vendedor' ? '/pedido/' + n.pedido_id : '/mis-pedidos';
                              }}
                              style={{ padding: '12px 16px', borderBottom: '1px solid #f9f9f9', backgroundColor: n.leida ? 'white' : '#fff8f0', cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#fff0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>
                                  {n.titulo.includes('venta') || n.titulo.includes('Venta') ? '💰' : n.titulo.includes('subasta') || n.titulo.includes('oferta') ? '🔨' : '📦'}
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

                <button onClick={cerrarSesion} className="desktop-only" style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', color: '#888', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="desktop-only" style={{ color: '#333', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Ingresar</a>
                <a href="/registro" style={{ backgroundColor: '#f90', color: '#111', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                  Crear cuenta
                </a>
              </>
            )}

            {/* SELECTOR IDIOMA — dentro de acciones, visible en mobile y desktop */}
            <div style={{ position: 'relative' }} data-idioma="true">
              <button
                onClick={() => setIdiomaAbierto(!idiomaAbierto)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 10px', borderRadius: '8px',
                  border: '1.5px solid #e5e5e5', backgroundColor: 'white',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  color: '#555', transition: 'all 0.2s', flexShrink: 0
                }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5'; (e.currentTarget as HTMLElement).style.color = '#555'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span className="desktop-only">Idioma</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {idiomaAbierto && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  backgroundColor: 'white',
                  borderRadius: '14px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  border: '1px solid #eee',
                  zIndex: 300,
                  width: '200px',
                  overflow: 'hidden',
                  animation: 'slideDown 0.2s ease'
                }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid #f5f5f5' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Selecciona idioma
                    </p>
                  </div>
                  <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                    {idiomas.map(idioma => (
                      <button
                        key={idioma.codigo}
                        onClick={() => cambiarIdioma(idioma.codigo)}
                        style={{
                          width: '100%', padding: '10px 14px', border: 'none',
                          backgroundColor: 'transparent', cursor: 'pointer',
                          textAlign: 'left', display: 'flex', alignItems: 'center',
                          gap: '10px', fontSize: '13px', fontWeight: '600',
                          color: '#333', transition: 'all 0.15s'
                        }}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#fff8f0'}
                        onMouseOut={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                      >
                        <span style={{ fontSize: '18px' }}>{idioma.bandera}</span>
                        <span>{idioma.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {usuario?.tipo !== 'vendedor' && (
  <a href="/carrito" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#555', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    <span className="desktop-only" style={{ fontSize: '13px', fontWeight: '600' }}>Carrito</span>
  </a>
)}
          </div>
        </div>

        {/* BUSCADOR MOBILE */}
        <div style={{ padding: '0 16px 12px', display: 'none' }} className="mobile-search">
          <input
            type="text"
            placeholder="Buscar en Driny..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onKeyDown={buscar}
            style={{ flex: 1, padding: '10px 14px', border: '2px solid #f90', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '14px', outline: 'none', width: '100%' }}
          />
          <button
            onClick={() => busqueda.trim() && (window.location.href = '/busqueda?q=' + busqueda)}
            style={{ padding: '10px 14px', backgroundColor: '#f90', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>

        {/* CATEGORIAS - desktop */}
        <div className="nav-categories" style={{ borderTop: '1px solid #f5f5f5', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {categorias.map(cat => (
              <a key={cat.nombre} href={'/productos?cat=' + cat.nombre} style={{ padding: '10px 14px', textDecoration: 'none', color: '#555', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', borderBottom: '2px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#555'; }}
              >
                {cat.icono} {cat.nombre}
              </a>
            ))}
            <a href="/subastas-real" style={{ padding: '10px 14px', textDecoration: 'none', color: '#f90', fontSize: '13px', fontWeight: '800', whiteSpace: 'nowrap', borderBottom: '2px solid #f90' }}>
              Subastas en vivo
            </a>
          </div>
        </div>
      </div>

      {/* MENU MOBILE LATERAL */}
      {mostrarMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div onClick={() => setMostrarMenu(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '280px', backgroundColor: 'white', animation: 'slideRight 0.3s ease', overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#111', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
              <button onClick={() => setMostrarMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#888' }}>✕</button>
            </div>
            {usuario && (
              <div style={{ padding: '16px 20px', backgroundColor: '#fff8f0', borderBottom: '1px solid #ffe0b2', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#111' }}>
                  {usuario.avatar_url ? <img src={usuario.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (usuario.username || usuario.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#111', margin: 0 }}>{usuario.username || usuario.email.split('@')[0]}</p>
                  <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{usuario.tipo}</p>
                </div>
              </div>
            )}
            <div style={{ padding: '12px 0' }}>
              {[
                { label: 'Inicio', href: '/', icon: '' },
                { label: 'Productos', href: '/productos', icon: '' },
                { label: 'Subastas en vivo', href: '/subastas-real', icon: '' },
                { label: 'Mi carrito', href: '/carrito', icon: '' },
                { label: 'Mi perfil', href: '/perfil', icon: '' },
                ...(usuario?.tipo !== 'vendedor' ? [{ label: 'Mis pedidos', href: '/mis-pedidos', icon: '' }] : []),
                ...(usuario?.tipo === 'vendedor' ? [{ label: 'Panel vendedor', href: '/vender', icon: '' }, { label: 'Mis subastas', href: '/subastas-panel', icon: '⚡' }] : []),
                { label: 'Vender en Driny', href: '/vende-con-nosotros', icon: '' },
              ].map((item, i) => (
                <a key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 20px', textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid #f9f9f9' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#fff8f0'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  {item.label}
                </a>
              ))}
              {usuario && (
                <button onClick={cerrarSesion} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 20px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', fontWeight: '600', borderTop: '1px solid #f5f5f5', marginTop: '8px' }}>
                  <span style={{ fontSize: '18px' }}></span>
                  Cerrar sesion
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>

        {/* BANNER PRINCIPAL */}
        <div className="hero-padding" style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a00 50%, #1a1a1a 100%)', display: 'flex', alignItems: 'center', minHeight: '200px', padding: '40px', position: 'relative', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'inline-block', backgroundColor: '#f90', color: '#111', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '1px' }}>
              BIENVENIDO A DRINY
            </div>
            <h1 className="hero-title" style={{ fontSize: '30px', fontWeight: '900', color: 'white', marginBottom: '8px', lineHeight: 1.2, fontFamily: 'Arial Black, sans-serif' }}>
              Todo lo que necesitas,{' '}
              <span style={{ background: 'linear-gradient(135deg, #f90, #ff6b00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en un solo lugar</span>
            </h1>
            <p className="hero-subtitle" style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>Compra, vende y subasta en Colombia</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="/productos" style={{ backgroundColor: '#f90', color: '#111', padding: '10px 22px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px' }}>
                Ver productos
              </a>
              <a href="/subastas-real" style={{ backgroundColor: 'transparent', color: '#f90', padding: '10px 22px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px', border: '2px solid #f90' }}>
                Subastas
              </a>
            </div>
          </div>
          <div className="banner-watermark" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', textAlign: 'center', opacity: 0.1 }}>
            <div style={{ fontSize: '100px', fontWeight: '900', color: '#f90', fontFamily: 'Arial Black, sans-serif', lineHeight: 1 }}>DRINY</div>
          </div>
        </div>

        {/* ACCESOS RAPIDOS */}
        <div className="quick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { label: 'Envio gratis', sub: 'Primera compra', icon: '📦', href: '/productos' },
            { label: 'Pago seguro', sub: 'Con PayPal y otros medios de pago', icon: '🔒', href: '/productos' },
            { label: 'Verificados', sub: 'Vendedores', icon: '✓', href: '/productos' },
            { label: 'Subastas', sub: 'En tiempo real', icon: '🔨', href: '/subastas-real' },
            { label: 'Vender', sub: 'Gratis en Driny', icon: '🏪', href: '/vende-con-nosotros' },
            { label: 'Soporte', sub: '24/7', icon: '💬', href: '/perfil' },
          ].map((item, i) => (
            <a key={i} href={item.href} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '14px 10px', textDecoration: 'none', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f90'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#eee'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '24px' }}>{item.icon}</div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '2px' }}>{item.label}</p>
                <p style={{ fontSize: '10px', color: '#888' }}>{item.sub}</p>
              </div>
            </a>
          ))}
        </div>

        {/* CATEGORIAS MOBILE - scroll horizontal */}
        <div style={{ display: 'none', overflowX: 'auto', gap: '10px', marginBottom: '20px', paddingBottom: '4px' }} className="mobile-cats">
          {categorias.map(cat => (
            <a key={cat.nombre} href={'/productos?cat=' + cat.nombre} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textDecoration: 'none', minWidth: '72px', backgroundColor: 'white', borderRadius: '12px', padding: '12px 8px', border: '1px solid #eee', flexShrink: 0 }}>
              <span style={{ fontSize: '22px' }}>{cat.icono}</span>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#333', textAlign: 'center' }}>{cat.nombre}</p>
            </a>
          ))}
        </div>

        {/* PRODUCTOS DESTACADOS */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Productos destacados</h2>
              <div style={{ height: '3px', width: '50px', backgroundColor: '#f90', borderRadius: '2px', marginTop: '4px' }}></div>
            </div>
            <a href="/productos" style={{ color: '#f90', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>Ver todos</a>
          </div>

          {productos.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #eee' }}>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '14px' }}>No hay productos publicados todavia</p>
              <a href="/vende-con-nosotros" style={{ backgroundColor: '#f90', color: '#111', padding: '9px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                Publicar el primero
              </a>
            </div>
          ) : (
            <div className="prod-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {productos.map(p => (
                <div
                  key={p.id}
                  className="prod-card"
                  onClick={() => window.location.href = '/producto/' + p.id}
                  style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ height: '150px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.nombre} />
                    ) : (
                      <div style={{ fontSize: '48px' }}>{p.emoji || '🛍️'}</div>
                    )}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>{p.categoria}</p>
                    <p style={{ fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px', lineHeight: 1.3, height: '34px', overflow: 'hidden' }}>{p.nombre}</p>
                    <p style={{ fontWeight: '800', fontSize: '16px', color: '#111', marginBottom: '10px' }}>
                      ${Number(p.precio).toLocaleString('es-CO')}
                      <span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}> COP</span>
                    </p>
                    <button
                      className="add-btn"
                      onClick={e => { e.stopPropagation(); window.location.href = '/producto/' + p.id; }}
                      style={{ width: '100%', padding: '8px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', transition: 'all 0.2s' }}
                    >
                      Ver producto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BANNER SUBASTAS */}
        <div className="banner-flex" style={{ background: 'linear-gradient(135deg, #0f0f0f, #1a1000)', borderRadius: '16px', padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'inline-block', backgroundColor: '#22c55e', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '1px', animation: 'pulse 2s infinite' }}>
              EN VIVO AHORA
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '6px', fontFamily: 'Arial Black, sans-serif' }}>
              Subastas en tiempo real
            </h3>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>Oferta por productos unicos al mejor precio</p>
            <a href="/subastas-real" style={{ backgroundColor: '#f90', color: '#111', padding: '10px 22px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px' }}>
              Ver subastas
            </a>
          </div>
          <div className="banner-watermark" style={{ fontSize: '60px', opacity: 0.1, fontWeight: '900', color: '#f90', fontFamily: 'Arial Black, sans-serif' }}>LIVE</div>
        </div>

        {/* BANNER VENDEDOR */}
        <div className="banner-flex" style={{ background: 'linear-gradient(135deg, #fff8f0, #fff5e6)', borderRadius: '16px', padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ffe0b2', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111', marginBottom: '6px', fontFamily: 'Arial Black, sans-serif' }}>
              Vende en Driny gratis
            </h3>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>Llega a miles de compradores en Colombia</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="/vende-con-nosotros" style={{ backgroundColor: '#f90', color: '#111', padding: '10px 22px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px' }}>
                Empezar a vender
              </a>
            </div>
          </div>
          <div className="banner-watermark" style={{ fontSize: '60px', opacity: 0.15 }}>🏪</div>
        </div>

        {/* CATEGORIAS GRID */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Explorar categorias</h2>
            <div style={{ height: '3px', width: '50px', backgroundColor: '#f90', borderRadius: '2px', marginTop: '4px' }}></div>
          </div>
          <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {categorias.map(cat => (
              <a key={cat.nombre} href={'/productos?cat=' + cat.nombre} className="cat-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '18px 14px', textDecoration: 'none', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '30px' }}>{cat.icono}</span>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#333' }}>{cat.nombre}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#111', color: '#888', padding: '40px 16px 24px', marginTop: '16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '28px', marginBottom: '32px' }}>
            <div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '20px', fontWeight: '900', color: 'white', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
                <div style={{ height: '3px', width: '36px', background: 'linear-gradient(90deg, #f90, #ff6b00)', borderRadius: '2px', marginTop: '4px' }}></div>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#666' }}>El marketplace colombiano para comprar, vender y subastar.</p>
            </div>
            {[
              { titulo: 'Comprar', links: [{ label: 'Todos los productos', href: '/productos' }, { label: 'Subastas', href: '/subastas-real' }] },
              { titulo: 'Vender', links: [{ label: 'Crear cuenta vendedor', href: '/vende-con-nosotros' }, { label: 'Como funciona', href: '/vende-con-nosotros' }] },
              { titulo: 'Ayuda', links: [{ label: 'Mi perfil', href: '/perfil' }, { label: 'Mis pedidos', href: '/mis-pedidos' }] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>{col.titulo}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {col.links.map((link, j) => (
                    <a key={j} href={link.href} style={{ color: '#666', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.color = '#f90'}
                      onMouseOut={e => (e.currentTarget as HTMLElement).style.color = '#666'}
                    >{link.label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #222', paddingTop: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#555' }}>© 2026 Driny — Todos los derechos reservados | Colombia</p>
          </div>
        </div>
      </footer>

      {/* CSS MOBILE ADICIONAL */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .mobile-search { display: flex !important; }
          .mobile-cats { display: flex !important; }
        }
      `}</style>
      <DrinyBot idioma={idiomaActual} />
    </main>
  );
}
      
    