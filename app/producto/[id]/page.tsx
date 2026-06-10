"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function DetalleProducto() {
  const [id, setId] = useState('');
  const [producto, setProducto] = useState<any>(null);
  const [vendedor, setVendedor] = useState<any>(null);
  const [productosVendedor, setProductosVendedor] = useState<any[]>([]);
  const [productosRelacionados, setProductosRelacionados] = useState<any[]>([]);
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
  const [fotoActiva, setFotoActiva] = useState(0);
  const [esFavorito, setEsFavorito] = useState(false);
  const [toggleandoFav, setToggleandoFav] = useState(false);

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
        const parts = window.location.pathname.split('/');
        const prodId = parts[parts.length - 1];
        if (prodId) verificarFavorito(prodId, session.user.id);
      }
    });
  }, []);

  const cargarTodo = async (prodId: string) => {
  const { data: prod } = await supabase.from('productos').select('*').eq('id', prodId).single();
  if (!prod) { setCargando(false); return; }
  setProducto(prod);

  if (prod.vendedor_id) {
    const { data: vend } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', prod.vendedor_id)
      .maybeSingle();

    if (vend) {
      setVendedor(vend);
      const { data: prods } = await supabase
        .from('productos')
        .select('*')
        .eq('vendedor_id', prod.vendedor_id)
        .neq('id', prodId)
        .limit(4);
      if (prods) setProductosVendedor(prods);
    }
  }

  const { data: relacionados } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria', prod.categoria)
    .neq('id', prodId)
    .limit(6);
  if (relacionados) setProductosRelacionados(relacionados);

  const { data: res } = await supabase
    .from('resenas')
    .select('*')
    .eq('producto_id', prodId)
    .order('created_at', { ascending: false });
  if (res) setResenas(res);
  setCargando(false);
};

  const verificarFavorito = async (prodId: string, userId: string) => {
    const { data } = await supabase
      .from('favoritos')
      .select('id')
      .eq('usuario_id', userId)
      .eq('producto_id', prodId)
      .maybeSingle();
    setEsFavorito(!!data);
  };

  const toggleFavorito = async () => {
  if (!usuario) { window.location.href = '/login'; return; }
  setToggleandoFav(true);
  if (esFavorito) {
    const { error } = await supabase.from('favoritos').delete().eq('usuario_id', usuario.id).eq('producto_id', id);
    if (error) { alert('Error al eliminar: ' + error.message); }
    else setEsFavorito(false);
  } else {
    const { error } = await supabase.from('favoritos').insert([{ usuario_id: usuario.id, producto_id: id }]);
    if (error) { alert('Error al guardar: ' + error.message + ' codigo: ' + error.code); }
    else setEsFavorito(true);
  }
  setToggleandoFav(false);
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
    setComentario(''); setCalificacion(5); setMensajeResena('Resena publicada');
    const { data } = await supabase.from('resenas').select('*').eq('producto_id', id).order('created_at', { ascending: false });
    if (data) setResenas(data);
    setEnviandoResena(false);
    setTimeout(() => setMensajeResena(''), 3000);
  };

  const promedio = resenas.length > 0 ? (resenas.reduce((a, r) => a + r.calificacion, 0) / resenas.length).toFixed(1) : null;

  if (cargando) return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a href="/" style={{ fontSize: '22px', fontWeight: '900', color: '#111', textDecoration: 'none', fontFamily: 'Arial Black, sans-serif' }}>DRINY</a>
      </nav>
      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {[1,2].map(i => <div key={i} style={{ height: '400px', borderRadius: '16px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}></div>)}
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </main>
  );

  if (!producto) return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '14px 24px' }}>
        <a href="/" style={{ fontSize: '22px', fontWeight: '900', color: '#111', textDecoration: 'none', fontFamily: 'Arial Black, sans-serif' }}>DRINY</a>
      </nav>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>Producto no encontrado</p>
        <a href="/productos" style={{ color: '#f90', fontWeight: '700', textDecoration: 'none' }}>Ver todos los productos</a>
      </div>
    </main>
  );

  const imagenes = producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : producto.imagen_url ? [producto.imagen_url] : [];

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .mini-thumb { transition: all 0.2s; }
        .mini-thumb:hover { border-color: #f90 !important; opacity: 1 !important; }
        .prod-rel:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .prod-rel { transition: all 0.22s; }
        .tab-btn:hover { color: #f90 !important; }
        .add-btn-main:hover { opacity: 0.9; transform: scale(0.99); }
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr !important; }
          .side-sticky { position: static !important; }
          .rel-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .vendedor-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .rel-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ fontSize: '22px', fontWeight: '900', color: '#111', textDecoration: 'none', fontFamily: 'Arial Black, sans-serif', flexShrink: 0 }}>
            DRINY<span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#f90', borderRadius: '50%', marginLeft: '2px', marginBottom: '12px' }}></span>
          </a>
          <div style={{ flex: 1 }}></div>
          <a href="/productos" style={{ color: '#666', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Productos</a>
          {perfilUsuario?.tipo !== 'vendedor' && (
  <a href="/carrito" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e5e5', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    Carrito
  </a>
)}
        </div>
        <div style={{ borderTop: '1px solid #f5f5f5' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '7px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a>{' › '}
              <a href="/productos" style={{ color: '#888', textDecoration: 'none' }}>Productos</a>{' › '}
              <a href={'/productos?cat=' + producto.categoria} style={{ color: '#888', textDecoration: 'none' }}>{producto.categoria}</a>{' › '}
              <span style={{ color: '#333', fontWeight: '600' }}>{producto.nombre.slice(0, 40)}{producto.nombre.length > 40 ? '...' : ''}</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>

        {/* GRID PRINCIPAL */}
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', marginBottom: '40px', alignItems: 'flex-start' }}>

          {/* COLUMNA IZQUIERDA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* GALERIA */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: '0' }}>

                {/* MINIATURAS LATERAL */}
                {imagenes.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px 8px 16px 16px', width: '72px', flexShrink: 0 }}>
                    {imagenes.map((img: string, i: number) => (
                      <div key={i} className="mini-thumb" onClick={() => setFotoActiva(i)} style={{ width: '52px', height: '52px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', border: i === fotoActiva ? '2px solid #f90' : '2px solid #eee', opacity: i === fotoActiva ? 1 : 0.6, transition: 'all 0.2s', flexShrink: 0 }}>
                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={'foto ' + (i + 1)} />
                      </div>
                    ))}
                  </div>
                )}

                {/* IMAGEN PRINCIPAL */}
                <div style={{ flex: 1, position: 'relative', backgroundColor: '#f9f9f9', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {imagenes.length > 0 ? (
                    <img src={imagenes[fotoActiva]} alt={producto.nombre} style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', transition: 'opacity 0.2s' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#ccc', padding: '60px' }}>
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <p style={{ fontSize: '13px', marginTop: '12px' }}>Sin imagen</p>
                    </div>
                  )}

                  {imagenes.length > 1 && (
                    <>
                      <button onClick={() => setFotoActiva(p => p === 0 ? imagenes.length - 1 : p - 1)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                      <button onClick={() => setFotoActiva(p => p === imagenes.length - 1 ? 0 : p + 1)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                      <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                        {imagenes.map((_: any, i: number) => (
                          <button key={i} onClick={() => setFotoActiva(i)} style={{ width: i === fotoActiva ? '18px' : '7px', height: '7px', borderRadius: '4px', border: 'none', backgroundColor: i === fotoActiva ? '#f90' : 'rgba(0,0,0,0.25)', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* TABS */}
              <div style={{ borderTop: '1px solid #f5f5f5' }}>
                <div style={{ display: 'flex', padding: '0 16px' }}>
                  {[
                    { id: 'descripcion', label: 'Descripcion' },
                    { id: 'resenas', label: `Resenas (${resenas.length})` },
                    { id: 'vendedor', label: 'Vendedor' },
                  ].map(tab => (
                    <button key={tab.id} className="tab-btn" onClick={() => setTabActivo(tab.id as any)} style={{ padding: '13px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: tabActivo === tab.id ? '#f90' : '#888', borderBottom: tabActivo === tab.id ? '2px solid #f90' : '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: '20px' }}>

                  {/* DESCRIPCION */}
                  {tabActivo === 'descripcion' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8, marginBottom: '20px' }}>
                        {producto.descripcion || 'Este producto no tiene descripcion disponible.'}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
  { label: 'Categoria', valor: producto.categoria },
  { label: 'Estado', valor: producto.estado_producto === 'nuevo' ? 'Nuevo' : producto.estado_producto === 'usado_como_nuevo' ? 'Usado - Como nuevo' : producto.estado_producto === 'usado_buen_estado' ? 'Usado - Buen estado' : producto.estado_producto === 'usado_aceptable' ? 'Usado - Aceptable' : 'Nuevo' },
  { label: 'Envio', valor: 'A todo Colombia' },
  { label: 'Garantia', valor: '30 dias devolucion' },
].map((item, i) => (
                          <div key={i} style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '12px', border: '1px solid #f0f0f0' }}>
                            <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#333' }}>{item.valor}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* RESENAS */}
                  {tabActivo === 'resenas' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      {promedio && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', padding: '16px', backgroundColor: '#fff8f0', borderRadius: '10px', border: '1px solid #ffe0b2' }}>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '40px', fontWeight: '900', color: '#f90', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>{promedio}</p>
                            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>de 5</p>
                          </div>
                          <div>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                              {[1,2,3,4,5].map(s => <div key={s} style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: s <= Math.round(Number(promedio)) ? '#f90' : '#e5e5e5' }}></div>)}
                            </div>
                            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Basado en {resenas.length} resena{resenas.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      )}

                      {usuario && perfilUsuario?.tipo === 'vendedor' ? (
  <div style={{ backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f90" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <div>
      <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '3px' }}>Solo compradores pueden dejar resenas</p>
      <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
        Para dejar una resena necesitas una cuenta de comprador.{' '}
        <a href="/registro" style={{ color: '#f90', textDecoration: 'none', fontWeight: '700' }}>Crear cuenta de comprador</a>
      </p>
    </div>
  </div>
) : usuario && perfilUsuario?.tipo !== 'vendedor' && (
  <div style={{ backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #eee' }}>
    <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>Escribe una resena</p>
                          {mensajeResena && <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '13px', color: '#22c55e' }}>{mensajeResena}</div>}
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
                            {[1,2,3,4,5].map(s => <button key={s} onClick={() => setCalificacion(s)} style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', backgroundColor: s <= calificacion ? '#f90' : '#e5e5e5', cursor: 'pointer', transition: 'all 0.15s' }}></button>)}
                            <span style={{ fontSize: '12px', color: '#888', marginLeft: '6px' }}>{calificacion}/5</span>
                          </div>
                          <textarea placeholder="Cuéntanos tu experiencia con este producto..." value={comentario} onChange={e => setComentario(e.target.value)} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const, marginBottom: '10px' }} onFocus={e => e.target.style.border = '1px solid #f90'} onBlur={e => e.target.style.border = '1px solid #e5e5e5'} />
                          <button onClick={enviarResena} disabled={enviandoResena || !comentario.trim()} style={{ padding: '9px 20px', backgroundColor: comentario.trim() ? '#f90' : '#f0f0f0', color: comentario.trim() ? '#111' : '#bbb', border: 'none', borderRadius: '8px', cursor: comentario.trim() ? 'pointer' : 'not-allowed', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s' }}>
                            {enviandoResena ? 'Publicando...' : 'Publicar resena'}
                          </button>
                        </div>
                      )}

                      {resenas.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '12px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          <p style={{ fontSize: '14px' }}>Se el primero en dejar una resena</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {resenas.map(r => (
                            <div key={r.id} style={{ padding: '14px', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '1px solid #eee', animation: 'fadeIn 0.3s ease' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#111', flexShrink: 0 }}>
                                  {r.avatar_url ? <img src={r.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (r.nombre_usuario || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontWeight: '700', fontSize: '13px', color: '#333', marginBottom: '2px' }}>{r.nombre_usuario || 'Usuario'}</p>
                                  <p style={{ fontSize: '11px', color: '#888' }}>{new Date(r.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '3px' }}>
                                  {[1,2,3,4,5].map(s => <div key={s} style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: s <= r.calificacion ? '#f90' : '#e5e5e5' }}></div>)}
                                </div>
                              </div>
                              <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>{r.comentario}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* VENDEDOR TAB */}
                  {tabActivo === 'vendedor' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      {vendedor ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', backgroundColor: '#f9f9f9', borderRadius: '12px', marginBottom: '20px', border: '1px solid #eee' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#111', flexShrink: 0, border: '2px solid #ffe0b2' }}>
                              {vendedor.avatar_url ? <img src={vendedor.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (vendedor.nombre || vendedor.nombre_tienda || 'V').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: '800', fontSize: '16px', color: '#111', marginBottom: '2px', fontFamily: 'Arial Black, sans-serif' }}>{vendedor.nombre_tienda || vendedor.nombre || 'Vendedor'}</p>
                              {vendedor.username && <p style={{ color: '#f90', fontSize: '13px', marginBottom: '4px' }}>@{vendedor.username}</p>}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '700' }}>Vendedor verificado</span>
                              </div>
                            </div>
                            <a href={'/perfil-vendedor/' + producto.vendedor_id} style={{ backgroundColor: '#f90', color: '#111', padding: '9px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              Ver tienda
                            </a>
                          </div>

                          {productosVendedor.length > 0 && (
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '700', color: '#333', marginBottom: '14px' }}>Mas productos de este vendedor</p>
                              <div className="vendedor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                {productosVendedor.map(p => (
                                  <div key={p.id} className="prod-rel" onClick={() => window.location.href = '/producto/' + p.id} style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                                    <div style={{ height: '90px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {p.imagen_url ? <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.nombre} /> : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                                    </div>
                                    <div style={{ padding: '10px' }}>
                                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px', height: '30px', overflow: 'hidden', lineHeight: 1.3 }}>{p.nombre}</p>
                                      <p style={{ fontSize: '14px', fontWeight: '800', color: '#111' }}>${Number(p.precio).toLocaleString('es-CO')} <span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}>COP</span></p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <a href={'/perfil-vendedor/' + producto.vendedor_id} style={{ display: 'block', textAlign: 'center', marginTop: '14px', padding: '10px', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s' }}
                                onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                                onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                              >
                                Ver tienda completa
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '12px' }}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                          <p style={{ fontSize: '14px' }}>Informacion del vendedor no disponible</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PANEL DERECHO - STICKY */}
          <div className="side-sticky" style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* PRECIO Y COMPRA */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{producto.categoria}</p>
              <h1 style={{ fontSize: '19px', fontWeight: '800', color: '#111', marginBottom: '14px', lineHeight: 1.3, fontFamily: 'Arial Black, sans-serif' }}>{producto.nombre}</h1>

              {promedio && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[1,2,3,4,5].map(s => <div key={s} style={{ width: '13px', height: '13px', borderRadius: '3px', backgroundColor: s <= Math.round(Number(promedio)) ? '#f90' : '#e5e5e5' }}></div>)}
                  </div>
                  <span style={{ fontSize: '13px', color: '#888' }}>{promedio} ({resenas.length} resenas)</span>
                </div>
              )}

              <div style={{ backgroundColor: '#fff8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #ffe0b2' }}>
                <p style={{ fontSize: '30px', fontWeight: '900', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>
                  ${Number(producto.precio).toLocaleString('es-CO')}
                  <span style={{ fontSize: '13px', color: '#888', fontWeight: 'normal', marginLeft: '4px' }}>COP</span>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: producto.disponibilidad === 'pausado' ? '#ef4444' : '#22c55e' }}></div>
    <p style={{ fontSize: '12px', color: producto.disponibilidad === 'pausado' ? '#ef4444' : '#22c55e', fontWeight: '700', margin: 0 }}>
      {producto.disponibilidad === 'disponible' ? 'Disponible' : producto.disponibilidad === 'bajo_pedido' ? 'Bajo pedido' : producto.disponibilidad === 'ultima_unidad' ? 'Ultima unidad' : producto.disponibilidad === 'pausado' ? 'No disponible' : 'Disponible'} · Envio a todo Colombia
    </p>
  </div>
  {producto.sku > 0 && (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
      <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
        {producto.sku === 1 ? 'Ultima unidad disponible' : producto.sku + ' unidades disponibles'}
      </p>
    </div>
  )}
  {producto.estado_producto && producto.estado_producto !== 'nuevo' && (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
        {producto.estado_producto === 'usado_como_nuevo' ? 'Usado - Como nuevo' : producto.estado_producto === 'usado_buen_estado' ? 'Usado - Buen estado' : 'Usado - Aceptable'}
      </p>
    </div>
  )}
</div>
              </div>

              {/* CANTIDAD */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#555' }}>Cantidad:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                  <button onClick={() => setCantidad(c => Math.max(1, c - 1))} style={{ width: '36px', height: '36px', border: 'none', backgroundColor: '#f9f9f9', cursor: 'pointer', fontSize: '18px', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>−</button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: '700', fontSize: '15px' }}>{cantidad}</span>
                  <button onClick={() => setCantidad(c => c + 1)} style={{ width: '36px', height: '36px', border: 'none', backgroundColor: '#f9f9f9', cursor: 'pointer', fontSize: '18px', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>+</button>
                </div>
              </div>

              {/* BOTONES */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
  {perfilUsuario?.tipo === 'vendedor' ? (
    <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
      <p style={{ fontSize: '13px', color: '#888', margin: 0, fontWeight: '600' }}>
        Las cuentas de vendedor no pueden realizar compras.{' '}
        <a href="/registro" style={{ color: '#f90', textDecoration: 'none', fontWeight: '700' }}>Crea una cuenta de comprador</a>
      </p>
    </div>
  ) : producto.vendedor_id === usuario?.id ? (
    <div style={{ backgroundColor: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
      <p style={{ fontSize: '13px', color: '#f90', margin: 0, fontWeight: '600' }}>Este es tu producto publicado</p>
    </div>
  ) : (
    <>
      <button onClick={agregarAlCarrito} className="add-btn-main" style={{ width: '100%', padding: '14px', backgroundColor: agregado ? '#22c55e' : '#111', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s', fontFamily: 'Arial Black, sans-serif' }}>
        {agregado ? '+ Agregado al carrito' : 'Agregar al carrito'}
      </button>
      <a href="/carrito" style={{ display: 'block', width: '100%', padding: '14px', backgroundColor: '#f90', color: '#111', borderRadius: '10px', fontWeight: '800', fontSize: '14px', textDecoration: 'none', textAlign: 'center', fontFamily: 'Arial Black, sans-serif', boxSizing: 'border-box' as const, transition: 'all 0.2s' }}
        onMouseOver={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#e68a00'}
        onMouseOut={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'}
      >
        Comprar ahora
      </a>
    </>
  )}
</div>

              {/* FAVORITO */}
              {usuario && perfilUsuario?.tipo !== 'vendedor' && (
                <button
                  onClick={toggleFavorito}
                  disabled={toggleandoFav}
                  style={{ width: '100%', padding: '11px', backgroundColor: esFavorito ? '#fff0f0' : 'white', color: esFavorito ? '#ef4444' : '#888', border: esFavorito ? '1.5px solid #fecaca' : '1.5px solid #eee', borderRadius: '10px', cursor: toggleandoFav ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', marginBottom: '14px' }}
                  onMouseOver={e => { if (!esFavorito) { (e.currentTarget as HTMLElement).style.borderColor = '#fecaca'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.backgroundColor = '#fff0f0'; } }}
                  onMouseOut={e => { if (!esFavorito) { (e.currentTarget as HTMLElement).style.borderColor = '#eee'; (e.currentTarget as HTMLElement).style.color = '#888'; (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; } }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={esFavorito ? '#ef4444' : 'none'} stroke={esFavorito ? '#ef4444' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {esFavorito ? 'Guardado en favoritos' : 'Guardar en favoritos'}
                </button>
              )}

              {/* GARANTIAS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '14px', borderTop: '1px solid #f5f5f5' }}>
                {[
                  { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text: 'Pago seguro con PayPal y otros medios de pago', color: '#22c55e' },
                  { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>, text: 'Devolucion en 30 dias', color: '#3b82f6' },
                  { svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f90" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, text: 'Envio a todo Colombia', color: '#f90' },
                ].map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                    {g.svg}
                    <span style={{ fontSize: '12px', color: '#555', fontWeight: '600' }}>{g.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD VENDEDOR - LATERAL */}
            {vendedor && (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', animation: 'fadeIn 0.4s ease' }}>
                <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: '700' }}>Vendedor</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '1px solid #eee' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#111', flexShrink: 0, border: '2px solid #ffe0b2' }}>
                    {vendedor.avatar_url ? <img src={vendedor.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (vendedor.nombre_tienda || vendedor.nombre || 'V').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '800', fontSize: '14px', color: '#111', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vendedor.nombre_tienda || vendedor.nombre || 'Vendedor'}</p>
                    {vendedor.username && <p style={{ color: '#f90', fontSize: '12px', margin: 0 }}>@{vendedor.username}</p>}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '700' }}>Vendedor verificado en Driny</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>Productos publicados</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>{productosVendedor.length + 1}</span>
                  </div>
                </div>

                <a href={'/perfil-vendedor/' + producto.vendedor_id} style={{ display: 'block', textAlign: 'center', padding: '11px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                >
                  Ver perfil del vendedor
                </a>
              </div>
            )}
          </div>
        </div>

        {/* PRODUCTOS RELACIONADOS */}
        {productosRelacionados.length > 0 && (
          <div style={{ marginBottom: '40px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Productos relacionados</h2>
                <div style={{ height: '3px', width: '50px', backgroundColor: '#f90', borderRadius: '2px', marginTop: '4px' }}></div>
              </div>
              <a href={'/productos?cat=' + producto.categoria} style={{ color: '#f90', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>Ver mas</a>
            </div>
            <div className="rel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
              {productosRelacionados.map(p => (
                <div key={p.id} className="prod-rel" onClick={() => window.location.href = '/producto/' + p.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ height: '150px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} alt={p.nombre}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
                        onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                      />
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    )}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.categoria}</p>
                    <p style={{ fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px', height: '34px', overflow: 'hidden', lineHeight: 1.3 }}>{p.nombre}</p>
                    <p style={{ fontWeight: '800', fontSize: '16px', color: '#111', marginBottom: '10px' }}>
                      ${Number(p.precio).toLocaleString('es-CO')}
                      <span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}> COP</span>
                    </p>
                    <button style={{ width: '100%', padding: '8px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', transition: 'all 0.2s' }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                      onClick={e => { e.stopPropagation(); window.location.href = '/producto/' + p.id; }}
                    >
                      Ver producto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer style={{ backgroundColor: '#111', color: '#888', padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px' }}>© 2026 Driny — Todos los derechos reservados | Colombia</p>
      </footer>
    </main>
  );
}