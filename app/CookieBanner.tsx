"use client";
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [detalle, setDetalle] = useState(false);

  useEffect(() => {
    const aceptado = localStorage.getItem('driny_cookies');
    if (!aceptado) setTimeout(() => setVisible(true), 1500);
  }, []);

  const aceptarTodas = () => {
    localStorage.setItem('driny_cookies', 'todas');
    setVisible(false);
  };

  const aceptarEsenciales = () => {
    localStorage.setItem('driny_cookies', 'esenciales');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes cookieUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        .cookie-btn-primary:hover { background: linear-gradient(135deg, #ff8c00, #f90) !important; transform: scale(1.02); }
        .cookie-btn-secondary:hover { border-color: #f90 !important; color: #f90 !important; }
        .cookie-link:hover { color: #e68a00 !important; }
        @media (max-width: 600px) {
          .cookie-inner { flex-direction: column !important; gap: 16px !important; }
          .cookie-btns { flex-direction: column !important; width: 100% !important; }
          .cookie-btns button { width: 100% !important; }
        }
      `}</style>

      {/* OVERLAY OSCURO */}
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 9998, backdropFilter: 'blur(2px)' }} />

      {/* BANNER */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, padding: '16px', animation: 'cookieUp 0.4s ease' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 -4px 40px rgba(0,0,0,0.15)', border: '1px solid #eee', overflow: 'hidden' }}>

          {/* HEADER */}
          <div style={{ background: 'linear-gradient(135deg, #f90, #ff6b00)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p style={{ fontSize: '14px', fontWeight: '800', color: 'white', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>
              Driny usa cookies
            </p>
          </div>

          <div style={{ padding: '20px 24px' }}>
            <div className="cookie-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>

              {/* TEXTO */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7, marginBottom: '10px' }}>
                  Usamos cookies para mejorar tu experiencia, mantener tu sesion activa y analizar el uso de la plataforma. Puedes aceptar todas las cookies o solo las esenciales para el funcionamiento basico.
                </p>

                {detalle && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', animation: 'cookieUp 0.3s ease' }}>
                    {[
                      { tipo: 'Esenciales', desc: 'Sesion, seguridad y carrito. Siempre activas.', color: '#22c55e', activa: true },
                      { tipo: 'Preferencias', desc: 'Idioma y configuraciones personales.', color: '#3b82f6', activa: true },
                      { tipo: 'Analiticas', desc: 'Estadisticas anonimas de uso de la plataforma.', color: '#f90', activa: false },
                      { tipo: 'Terceros', desc: 'PayPal, Supabase y Google Translate.', color: '#888', activa: false },
                    ].map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color, flexShrink: 0 }}></div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>{c.tipo}: </span>
                          <span style={{ fontSize: '12px', color: '#888' }}>{c.desc}</span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: c.activa ? '#22c55e' : '#888' }}>
                          {c.activa ? 'Siempre activa' : 'Opcional'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setDetalle(!detalle)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#f90', fontWeight: '700', padding: 0, textDecoration: 'underline' }}>
                    {detalle ? 'Ocultar detalles' : 'Ver detalles'}
                  </button>
                  <a href="/politica-cookies" target="_blank" className="cookie-link" style={{ fontSize: '12px', color: '#888', textDecoration: 'none', fontWeight: '600', transition: 'color 0.2s' }}>
                    Politica de cookies
                  </a>
                </div>
              </div>

              {/* BOTONES */}
              <div className="cookie-btns" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, minWidth: '180px' }}>
                <button
                  onClick={aceptarTodas}
                  className="cookie-btn-primary"
                  style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', color: '#111', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Arial Black, sans-serif', whiteSpace: 'nowrap' }}
                >
                  Aceptar todas
                </button>
                <button
                  onClick={aceptarEsenciales}
                  className="cookie-btn-secondary"
                  style={{ padding: '12px 20px', backgroundColor: 'white', border: '1.5px solid #ddd', borderRadius: '10px', fontWeight: '700', fontSize: '13px', color: '#555', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                >
                  Solo esenciales
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER LEGAL */}
          <div style={{ padding: '10px 24px', backgroundColor: '#f9f9f9', borderTop: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: '11px', color: '#bbb', margin: 0, textAlign: 'center' }}>
              Al usar Driny aceptas nuestra{' '}
              <a href="/politica-cookies" style={{ color: '#f90', textDecoration: 'none', fontWeight: '700' }}>Politica de Cookies</a>
              {' '}segun la Ley 1581 de 2012 de Colombia.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}