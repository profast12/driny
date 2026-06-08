"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function MisPedidos() {
  const [usuario, setUsuario] = useState<any>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoActivo, setPedidoActivo] = useState<any>(null);
  const [itemsActivos, setItemsActivos] = useState<any[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [modalCalificar, setModalCalificar] = useState<any>(null);
  const [calificacion, setCalificacion] = useState(5);
  const [comentarioCalif, setComentarioCalif] = useState('');
  const [enviandoCalif, setEnviandoCalif] = useState(false);
  const [califEnviada, setCalifEnviada] = useState(false);
  const [calificacionesHechas, setCalificacionesHechas] = useState<string[]>([]);
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return; }
      setUsuario(session.user);
      cargarPedidos(session.user.id);
      cargarCalificacionesHechas(session.user.id);
    });
  }, []);

  const cargarPedidos = async (userId: string) => {
    const { data } = await supabase
      .from('pedidos').select('*').eq('comprador_id', userId)
      .order('created_at', { ascending: false });
    if (data) setPedidos(data);
    setCargando(false);
  };

  const cargarCalificacionesHechas = async (userId: string) => {
    const { data } = await supabase
      .from('calificaciones_vendedor').select('pedido_id').eq('comprador_id', userId);
    if (data) setCalificacionesHechas(data.map((c: any) => c.pedido_id));
  };

  const verDetalle = async (pedido: any) => {
    setPedidoActivo(pedido);
    setCargandoDetalle(true);
    const { data } = await supabase.from('pedido_items').select('*').eq('pedido_id', pedido.id);
    if (data) setItemsActivos(data);
    setCargandoDetalle(false);
  };

  const enviarCalificacion = async () => {
  if (!modalCalificar || !usuario) {
    alert('Error: No hay pedido o usuario');
    return;
  }
  setEnviandoCalif(true);

  try {
    const { data: perfilData, error: perfilError } = await supabase
      .from('usuarios').select('*').eq('auth_id', usuario.id).maybeSingle();

    const { data: itemsPedido, error: itemsError } = await supabase
      .from('pedido_items').select('*').eq('pedido_id', modalCalificar.id);

    if (itemsError) { alert('Error items: ' + itemsError.message); setEnviandoCalif(false); return; }
    if (!itemsPedido || itemsPedido.length === 0) { alert('No se encontraron items del pedido'); setEnviandoCalif(false); return; }

    const vendedorId = itemsPedido[0].vendedor_id;
    if (!vendedorId) { alert('No se encontro vendedor_id en los items'); setEnviandoCalif(false); return; }

    const { error } = await supabase.from('calificaciones_vendedor').insert([{
      vendedor_id: vendedorId,
      comprador_id: usuario.id,
      pedido_id: modalCalificar.id,
      calificacion,
      comentario: comentarioCalif.trim() || null,
      comprador_nombre: perfilData?.username || perfilData?.nombre || usuario.email.split('@')[0],
      comprador_avatar: perfilData?.avatar_url || null,
    }]);

    if (error) {
      alert('Error al insertar: ' + error.message + ' | Codigo: ' + error.code);
      setEnviandoCalif(false);
      return;
    }

    await supabase.from('notificaciones').insert([{
      usuario_id: vendedorId,
      titulo: 'Nueva calificacion recibida',
      mensaje: 'Un comprador te califico con ' + calificacion + ' de 5 estrellas.',
      pedido_id: modalCalificar.id,
    }]);

    setCalificacionesHechas(prev => [...prev, modalCalificar.id]);
    setCalifEnviada(true);
    setTimeout(() => {
      setModalCalificar(null);
      setCalifEnviada(false);
      setCalificacion(5);
      setComentarioCalif('');
      setHoverStar(0);
    }, 2500);

  } catch (err: any) {
    alert('Error inesperado: ' + err.message);
  }

  setEnviandoCalif(false);
};

  const getBadge = (estado: string) => {
    if (estado === 'pagado') return { bg: '#d1fae5', color: '#065f46', label: 'Pago confirmado', paso: 1 };
    if (estado === 'preparando') return { bg: '#fef3c7', color: '#92400e', label: 'En preparacion', paso: 2 };
    if (estado === 'enviado') return { bg: '#dbeafe', color: '#1e40af', label: 'En camino', paso: 3 };
    if (estado === 'entregado') return { bg: '#dcfce7', color: '#166534', label: 'Entregado', paso: 4 };
    if (estado === 'cancelado') return { bg: '#fee2e2', color: '#991b1b', label: 'Cancelado', paso: 0 };
    return { bg: '#f3f4f6', color: '#111', label: estado, paso: 1 };
  };

  const pasos = [
    { num: 1, label: 'Pago confirmado', icon: '💳' },
    { num: 2, label: 'Preparando', icon: '📦' },
    { num: 3, label: 'En camino', icon: '🚚' },
    { num: 4, label: 'Entregado', icon: '🎉' },
  ];

  const starColor = (star: number) => {
    const active = hoverStar || calificacion;
    return star <= active ? '#f90' : '#e5e5e5';
  };

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes checkIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
        .pedido-card { transition: all 0.2s; }
        .pedido-card:hover { box-shadow: 0 4px 20px rgba(255,153,0,0.15) !important; border-color: rgba(255,153,0,0.3) !important; }
        .star-btn { transition: transform 0.1s; }
        .star-btn:hover { transform: scale(1.2); }
        @media (max-width: 768px) {
          .pedidos-layout { flex-direction: column !important; }
          .detalle-panel { width: 100% !important; min-width: 0 !important; position: static !important; }
        }
      `}</style>

      {/* MODAL CALIFICAR */}
      {modalCalificar && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '36px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.25s ease' }}>

            {califEnviada ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '72px', height: '72px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #bbf7d0', animation: 'checkIn 0.4s ease' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111', marginBottom: '8px', fontFamily: 'Arial Black, sans-serif' }}>Calificacion enviada</h3>
                <p style={{ color: '#888', fontSize: '14px' }}>Gracias por tu opinion. Ayuda a otros compradores.</p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #f90, #ff6b00)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111', marginBottom: '6px', fontFamily: 'Arial Black, sans-serif' }}>Califica al vendedor</h3>
                  <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Pedido #{modalCalificar.id.slice(0, 8).toUpperCase()}</p>
                </div>

                {/* ESTRELLAS */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <p style={{ fontSize: '12px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Tu calificacion</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        className="star-btn"
                        onClick={() => setCalificacion(star)}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill={starColor(star)} stroke={starColor(star)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#f90', margin: 0 }}>
                    {calificacion === 1 ? 'Muy malo' : calificacion === 2 ? 'Malo' : calificacion === 3 ? 'Regular' : calificacion === 4 ? 'Bueno' : 'Excelente'}
                  </p>
                </div>

                {/* COMENTARIO */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Comentario (opcional)
                  </label>
                  <textarea
                    placeholder="Cuéntanos tu experiencia con este vendedor..."
                    value={comentarioCalif}
                    onChange={e => setComentarioCalif(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const, fontFamily: 'Arial, sans-serif', color: '#333', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.border = '2px solid #f90'}
                    onBlur={e => e.target.style.border = '2px solid #eee'}
                  />
                </div>

                {/* BOTONES */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setModalCalificar(null); setCalificacion(5); setComentarioCalif(''); }} style={{ flex: 1, padding: '13px', backgroundColor: 'white', color: '#888', border: '1.5px solid #eee', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ddd'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#eee'; }}
                  >
                    Cancelar
                  </button>
                  <button onClick={enviarCalificacion} disabled={enviandoCalif} style={{ flex: 2, padding: '13px', background: enviandoCalif ? '#f0f0f0' : 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', color: enviandoCalif ? '#bbb' : '#111', cursor: enviandoCalif ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'Arial Black, sans-serif' }}>
                    {enviandoCalif ? 'Enviando...' : 'Enviar calificacion'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#111', letterSpacing: '-1px', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#f90', borderRadius: '50%', marginBottom: '3px', marginLeft: '1px' }}></div>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #f90, #ff6b00)', borderRadius: '2px', marginTop: '1px' }}></div>
          </a>
          <div style={{ flex: 1 }}></div>
          <a href="/perfil" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Mi perfil</a>
          <a href="/carrito" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e5e5', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Carrito
          </a>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111', marginBottom: '6px', fontFamily: 'Arial Black, sans-serif' }}>Mis pedidos</h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>Seguimiento en tiempo real de tus compras</p>
        </div>

        {cargando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '120px', borderRadius: '16px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}></div>
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '80px 40px', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '20px' }}>
              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#333', marginBottom: '10px' }}>No tienes pedidos todavia</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Cuando realices una compra podras ver el estado aqui</p>
            <a href="/productos" style={{ backgroundColor: '#f90', color: '#111', padding: '12px 28px', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>Explorar productos</a>
          </div>
        ) : (
          <div className="pedidos-layout" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

            {/* LISTA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pedidos.map(pedido => {
                const badge = getBadge(pedido.estado);
                const activo = pedidoActivo?.id === pedido.id;
                const yaCalificado = calificacionesHechas.includes(pedido.id);

                return (
                  <div key={pedido.id} className="pedido-card" onClick={() => verDetalle(pedido)} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: activo ? '0 4px 20px rgba(255,153,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)', border: activo ? '2px solid #f90' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', animation: 'fadeIn 0.3s ease' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <p style={{ fontWeight: '800', fontSize: '15px', color: '#111', marginBottom: '4px', fontFamily: 'Arial Black, sans-serif' }}>
                          Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                          {new Date(pedido.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <div style={{ backgroundColor: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                          {badge.label}
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: '800', color: '#f90', margin: 0 }}>
                          ${Number(pedido.total).toLocaleString('es-CO')} COP
                        </p>
                      </div>
                    </div>

                    {/* BARRA PROGRESO */}
                    {pedido.estado !== 'cancelado' && (
                      <div style={{ position: 'relative', marginBottom: pedido.estado === 'entregado' ? '14px' : '0' }}>
                        <div style={{ position: 'absolute', top: '12px', left: '6%', right: '6%', height: '3px', backgroundColor: '#f3f4f6' }}>
                          <div style={{ height: '100%', backgroundColor: '#f90', borderRadius: '2px', transition: 'width 0.5s', width: badge.paso >= 4 ? '100%' : badge.paso >= 3 ? '66%' : badge.paso >= 2 ? '33%' : '0%' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                          {pasos.map(p => (
                            <div key={p.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                              <div style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: badge.paso >= p.num ? '#f90' : 'white', border: badge.paso >= p.num ? '2px solid #f90' : '2px solid #e5e7eb', marginBottom: '6px', fontSize: '12px', transition: 'all 0.3s' }}>
                                {badge.paso >= p.num ? <span style={{ color: 'white', fontSize: '11px' }}>✓</span> : p.icon}
                              </div>
                              <p style={{ fontSize: '10px', color: badge.paso >= p.num ? '#f90' : '#aaa', fontWeight: badge.paso >= p.num ? '700' : 'normal', textAlign: 'center', margin: 0 }}>{p.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BOTON CALIFICAR */}
                    {pedido.estado === 'entregado' && (
                      <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f5f5f5' }}>
                        {yaCalificado ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: '700' }}>Ya calificaste a este vendedor</span>
                          </div>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); setModalCalificar(pedido); verDetalle(pedido); }}
                            style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Arial Black, sans-serif', transition: 'all 0.2s' }}
                            onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
                            onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Calificar al vendedor
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DETALLE */}
            {pedidoActivo && (
              <div className="detalle-panel" style={{ width: '360px', minWidth: '360px', backgroundColor: 'white', borderRadius: '16px', padding: '22px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'sticky', top: '80px', animation: 'fadeIn 0.3s ease', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '14px', borderBottom: '2px solid #f90' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Detalle del pedido</h3>
                  <button onClick={() => setPedidoActivo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '18px', padding: '2px' }}>✕</button>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Numero de pedido</p>
                  <p style={{ fontWeight: '800', fontSize: '14px', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>#{pedidoActivo.id.slice(0, 8).toUpperCase()}</p>
                  <p style={{ fontSize: '11px', color: '#888', marginTop: '3px', margin: '3px 0 0' }}>
                    {new Date(pedidoActivo.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* ESTADO */}
                <div style={{ backgroundColor: getBadge(pedidoActivo.estado).bg, borderRadius: '10px', padding: '14px', marginBottom: '14px', textAlign: 'center' }}>
                  <p style={{ fontWeight: '800', fontSize: '14px', color: getBadge(pedidoActivo.estado).color, margin: 0 }}>
                    {getBadge(pedidoActivo.estado).label}
                  </p>
                  <p style={{ fontSize: '12px', color: getBadge(pedidoActivo.estado).color, opacity: 0.8, marginTop: '4px', margin: '4px 0 0' }}>
                    {pedidoActivo.estado === 'pagado' ? 'El vendedor esta revisando tu pedido' :
                     pedidoActivo.estado === 'preparando' ? 'El vendedor esta preparando tu paquete' :
                     pedidoActivo.estado === 'enviado' ? 'Tu paquete esta en camino' :
                     pedidoActivo.estado === 'entregado' ? 'Tu pedido llego exitosamente' :
                     'Este pedido fue cancelado'}
                  </p>
                </div>

                {/* PRODUCTOS */}
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#111', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Productos</p>
                  {cargandoDetalle ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#888', fontSize: '13px' }}>Cargando...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {itemsActivos.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, border: '1px solid #eee' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: '600', fontSize: '12px', color: '#333', marginBottom: '2px' }}>{item.nombre_producto}</p>
                            <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>x{item.cantidad}</p>
                          </div>
                          <p style={{ fontWeight: '700', fontSize: '13px', color: '#f90', flexShrink: 0 }}>${(Number(item.precio) * item.cantidad).toLocaleString('es-CO')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DIRECCION */}
                <div style={{ backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Direccion de entrega</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '2px' }}>{pedidoActivo.comprador_nombre}</p>
                  <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: 1.5 }}>{pedidoActivo.direccion}<br />{pedidoActivo.ciudad}, {pedidoActivo.departamento}</p>
                  {pedidoActivo.notas && <p style={{ fontSize: '11px', color: '#f90', marginTop: '6px', margin: '6px 0 0' }}>Nota: {pedidoActivo.notas}</p>}
                </div>

                {/* TOTAL */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '2px solid #f5f5f5' }}>
                  <span style={{ fontWeight: '700', fontSize: '15px', color: '#111' }}>Total pagado</span>
                  <span style={{ fontWeight: '800', fontSize: '20px', color: '#f90' }}>${Number(pedidoActivo.total).toLocaleString('es-CO')} COP</span>
                </div>

                <a href="/productos" style={{ display: 'block', textAlign: 'center', marginTop: '16px', backgroundColor: '#111', color: '#f90', padding: '11px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '13px', fontFamily: 'Arial Black, sans-serif' }}>
                  Seguir comprando
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </main>
  );
}