"use client";
import { useState } from "react";
import emailjs from '@emailjs/browser';
import { supabase } from "../../lib/supabase";

const SERVICE_ID = 'service_jgquzeo';
const TEMPLATE_ID = 'template_1vfcvoj';
const PUBLIC_KEY = 'fKKe-9ggzSrmaznFj';

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [ticketNum] = useState('#DRN-' + (Math.floor(Math.random() * 90000) + 10000));

  const categorias = [
    { id: 'Problema con una compra', label: 'Problema con una compra', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
    { id: 'Problema con una venta', label: 'Problema con una venta', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: 'Problema con mi cuenta', label: 'Problema con mi cuenta', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'Problema con un pago', label: 'Problema con un pago', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { id: 'Problema con una subasta', label: 'Problema con una subasta', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { id: 'Otro motivo', label: 'Otro motivo', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  ];

  const enviarFormulario = async () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) { setError('Por favor completa todos los campos obligatorios'); return; }
    if (!categoriaActiva) { setError('Selecciona el motivo de tu consulta'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Ingresa un correo electronico valido'); return; }
    setEnviando(true); setError('');

    try {
      let tipoCuenta = 'No registrado en Driny';
      const { data: usuario } = await supabase.from('usuarios').select('tipo, nombre').eq('email', form.email.trim().toLowerCase()).maybeSingle();
      if (usuario) tipoCuenta = usuario.tipo === 'vendedor' ? 'Vendedor' : 'Comprador';

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        motivo: categoriaActiva,
        nombre: form.nombre.trim(),
        email_usuario: form.email.trim(),
        tipo_cuenta: tipoCuenta,
        asunto: form.asunto.trim() || 'Sin asunto',
        mensaje: form.mensaje.trim(),
        ticket: ticketNum,
      }, PUBLIC_KEY);

      setEnviado(true);
    } catch (err: any) {
      setError('Error al enviar el mensaje. Intenta de nuevo o escríbenos directamente a drinymail@gmail.com');
    }

    setEnviando(false);
  };

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .input-c:focus { border-color: #f90 !important; box-shadow: 0 0 0 3px rgba(255,153,0,0.1) !important; }
        .cat-btn:hover { border-color: #f90 !important; background-color: #fff8f0 !important; }
        .info-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        @media (max-width: 768px) {
          .contacto-grid { grid-template-columns: 1fr !important; }
          .cat-grid { grid-template-columns: 1fr !important; }
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
          <a href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Volver al inicio</a>
        </div>
        <div style={{ borderTop: '1px solid #f5f5f5' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '7px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a>{' › '}
              <span style={{ color: '#333', fontWeight: '600' }}>Contacto y soporte</span>
            </p>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a00 50%, #1a1a1a 100%)', padding: '56px 24px', textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #f90, #ff6b00)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '10px', fontFamily: 'Arial Black, sans-serif' }}>Centro de soporte</h1>
          <p style={{ color: '#aaa', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            Estamos aqui para ayudarte. Escribenos y te responderemos lo antes posible.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* TARJETAS INFO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f90" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, titulo: 'Correo electronico', valor: 'drinymail@gmail.com', desc: 'Respuesta en menos de 24 horas', color: '#f90' },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>, titulo: 'WhatsApp', valor: '+57 301 396 9974', desc: 'Lunes a viernes 8am - 6pm', color: '#22c55e' },
            { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, titulo: 'Tiempo de respuesta', valor: 'Menos de 24h', desc: 'En dias habiles laborales', color: '#3b82f6' },
          ].map((item, i) => (
            <div key={i} className="info-card" style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>{item.icon}</div>
              </div>
              <p style={{ fontSize: '12px', color: '#888', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.titulo}</p>
              <p style={{ fontSize: '16px', fontWeight: '800', color: item.color, marginBottom: '4px', fontFamily: 'Arial Black, sans-serif' }}>{item.valor}</p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="contacto-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'flex-start' }}>

          {/* FORMULARIO */}
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee', animation: 'fadeIn 0.4s ease' }}>

            {enviado ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '72px', height: '72px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #bbf7d0', animation: 'checkIn 0.5s ease' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111', marginBottom: '10px', fontFamily: 'Arial Black, sans-serif' }}>Mensaje enviado</h3>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
                  Recibimos tu mensaje correctamente. Te responderemos a <strong>{form.email || 'tu correo'}</strong> en menos de 24 horas habiles.
                </p>
                <div style={{ backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid #eee' }}>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Numero de ticket</p>
                  <p style={{ fontSize: '18px', fontWeight: '800', color: '#f90', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>{ticketNum}</p>
                </div>
                <button onClick={() => { setEnviado(false); setForm({ nombre: '', email: '', asunto: '', mensaje: '' }); setCategoriaActiva(''); }} style={{ backgroundColor: '#f90', color: '#111', padding: '12px 28px', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', fontFamily: 'Arial Black, sans-serif' }}>
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '2px solid #f90' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Formulario de contacto</h2>
                  <p style={{ color: '#888', fontSize: '13px', marginTop: '6px', margin: '6px 0 0' }}>Completa el formulario y te responderemos pronto</p>
                </div>

                {error && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
                  </div>
                )}

                {/* CATEGORIA */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Motivo de contacto <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {categorias.map(cat => (
                      <button key={cat.id} className="cat-btn" onClick={() => setCategoriaActiva(cat.id)} style={{ padding: '11px 14px', borderRadius: '10px', border: categoriaActiva === cat.id ? '2px solid #f90' : '2px solid #eee', backgroundColor: categoriaActiva === cat.id ? '#fff8f0' : 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s' }}>
                        <div style={{ color: categoriaActiva === cat.id ? '#f90' : '#888', flexShrink: 0 }}>{cat.icon}</div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: categoriaActiva === cat.id ? '#111' : '#555' }}>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Nombre completo <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" placeholder="Tu nombre" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="input-c" style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Correo electronico <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="email" placeholder="tucorreo@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-c" style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Asunto</label>
                  <input type="text" placeholder="Resumen breve de tu consulta" value={form.asunto} onChange={e => setForm(p => ({ ...p, asunto: e.target.value }))} className="input-c" style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Mensaje <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea placeholder="Describe tu problema o consulta detalladamente..." value={form.mensaje} onChange={e => setForm(p => ({ ...p, mensaje: e.target.value }))} rows={5} className="input-c" style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white', resize: 'vertical', fontFamily: 'Arial, sans-serif' }} />
                  <p style={{ fontSize: '11px', color: '#bbb', marginTop: '5px' }}>{form.mensaje.length}/1000 caracteres</p>
                </div>

                <button onClick={enviarFormulario} disabled={enviando} style={{ width: '100%', padding: '14px', background: enviando ? '#f0f0f0' : 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '15px', color: enviando ? '#bbb' : '#111', cursor: enviando ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'Arial Black, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {enviando ? (
                    <>
                      <div style={{ width: '16px', height: '16px', border: '2px solid #bbb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                      Enviando mensaje...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      Enviar mensaje
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* PANEL LATERAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '2px solid #f90' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f90" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Horario de atencion</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { dia: 'Lunes - Viernes', hora: '8:00 AM - 6:00 PM', activo: true },
                  { dia: 'Sabados', hora: '9:00 AM - 1:00 PM', activo: true },
                  { dia: 'Domingos', hora: 'Cerrado', activo: false },
                ].map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{h.dia}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: h.activo ? '#22c55e' : '#ef4444' }}>{h.hora}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '14px', backgroundColor: '#fff8f0', borderRadius: '10px', padding: '12px', border: '1px solid #ffe0b2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }}></div>
                <p style={{ fontSize: '12px', color: '#f90', fontWeight: '700', margin: 0 }}>Respondemos en menos de 24 horas habiles</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '2px solid #f90' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f90" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Preguntas frecuentes</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { p: 'Como hago un seguimiento de mi pedido?', r: 'Ve a Mis pedidos en tu perfil para ver el estado en tiempo real.' },
                  { p: 'Cuanto tiempo tarda el envio?', r: 'Depende de la paqueteria. Coordinadora e Interrapidisimo entregan en 1-3 dias habiles.' },
                  { p: 'Como puedo devolver un producto?', r: 'Tienes 30 dias para solicitar una devolucion. Contacta al vendedor directamente.' },
                  { p: 'Es seguro pagar con PayPal?', r: 'Si. PayPal protege todas las transacciones y ofrece garantia al comprador.' },
                ].map((faq, i) => (
                  <div key={i} style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '1px solid #eee' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#111', marginBottom: '5px' }}>{faq.p}</p>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: 1.5 }}>{faq.r}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <p style={{ fontWeight: '800', fontSize: '16px', color: 'white', marginBottom: '6px', fontFamily: 'Arial Black, sans-serif' }}>Soporte por WhatsApp</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '16px', lineHeight: 1.5 }}>Chatea con nosotros directamente en horario de atencion</p>
              <a href="https://wa.me/573013969974?text=Hola,%20necesito%20ayuda%20con%20Driny" target="_blank" style={{ display: 'block', backgroundColor: 'white', color: '#22c55e', padding: '11px', borderRadius: '10px', textDecoration: 'none', fontWeight: '800', fontSize: '14px', fontFamily: 'Arial Black, sans-serif' }}>
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ backgroundColor: '#111', color: '#888', padding: '20px', textAlign: 'center', marginTop: '16px' }}>
        <p style={{ fontSize: '12px', margin: 0 }}>© 2026 Driny — Todos los derechos reservados | Colombia</p>
      </footer>
    </main>
  );
}