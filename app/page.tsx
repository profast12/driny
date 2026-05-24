"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const categorias = ["Electrónica", "Ropa", "Hogar", "Deportes", "Juguetes", "Autos"];
  const [usuario, setUsuario] = useState<any>(null);

  const productos = [
    { id: 1, nombre: "Audífonos Bluetooth", precio: "89.900", vendedor: "TechStore" },
    { id: 2, nombre: "Zapatillas Running", precio: "120.000", vendedor: "SportShop" },
    { id: 3, nombre: "Lámpara LED", precio: "45.000", vendedor: "HogarPlus" },
    { id: 4, nombre: "Camiseta Deportiva", precio: "38.000", vendedor: "ModaCo" },
    { id: 5, nombre: "Mouse Inalámbrico", precio: "67.000", vendedor: "TechStore" },
    { id: 6, nombre: "Mochila Urbana", precio: "95.000", vendedor: "UrbanBag" },
  ];

  useEffect(() => {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('username')
        .eq('email', session.user.email)
        .single();
      setUsuario({ ...session.user, username: perfil?.username || null });
    } else {
      setUsuario(null);
    }
  });
}, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
  };

  return (
    <main>

      {/* NAVBAR SUPERIOR */}
      <div style={{
        backgroundColor: '#f90',
        padding: '6px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '16px',
        fontSize: '13px',
        color: '#111'
      }}>
        <a href="/productos" style={{ cursor: 'pointer', textDecoration: 'none', color: '#111' }}>¿Quieres vender en Driny?</a>
        <span>|</span>
        <span style={{ cursor: 'pointer' }}>Ayuda</span>
        <span>|</span>
        <span style={{ cursor: 'pointer' }}>Mis pedidos</span>
      </div>

      {/* NAVBAR PRINCIPAL */}
      <nav style={{
        backgroundColor: '#111',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <h1 style={{ color: '#f90', fontSize: '30px', fontWeight: 'bold', minWidth: 'fit-content' }}>Driny</h1>

        <input
  type="text"
  placeholder="🔍  Buscar productos, marcas y más..."
  onKeyDown={e => {
    if (e.key === 'Enter') {
      const valor = (e.target as HTMLInputElement).value;
      if (valor.trim()) window.location.href = `/busqueda?q=${valor}`;
    }
  }}
  style={{
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '15px',
    outline: 'none'
  }}
/>

        <div style={{ display: 'flex', gap: '24px', color: 'white', fontSize: '14px', minWidth: 'fit-content' }}>
          {usuario ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a href="/perfil" style={{ textDecoration: 'none', textAlign: 'center' }}>
  <div style={{ fontSize: '11px', color: '#aaa' }}>Hola,</div>
  <div style={{ fontWeight: 'bold', color: '#f90' }}>
    {usuario.username || usuario.email.split('@')[0]}
  </div>
</a>
              <button
                onClick={cerrarSesion}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #666',
                  color: '#aaa',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Salir
              </button>
            </div>
          ) : (
            <a href="/login" style={{ textDecoration: 'none', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#aaa' }}>Hola, ingresa</div>
              <div style={{ fontWeight: 'bold' }}>Mi cuenta</div>
            </a>
          )}
          <div style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#aaa' }}>¿Quieres</div>
            <div style={{ fontWeight: 'bold' }}>Vender?</div>
          </div>
          <a href="/carrito" style={{ textDecoration: 'none', textAlign: 'center', color: '#f90' }}>
            <div style={{ fontSize: '22px' }}>🛒</div>
            <div style={{ fontSize: '11px', color: 'white' }}>Carrito</div>
          </a>
        </div>
      </nav>

      {/* CATEGORÍAS */}
      <div style={{
        backgroundColor: '#222',
        padding: '10px 24px',
        display: 'flex',
        gap: '24px',
        overflowX: 'auto'
      }}>
        {categorias.map((cat) => (
          <span key={cat} style={{
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            padding: '4px 0'
          }}
            onMouseOver={e => (e.target as HTMLElement).style.color = '#f90'}
            onMouseOut={e => (e.target as HTMLElement).style.color = 'white'}
          >
            {cat}
          </span>
        ))}
        <a href="/subastas" style={{
          color: '#f90',
          fontSize: '14px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontWeight: 'bold',
          textDecoration: 'none'
        }}>🔨 Subastas</a>
      </div>

      {/* BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '70px 20px'
      }}>
        <p style={{ color: '#f90', fontSize: '14px', letterSpacing: '3px', marginBottom: '12px' }}>BIENVENIDO A DRINY</p>
        <h2 style={{ fontSize: '40px', marginBottom: '16px', lineHeight: 1.2 }}>Todo lo que necesitas,<br />en un solo lugar</h2>
        <p style={{ fontSize: '17px', marginBottom: '32px', color: '#aaa' }}>Compra, vende y subasta productos en Colombia</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a href="/productos" style={{
            backgroundColor: '#f90',
            border: 'none',
            padding: '14px 32px',
            fontSize: '16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            textDecoration: 'none',
            color: '#111'
          }}>
            Ver productos
          </a>
          <a href="/subastas" style={{
            backgroundColor: 'transparent',
            border: '2px solid #f90',
            color: '#f90',
            padding: '14px 32px',
            fontSize: '16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}>
            🔨 Ver subastas
          </a>
        </div>
      </div>

      {/* PRODUCTOS */}
      <section style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px' }}>Productos destacados</h2>
          <a href="/productos" style={{ color: '#f90', fontSize: '14px', textDecoration: 'none' }}>Ver todos →</a>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '20px'
        }}>
          {productos.map((p) => (
            <div key={p.id} style={{
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
                height: '160px',
                borderRadius: '8px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>🛍️</div>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>{p.vendedor}</p>
              <p style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>{p.nombre}</p>
              <p style={{ color: '#f90', fontWeight: 'bold', fontSize: '17px' }}>${p.precio} COP</p>
              <button style={{
                marginTop: '12px',
                width: '100%',
                padding: '10px',
                backgroundColor: '#111',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                Agregar al carrito
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* BANNER SUBASTAS */}
      <section style={{
        margin: '0 24px 40px',
        backgroundColor: '#111',
        borderRadius: '16px',
        padding: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        <div>
          <p style={{ color: '#f90', fontWeight: 'bold', marginBottom: '8px' }}>NUEVO EN DRINY</p>
          <h3 style={{ fontSize: '28px', marginBottom: '12px' }}>Subastas en tiempo real</h3>
          <p style={{ color: '#aaa', marginBottom: '20px' }}>Oferta por productos únicos y consíguelos al mejor precio</p>
          <a href="/subastas" style={{
            backgroundColor: '#f90',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            textDecoration: 'none',
            color: '#111'
          }}>
            🔨 Ver subastas activas
          </a>
        </div>
        <div style={{ fontSize: '80px' }}>🏆</div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#111',
        color: '#aaa',
        padding: '40px 24px',
        marginTop: '20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div>
            <h4 style={{ color: '#f90', marginBottom: '12px', fontSize: '20px' }}>Driny</h4>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>El marketplace colombiano para comprar, vender y subastar.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px' }}>Comprar</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <a href="/productos" style={{ cursor: 'pointer', textDecoration: 'none', color: '#aaa' }}>Todos los productos</a>
              <span style={{ cursor: 'pointer' }}>Ofertas del día</span>
              <a href="/subastas" style={{ cursor: 'pointer', textDecoration: 'none', color: '#aaa' }}>Subastas</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px' }}>Vender</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <a href="/registro" style={{ cursor: 'pointer', textDecoration: 'none', color: '#aaa' }}>Crear cuenta vendedor</a>
              <span style={{ cursor: 'pointer' }}>Cómo funciona</span>
              <span style={{ cursor: 'pointer' }}>Tarifas</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '12px' }}>Ayuda</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <span style={{ cursor: 'pointer' }}>Centro de ayuda</span>
              <span style={{ cursor: 'pointer' }}>Devoluciones</span>
              <span style={{ cursor: 'pointer' }}>Contáctanos</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: '20px', textAlign: 'center', fontSize: '13px' }}>
          © 2025 Driny — Todos los derechos reservados | Colombia 🇨🇴
        </div>
      </footer>

    </main>
  );
}