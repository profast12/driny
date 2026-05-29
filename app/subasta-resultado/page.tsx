"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function SubastaResultado() {
  const [subastaId, setSubastaId] = useState('');
  const [subasta, setSubasta] = useState<any>(null);
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [ganador, setGanador] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState<'aceptar' | 'rechazar' | null>(null);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '';
    setSubastaId(id);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return; }
      setUsuario(session.user);
      if (id) cargarDatos(id, session.user.id);
    });
  }, []);

  const cargarDatos = async (id: string, userId: string) => {
    const { data: s } = await supabase.from('subastas_real').select('*').eq('id', id).single();
    if (!s) { setCargando(false); return; }
    if (s.vendedor_id !== userId) { window.location.href = '/'; return; }
    setSubasta(s);

    const { data: ofs } = await supabase
      .from('ofertas_real').select('*').eq('subasta_id', id)
      .order('monto', { ascending: false }).limit(10);
    if (ofs) {
      setOfertas(ofs);
      if (ofs.length > 0) {
        const mejorOferta = ofs[0];
        const { data: perfil } = await supabase.from('usuarios').select('*').eq('id', mejorOferta.usuario_id).single();
        setGanador({ ...mejorOferta, perfil });
      }
    }
    setCargando(false);
  };

  const aceptarOferta = async () => {
    if (!ganador || !subasta) return;
    setProcesando(true); setError(''); setMensaje('');

    await supabase.from('subastas_real').update({
      estado_final: 'aceptada',
      activa: false,
      ganador_id: ganador.usuario_id,
      ganador_nombre: ganador.usuario_nombre,
      ganador_email: ganador.perfil?.email || '',
      ganador_avatar: ganador.usuario_avatar || ''
    }).eq('id', subastaId);

    await supabase.from('notificaciones').insert([{
      usuario_id: ganador.usuario_id,
      titulo: 'Ganaste la subasta',
      mensaje: 'Tu oferta de $' + Number(ganador.monto).toLocaleString('es-CO') + ' COP fue aceptada para ' + subasta.nombre + '. El vendedor se pondra en contacto contigo.',
      pedido_id: null
    }]);

    setMensaje('Oferta aceptada. El comprador sera notificado.');
    setConfirmando(null);
    setProcesando(false);
    cargarDatos(subastaId, usuario.id);
  };

  const rechazarOferta = async () => {
    if (!subasta) return;
    setProcesando(true); setError(''); setMensaje('');

    await supabase.from('subastas_real').update({
      estado_final: 'rechazada',
      activa: false
    }).eq('id', subastaId);

    if (ganador) {
      await supabase.from('notificaciones').insert([{
        usuario_id: ganador.usuario_id,
        titulo: 'Subasta no disponible',
        mensaje: 'El vendedor no pudo completar la subasta de ' + subasta.nombre + '. Tu oferta ha sido cancelada.',
        pedido_id: null
      }]);
    }

    setMensaje('Subasta rechazada. Los oferentes seran notificados.');
    setConfirmando(null);
    setProcesando(false);
    cargarDatos(subastaId, usuario.id);
  };

  if (cargando) return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white', fontSize: '15px' }}>Cargando resultado...</div>
    </main>
  );

  if (!subasta) return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white' }}>Subasta no encontrada</div>
    </main>
  );

  const finalizada = !subasta.activa || new Date(subasta.tiempo_fin) <= new Date();
  const estadoFinal = subasta.estado_final;

  return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: 'white' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .btn-aceptar { transition: all 0.2s; }
        .btn-aceptar:hover { background: linear-gradient(135deg, #22c55e, #16a34a) !important; transform: scale(1.02); }
        .btn-rechazar { transition: all 0.2s; }
        .btn-rechazar:hover { background: linear-gradient(135deg, #ef4444, #dc2626) !important; transform: scale(1.02); }
        .oferta-row { transition: all 0.2s; }
        .oferta-row:hover { background-color: #1f1f1f !important; }
        .modal-overlay { animation: scaleIn 0.2s ease; }
      `}</style>

      {/* MODAL CONFIRMACION */}
      {confirmando && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="modal-overlay" style={{ backgroundColor: '#111', borderRadius: '20px', padding: '36px', maxWidth: '420px', width: '100%', border: '1px solid #2a2a2a', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: confirmando === 'aceptar' ? '#22c55e22' : '#ef444422', border: confirmando === 'aceptar' ? '2px solid #22c55e44' : '2px solid #ef444444' }}>
              <span style={{ fontSize: '28px' }}>{confirmando === 'aceptar' ? '✓' : '✕'}</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
              {confirmando === 'aceptar' ? 'Confirmar aceptacion' : 'Confirmar rechazo'}
            </h3>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              {confirmando === 'aceptar'
                ? `Vas a aceptar la oferta de $${Number(ganador?.monto).toLocaleString('es-CO')} COP de ${ganador?.usuario_nombre}. El comprador recibira una notificacion y debera coordinar el pago contigo.`
                : 'Vas a rechazar todas las ofertas y cerrar esta subasta. Esta accion no se puede deshacer.'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmando(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                Cancelar
              </button>
              <button
                onClick={confirmando === 'aceptar' ? aceptarOferta : rechazarOferta}
                disabled={procesando}
                className={confirmando === 'aceptar' ? 'btn-aceptar' : 'btn-rechazar'}
                style={{ flex: 1, padding: '12px', backgroundColor: confirmando === 'aceptar' ? '#22c55e' : '#ef4444', border: 'none', color: 'white', borderRadius: '10px', cursor: procesando ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '14px', opacity: procesando ? 0.7 : 1 }}
              >
                {procesando ? 'Procesando...' : confirmando === 'aceptar' ? 'Aceptar oferta' : 'Rechazar subasta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#111', borderBottom: '1px solid #1f1f1f', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <span style={{ color: '#2a2a2a' }}>|</span>
        <a href="/subastas-panel" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Panel de subastas</a>
        <div style={{ flex: 1 }}></div>
        <a href="/subastas-panel" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>← Volver</a>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', animation: 'fadeIn 0.4s ease' }}>

        {/* BREADCRUMB */}
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>
          <a href="/subastas-panel" style={{ color: '#f90', textDecoration: 'none' }}>Mis subastas</a>
          {' › '}Resultado de subasta
        </p>

        {mensaje !== '' && (
          <div style={{ backgroundColor: '#22c55e22', border: '1px solid #22c55e44', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', fontSize: '14px', color: '#22c55e', animation: 'slideUp 0.3s ease' }}>
            {mensaje}
          </div>
        )}

        {/* HEADER SUBASTA */}
        <div style={{ backgroundColor: '#111', borderRadius: '20px', padding: '28px', marginBottom: '20px', border: '1px solid #1f1f1f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>{subasta.categoria}</p>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{subasta.nombre}</h1>
              <p style={{ color: '#666', fontSize: '13px' }}>
                Finalizo el {new Date(subasta.tiempo_fin).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div style={{
              padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
              backgroundColor: estadoFinal === 'aceptada' ? '#22c55e22' : estadoFinal === 'rechazada' ? '#ef444422' : finalizada ? '#fef3c722' : '#22c55e22',
              color: estadoFinal === 'aceptada' ? '#22c55e' : estadoFinal === 'rechazada' ? '#ef4444' : finalizada ? '#f59e0b' : '#22c55e',
              border: estadoFinal === 'aceptada' ? '1px solid #22c55e44' : estadoFinal === 'rechazada' ? '1px solid #ef444444' : '1px solid #f59e0b44'
            }}>
              {estadoFinal === 'aceptada' ? 'Oferta aceptada' : estadoFinal === 'rechazada' ? 'Subasta rechazada' : finalizada ? 'Pendiente decision' : 'En curso'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { label: 'Precio base', valor: '$' + Number(subasta.precio_base).toLocaleString('es-CO') + ' COP' },
              { label: 'Precio final', valor: '$' + Number(subasta.precio_actual).toLocaleString('es-CO') + ' COP', destacado: true },
              { label: 'Total ofertas', valor: subasta.total_ofertas + ' ofertas' },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: stat.destacado ? '#f90' : 'white' }}>{stat.valor}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* GANADOR */}
          <div style={{ backgroundColor: '#111', borderRadius: '20px', padding: '28px', border: ganador ? '1px solid #f9030' : '1px solid #1f1f1f', animation: 'slideUp 0.4s ease' }}>
            <h2 style={{ fontSize: '14px', color: '#666', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Mejor oferta</h2>

            {!ganador ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#666' }}>
                <p>No hubo ofertas en esta subasta</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#111', flexShrink: 0, border: '2px solid #f9030' }}>
                    {ganador.usuario_avatar ? <img src={ganador.usuario_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (ganador.usuario_nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '17px', marginBottom: '4px' }}>{ganador.usuario_nombre || 'Usuario'}</p>
                    {ganador.perfil?.email && <p style={{ color: '#888', fontSize: '13px', marginBottom: '2px' }}>{ganador.perfil.email}</p>}
                    {ganador.perfil?.username && <p style={{ color: '#f90', fontSize: '12px' }}>@{ganador.perfil.username}</p>}
                  </div>
                </div>

                <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#666', marginBottom: '6px', textTransform: 'uppercase' }}>Oferta ganadora</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', background: 'linear-gradient(135deg, #f90, #ff6b00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ${Number(ganador.monto).toLocaleString('es-CO')}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666' }}>COP</p>
                </div>

                {ganador.perfil?.telefono && (
                  <div style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>TELEFONO</p>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{ganador.perfil.telefono}</p>
                  </div>
                )}

                {estadoFinal === 'pendiente' && finalizada && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => setConfirmando('aceptar')} className="btn-aceptar" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                      Aceptar oferta ganadora
                    </button>
                    <button onClick={() => setConfirmando('rechazar')} className="btn-rechazar" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                      Rechazar todas las ofertas
                    </button>
                  </div>
                )}

                {estadoFinal === 'aceptada' && (
                  <div style={{ backgroundColor: '#22c55e22', border: '1px solid #22c55e44', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <p style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '14px' }}>Oferta aceptada</p>
                    <p style={{ color: '#22c55e', fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>El comprador fue notificado</p>
                  </div>
                )}

                {estadoFinal === 'rechazada' && (
                  <div style={{ backgroundColor: '#ef444422', border: '1px solid #ef444444', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>Subasta rechazada</p>
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>Los oferentes fueron notificados</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INFO CONTACTO */}
          {ganador && ganador.perfil && (
            <div style={{ backgroundColor: '#111', borderRadius: '20px', padding: '28px', border: '1px solid #1f1f1f', animation: 'slideUp 0.5s ease' }}>
              <h2 style={{ fontSize: '14px', color: '#666', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Informacion de contacto</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Nombre', valor: ganador.perfil?.nombre || ganador.usuario_nombre },
                  { label: 'Correo', valor: ganador.perfil?.email },
                  { label: 'Usuario', valor: ganador.perfil?.username ? '@' + ganador.perfil.username : '-' },
                  { label: 'Tipo de cuenta', valor: ganador.perfil?.tipo || 'comprador' },
                  { label: 'Oferta realizada', valor: new Date(ganador.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{item.valor || '-'}</span>
                  </div>
                ))}
              </div>

              {ganador.perfil?.email && (
                <a
                  href={"mailto:" + ganador.perfil.email + "?subject=Tu oferta ganadora en Driny - " + subasta.nombre + "&body=Hola " + (ganador.perfil.nombre || ganador.usuario_nombre) + ", tu oferta de $" + Number(ganador.monto).toLocaleString('es-CO') + " COP ha sido aceptada. Coordinemos el pago y envio."}
                  style={{ display: 'block', textAlign: 'center', marginTop: '16px', backgroundColor: '#1a1a1a', color: '#f90', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', border: '1px solid #2a2a2a' }}
                >
                  Contactar por correo
                </a>
              )}
            </div>
          )}
        </div>

        {/* HISTORIAL COMPLETO */}
        <div style={{ backgroundColor: '#111', borderRadius: '20px', padding: '28px', border: '1px solid #1f1f1f', animation: 'slideUp 0.6s ease' }}>
          <h2 style={{ fontSize: '14px', color: '#666', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Historial completo de ofertas</h2>

          {ofertas.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '30px 0', fontSize: '14px' }}>No hubo ofertas en esta subasta</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ofertas.map((o, i) => (
                <div key={o.id} className="oferta-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', backgroundColor: i === 0 ? '#1a1500' : '#1a1a1a', borderRadius: '10px', border: i === 0 ? '1px solid #f9030' : '1px solid transparent', transition: 'all 0.2s' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: i === 0 ? '#f90' : '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: i === 0 ? '#111' : '#888', flexShrink: 0, overflow: 'hidden' }}>
                    {o.usuario_avatar ? <img src={o.usuario_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (o.usuario_nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>{o.usuario_nombre || 'Usuario'}</p>
                    <p style={{ fontSize: '11px', color: '#666' }}>{new Date(o.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', color: i === 0 ? '#f90' : '#888', fontSize: '15px' }}>${Number(o.monto).toLocaleString('es-CO')} COP</p>
                    {i === 0 && <p style={{ fontSize: '10px', color: '#f90', marginTop: '2px', letterSpacing: '0.5px' }}>MEJOR OFERTA</p>}
                    {i > 0 && <p style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>#{i + 1} lugar</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}