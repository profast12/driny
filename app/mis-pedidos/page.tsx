"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function MisPedidos() {
  const [usuario, setUsuario] = useState<any>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [itemsActivos, setItemsActivos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoActivo, setPedidoActivo] = useState<any>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [modalCalificacion, setModalCalificacion] = useState<any>(null);
  const [calificaciones, setCalificaciones] = useState<any>({});
  const [formCal, setFormCal] = useState({ estrellas: 5, comentario: '' });
  const [enviandoCal, setEnviandoCal] = useState(false);
  const [mensajeCal, setMensajeCal] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return; }
      setUsuario(session.user);
      cargarPedidos(session.user.id);
    });
  }, []);

  const cargarPedidos = async (userId: string) => {
    const { data } = await supabase
      .from('pedidos').select('*').eq('comprador_id', userId)
      .order('created_at', { ascending: false });
    if (data) {
      setPedidos(data);
      const { data: cals } = await supabase
        .from('calificaciones_vendedor').select('pedido_id')
        .eq('comprador_id', userId);
      if (cals) {
        const calMap: any = {};
        cals.forEach((c: any) => { calMap[c.pedido_id] = true; });
        setCalificaciones(calMap);
      }
    }
    setCargando(false);
  };

  const verDetalle = async (pedido: any) => {
    setPedidoActivo(pedido);
    setCargandoDetalle(true);
    const { data } = await supabase.from('pedido_items').select('*').eq('pedido_id', pedido.id);
    if (data) setItemsActivos(data);
    setCargandoDetalle(false);
  };

  const enviarCalificacion = async () => {
    if (!modalCalificacion || !usuario) return;
    setEnviandoCal(true);

    const { data: perfil } = await supabase.from('usuarios').select('nombre, avatar_url, auth_id').eq('auth_id', usuario.id).maybeSingle();

    const { data: pedidoData } = await supabase.from('pedidos').select('*').eq('id', modalCalificacion.id).single();
    if (!pedidoData) { setEnviandoCal(false); return; }

    const { data: items } = await supabase.from('pedido_items').select('vendedor_id').eq('pedido_id', modalCalificacion.id).limit(1);
    const vendedorId = items?.[0]?.vendedor_id;
    if (!vendedorId) { setEnviandoCal(false); return; }

    await supabase.from('calificaciones_vendedor').insert([{
      vendedor_id: vendedorId,
      comprador_id: usuario.id,
      pedido_id: modalCalificacion.id,
      calificacion: formCal.estrellas,
      comentario: formCal.comentario.trim(),
      comprador_nombre: perfil?.nombre || usuario.email.split('@')[0],
      comprador_avatar: perfil?.avatar_url || null,
    }]);

    await supabase.from('notificaciones').insert([{
      usuario_id: vendedorId,
      titulo: 'Nueva calificacion recibida',
      mensaje: 'Un comprador te califico con ' + formCal.estrellas + ' estrellas. Ver en tu perfil.',
      pedido_id: modalCalificacion.id,
    }]);

    setCalificaciones((prev: any) => ({ ...prev, [modalCalificacion.id]: true }));
    setMensajeCal('Calificacion enviada. Gracias por tu opinion.');
    setModalCalificacion(null);
    setFormCal({ estrellas: 5, comentario: '' });
    setEnviandoCal(false);
    setTimeout(() => setMensajeCal(''), 4000);
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

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pedido-card:hover { box-shadow: 0 4px 20px rgba(255,153,0,0.15) !important; border-color: rgba(255,153,0,0.3) !important; }
        .estrella:hover { transform: scale(1.2); }
        @media (max-width: 900px) {
          .pedidos-grid { grid-template-columns: 1fr !important; }
          .detalle-panel { position: static !important; }
        }
      `}</style>

      {/* MODAL CALIFICACION */}
      {modalCalificacion && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '36px', maxWidth: '460px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'scaleIn 0.25s ease' }}>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #f90, #ff6b00)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111', marginBottom: '6px', fontFamily: 'Arial Black, sans-serif' }}>Califica al vendedor</h3>
              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Pedido #{modalCalificacion.id.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* ESTRELLAS */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', textAlign: 'center' }}>Tu calificacion</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className="estrella"
                    onClick={() => setFormCal(p => ({ ...p, estrellas: n }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: 'transform 0.15s' }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill={n <= formCal.estrellas ? '#f90' : 'none'} stroke={n <= formCal.estrellas ? '#f90' : '#ddd'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#f90', marginTop: '8px', fontFamily: 'Arial Black, sans-serif' }}>
                {formCal.estrellas === 1 ? 'Muy malo' : formCal.estrellas === 2 ? 'Malo' : formCal.estrellas === 3 ? 'Regular' : formCal.estrellas === 4 ? 'Bueno' : 'Excelente'}
              </p>
            </div>

            {/* COMENTARIO */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Comentario (opcional)</label>
              <textarea
                placeholder="Cuéntanos tu experiencia con este vendedor..."
                value={formCal.comentario}
                onChange={e => setFormCal(p => ({ ...p, comentario: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box' as const, fontFamily: 'Arial, sans-serif', color: '#333', transition: 'border 0.2s' }}
                onFocus={e => e.target.style.border = '2px solid #f90'}
                onBlur={e => e.target.style.border = '2px solid #eee'}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setModalCalificacion(null); setFormCal({ estrellas: 5, comentario: '' }); }} style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: '#888', border: '1.5px solid #eee', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' }}>
                Cancelar
              </button>
              <button onClick={enviarCalificacion} disabled={enviandoCal} style={{ flex: 2, padding: '12px', background: enviandoCal ? '#f0f0f0' : 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '10px', color: enviandoCal ? '#bbb' : '#111', cursor: enviandoCal ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '14px', fontFamily: 'Arial Black, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {enviandoCal ? (
                  <><div style={{ width: '14px', height: '14px', border: '2px solid #bbb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>Enviando...</>
                ) : 'Enviar calificacion'}
              </button>
            </div>
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
        <div style={{ borderTop: '1px solid #f5f5f5' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '7px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a>{' › '}
              <span style={{ color: '#333', fontWeight: '600' }}>Mis pedidos</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px', animation: 'fadeIn 0.4s ease' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111', marginBottom: '6px', fontFamily: 'Arial Black, sans-serif' }}>Mis pedidos</h1>
          <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Seguimiento en tiempo real de tus compras</p>
        </div>

        {mensajeCal && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <p style={{ fontSize: '13px', color: '#22c55e', margin: 0, fontWeight: '600' }}>{mensajeCal}</p>
          </div>
        )}

        {cargando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eee' }}>
                <div style={{ height: '18px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '12px', width: '40%', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ height: '14px', backgroundColor: '#f0f0f0', borderRadius: '4px', width: '60%', animation: 'pulse 1.5s infinite' }}></div>
              </div>
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '80px 40px', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '20px' }}>
              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#333', marginBottom: '10px', fontFamily: 'Arial Black, sans-serif' }}>No tienes pedidos todavia</h2>
            <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>Cuando realices una compra podras ver el estado aqui</p>
            <a href="/productos" style={{ backgroundColor: '#f90', color: '#111', padding: '12px 28px', borderRadius: '10px', fontWeight: '800', textDecoration: 'none', fontSize: '14px', fontFamily: 'Arial Black, sans-serif' }}>
              Explorar productos
            </a>
          </div>
        ) : (
          <div className="pedidos-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'flex-start' }}>

            {/* LISTA PEDIDOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pedidos.map(pedido => {
                const badge = getBadge(pedido.estado);
                const activo = pedidoActivo?.id === pedido.id;
                const yaCalificado = calificaciones[pedido.id];
                const puedeCalificar = pedido.estado === 'entregado' && !yaCalificado;

                return (
                  <div key={pedido.id} className="pedido-card" onClick={() => verDetalle(pedido)} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: activo ? '2px solid #f90' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activo ? '0 4px 20px rgba(255,153,0,0.15)' : '0 2px 8px rgba(0,0,0,0.06)' }}>

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
                      <div style={{ position: 'relative', marginBottom: puedeCalificar ? '16px' : '0' }}>
                        <div style={{ position: 'absolute', top: '12px', left: '6%', right: '6%', height: '3px', backgroundColor: '#f0f0f0' }}>
                          <div style={{ height: '100%', backgroundColor: '#f90', borderRadius: '2px', transition: 'width 0.5s', width: badge.paso >= 4 ? '100%' : badge.paso >= 3 ? '66%' : badge.paso >= 2 ? '33%' : '0%' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                          {pasos.map(p => (
                            <div key={p.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                              <div style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: badge.paso >= p.num ? '#f90' : 'white', border: badge.paso >= p.num ? '2px solid #f90' : '2px solid #e5e5e5', marginBottom: '6px', fontSize: '12px', transition: 'all 0.3s' }}>
                                {badge.paso >= p.num ? <span style={{ color: 'white', fontSize: '11px' }}>✓</span> : p.icon}
                              </div>
                              <p style={{ fontSize: '10px', color: badge.paso >= p.num ? '#f90' : '#bbb', fontWeight: badge.paso >= p.num ? '700' : 'normal', textAlign: 'center', margin: 0 }}>{p.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BOTON CALIFICAR */}
                    {puedeCalificar && (
                      <button
                        onClick={e => { e.stopPropagation(); setModalCalificacion(pedido); }}
                        style={{ width: '100%', marginTop: '14px', padding: '10px', background: 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '10px', color: '#111', fontWeight: '800', fontSize: '13px', cursor: 'pointer', fontFamily: 'Arial Black, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        Calificar al vendedor
                      </button>
                    )}

                    {yaCalificado && pedido.estado === 'entregado' && (
                      <div style={{ marginTop: '12px', padding: '8px 14px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <p style={{ fontSize: '12px', color: '#22c55e', margin: 0, fontWeight: '700' }}>Ya calificaste a este vendedor</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PANEL DETALLE */}
            {pedidoActivo && (
              <div className="detalle-panel" style={{ position: 'sticky', top: '80px', backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #eee', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '2px solid #f90' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Detalle del pedido</h3>
                  <button onClick={() => setPedidoActivo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '18px', padding: '4px' }}>✕</button>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Numero de pedido</p>
                  <p style={{ fontWeight: '800', fontSize: '15px', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>#{pedidoActivo.id.slice(0, 8).toUpperCase()}</p>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '4px', margin: '4px 0 0' }}>
                    {new Date(pedidoActivo.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* ESTADO */}
                <div style={{ backgroundColor: getBadge(pedidoActivo.estado).bg, borderRadius: '10px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
                  <p style={{ fontWeight: '800', fontSize: '15px', color: getBadge(pedidoActivo.estado).color, margin: 0 }}>
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
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#111', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Productos</p>

                  {cargandoDetalle ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[1, 2].map(i => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                          <div style={{ width: '48px', height: '48px', backgroundColor: '#eee', borderRadius: '8px', flexShrink: 0, animation: 'pulse 1.5s infinite' }}></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ height: '13px', backgroundColor: '#eee', borderRadius: '4px', marginBottom: '8px', width: '70%', animation: 'pulse 1.5s infinite' }}></div>
                            <div style={{ height: '11px', backgroundColor: '#eee', borderRadius: '4px', width: '40%', animation: 'pulse 1.5s infinite' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : itemsActivos.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                      <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>No hay productos en este pedido</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {itemsActivos.map((item: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                          {item.imagen_url ? (
                            <img
                              src={item.imagen_url}
                              alt={item.nombre}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid #eee' }}
                            />
                          ) : (
                            <div style={{ width: '48px', height: '48px', backgroundColor: '#eee', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: '700', fontSize: '13px', color: '#111', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre || 'Producto'}</p>
                            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Cant: {item.cantidad || 1}</p>
                          </div>
                          <p style={{ fontWeight: '800', fontSize: '13px', color: '#f90', margin: 0, flexShrink: 0 }}>
                            ${Number(item.precio * (item.cantidad || 1)).toLocaleString('es-CO')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DATOS DE ENVIO */}
                {pedidoActivo.direccion_envio && (
                  <div style={{ backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Direccion de envio</p>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f90" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <p style={{ fontSize: '13px', color: '#333', margin: 0, lineHeight: '1.5' }}>{pedidoActivo.direccion_envio}</p>
                    </div>
                  </div>
                )}

                {/* RESUMEN TOTAL */}
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
                  {pedidoActivo.subtotal != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Subtotal</p>
                      <p style={{ fontSize: '13px', color: '#333', margin: 0, fontWeight: '600' }}>${Number(pedidoActivo.subtotal).toLocaleString('es-CO')} COP</p>
                    </div>
                  )}
                  {pedidoActivo.costo_envio != null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Envio</p>
                      <p style={{ fontSize: '13px', color: '#333', margin: 0, fontWeight: '600' }}>
                        {pedidoActivo.costo_envio === 0 ? 'Gratis' : `$${Number(pedidoActivo.costo_envio).toLocaleString('es-CO')} COP`}
                      </p>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Total</p>
                    <p style={{ fontSize: '16px', fontWeight: '800', color: '#f90', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>${Number(pedidoActivo.total).toLocaleString('es-CO')} COP</p>
                  </div>
                </div>

                {/* METODO DE PAGO */}
                {pedidoActivo.metodo_pago && (
                  <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#f9f9f9', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Pagado con <span style={{ color: '#333', fontWeight: '700' }}>{pedidoActivo.metodo_pago}</span></p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}