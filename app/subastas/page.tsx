"use client";
import { useState, useEffect } from "react";

const subastas = [
  {
    id: 1,
    nombre: "iPhone 14 Pro",
    descripcion: "Como nuevo, 256GB, color negro",
    precioBase: 1200000,
    precioActual: 1450000,
    ofertas: 8,
    emoji: "📱",
    tiempoRestante: 3600,
    vendedor: "TechStore"
  },
  {
    id: 2,
    nombre: "PS5 Digital Edition",
    descripcion: "Sellada de fábrica, incluye 2 juegos",
    precioBase: 1800000,
    precioActual: 2100000,
    ofertas: 15,
    emoji: "🎮",
    tiempoRestante: 7200,
    vendedor: "GamerShop"
  },
  {
    id: 3,
    nombre: "Bicicleta de Montaña",
    descripcion: "Trek X-Caliber, talla M, poco uso",
    precioBase: 800000,
    precioActual: 950000,
    ofertas: 5,
    emoji: "🚵",
    tiempoRestante: 1800,
    vendedor: "SportShop"
  },
  {
    id: 4,
    nombre: "MacBook Air M2",
    descripcion: "8GB RAM, 256GB SSD, color plata",
    precioBase: 3500000,
    precioActual: 3800000,
    ofertas: 12,
    emoji: "💻",
    tiempoRestante: 10800,
    vendedor: "TechStore"
  },
  {
    id: 5,
    nombre: "Cámara Sony A7III",
    descripcion: "Cuerpo + lente 28-70mm, excelente estado",
    precioBase: 4200000,
    precioActual: 4500000,
    ofertas: 6,
    emoji: "📷",
    tiempoRestante: 5400,
    vendedor: "PhotoPro"
  },
  {
    id: 6,
    nombre: "Smart TV Samsung 55\"",
    descripcion: "4K QLED, 2023, con caja original",
    precioBase: 1500000,
    precioActual: 1750000,
    ofertas: 9,
    emoji: "📺",
    tiempoRestante: 900,
    vendedor: "ElectroShop"
  },
];

function Contador({ segundos }: { segundos: number }) {
  const [tiempo, setTiempo] = useState(segundos);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempo(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const horas = Math.floor(tiempo / 3600);
  const minutos = Math.floor((tiempo % 3600) / 60);
  const segs = tiempo % 60;
  const urgente = tiempo < 1800;

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      justifyContent: 'center',
      marginBottom: '12px'
    }}>
      {[
        { valor: horas, label: 'h' },
        { valor: minutos, label: 'm' },
        { valor: segs, label: 's' }
      ].map((t, i) => (
        <div key={i} style={{
          backgroundColor: urgente ? '#c0392b' : '#111',
          color: 'white',
          borderRadius: '6px',
          padding: '4px 8px',
          fontSize: '16px',
          fontWeight: 'bold',
          minWidth: '40px',
          textAlign: 'center'
        }}>
          {String(t.valor).padStart(2, '0')}{t.label}
        </div>
      ))}
    </div>
  );
}

export default function Subastas() {
  const [ofertaActiva, setOfertaActiva] = useState<number | null>(null);
  const [miOferta, setMiOferta] = useState("");

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
        <input
          type="text"
          placeholder="🔍  Buscar subastas..."
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '15px',
            outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '24px', color: 'white', fontSize: '14px' }}>
          <span style={{ cursor: 'pointer' }}>Mi cuenta</span>
          <span style={{ cursor: 'pointer', color: '#f90' }}>🛒 Carrito</span>
        </div>
      </nav>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        padding: '40px 24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#f90', letterSpacing: '3px', fontSize: '13px', marginBottom: '10px' }}>EN VIVO AHORA</p>
        <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>🔨 Subastas en tiempo real</h1>
        <p style={{ color: '#aaa', fontSize: '16px' }}>Oferta por productos únicos y gánalos al mejor precio</p>
      </div>

      {/* GRID SUBASTAS */}
      <section style={{ padding: '32px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {subastas.map(s => (
            <div key={s.id} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: ofertaActiva === s.id ? '2px solid #f90' : '2px solid transparent',
              transition: 'all 0.2s'
            }}>

              {/* IMAGEN */}
              <div style={{
                backgroundColor: '#f3f4f6',
                height: '160px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                marginBottom: '16px'
              }}>{s.emoji}</div>

              {/* INFO */}
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{s.vendedor}</p>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '6px' }}>{s.nombre}</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px' }}>{s.descripcion}</p>

              {/* CONTADOR */}
              <Contador segundos={s.tiempoRestante} />

              {/* PRECIOS */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '14px',
                fontSize: '13px'
              }}>
                <div>
                  <p style={{ color: '#888' }}>Precio base</p>
                  <p style={{ fontWeight: 'bold' }}>${s.precioBase.toLocaleString('es-CO')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#888' }}>Oferta actual</p>
                  <p style={{ fontWeight: 'bold', color: '#f90', fontSize: '16px' }}>
                    ${s.precioActual.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px', textAlign: 'center' }}>
                {s.ofertas} ofertas realizadas
              </p>

              {/* FORMULARIO OFERTA */}
              {ofertaActiva === s.id ? (
                <div>
                  <input
                    type="number"
                    placeholder={`Mínimo $${(s.precioActual + 10000).toLocaleString('es-CO')}`}
                    value={miOferta}
                    onChange={e => setMiOferta(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '2px solid #f90',
                      fontSize: '14px',
                      marginBottom: '8px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        alert(`¡Oferta de $${Number(miOferta).toLocaleString('es-CO')} COP enviada!`);
                        setOfertaActiva(null);
                        setMiOferta("");
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#f90',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Ofertar
                    </button>
                    <button
                      onClick={() => setOfertaActiva(null)}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setOfertaActiva(s.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#111',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '15px'
                  }}
                >
                  🔨 Hacer oferta
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#111',
        color: '#aaa',
        textAlign: 'center',
        padding: '24px',
        fontSize: '13px'
      }}>
        © 2025 Driny — Todos los derechos reservados | Colombia 🇨🇴
      </footer>

    </main>
  );
}