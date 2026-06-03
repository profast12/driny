"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [tipo, setTipo] = useState<'comprador' | 'vendedor'>('comprador');
  const [nombreTienda, setNombreTienda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [aceptoPrivacidad, setAceptoPrivacidad] = useState(false);
  const [aceptoMayores, setAceptoMayores] = useState(false);
  const [modalActivo, setModalActivo] = useState<'terminos' | 'privacidad' | 'edad' | null>(null);

  const fortaleza = () => {
    if (password.length === 0) return { nivel: 0, label: '', color: '' };
    if (password.length < 6) return { nivel: 1, label: 'Muy debil', color: '#ef4444' };
    if (password.length < 8) return { nivel: 2, label: 'Debil', color: '#f59e0b' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { nivel: 3, label: 'Media', color: '#f90' };
    if (!/[^A-Za-z0-9]/.test(password)) return { nivel: 4, label: 'Fuerte', color: '#22c55e' };
    return { nivel: 5, label: 'Muy fuerte', color: '#16a34a' };
  };

  const requisitos = [
    { ok: password.length >= 8, label: 'Minimo 8 caracteres' },
    { ok: /[A-Z]/.test(password), label: 'Al menos una letra mayuscula' },
    { ok: /[0-9]/.test(password), label: 'Al menos un numero' },
    { ok: /[^A-Za-z0-9]/.test(password), label: 'Al menos un caracter especial (!@#$...)' },
  ];

  const pass = fortaleza();
  const todosRequisitos = requisitos.every(r => r.ok);

  const registrar = async () => {
    if (!nombre.trim()) { setError('Ingresa tu nombre completo'); return; }
    if (!email.trim()) { setError('Ingresa tu correo electronico'); return; }
    if (!todosRequisitos) { setError('La contrasena no cumple todos los requisitos'); return; }
    if (password !== confirmar) { setError('Las contrasenas no coinciden'); return; }
    if (tipo === 'vendedor' && !nombreTienda.trim()) { setError('Ingresa el nombre de tu tienda'); return; }
    if (!aceptoTerminos || !aceptoPrivacidad || !aceptoMayores) { setError('Debes aceptar todos los terminos y condiciones'); return; }

    setCargando(true); setError('');

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'https://driny.vercel.app/verificar' }
    });

    if (authError) {
      setError(authError.message.includes('already') ? 'Este correo ya esta registrado' : 'Error al crear la cuenta. Intenta de nuevo.');
      setCargando(false); return;
    }

    if (data.user) {
  const { error: insertError } = await supabase.from('usuarios').insert([{
    id: crypto.randomUUID(),
    auth_id: data.user.id,
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    tipo: tipo,
    nombre_tienda: tipo === 'vendedor' ? nombreTienda.trim() : null,
    username: null,
    avatar_url: null,
  }]);

  if (insertError) {
    console.error('Error insertando usuario:', insertError);
  }
}

    window.location.href = '/verificar?email=' + encodeURIComponent(email);
  };

  const contenidoModal: any = {
    terminos: {
      titulo: 'Terminos y Condiciones de Uso',
      contenido: `TERMINOS Y CONDICIONES DE USO DE DRINY

Ultima actualizacion: Junio 2025

1. ACEPTACION DE LOS TERMINOS
Al crear una cuenta en Driny, usted acepta quedar vinculado por estos Terminos y Condiciones. Si no esta de acuerdo con alguna parte de estos terminos, no podra acceder al servicio.

2. DESCRIPCION DEL SERVICIO
Driny es una plataforma de comercio electronico que permite a usuarios comprar, vender y subastar productos en Colombia. Actuamos como intermediarios entre compradores y vendedores, sin ser propietarios de los productos listados.

3. CUENTAS DE USUARIO
- Debes tener al menos 13 anos para usar Driny.
- Eres responsable de mantener la confidencialidad de tu contrasena.
- Debes proporcionar informacion veridica y actualizada.
- Una persona fisica o juridica solo puede tener una cuenta activa.
- Nos reservamos el derecho de suspender cuentas que violen estos terminos.

4. OBLIGACIONES DEL VENDEDOR
- Publicar unicamente productos de los que seas propietario o tengas derecho a vender.
- Proporcionar descripciones precisas y fotografias reales de los productos.
- Cumplir con los pedidos en los tiempos acordados.
- Pagar la comision del 5% sobre cada venta realizada.
- No publicar productos prohibidos por la ley colombiana.

5. OBLIGACIONES DEL COMPRADOR
- Realizar el pago completo antes de solicitar el envio.
- Proporcionar una direccion de entrega correcta y completa.
- Comunicarse de forma respetuosa con los vendedores.

6. PRODUCTOS PROHIBIDOS
Queda estrictamente prohibido publicar: armas, sustancias ilegales, productos falsificados, material para adultos, animales vivos, medicamentos sin autorizacion, o cualquier producto cuya venta sea ilegal en Colombia.

7. PAGOS Y COMISIONES
Driny cobra una comision del 5% sobre el valor de cada transaccion exitosa. Los pagos se procesan a traves de PayPal. Driny no almacena informacion financiera de los usuarios.

8. RESOLUCIÓN DE DISPUTAS
En caso de disputa entre comprador y vendedor, Driny actuara como mediador sin garantizar resultados especificos. Las partes pueden acudir a la Superintendencia de Industria y Comercio de Colombia.

9. LIMITACION DE RESPONSABILIDAD
Driny no sera responsable por danos indirectos, incidentales o consecuentes derivados del uso de la plataforma. Nuestra responsabilidad maxima no excedera el valor de la transaccion en disputa.

10. MODIFICACIONES
Nos reservamos el derecho de modificar estos terminos en cualquier momento. Los cambios entran en vigor al publicarse. El uso continuado de la plataforma implica la aceptacion de los nuevos terminos.

11. LEY APLICABLE
Estos terminos se rigen por las leyes de la Republica de Colombia, especialmente la Ley 1480 de 2011 (Estatuto del Consumidor) y la Ley 527 de 1999 (Comercio Electronico).`
    },
    privacidad: {
      titulo: 'Politica de Privacidad',
      contenido: `POLITICA DE PRIVACIDAD DE DRINY

Ultima actualizacion: Junio 2025

1. INFORMACION QUE RECOPILAMOS
Recopilamos la siguiente informacion cuando usas Driny:
- Informacion de registro: nombre, correo electronico, tipo de cuenta.
- Informacion de perfil: foto de perfil, nombre de tienda, username.
- Informacion de transacciones: historial de compras, ventas y subastas.
- Informacion tecnica: direccion IP, tipo de navegador, dispositivo usado.
- Comunicaciones: mensajes entre usuarios dentro de la plataforma.

2. USO DE LA INFORMACION
Utilizamos tu informacion para:
- Procesar transacciones y enviar confirmaciones.
- Verificar tu identidad y prevenir fraudes.
- Mejorar nuestros servicios y experiencia de usuario.
- Enviarte notificaciones sobre tu cuenta y pedidos.
- Cumplir con obligaciones legales.
- Resolver disputas y hacer cumplir nuestros terminos.

3. COMPARTIR INFORMACION
Compartimos tu informacion solo en los siguientes casos:
- Con el vendedor o comprador involucrado en una transaccion (nombre, correo, telefono de entrega).
- Con proveedores de servicios de pago (PayPal) para procesar transacciones.
- Con autoridades competentes cuando la ley lo exija.
- Nunca vendemos tu informacion personal a terceros.

4. SEGURIDAD DE LA INFORMACION
Implementamos medidas de seguridad tecnicas y organizativas para proteger tu informacion, incluyendo cifrado SSL, autenticacion segura y acceso restringido a datos sensibles. Sin embargo, ningun sistema es 100% seguro.

5. COOKIES
Usamos cookies para mantener tu sesion activa y mejorar tu experiencia. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.

6. TUS DERECHOS
De acuerdo con la Ley 1581 de 2012 (Habeas Data), tienes derecho a:
- Conocer, actualizar y rectificar tu informacion personal.
- Solicitar la eliminacion de tu cuenta y datos.
- Revocar el consentimiento para el tratamiento de datos.
Para ejercer estos derechos, contacta a: privacidad@driny.co

7. RETENCION DE DATOS
Conservamos tu informacion mientras tu cuenta este activa. Tras eliminar tu cuenta, conservamos datos minimos por 5 anos para cumplir obligaciones legales y fiscales.

8. MENORES DE EDAD
Driny no recopila intencionalmente datos de menores de 13 anos. Si eres padre o tutor y crees que tu hijo ha proporcionado datos, contactanos inmediatamente.

9. CAMBIOS A ESTA POLITICA
Notificaremos cambios significativos a esta politica por correo electronico o mediante avisos en la plataforma con al menos 30 dias de anticipacion.

10. CONTACTO
Para preguntas sobre privacidad: privacidad@driny.co
Responsable del tratamiento: Driny SAS, Colombia.`
    },
    edad: {
      titulo: 'Declaracion de Edad y Responsabilidad',
      contenido: `DECLARACION DE EDAD Y RESPONSABILIDAD

Al marcar esta casilla, usted declara y acepta lo siguiente:

1. DECLARACION DE EDAD
Declaro que soy mayor de 13 anos de edad. Si tengo entre 13 y 17 anos, declaro contar con autorizacion de mi padre, madre o tutor legal para usar esta plataforma.

2. RESPONSABILIDAD DE LAS TRANSACCIONES
Me comprometo a:
- Actuar de buena fe en todas mis transacciones.
- No realizar compras fraudulentas ni pagos revertidos injustificados.
- Coordinar el pago y entrega de manera oportuna.
- Reportar cualquier actividad sospechosa a Driny.

3. CONDUCTA EN LA PLATAFORMA
Me comprometo a mantener un trato respetuoso con otros usuarios, vendedores y el equipo de Driny. No utilizare la plataforma para actividades ilegales, fraudulentas o que perjudiquen a terceros.

4. VERACIDAD DE LA INFORMACION
Declaro que toda la informacion proporcionada durante el registro y uso de la plataforma es veridica. Entiendo que proporcionar informacion falsa puede resultar en la suspension inmediata de mi cuenta.

5. ACEPTACION DE RIESGOS
Entiendo que Driny es una plataforma intermediaria y que las transacciones se realizan entre particulares. Acepto los riesgos inherentes al comercio electronico y me comprometo a tomar precauciones razonables.

6. Colombia - LEY APLICABLE
Esta declaracion se realiza bajo las leyes de la Republica de Colombia. Cualquier disputa sera resuelta ante los tribunales competentes de Colombia.`
    }
  };

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .input-field:focus { border-color: #f90 !important; box-shadow: 0 0 0 3px rgba(255,153,0,0.1) !important; }
        .tipo-btn:hover { border-color: #f90 !important; }
        .check-item:hover { background-color: #fff5e6 !important; }
      `}</style>

      {/* MODAL */}
      {modalActivo && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setModalActivo(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'modalIn 0.25s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>{contenidoModal[modalActivo].titulo}</h3>
              <button onClick={() => setModalActivo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '20px', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              <pre style={{ fontSize: '12px', color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'Arial, sans-serif', margin: 0 }}>
                {contenidoModal[modalActivo].contenido}
              </pre>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
              <button onClick={() => setModalActivo(null)} style={{ width: '100%', padding: '12px', backgroundColor: '#f90', color: '#111', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', fontFamily: 'Arial Black, sans-serif' }}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#111', letterSpacing: '-1px', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
            <div style={{ width: '6px', height: '6px', backgroundColor: '#f90', borderRadius: '50%', marginBottom: '3px', marginLeft: '1px' }}></div>
          </div>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #f90, #ff6b00)', borderRadius: '2px', marginTop: '1px' }}></div>
        </a>
        <a href="/login" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
          Ya tienes cuenta? <span style={{ color: '#f90' }}>Inicia sesion</span>
        </a>
      </div>

      <div style={{ maxWidth: '520px', margin: '32px auto', padding: '0 20px 40px', animation: 'fadeIn 0.4s ease' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#111', marginBottom: '8px', fontFamily: 'Arial Black, sans-serif' }}>Crea tu cuenta</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Empieza a comprar, vender y subastar en Driny</p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>

          {/* TIPO DE CUENTA */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Tipo de cuenta</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { valor: 'comprador', titulo: 'Comprador', desc: 'Compra productos y participa en subastas', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
                { valor: 'vendedor', titulo: 'Vendedor', desc: 'Vende productos y crea subastas', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
              ].map(t => (
                <button key={t.valor} className="tipo-btn" onClick={() => setTipo(t.valor as any)} style={{ padding: '14px', borderRadius: '12px', border: tipo === t.valor ? '2px solid #f90' : '2px solid #eee', backgroundColor: tipo === t.valor ? '#fff8f0' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                  <div style={{ color: tipo === t.valor ? '#f90' : '#888', marginBottom: '6px' }}>{t.icon}</div>
                  <p style={{ fontSize: '13px', fontWeight: '800', color: tipo === t.valor ? '#111' : '#555', marginBottom: '2px', fontFamily: 'Arial Black, sans-serif' }}>{t.titulo}</p>
                  <p style={{ fontSize: '11px', color: '#888', lineHeight: 1.4 }}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* CAMPOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>

            {[
              { label: 'Nombre completo', value: nombre, setter: setNombre, type: 'text', placeholder: 'Tu nombre completo' },
              { label: 'Correo electronico', value: email, setter: setEmail, type: 'email', placeholder: 'tucorreo@email.com' },
            ].map((campo, i) => (
              <div key={i}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>{campo.label}</label>
                <input
                  type={campo.type}
                  placeholder={campo.placeholder}
                  value={campo.value}
                  onChange={e => campo.setter(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }}
                />
              </div>
            ))}

            {tipo === 'vendedor' && (
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Nombre de tu tienda</label>
                <input type="text" placeholder="Ej: Tecnologia Lopez" value={nombreTienda} onChange={e => setNombreTienda(e.target.value)} className="input-field" style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }} />
              </div>
            )}

            {/* CONTRASEÑA */}
            <div>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Contrasena</label>
              <div style={{ position: 'relative' }}>
                <input type={mostrarPass ? 'text' : 'password'} placeholder="Crea una contrasena segura" value={password} onChange={e => setPassword(e.target.value)} className="input-field" style={{ width: '100%', padding: '12px 44px 12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }} />
                <button onClick={() => setMostrarPass(!mostrarPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px', display: 'flex', alignItems: 'center' }}>
                  {mostrarPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>

              {/* BARRA FORTALEZA */}
              {password.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: n <= pass.nivel ? pass.color : '#e5e5e5', transition: 'background-color 0.3s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '12px', color: pass.color, fontWeight: '700', margin: 0 }}>{pass.label}</p>
                </div>
              )}

              {/* REQUISITOS */}
              {password.length > 0 && (
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                  <p style={{ fontSize: '11px', color: '#888', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requisitos de seguridad</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {requisitos.map((req, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: req.ok ? '#22c55e' : '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                          {req.ok && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <p style={{ fontSize: '12px', color: req.ok ? '#22c55e' : '#888', margin: 0, fontWeight: req.ok ? '700' : 'normal', transition: 'all 0.2s' }}>{req.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRMAR CONTRASEÑA */}
            <div>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Confirmar contrasena</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarConfirm ? 'text' : 'password'}
                  placeholder="Repite tu contrasena"
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '12px 44px 12px 14px', border: confirmar.length > 0 ? (password === confirmar ? '2px solid #22c55e' : '2px solid #ef4444') : '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }}
                />
                <button onClick={() => setMostrarConfirm(!mostrarConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px', display: 'flex', alignItems: 'center' }}>
                  {mostrarConfirm ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {confirmar.length > 0 && (
                <p style={{ fontSize: '12px', marginTop: '6px', color: password === confirmar ? '#22c55e' : '#ef4444', fontWeight: '700' }}>
                  {password === confirmar ? '✓ Las contrasenas coinciden' : '✕ Las contrasenas no coinciden'}
                </p>
              )}
            </div>
          </div>

          {/* CHECKS LEGALES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: '11px', color: '#888', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Debes aceptar para continuar</p>

            {[
              {
                estado: aceptoTerminos,
                setter: setAceptoTerminos,
                texto: 'He leido y acepto los',
                link: 'Terminos y Condiciones de Uso',
                modal: 'terminos' as const
              },
              {
                estado: aceptoPrivacidad,
                setter: setAceptoPrivacidad,
                texto: 'He leido y acepto la',
                link: 'Politica de Privacidad',
                modal: 'privacidad' as const
              },
              {
                estado: aceptoMayores,
                setter: setAceptoMayores,
                texto: 'Acepto la',
                link: 'Declaracion de Edad y Responsabilidad',
                modal: 'edad' as const
              },
            ].map((item, i) => (
              <div key={i} className="check-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', border: '1px solid transparent' }} onClick={() => item.setter(!item.estado)}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: item.estado ? '2px solid #f90' : '2px solid #ddd', backgroundColor: item.estado ? '#f90' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', cursor: 'pointer' }}>
                  {item.estado && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.4 }}>
                  {item.texto}{' '}
                  <button
                    onClick={e => { e.stopPropagation(); setModalActivo(item.modal); }}
                    style={{ background: 'none', border: 'none', color: '#f90', fontWeight: '700', cursor: 'pointer', fontSize: '13px', padding: 0, textDecoration: 'underline' }}
                  >
                    {item.link}
                  </button>
                </p>
              </div>
            ))}
          </div>

          {/* ERROR */}
          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* BOTON REGISTRAR */}
          <button
            onClick={registrar}
            disabled={cargando}
            style={{
              width: '100%',
              padding: '14px',
              background: cargando ? '#f0f0f0' : 'linear-gradient(135deg, #f90, #ff6b00)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '15px',
              color: cargando ? '#bbb' : '#111',
              cursor: cargando ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Arial Black, sans-serif',
              marginBottom: '16px'
            }}
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', margin: 0 }}>
            Ya tienes cuenta?{' '}
            <a href="/login" style={{ color: '#f90', fontWeight: '700', textDecoration: 'none' }}>Inicia sesion</a>
          </p>
        </div>

        {/* BENEFICIOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '24px' }}>
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, titulo: 'Pago seguro', desc: 'Transacciones protegidas' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, titulo: 'Envio Colombia', desc: 'A todo el pais' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f90" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>, titulo: 'Sin costo', desc: 'Registro gratuito' },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '14px', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>{item.icon}</div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '3px' }}>{item.titulo}</p>
              <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}