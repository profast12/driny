"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const categorias = ["Electrónica", "Ropa", "Hogar", "Deportes", "Juguetes", "Autos"];

export default function Vender() {
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("Electrónica");
  const [descripcion, setDescripcion] = useState("");
  const [emoji, setEmoji] = useState("🛍️");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [misProductos, setMisProductos] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setUsuario(session.user);
      cargarProductos(session.user.id);
      setCargando(false);
    });
  }, []);

  const cargarProductos = async (userId: string) => {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('vendedor_id', userId)
      .order('created_at', { ascending: false });
    if (data) setMisProductos(data);
  };

  const publicarProducto = async () => {
    if (!nombre || !precio || !descripcion) {
      setError("Por favor completa todos los campos");
      return;
    }

    setEnviando(true);
    setError("");
    setMensaje("");

   const { error: dbError } = await supabase
  .from('productos')
  .insert([{
    nombre,
    precio: Number(precio),
    categoria,
    descripcion,
    emoji,
    vendedor_id: usuario.id
  }]);

if (dbError) {
  setError("Error: " + dbError.message + " | Code: " + dbError.code);
      setEnviando(false);
      return;
    }

    setMensaje("¡Producto publicado exitosamente!");
    setNombre("");
    setPrecio("");
    setDescripcion("");
    setEmoji("🛍️");
    cargarProductos(usuario.id);
    setEnviando(false);
  };

  const eliminarProducto = async (id: string) => {
    await supabase.from('productos').delete().eq('id', id);
    cargarProductos(usuario.id);
  };

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Cargando...</p>
    </div>
  );

  return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        backgroundColor: '#111',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: '14px' }}>
            Hola, <strong style={{ color: '#f90' }}>{usuario?.email?.split('@')[0]}</strong>
          </span>
          <a href="/carrito" style={{ color: '#f90', textDecoration: 'none', fontSize: '20px' }}>🛒</a>
        </div>
      </nav>

      <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px' }}>🏪 Panel de vendedor</h1>
        <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px' }}>Publica y administra tus productos en Driny</p>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* FORMULARIO */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '28px',
            width: '380px',
            minWidth: '380px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Publicar producto</h3>

            {mensaje && (
              <div style={{
                backgroundColor: '#d1fae5',
                border: '1px solid #6ee7b7',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#065f46'
              }}>✅ {mensaje}</div>
            )}

            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#991b1b'
              }}>❌ {error}</div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                Nombre del producto
              </label>
              <input
                type="text"
                placeholder="Ej: Audífonos Bluetooth"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.border = '2px solid #f90'}
                onBlur={e => e.target.style.border = '2px solid #e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                Precio (COP)
              </label>
              <input
                type="number"
                placeholder="Ej: 89900"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.border = '2px solid #f90'}
                onBlur={e => e.target.style.border = '2px solid #e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                Categoría
              </label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
                }}
              >
                {categorias.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                Descripción
              </label>
              <textarea
                placeholder="Describe tu producto..."
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
                onFocus={e => e.target.style.border = '2px solid #f90'}
                onBlur={e => e.target.style.border = '2px solid #e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                Ícono del producto
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['🛍️', '📱', '💻', '🎧', '👕', '👟', '🏠', '⚽', '🚗', '🎮', '💡', '🎒'].map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    style={{
                      fontSize: '22px',
                      padding: '6px',
                      borderRadius: '8px',
                      border: emoji === e ? '2px solid #f90' : '2px solid #e5e7eb',
                      backgroundColor: emoji === e ? '#fff8ee' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={publicarProducto}
              disabled={enviando}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: enviando ? '#ccc' : '#f90',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '15px',
                cursor: enviando ? 'not-allowed' : 'pointer'
              }}
            >
              {enviando ? 'Publicando...' : '📦 Publicar producto'}
            </button>
          </div>

          {/* MIS PRODUCTOS */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Mis productos ({misProductos.length})
            </h3>

            {misProductos.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '60px',
                textAlign: 'center',
                color: '#888',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <p style={{ fontSize: '16px' }}>No has publicado productos todavía</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {misProductos.map(p => (
                  <div key={p.id} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      width: '60px',
                      height: '60px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      flexShrink: 0
                    }}>{p.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>{p.nombre}</p>
                      <p style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>{p.categoria}</p>
                      <p style={{ color: '#f90', fontWeight: 'bold' }}>
                        ${Number(p.precio).toLocaleString('es-CO')} COP
                      </p>
                    </div>
                    <button
                      onClick={() => eliminarProducto(p.id)}
                      style={{
                        backgroundColor: '#fee2e2',
                        border: 'none',
                        color: '#991b1b',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}