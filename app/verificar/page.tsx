"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

export default function Verificar() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState(['', '', '', '', '', '', '', '']);
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState('');
  const [reenviando, setReenviando] = useState(false);
  const [mensajeReenvio, setMensajeReenvio] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email') || '';
    setEmail(emailParam);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const nuevoCodigo = [...codigo];
    nuevoCodigo[index] = value.slice(-1);
    setCodigo(nuevoCodigo);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') verificar();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    const nuevoCodigo = [...codigo];
    texto.split('').forEach((char, i) => { if (i < 6) nuevoCodigo[i] = char; });
    setCodigo(nuevoCodigo);
    const ultimoIndex = Math.min(texto.length, 5);
    inputRefs.current[ultimoIndex]?.focus();
  };

  const verificar = async () => {
    const token = codigo.join('');
    if (token.length !== 8) { setError('Ingresa el codigo completo de 8 digitos'); return; }
    if (!email) { setError('No se encontro el correo. Vuelve a registrarte.'); return; }
    setVerificando(true); setError('');

    const { data, error: err } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });

    if (err) {
      setError('Codigo incorrecto o expirado. Verifica e intenta de nuevo.');
      setVerificando(false);
      setCodigo(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    window.location.href = '/';
  };

  const reenviarCodigo = async () => {
    if (countdown > 0) return;
    setReenviando(true); setMensajeReenvio(''); setError('');
    const { error: err } = await supabase.auth.resend({ type: 'signup', email });
    if (err) { setError('Error al reenviar el codigo. Intenta mas tarde.'); setReenviando(false); return; }
    setMensajeReenvio('Codigo reenviado exitosamente');
    setCountdown(60);
    setReenviando(false);
    setTimeout(() => setMensajeReenvio(''), 4000);
  };

  const codigoCompleto = codigo.every(c => c !== '');

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .otp-input:focus { border-color: #f90 !important; box-shadow: 0 0 0 3px rgba(255,153,0,0.15) !important; }
        .otp-input { transition: all 0.15s; }
        .shake { animation: shake 0.4s ease; }
      `}</style>

      <nav style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#111', letterSpacing: '-1px', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
            <div style={{ width: '6px', height: '6px', backgroundColor: '#f90', borderRadius: '50%', marginBottom: '3px', marginLeft: '1px' }}></div>
          </div>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #f90, #ff6b00)', borderRadius: '2px', marginTop: '1px' }}></div>
        </a>
        <a href="/login" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Volver al inicio</a>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeIn 0.4s ease' }}>

          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '44px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>

            {/* ICONO */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #f90, #ff6b00)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111', marginBottom: '8px', fontFamily: 'Arial Black, sans-serif' }}>
                Verifica tu correo
              </h1>
              <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6 }}>
                Enviamos un codigo de 8 digitos a
              </p>
              <p style={{ color: '#f90', fontWeight: '700', fontSize: '14px', marginTop: '4px' }}>
                {email || 'tu correo electronico'}
              </p>
            </div>

            {/* ALERTAS */}
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
              </div>
            )}

            {mensajeReenvio && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <p style={{ fontSize: '13px', color: '#22c55e', margin: 0 }}>{mensajeReenvio}</p>
              </div>
            )}

            {/* INPUTS OTP */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
  Codigo de verificacion
</p>
<div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }} onPaste={handlePaste}>
  {codigo.map((digit, i) => (
    <input
      key={i}
      ref={el => { inputRefs.current[i] = el; }}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={e => handleInput(i, e.target.value)}
      onKeyDown={e => handleKeyDown(i, e)}
      className="otp-input"
      style={{
        width: '42px',
        height: '54px',
                      textAlign: 'center',
                      fontSize: '24px',
                      fontWeight: '800',
                      color: '#111',
                      border: digit ? '2px solid #f90' : '2px solid #e5e5e5',
                      borderRadius: '12px',
                      outline: 'none',
                      backgroundColor: digit ? '#fff8f0' : 'white',
                      fontFamily: 'Arial Black, sans-serif',
                      cursor: 'text'
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', marginTop: '12px' }}>
  Codigo de 8 digitos — puedes pegarlo directamente
</p>
            </div>

            {/* BOTON VERIFICAR */}
            <button
              onClick={verificar}
              disabled={verificando || !codigoCompleto}
              style={{
                width: '100%',
                padding: '14px',
                background: codigoCompleto && !verificando ? 'linear-gradient(135deg, #f90, #ff6b00)' : '#f0f0f0',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '15px',
                color: codigoCompleto && !verificando ? '#111' : '#bbb',
                cursor: codigoCompleto && !verificando ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                marginBottom: '20px',
                fontFamily: 'Arial Black, sans-serif',
                letterSpacing: '0.3px'
              }}
            >
              {verificando ? 'Verificando...' : 'Verificar cuenta'}
            </button>

            {/* SEPARADOR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#f0f0f0' }}></div>
              <span style={{ fontSize: '12px', color: '#bbb' }}>o</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#f0f0f0' }}></div>
            </div>

            {/* REENVIAR */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                No recibiste el codigo?
              </p>
              <button
                onClick={reenviarCodigo}
                disabled={reenviando || countdown > 0}
                style={{
                  backgroundColor: 'transparent',
                  border: '1.5px solid',
                  borderColor: countdown > 0 ? '#e5e5e5' : '#f90',
                  color: countdown > 0 ? '#bbb' : '#f90',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                  width: '100%'
                }}
              >
                {reenviando ? 'Enviando...' : countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar codigo'}
              </button>
            </div>

            {/* INFO */}
            <div style={{ marginTop: '24px', backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Revisa tu bandeja de entrada',
                  'Si no llega en 5 minutos revisa spam',
                  'El codigo expira en 1 hora',
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#f90', flexShrink: 0 }}></div>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{tip}</p>
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