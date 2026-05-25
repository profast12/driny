"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const categorias = ["Todos", "Electrónica", "Ropa", "Hogar", "Deportes", "Juguetes", "Autos"];

export default function Productos() {
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [ordenar, setOrdenar] = useState("relevancia");
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProductos(data);
    setCargando(false);
  };

  const filtrados = productos
    .filter(p => categoriaActiva === "Todos" || p.categoria === categoriaActiva)
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (ordenar === "menor") return a.precio - b.precio;
      if (ordenar === "mayor") return b.precio - a.precio;
      return 0;
    });

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
          placeholder="🔍  Buscar productos..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
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
          <a href="/login" style={{ color: 'white', textDecoration: 'none' }}>Mi cuenta</a>
          <a href="/carrito" style={{ color: '#f90', textDecoration: 'none' }}>🛒 Carrito</a>
        </div>
      </nav>

      <div style={{ display: 'flex', gap: '24px', padding: '24px' }}>

        {/* SIDEBAR */}
        <aside style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          width: '200px',
          minWidth: '200px',
          height: 'fit-content',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Categorías</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: categoriaActiva === cat ? 'bold' : 'normal',
                  backgroundColor: categoriaActiva === cat ? '#111' : '#f3f4f6',
                  color: categoriaActiva === cat ? '#f90' : '#111',
                  fontSize: '14px'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <h3 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '16px' }}>Ordenar por</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { valor: "relevancia", label: "Relevancia" },
              { valor: "menor", label: "Menor precio" },
              { valor: "mayor", label: "Mayor precio" }
            ].map(op => (
              <button
                key={op.valor}
                onClick={() => setOrdenar(op.valor)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: ordenar === op.valor ? 'bold' : 'normal',
                  backgroundColor: ordenar === op.valor ? '#111' : '#f3f4f6',
                  color: ordenar === op.valor ? '#f90' : '#111',
                  fontSize: '14px'
                }}
              >
                {op.label}
              </button>
            ))}
          </div>
        </aside>

        {/* GRID PRODUCTOS */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
              {cargando ? 'Cargando productos...' : `${filtrados.length} productos encontrados`}
            </p>
            <a href="/vender" style={{
              backgroundColor: '#f90',
              color: '#111',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '13px'
            }}>+ Vender producto</a>
          </div>

          {cargando ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '60px',
              textAlign: 'center',
              color: '#888'
            }}>
              <p style={{ fontSize: '18px' }}>Cargando productos...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '60px',
              textAlign: 'center',
              color: '#888'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p style={{ fontSize: '18px', marginBottom: '12px' }}>No se encontraron productos</p>
              <a href="/vender" style={{
                backgroundColor: '#f90',
                color: '#111',
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>¡Sé el primero en vender!</a>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {filtrados.map(p => (
                <div key={p.id} onClick={() => window.location.href = `/producto/${p.id}`} style={{
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
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '48px'
}}>
  {p.imagen_url ? (
    <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : (
    p.emoji || '🛍️'
  )}
</div>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{p.categoria}</p>
                  <p style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>{p.nombre}</p>
                  <p style={{ color: '#f90', fontWeight: 'bold', fontSize: '16px' }}>
                    ${Number(p.precio).toLocaleString('es-CO')} COP
                  </p>
                  <button
  onClick={async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }
    const { error } = await supabase
      .from('carrito')
      .insert([{
        usuario_id: session.user.id,
        producto_id: p.id,
        cantidad: 1
      }]);
    if (!error) alert('✅ Producto agregado al carrito');
    else alert('❌ Error al agregar al carrito');
  }}
  style={{
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
  }}
>
  Agregar al carrito
</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}