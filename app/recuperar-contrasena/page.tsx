"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const enviarCorreo = async () => {
    if (!email.trim()) { setError('Ingresa tu correo electronico'); return; }
    setEnviando(true); setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://driny.vercel.app/nueva-contrasena'
    });
    if (err) { setError('Error al enviar el correo. Verifica que el email sea correcto.'); setEnviando(false); return; }
    setEnviado(true);
    setEnviando(false);
  };

  return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>

      <nav style={{ backgroundColor: '#111', borderBottom: '1px solid #1f1f1f', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#f90', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <a href="/login" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Volver al inicio de sesion</a>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.4s ease' }}>

          {!enviado ? (
            <div style={{ backgroundColor: '#111', borderRadius: '20px', padding: '40px', border: '1px solid #1f1f1f' }}>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ width: '52px', height: '52px', backgroundColor: '#f9022', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', background: 'linear-gradient(135deg, #f90, #ff6b00)' }}>
                  <span style={{ fontSize: '24px' }}>🔐</span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Recupera tu cuenta</h1>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6 }}>
                  Ingresa el correo con el que te registraste en Driny y te enviaremos un enlace para restablecer tu contrasena.
                </p>
              </div>

              {error && (
                <div style={{ backgroundColor: '#ef444422', border: '1px solid #ef444444', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#ef4444' }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Correo electronico
                </label>
                <input
                  type="email"
                  placeholder="tucorreo@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && enviarCorreo()}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #2a2a2a', backgroundColor: '#1a1a1a', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' as const, transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.border = '1px solid #f90'}
                  onBlur={e => e.target.style.border = '1px solid #2a2a2a'}
                />
              </div>

              <button
                onClick={enviarCorreo}
                disabled={enviando}
                style={{ width: '100%', padding: '14px', background: enviando ? '#2a2a2a' : 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', color: enviando ? '#666' : '#111', cursor: enviando ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginBottom: '20px' }}
              >
                {enviando ? 'Enviando...' : 'Enviar enlace de recuperacion'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <a href="/login" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>
                  Recordaste tu contrasena? <span style={{ color: '#f90' }}>Inicia sesion</span>
                </a>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#111', borderRadius: '20px', padding: '40px', border: '1px solid #22c55e44', textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', backgroundColor: '#22c55e22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'checkIn 0.5s ease', border: '2px solid #22c55e44' }}>
                <span style={{ fontSize: '32px', color: '#22c55e' }}>✓</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Correo enviado</h2>
              <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.7, marginBottom: '8px' }}>
                Enviamos un enlace de recuperacion a:
              </p>
              <p style={{ color: '#f90', fontWeight: 'bold', fontSize: '15px', marginBottom: '24px' }}>{email}</p>
              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
                <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.8 }}>
                  <span style={{ color: '#f90', fontWeight: 'bold' }}>1.</span> Revisa tu bandeja de entrada<br />
                  <span style={{ color: '#f90', fontWeight: 'bold' }}>2.</span> Si no llega en 5 minutos revisa spam<br />
                  <span style={{ color: '#f90', fontWeight: 'bold' }}>3.</span> Haz clic en el enlace del correo<br />
                  <span style={{ color: '#f90', fontWeight: 'bold' }}>4.</span> Crea tu nueva contrasena
                </p>
              </div>
              <button
                onClick={() => { setEnviado(false); setEmail(''); }}
                style={{ backgroundColor: 'transparent', border: '1px solid #2a2a2a', color: '#888', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', marginBottom: '16px' }}
              >
                Enviar a otro correo
              </button>
              <br />
              <a href="/login" style={{ color: '#f90', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
                Volver al inicio de sesion
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}