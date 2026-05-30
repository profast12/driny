"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function NuevaContrasena() {
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');
  const [sesionLista, setSesionLista] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSesionLista(true);
      }
    });
  }, []);

  const fortaleza = () => {
    if (contrasena.length === 0) return { nivel: 0, label: '', color: '' };
    if (contrasena.length < 6) return { nivel: 1, label: 'Muy debil', color: '#ef4444' };
    if (contrasena.length < 8) return { nivel: 2, label: 'Debil', color: '#f59e0b' };
    if (!/[A-Z]/.test(contrasena) || !/[0-9]/.test(contrasena)) return { nivel: 3, label: 'Media', color: '#f90' };
    return { nivel: 4, label: 'Fuerte', color: '#22c55e' };
  };

  const pass = fortaleza();

  const guardarContrasena = async () => {
    if (contrasena.length < 8) { setError('La contrasena debe tener minimo 8 caracteres'); return; }
    if (contrasena !== confirmar) { setError('Las contrasenas no coinciden'); return; }
    setGuardando(true); setError('');
    const { error: err } = await supabase.auth.updateUser({ password: contrasena });
    if (err) { setError('Error al actualizar la contrasena. El enlace puede haber expirado.'); setGuardando(false); return; }
    setGuardado(true);
    setGuardando(false);
    setTimeout(() => { window.location.href = '/'; }, 3000);
  };

  return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes redirect { from { width: 0%; } to { width: 100%; } }
      `}</style>

      <nav style={{ backgroundColor: '#111', borderBottom: '1px solid #1f1f1f', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#f90', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.4s ease' }}>

          {guardado ? (
            <div style={{ backgroundColor: '#111', borderRadius: '20px', padding: '40px', border: '1px solid #22c55e44', textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', backgroundColor: '#22c55e22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'checkIn 0.5s ease', border: '2px solid #22c55e44' }}>
                <span style={{ fontSize: '32px', color: '#22c55e' }}>✓</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Contrasena actualizada</h2>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                Tu contrasena fue cambiada exitosamente. Seras redirigido en unos segundos.
              </p>
              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', height: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', backgroundColor: '#22c55e', animation: 'redirect 3s linear forwards' }}></div>
              </div>
              <a href="/" style={{ display: 'block', marginTop: '16px', color: '#f90', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
                Ir ahora
              </a>
            </div>
          ) : !sesionLista ? (
            <div style={{ backgroundColor: '#111', borderRadius: '20px', padding: '40px', border: '1px solid #1f1f1f', textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #f90, #ff6b00)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span style={{ fontSize: '24px' }}>⏳</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Verificando enlace...</h2>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                Si llegaste aqui desde el correo de recuperacion espera un momento. Si el problema persiste el enlace puede haber expirado.
              </p>
              <a href="/recuperar-contrasena" style={{ display: 'inline-block', backgroundColor: '#f90', color: '#111', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                Solicitar nuevo enlace
              </a>
            </div>
          ) : (
            <div style={{ backgroundColor: '#111', borderRadius: '20px', padding: '40px', border: '1px solid #1f1f1f' }}>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #f90, #ff6b00)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '24px' }}>🔑</span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Nueva contrasena</h1>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6 }}>
                  Crea una contrasena segura para tu cuenta de Driny.
                </p>
              </div>

              {error && (
                <div style={{ backgroundColor: '#ef444422', border: '1px solid #ef444444', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#ef4444' }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Nueva contrasena
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarPass ? 'text' : 'password'}
                    placeholder="Minimo 8 caracteres"
                    value={contrasena}
                    onChange={e => setContrasena(e.target.value)}
                    style={{ width: '100%', padding: '14px 48px 14px 16px', borderRadius: '10px', border: '1px solid #2a2a2a', backgroundColor: '#1a1a1a', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' as const, transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.border = '1px solid #f90'}
                    onBlur={e => e.target.style.border = '1px solid #2a2a2a'}
                  />
                  <button onClick={() => setMostrarPass(!mostrarPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>
                    {mostrarPass ? '🙈' : '👁'}
                  </button>
                </div>

                {contrasena.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: n <= pass.nivel ? pass.color : '#2a2a2a', transition: 'background-color 0.3s' }} />
                      ))}
                    </div>
                    <p style={{ fontSize: '12px', color: pass.color, fontWeight: '600' }}>{pass.label}</p>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {[
                        { ok: contrasena.length >= 8, label: 'Minimo 8 caracteres' },
                        { ok: /[A-Z]/.test(contrasena), label: 'Al menos una mayuscula' },
                        { ok: /[0-9]/.test(contrasena), label: 'Al menos un numero' },
                      ].map((req, i) => (
                        <p key={i} style={{ fontSize: '12px', color: req.ok ? '#22c55e' : '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{req.ok ? '✓' : '○'}</span> {req.label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Confirmar contrasena
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarConfirm ? 'text' : 'password'}
                    placeholder="Repite tu contrasena"
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && guardarContrasena()}
                    style={{ width: '100%', padding: '14px 48px 14px 16px', borderRadius: '10px', border: confirmar.length > 0 ? (contrasena === confirmar ? '1px solid #22c55e' : '1px solid #ef4444') : '1px solid #2a2a2a', backgroundColor: '#1a1a1a', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' as const, transition: 'border 0.2s' }}
                    onFocus={e => { if (confirmar.length === 0) e.target.style.border = '1px solid #f90'; }}
                    onBlur={e => { if (confirmar.length === 0) e.target.style.border = '1px solid #2a2a2a'; }}
                  />
                  <button onClick={() => setMostrarConfirm(!mostrarConfirm)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>
                    {mostrarConfirm ? '🙈' : '👁'}
                  </button>
                </div>
                {confirmar.length > 0 && (
                  <p style={{ fontSize: '12px', marginTop: '6px', color: contrasena === confirmar ? '#22c55e' : '#ef4444' }}>
                    {contrasena === confirmar ? '✓ Las contrasenas coinciden' : '✕ Las contrasenas no coinciden'}
                  </p>
                )}
              </div>

              <button
                onClick={guardarContrasena}
                disabled={guardando || contrasena !== confirmar || contrasena.length < 8}
                style={{ width: '100%', padding: '14px', background: guardando || contrasena !== confirmar || contrasena.length < 8 ? '#2a2a2a' : 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', color: guardando || contrasena !== confirmar || contrasena.length < 8 ? '#666' : '#111', cursor: guardando || contrasena !== confirmar || contrasena.length < 8 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              >
                {guardando ? 'Guardando...' : 'Guardar nueva contrasena'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}