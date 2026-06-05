"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);

  const iniciarSesion = async () => {
    if (!email || !password) { setError("Por favor completa todos los campos"); return; }
    setCargando(true); setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError("Correo o contrasena incorrectos"); setCargando(false); return; }
    window.location.href = "/";
  };

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .input-login:focus { border-color: #f90 !important; box-shadow: 0 0 0 3px rgba(255,153,0,0.1) !important; }
        .btn-login:hover { background: linear-gradient(135deg, #ff8c00, #f90) !important; transform: scale(1.01); }
        .link-hover:hover { color: #e68a00 !important; }
      `}</style>

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/">
          <Image src="/logo.png" alt="Driny" width={65} height={65} style={{ width: 'auto', height: '55px' }} />
        </a>
        <a href="/registro" style={{ fontSize: '13px', color: '#666', textDecoration: 'none', fontWeight: '600' }}>
          No tienes cuenta?{' '}
          <span style={{ color: '#f90', fontWeight: '700' }}>Registrate gratis</span>
        </a>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.4s ease' }}>

          {/* CARD */}
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>

            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #f90, #ff6b00)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111', marginBottom: '6px', fontFamily: 'Arial Black, sans-serif' }}>Bienvenido de nuevo</h1>
              <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Inicia sesion en tu cuenta de Driny</p>
            </div>

            {/* ERROR */}
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideDown 0.3s ease' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* CAMPOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>

              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                  Correo electronico
                </label>
                <input
                  type="email"
                  placeholder="tucorreo@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && iniciarSesion()}
                  className="input-login"
                  style={{ width: '100%', padding: '13px 16px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Contrasena
                  </label>
                  <a href="/recuperar-contrasena" className="link-hover" style={{ fontSize: '12px', color: '#f90', textDecoration: 'none', fontWeight: '700', transition: 'color 0.2s' }}>
                    Olvidaste tu contrasena?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarPass ? 'text' : 'password'}
                    placeholder="Tu contrasena"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && iniciarSesion()}
                    className="input-login"
                    style={{ width: '100%', padding: '13px 44px 13px 16px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }}
                  />
                  <button onClick={() => setMostrarPass(!mostrarPass)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '4px', display: 'flex', alignItems: 'center' }}>
                    {mostrarPass ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* BOTON */}
            <button
              onClick={iniciarSesion}
              disabled={cargando}
              className="btn-login"
              style={{ width: '100%', padding: '14px', background: cargando ? '#f0f0f0' : 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '15px', color: cargando ? '#bbb' : '#111', cursor: cargando ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'Arial Black, sans-serif', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {cargando ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid #bbb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                  Iniciando sesion...
                </>
              ) : 'Iniciar sesion'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', margin: 0 }}>
              No tienes cuenta?{' '}
              <a href="/registro" className="link-hover" style={{ color: '#f90', fontWeight: '700', textDecoration: 'none', transition: 'color 0.2s' }}>
                Registrate gratis
              </a>
            </p>
          </div>

          {/* BENEFICIOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px' }}>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, titulo: 'Seguro', desc: 'Pagos protegidos' },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, titulo: 'Envios', desc: 'A todo Colombia' },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f90" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, titulo: 'Rapido', desc: 'Compra en minutos' },
            ].map((item, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '14px', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '7px' }}>{item.icon}</div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '2px' }}>{item.titulo}</p>
                <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}