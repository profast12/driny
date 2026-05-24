"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function DetalleProducto({ params }: any) {
  const [producto, setProducto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
  console.log("ID recibido:", params.id);
  cargarProducto();
}, []);

  const cargarProducto = async () => {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('id', params.id)
      .single();
    if (data) setProducto(data);
    setCargando(false);
  };

  const agregarAlCarrito = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }
    await supabase.from('carrito').insert([{
      usuario_id: session.user.id,
      producto_id: producto.id,
      cantidad
    }]);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 3000);
  };

  if (cargando) return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#111', padding: '14px 24px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>Cargando producto...</div>
    </main>
  );

  if (!producto) return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#111', padding: '14px 24px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <p style={{ fontSize: '18px', marginBottom: '16px' }}>Producto no encontrado</p>
        <a href="/productos" style={{ color: '#f90', textDecoration: 'none', fontWeight: 'bold' }}>Ver todos los productos</a>
      </div>
    </main>
  );

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
        <div style={{ flex: 1 }}></div>
        <a href="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Mi cuenta</a>
        <a href="/carrito" style={{ color: '#f90', textDecoration: 'none', fontSize: '20px' }}>🛒</a>
      </nav>

      {/* BREADCRUMB */}
      <div style={{ padding: '16px 24px', fontSize: '13px', color: '#888' }}>
        <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a>
        <span> → </span>
        <a href="/productos" style={{ color: '#888', textDecoration: 'none' }}>Productos</a>
        <span> → </span>
        <span style={{ color: '#111' }}>{producto.nombre}</span>
      </div>

      {/* CONTENIDO */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px 40px',
        display: 'flex',
        gap: '40px',
        alignItems: 'flex-start'
      }}>

        {/* IMAGEN */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '140px',
          width: '420px',
          minWidth: '420px',
          height: '380px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          {producto.emoji || '🛍️'}
        </div>

        {/* INFO */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{producto.categoria}</p>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.3 }}>
            {producto.nombre}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ color: '#f90', fontSize: '20px' }}>★★★★★</span>
            <span style={{ fontSize: '13px', color: '#888' }}>5.0 (sin reseñas aún)</span>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f90', marginBottom: '4px' }}>
              ${Number(producto.precio).toLocaleString('es-CO')} COP
            </p>
            <p style={{ fontSize: '13px', color: '#22c55e', fontWeight: 'bold' }}>✅ En stock</p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>Descripción</h3>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
              {producto.descripcion || 'Sin descripción disponible.'}
            </p>
          </div>

          {/* CANTIDAD */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Cantidad:</span>
            <button
              onClick={() => setCantidad(c => Math.max(1, c - 1))}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: '2px solid #e5e7eb', backgroundColor: 'white',
                fontSize: '20px', cursor: 'pointer'
              }}
            >−</button>
            <span style={{ fontWeight: 'bold', fontSize: '18px', minWidth: '24px', textAlign: 'center' }}>
              {cantidad}
            </span>
            <button
              onClick={() => setCantidad(c => c + 1)}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: '2px solid #e5e7eb', backgroundColor: 'white',
                fontSize: '20px', cursor: 'pointer'
              }}
            >+</button>
          </div>

          {/* BOTONES */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button
              onClick={agregarAlCarrito}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: agregado ? '#22c55e' : '#111',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              {agregado ? '✅ Agregado al carrito' : '🛒 Agregar al carrito'}
            </button>
            <a href="/carrito" style={{
              flex: 1,
              padding: '14px',
              backgroundColor: '#f90',
              color: '#111',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'center'
            }}>
              ⚡ Comprar ahora
            </a>
          </div>

          {/* GARANTIAS */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <span>🔒</span><span>Pago seguro con PayPal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <span>🔄</span><span>Devoluciones dentro de 30 días</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <span>🚚</span><span>Envío a todo Colombia</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}