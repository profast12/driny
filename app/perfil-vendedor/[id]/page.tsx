"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function PerfilVendedor() {
  const [id, setId] = useState('');
  const [vendedor, setVendedor] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [subastas, setSubastas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState<'productos' | 'subastas'>('productos');

  useEffect(() => {
    const parts = window.location.pathname.split('/');
    setId(parts[parts.length - 1]);
  }, []);

  useEffect(() => {
    if (!id) return;
    cargarPerfil();
  }, [id]);

  const cargarPerfil = async () => {
    const { data: v } = await supabase.from('usuarios').select('*').eq('id', id).single();
    if (v) setVendedor(v);
    const { data: p } = await supabase.from('productos').select('*').eq('vendedor_id', id).order('created_at', { ascending: false });
    if (p) setProductos(p);
    const { data: s } = await supabase.from('subastas_real').select('*').eq('vendedor_id', id).eq('activa', true).order('created_at', { ascending: false });
    if (s) setSubastas(s);
    setCargando(false);
  };

  if (cargando) return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white' }}>Cargando perfil...</div>
    </main>
  );

  if (!vendedor) return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white' }}>Vendedor no encontrado</div>
    </main>
  );

  return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: 'white' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(255,153,0,0.1); }
      `}</style>

      <nav style={{ backgroundColor: '#111', borderBottom: '1px solid #1f1f1f', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <div style={{ flex: 1 }}></div>
        <a href="/productos" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Ver productos</a>
        <a href="/subastas" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Subastas</a>
      </nav>

      {/* HEADER PERFIL */}
      <div style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '48px 24px', borderBottom: '1px solid #1f1f1f' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '28px', alignItems: 'center', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', color: '#111', flexShrink: 0, border: '3px solid #f90' }}>
            {vendedor.avatar_url ? <img src={vendedor.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (vendedor.nombre || 'V').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '4px' }}>{vendedor.nombre_tienda || vendedor.nombre || 'Vendedor'}</h1>
            {vendedor.username && <p style={{ color: '#f90', fontSize: '14px', marginBottom: '6px' }}>@{vendedor.username}</p>}
            <p style={{ color: '#666', fontSize: '13px' }}>Vendedor verificado en Driny</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '14px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f90' }}>{productos.length}</p>
                <p style={{ fontSize: '11px', color: '#666' }}>Productos</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f90' }}>{subastas.length}</p>
                <p style={{ fontSize: '11px', color: '#666' }}>Subastas activas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
          {[
            { id: 'productos', label: 'Productos' },
            { id: 'subastas', label: 'Subastas activas' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', backgroundColor: tab === t.id ? '#f90' : 'transparent', color: tab === t.id ? '#111' : '#666' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'productos' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {productos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Este vendedor no tiene productos publicados</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {productos.map(p => (
                  <div key={p.id} className="card-hover" onClick={() => window.location.href = '/producto/' + p.id} style={{ backgroundColor: '#111', borderRadius: '14px', overflow: 'hidden', border: '1px solid #1f1f1f', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ height: '160px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', overflow: 'hidden' }}>
                      {p.imagen_url ? <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.emoji || '🛍️'}
                    </div>
                    <div style={{ padding: '14px' }}>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{p.categoria}</p>
                      <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>{p.nombre}</p>
                      <p style={{ color: '#f90', fontWeight: 'bold', fontSize: '16px' }}>${Number(p.precio).toLocaleString('es-CO')} COP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'subastas' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {subastas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Este vendedor no tiene subastas activas</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {subastas.map(s => (
                  <div key={s.id} className="card-hover" onClick={() => window.location.href = '/subasta/' + s.id} style={{ backgroundColor: '#111', borderRadius: '14px', padding: '20px', border: '1px solid #1f1f1f', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{s.nombre}</p>
                      <div style={{ backgroundColor: '#22c55e22', color: '#22c55e', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>VIVO</div>
                    </div>
                    <p style={{ color: '#f90', fontWeight: 'bold', fontSize: '18px' }}>${Number(s.precio_actual).toLocaleString('es-CO')} COP</p>
                    <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>{s.total_ofertas} ofertas</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}