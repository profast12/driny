"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function DetalleProducto() {
  const [id, setId] = useState('');
  const [producto, setProducto] = useState<any>(null);
  const [vendedor, setVendedor] = useState<any>(null);
  const [productosVendedor, setProductosVendedor] = useState<any[]>([]);
  const [resenas, setResenas] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const [perfilUsuario, setPerfilUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [comentario, setComentario] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [mensajeResena, setMensajeResena] = useState('');
  const [tabActivo, setTabActivo] = useState<'descripcion' | 'resenas' | 'vendedor'>('descripcion');

  useEffect(() => {
    const parts = window.location.pathname.split('/');
    const prodId = parts[parts.length - 1];
    setId(prodId);
    if (prodId) cargarTodo(prodId);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUsuario(session.user);
        const { data: p } = await supabase.from('usuarios').select('*').eq('email', session.user.email).single();
        if (p) setPerfilUsuario(p);
      }
    });
  }, []);

  const cargarTodo = async (prodId: string) => {
    const { data: prod } = await supabase.from('productos').select('*').eq('id', prodId).single();
    if (prod) {
      setProducto(prod);
      if (prod.vendedor_id) {
        const { data: vend } = await supabase.from('usuarios').select('*').eq('id', prod.vendedor_id).single();
        if (!vend) {
          const { data: vendAuth } = await supabase.from('usuarios').select('*').limit(1);
        }
        setVendedor(vend);
        if (vend) {
          const { data: prods } = await supabase.from('productos').select('*').eq('vendedor_id', prod.vendedor_id).neq('id', prodId).limit(4);
          if (prods) setProductosVendedor(prods);
        }
      }
    }
    const { data: res } = await supabase.from('resenas').select('*').eq('producto_id', prodId).order('created_at', { ascending: false });
    if (res) setResenas(res);
    setCargando(false);
  };

  const agregarAlCarrito = async () => {
    if (!usuario) { window.location.href = '/login'; return; }
    await supabase.from('carrito').insert([{ usuario_id: usuario.id, producto_id: producto.id, cantidad }]);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 3000);
  };

  const enviarResena = async () => {
    if (!usuario) { window.location.href = '/login'; return; }
    if (!comentario.trim()) return;
    setEnviandoResena(true);
    await supabase.from('resenas').insert([{
      producto_id: id,
      usuario_id: usuario.id,
      nombre_usuario: perfilUsuario?.username || perfilUsuario?.nombre || usuario.email.split('@')[0],
      avatar_url: perfilUsuario?.avatar_url || null,
      calificacion,
      comentario
    }]);
    setComentario('');
    setCalificacion(5);
    setMensajeResena('Resena publicada');
    const { data } = await supabase.from('resenas').select('*').eq('producto_id', id).order('created_at', { ascending: false });
    if (data) setResenas(data);
    setEnviandoResena(false);
    setTimeout(() => setMensajeResena(''), 3000);
  };

  const promedio = resenas.length > 0 ? (resenas.reduce((a, r) => a + r.calificacion, 0) / resenas.length).toFixed(1) : null;

  if (cargando) return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '14px 24px' }}>
        <a href="/" style={{ fontSize: '22px', fontWeight: '900', color: '#111', textDecoration: 'none', fontFamily: 'Arial Black, sans-serif' }}>DRINY</a>
      </nav>
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{ backgroundColor: '#e8e8e8', borderRadius: '16px', height: '400px', animation: 'shimmer 1.5s infinite', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%' }}></div>
        ))}
      </div>
    </main>
  );

  if (!producto) return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '14px 24px' }}>
        <a href="/" style={{ fontSize: '22px', fontWeight: '900', color: '#111', textDecoration: 'none', fontFamily: 'Arial Black, sans-serif' }}>DRINY</a>
      </nav>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '20px' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <p style={{ fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>Producto no encontrado</p>
        <a href="/productos" style={{ color: '#f90', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>Ver todos los productos</a>
      </div>
    </main>
  );

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        .prod-mini:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important; }
        .tab-btn:hover { color: #f90 !important; }
        .resena-item { animation: slideIn 0.3s ease; }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
          .side-panel { position: static !important; }
          .prods-mini-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ fontSize: '22px', fontWeight: '900', color: '#111', textDecoration: 'none', fontFamily: 'Arial Black, sans-serif', flexShrink: 0 }}>
            DRINY<span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#f90', borderRadius: '50%', marginLeft: '2px', marginBottom: '12px' }}></span>
          </a>
          <div style={{ flex: 1 }}></div>
          <a href="/carrito" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#555', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '13px', fontWeight: '600' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <a href={'/productos?cat=' + producto.categoria} style={{ color: '#888', textDecoration: 'none' }}>{producto.categoria}</a>
              {' › '}
              <span style={{ color: '#333', fontWeight: '600' }}>{producto.nombre}</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', animation: 'fadeIn 0.4s ease' }}>

        {/* DETALLE PRINCIPAL */}
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', marginBottom: '32px', alignItems: 'flex-start' }}>

          {/* IMAGEN */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ height: '380px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {producto.imagen_url ? (
                <img src={producto.imagen_url} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#ccc' }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p style={{ fontSize: '13px', marginTop: '10px' }}>Sin imagen</p>
                </div>
              )}
            </div>

            {/* TABS */}
            <div style={{ borderTop: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', padding: '0 20px' }}>
                {[
                  { id: 'descripcion', label: 'Descripcion' },
                  { id: 'resenas', label: `Resenas (${resenas.length})` },
                  { id: 'vendedor', label: 'Sobre el vendedor' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    className="tab-btn"
                    onClick={() => setTabActivo(tab.id as any)}
                    style={{
                      padding: '14px 16px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: tabActivo === tab.id ? '#f90' : '#888',
                      borderBottom: tabActivo === tab.id ? '2px solid #f90' : '2px solid transparent',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: '20px' }}>

                {/* TAB DESCRIPCION */}
                {tabActivo === 'descripcion' && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8 }}>
                      {producto.descripcion || 'Sin descripcion disponible.'}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                      {[
                        { label: 'Categoria', valor: producto.categoria },
                        { label: 'Estado', valor: 'Nuevo' },
                        { label: 'Envio', valor: 'A todo Colombia' },
                        { label: 'Garantia', valor: '30 dias devolucion' },
                      ].map((item, i) => (
                        <div key={i} style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '12px' }}>
                          <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                          <p style={{ fontSize: '13px', fontWeight: '700', color: '#333' }}>{item.valor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB RESENAS */}
                {tabActivo === 'resenas' && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {promedio && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', backgroundColor: '#fff8f0', borderRadius: '10px', border: '1px solid #ffe0b2' }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '36px', fontWeight: '900', color: '#f90', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>{promedio}</p>
                          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>de 5</p>
                        </div>
                        <div>
                          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            {[1,2,3,4,5].map(s => (
                              <div key={s} style={{ width: '16px', height: '16px', borderRadius: '3px', backgroundColor: s <= Math.round(Number(promedio)) ? '#f90' : '#e5e5e5' }}></div>
                            ))}
                          </div>
                          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{resenas.length} resenas</p>
                        </div>
                      </div>
                    )}

                    {usuario && (
                      <div style={{ backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #eee' }}>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>Deja tu resena</p>
                        {mensajeResena && (
                          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '13px', color: '#22c55e' }}>
                            {mensajeResena}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                          {[1,2,3,4,5].map(s => (
                            <button key={s} onClick={() => setCalificacion(s)} style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', backgroundColor: s <= calificacion ? '#f90' : '#e5e5e5', cursor: 'pointer', transition: 'all 0.15s' }}></button>
                          ))}
                          <span style={{ fontSize: '12px', color: '#888', alignSelf: 'center', marginLeft: '6px' }}>{calificacion}/5</span>
                        </div>
                        <textarea
                          placeholder="Cuéntanos tu experiencia con este producto..."
                          value={comentario}
                          onChange={e => setComentario(e.target.value)}
                          rows={3}
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const, marginBottom: '10px' }}
                          onFocus={e => e.target.style.border = '1px solid #f90'}
                          onBlur={e => e.target.style.border = '1px solid #e5e5e5'}
                        />
                        <button onClick={enviarResena} disabled={enviandoResena || !comentario.trim()} style={{ padding: '9px 20px', backgroundColor: comentario.trim() ? '#f90' : '#f0f0f0', color: comentario.trim() ? '#111' : '#bbb', border: 'none', borderRadius: '8px', cursor: comentario.trim() ? 'pointer' : 'not-allowed', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s' }}>
                          {enviandoResena ? 'Publicando...' : 'Publicar resena'}
                        </button>
                      </div>
                    )}

                    {resenas.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <p style={{ fontSize: '14px' }}>Se el primero en dejar una resena</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {resenas.map(r => (
                          <div key={r.id} className="resena-item" style={{ padding: '14px', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#111', flexShrink: 0 }}>
                                {r.avatar_url ? <img src={r.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (r.nombre_usuario || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '700', fontSize: '13px', color: '#333', marginBottom: '2px' }}>{r.nombre_usuario || 'Usuario'}</p>
                                <p style={{ fontSize: '11px', color: '#888' }}>{new Date(r.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '3px' }}>
                                {[1,2,3,4,5].map(s => (
                                  <div key={s} style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: s <= r.calificacion ? '#f90' : '#e5e5e5' }}></div>
                                ))}
                              </div>
                            </div>
                            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>{r.comentario}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB VENDEDOR */}
                {tabActivo === 'vendedor' && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {vendedor ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', color: '#111', flexShrink: 0, border: '2px solid #f90' }}>
                            {vendedor.avatar_url ? <img src={vendedor.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (vendedor.nombre || 'V').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: '800', fontSize: '16px', color: '#111', marginBottom: '2px', fontFamily: 'Arial Black, sans-serif' }}>{vendedor.nombre_tienda || vendedor.nombre || 'Vendedor'}</p>
                            {vendedor.username && <p style={{ color: '#f90', fontSize: '13px', marginBottom: '4px' }}>@{vendedor.username}</p>}
                            <p style={{ fontSize: '12px', color: '#888' }}>Vendedor verificado en Driny</p>
                          </div>
                          <a href={'/perfil-vendedor/' + producto.vendedor_id} style={{ backgroundColor: '#f90', color: '#111', padding: '9px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            Ver perfil
                          </a>
                        </div>

                        {productosVendedor.length > 0 && (
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>Otros productos de este vendedor</p>
                            <div className="prods-mini-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                              {productosVendedor.map(p => (
                                <div key={p.id} className="prod-mini" onClick={() => window.location.href = '/producto/' + p.id} style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                                  <div style={{ height: '100px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {p.imagen_url ? <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                    )}
                                  </div>
                                  <div style={{ padding: '10px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', lineHeight: 1.3, height: '30px', overflow: 'hidden' }}>{p.nombre}</p>
                                    <p style={{ fontSize: '13px', fontWeight: '800', color: '#111' }}>${Number(p.precio).toLocaleString('es-CO')} <span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}>COP</span></p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <a href={'/perfil-vendedor/' + producto.vendedor_id} style={{ display: 'block', textAlign: 'center', marginTop: '14px', color: '#f90', textDecoration: 'none', fontSize: '13px', fontWeight: '700', padding: '10px', border: '1.5px solid #f90', borderRadius: '8px', transition: 'all 0.2s' }}
                              onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                              onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                            >
                              Ver todos los productos del vendedor
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                        <p style={{ fontSize: '14px' }}>Informacion del vendedor no disponible</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PANEL DERECHO */}
          <div className="side-panel" style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* INFO PRODUCTO */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{producto.categoria}</p>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#111', marginBottom: '12px', lineHeight: 1.3, fontFamily: 'Arial Black, sans-serif' }}>{producto.nombre}</h1>

              {promedio && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[1,2,3,4,5].map(s => (
                      <div key={s} style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: s <= Math.round(Number(promedio)) ? '#f90' : '#e5e5e5' }}></div>
                    ))}
                  </div>
                  <span style={{ fontSize: '13px', color: '#888' }}>{promedio} ({resenas.length})</span>
                </div>
              )}

              <div style={{ backgroundColor: '#fff8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #ffe0b2' }}>
                <p style={{ fontSize: '28px', fontWeight: '900', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>
                  ${Number(producto.precio).toLocaleString('es-CO')}
                  <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal', marginLeft: '4px' }}>COP</span>
                </p>
                <p style={{ fontSize: '12px', color: '#22c55e', fontWeight: '700', marginTop: '6px' }}>En stock · Envio a todo Colombia</p>
              </div>

              {/* CANTIDAD */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#555' }}>Cantidad:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                  <button onClick={() => setCantidad(c => Math.max(1, c - 1))} style={{ width: '36px', height: '36px', border: 'none', backgroundColor: '#f9f9f9', cursor: 'pointer', fontSize: '18px', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: '700', fontSize: '15px' }}>{cantidad}</span>
                  <button onClick={() => setCantidad(c => c + 1)} style={{ width: '36px', height: '36px', border: 'none', backgroundColor: '#f9f9f9', cursor: 'pointer', fontSize: '18px', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>

              {/* BOTONES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <button onClick={agregarAlCarrito} style={{ width: '100%', padding: '13px', backgroundColor: agregado ? '#22c55e' : '#111', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s', fontFamily: 'Arial Black, sans-serif' }}>
                  {agregado ? 'Agregado al carrito' : 'Agregar al carrito'}
                </button>
                <a href="/carrito" style={{ display: 'block', width: '100%', padding: '13px', backgroundColor: '#f90', color: '#111', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', textDecoration: 'none', textAlign: 'center', fontFamily: 'Arial Black, sans-serif', boxSizing: 'border-box' as const }}>
                  Comprar ahora
                </a>
              </div>

              {/* GARANTIAS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { icon: '🔒', text: 'Pago seguro con PayPal' },
                  { icon: '🔄', text: 'Devoluciones en 30 dias' },
                  { icon: '📦', text: 'Envio a todo Colombia' },
                ].map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#666', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{g.icon}</span>
                    <span>{g.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD VENDEDOR */}
            {vendedor && (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: '700' }}>Vendedor</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#111', flexShrink: 0, border: '2px solid #ffe0b2' }}>
                    {vendedor.avatar_url ? <img src={vendedor.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (vendedor.nombre || 'V').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '800', fontSize: '14px', color: '#111', marginBottom: '2px' }}>{vendedor.nombre_tienda || vendedor.nombre || 'Vendedor'}</p>
                    {vendedor.username && <p style={{ color: '#f90', fontSize: '12px' }}>@{vendedor.username}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '14px', border: '1px solid #bbf7d0' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '700' }}>Vendedor verificado en Driny</span>
                </div>
                <a href={'/perfil-vendedor/' + producto.vendedor_id} style={{ display: 'block', textAlign: 'center', padding: '10px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                >
                  Ver perfil del vendedor
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER SIMPLE */}
      <footer style={{ backgroundColor: '#111', color: '#888', padding: '20px', textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '12px' }}>© 2026 Driny — Todos los derechos reservados | Colombia</p>
      </footer>

    </main>
  );
}