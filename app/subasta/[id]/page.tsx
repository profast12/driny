"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";

export default function DetalleSubasta() {
  const [id, setId] = useState('');
  const [subasta, setSubasta] = useState<any>(null);
  const [vendedor, setVendedor] = useState<any>(null);
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const [perfilUsuario, setPerfilUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [miOferta, setMiOferta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState('');
  const [urgente, setUrgente] = useState(false);
  const intervalRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const [fotoActiva, setFotoActiva] = useState(0);

  useEffect(() => {
    const parts = window.location.pathname.split('/');
    setId(parts[parts.length - 1]);
  }, []);

  useEffect(() => {
    if (!id) return;
    cargarSubasta();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUsuario(session.user);
        const { data: p } = await supabase.from('usuarios').select('*').eq('email', session.user.email).single();
        if (p) setPerfilUsuario(p);
      }
    });

    const canal = supabase.channel('subasta-' + id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subastas_real', filter: 'id=eq.' + id }, payload => {
        setSubasta((payload.new as any));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ofertas_real', filter: 'subasta_id=eq.' + id }, () => {
        cargarOfertas();
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [id]);

  useEffect(() => {
    if (!subasta) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = new Date(subasta.tiempo_fin).getTime() - new Date().getTime();
      if (diff <= 0) { setTiempoRestante('Finalizada'); clearInterval(timerRef.current); return; }
      setUrgente(diff < 3600000);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTiempoRestante(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [subasta]);

  const cargarSubasta = async () => {
    const { data: s } = await supabase.from('subastas_real').select('*').eq('id', id).single();
    if (s) {
      setSubasta(s);
      const { data: v } = await supabase.from('usuarios').select('*').eq('id', s.vendedor_id).single();
      if (!v) {
        const { data: authUser } = await supabase.from('usuarios').select('*').limit(1);
      }
      setVendedor(v);
      cargarOfertas();
    }
    setCargando(false);
  };

  const cargarOfertas = async () => {
    const { data } = await supabase.from('ofertas_real').select('*').eq('subasta_id', id).order('monto', { ascending: false }).limit(10);
    if (data) setOfertas(data);
  };

  const hacerOferta = async () => {
    if (!usuario) { window.location.href = '/login'; return; }
    if (perfilUsuario?.tipo === 'vendedor' && subasta?.vendedor_id === usuario.id) { setError('No puedes ofertar en tu propia subasta'); return; }
    const ofertaNum = Number(miOferta);
    const minima = subasta.precio_actual + subasta.incremento_minimo;
    if (ofertaNum < minima) { setError('La oferta minima es $' + minima.toLocaleString('es-CO') + ' COP'); return; }

    setEnviando(true); setError(''); setMensaje('');
    const { error: err1 } = await supabase.from('ofertas_real').insert([{
      subasta_id: id,
      usuario_id: usuario.id,
      usuario_nombre: perfilUsuario?.username || perfilUsuario?.nombre || usuario.email.split('@')[0],
      usuario_avatar: perfilUsuario?.avatar_url || null,
      monto: ofertaNum
    }]);

    if (err1) { setError('Error al enviar la oferta'); setEnviando(false); return; }

    await supabase.from('subastas_real').update({ precio_actual: ofertaNum, total_ofertas: (subasta.total_ofertas || 0) + 1 }).eq('id', id);
    await supabase.from('notificaciones').insert([{
  usuario_id: subasta.vendedor_id,
  titulo: 'Nueva oferta en tu subasta',
  mensaje: 'Alguien oferto $' + ofertaNum.toLocaleString('es-CO') + ' COP en ' + subasta.nombre + '. Haz clic para ver el resultado.',
  pedido_id: null,
  subasta_id: id
}]);

    setMensaje('Oferta enviada exitosamente');
    setMiOferta('');
    setEnviando(false);
    setTimeout(() => setMensaje(''), 4000);
  };

  if (cargando) return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white' }}>Cargando subasta...</div>
    </main>
  );

  if (!subasta) return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white' }}>Subasta no encontrada</div>
    </main>
  );

  const finalizada = !subasta.activa || new Date(subasta.tiempo_fin) <= new Date();

  return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: 'white' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes urgente { 0%, 100% { color: #ef4444; } 50% { color: #ff6b6b; } }
        .oferta-item { animation: slideIn 0.3s ease; }
        .btn-ofertar:hover { background: linear-gradient(135deg, #ff8c00, #f90) !important; transform: scale(1.02); }
        .btn-ofertar:active { transform: scale(0.98); }
      `}</style>

      <nav style={{ backgroundColor: '#111', borderBottom: '1px solid #1f1f1f', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <span style={{ color: '#333' }}>|</span>
        <a href="/subastas" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Subastas</a>
        <div style={{ flex: 1 }}></div>
        {usuario ? (
          <a href="/perfil" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Mi perfil</a>
        ) : (
          <a href="/login" style={{ backgroundColor: '#f90', color: '#111', padding: '6px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>Iniciar sesion</a>
        )}
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', animation: 'fadeIn 0.4s ease' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'flex-start' }}>

          {/* COLUMNA IZQUIERDA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* GALERIA */}
<div style={{ position: 'relative', backgroundColor: '#1a1a1a', height: '340px', overflow: 'hidden' }}>
  {subasta.imagenes && subasta.imagenes.length > 0 ? (
    <>
      <img
        src={subasta.imagenes[fotoActiva]}
        style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#111', transition: 'opacity 0.3s' }}
        alt={subasta.nombre}
      />
      {subasta.imagenes.length > 1 && (
        <>
          <button
            onClick={() => setFotoActiva(prev => prev === 0 ? subasta.imagenes.length - 1 : prev - 1)}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ‹
          </button>
          <button
            onClick={() => setFotoActiva(prev => prev === subasta.imagenes.length - 1 ? 0 : prev + 1)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ›
          </button>
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
            {subasta.imagenes.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setFotoActiva(i)}
                style={{ width: i === fotoActiva ? '20px' : '8px', height: '8px', borderRadius: '4px', border: 'none', backgroundColor: i === fotoActiva ? '#f90' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}
              />
            ))}
          </div>
        </>
      )}
    </>
  ) : (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
      {subasta.emoji || '🛍️'}
    </div>
  )}
  {!finalizada && (
    <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#22c55e', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
      EN VIVO
    </div>
  )}
  {finalizada && (
    <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#ef4444', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
      FINALIZADA
    </div>
  )}
  {subasta.imagenes && subasta.imagenes.length > 1 && (
    <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>
      {fotoActiva + 1} / {subasta.imagenes.length}
    </div>
  )}
</div>

{/* MINIATURAS */}
{subasta.imagenes && subasta.imagenes.length > 1 && (
  <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', backgroundColor: '#0f0f0f', overflowX: 'auto' }}>
    {subasta.imagenes.map((img: string, i: number) => (
      <div
        key={i}
        onClick={() => setFotoActiva(i)}
        style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', border: i === fotoActiva ? '2px solid #f90' : '2px solid transparent', transition: 'all 0.2s', opacity: i === fotoActiva ? 1 : 0.6 }}
      >
        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={'foto ' + (i + 1)} />
      </div>
    ))}
  </div>
)}

            {/* VENDEDOR */}
            {vendedor && (
              <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '24px', border: '1px solid #1f1f1f' }}>
                <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vendedor</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', color: '#111', flexShrink: 0 }}>
                    {vendedor.avatar_url ? <img src={vendedor.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (vendedor.nombre || 'V').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '2px' }}>{vendedor.nombre_tienda || vendedor.nombre || 'Vendedor'}</p>
                    {vendedor.username && <p style={{ color: '#f90', fontSize: '13px' }}>@{vendedor.username}</p>}
                    <p style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>Vendedor verificado en Driny</p>
                  </div>
                  <a href={`/perfil-vendedor/${subasta.vendedor_id}`} style={{ backgroundColor: '#1a1a1a', color: '#f90', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', border: '1px solid #2a2a2a' }}>
                    Ver perfil
                  </a>
                </div>
              </div>
            )}

            {/* HISTORIAL OFERTAS */}
            <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '24px', border: '1px solid #1f1f1f' }}>
              <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Historial de ofertas</h3>
              {ofertas.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Aun no hay ofertas. Se el primero.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ofertas.map((o, i) => (
                    <div key={o.id} className="oferta-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: i === 0 ? '#1a1a0a' : '#1a1a1a', borderRadius: '10px', border: i === 0 ? '1px solid #f9030' : '1px solid transparent' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: i === 0 ? '#f90' : '#2a2a2a', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: i === 0 ? '#111' : '#888', flexShrink: 0 }}>
                        {o.usuario_avatar ? <img src={o.usuario_avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (o.usuario_nombre || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>{o.usuario_nombre || 'Usuario'}</p>
                        <p style={{ fontSize: '11px', color: '#666' }}>{new Date(o.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 'bold', color: i === 0 ? '#f90' : '#888', fontSize: '14px' }}>${Number(o.monto).toLocaleString('es-CO')}</p>
                        {i === 0 && <p style={{ fontSize: '10px', color: '#f90', marginTop: '2px' }}>MEJOR OFERTA</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* PRECIO Y CONTADOR */}
            <div style={{ backgroundColor: '#111', borderRadius: '20px', padding: '28px', border: '1px solid #1f1f1f', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Precio actual</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', background: 'linear-gradient(135deg, #f90, #ff6b00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>
                ${Number(subasta.precio_actual).toLocaleString('es-CO')}
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>COP</p>

              {!finalizada && (
                <div style={{ backgroundColor: urgente ? '#2a0a0a' : '#1a1a1a', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: urgente ? '1px solid #ef444444' : '1px solid #2a2a2a' }}>
                  <p style={{ fontSize: '11px', color: urgente ? '#ef4444' : '#666', marginBottom: '6px', textTransform: 'uppercase' }}>Tiempo restante</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace', color: urgente ? '#ef4444' : '#f90', animation: urgente ? 'urgente 1s infinite' : 'none' }}>
                    {tiempoRestante}
                  </p>
                </div>
              )}

              {finalizada ? (
                <div style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ color: '#666', fontSize: '14px' }}>Esta subasta ha finalizado</p>
                  {ofertas.length > 0 && <p style={{ color: '#f90', fontWeight: 'bold', marginTop: '4px', fontSize: '13px' }}>Ganador: {ofertas[0]?.usuario_nombre}</p>}
                </div>
              ) : (
                <div>
                  {mensaje && (
                    <div style={{ backgroundColor: '#22c55e22', border: '1px solid #22c55e44', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '13px', color: '#22c55e' }}>
                      {mensaje}
                    </div>
                  )}
                  {error && (
                    <div style={{ backgroundColor: '#ef444422', border: '1px solid #ef444444', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '13px', color: '#ef4444' }}>
                      {error}
                    </div>
                  )}

                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textAlign: 'left' }}>
                    Tu oferta (minimo ${(Number(subasta.precio_actual) + Number(subasta.incremento_minimo)).toLocaleString('es-CO')} COP)
                  </p>
                  <input
                    type="number"
                    placeholder={'Min. $' + (Number(subasta.precio_actual) + Number(subasta.incremento_minimo)).toLocaleString('es-CO')}
                    value={miOferta}
                    onChange={e => setMiOferta(e.target.value)}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #2a2a2a', backgroundColor: '#1a1a1a', color: 'white', fontSize: '16px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', textAlign: 'center' }}
                    onFocus={e => e.target.style.border = '1px solid #f90'}
                    onBlur={e => e.target.style.border = '1px solid #2a2a2a'}
                  />

                  {usuario ? (
                    <button onClick={hacerOferta} disabled={enviando} className="btn-ofertar" style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f90, #ff6b00)', color: '#111', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: enviando ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: enviando ? 0.7 : 1 }}>
                      {enviando ? 'Enviando oferta...' : 'Hacer oferta'}
                    </button>
                  ) : (
                    <a href="/login" style={{ display: 'block', width: '100%', padding: '16px', backgroundColor: '#f90', color: '#111', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' as const }}>
                      Iniciar sesion para ofertar
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* INFO ADICIONAL */}
            <div style={{ backgroundColor: '#111', borderRadius: '16px', padding: '20px', border: '1px solid #1f1f1f' }}>
              <h3 style={{ fontSize: '13px', color: '#666', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Informacion importante</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'El ganador debe completar el pago en 48 horas',
                  'El vendedor coordinara el envio tras el pago',
                  'Driny garantiza la seguridad de la transaccion',
                  'El precio final incluye el costo del producto',
                ].map((info, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#888' }}>
                    <span style={{ color: '#f90', flexShrink: 0 }}>-</span>
                    <span>{info}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}