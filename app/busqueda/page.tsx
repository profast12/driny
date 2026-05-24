"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Busqueda() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    setQuery(q);
    if (q) buscar(q);
  }, []);

  const buscar = async (texto: string) => {
    if (!texto.trim()) return;
    setCargando(true);
    setBuscado(true);
    const { data } = await supabase
      .from('productos')
      .select('*')
      .ilike('nombre', `%${texto}%`)
      .order('created_at', { ascending: false });
    if (data) setResultados(data);
    setCargando(false);
  };

  const handleBuscar = () => {
    window.history.pushState({}, '', `/busqueda?q=${query}`);
    buscar(query);
  };

  return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        backgroundColor: '#111',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="🔍  Buscar productos, marcas y más..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '15px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleBuscar}
            style={{
              backgroundColor: '#f90',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            Buscar
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: 'white', fontSize: '14px' }}>
          <a href="/login" style={{ color: 'white', textDecoration: 'none' }}>Mi cuenta</a>
          <a href="/carrito" style={{ color: '#f90', textDecoration: 'none' }}>🛒</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {!buscado ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontSize: '18px' }}>Escribe algo para buscar en Driny</p>
          </div>
        ) : cargando ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>
            <p style={{ fontSize: '18px' }}>Buscando...</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {resultados.length > 0
                  ? `${resultados.length} resultados para "${query}"`
                  : `Sin resultados para "${query}"`}
              </h2>
            </div>

            {resultados.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '60px',
                textAlign: 'center',
                color: '#888',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
                <p style={{ fontSize: '16px', marginBottom: '16px' }}>No encontramos productos con ese nombre</p>
                <a href="/productos" style={{
                  color: '#f90', textDecoration: 'none', fontWeight: 'bold'
                }}>Ver todos los productos</a>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px'
              }}>
                {resultados.map(p => (
                  <div
                    key={p.id}
                    onClick={() => window.location.href = `/producto/${p.id}`}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                  >
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      height: '140px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px'
                    }}>{p.emoji || '🛍️'}</div>
                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{p.categoria}</p>
                    <p style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>{p.nombre}</p>
                    <p style={{ color: '#f90', fontWeight: 'bold', fontSize: '16px' }}>
                      ${Number(p.precio).toLocaleString('es-CO')} COP
                    </p>
                    <button style={{
                      marginTop: '10px',
                      width: '100%',
                      padding: '9px',
                      backgroundColor: '#111',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}>
                      Ver producto
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}