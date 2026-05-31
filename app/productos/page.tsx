"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabase";

const categorias = ["Todos", "Electronica", "Ropa", "Hogar", "Deportes", "Juguetes", "Autos"];

export default function Productos() {
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [ordenar, setOrdenar] = useState("relevancia");
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [vistaGrid, setVistaGrid] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat) setCategoriaActiva(cat);
    cargarProductos();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUsuario(session.user);
    });
  }, []);

  const cargarProductos = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProductos(data);
    setCargando(false);
  };

  const agregarAlCarrito = async (e: React.MouseEvent, productoId: string) => {
    e.stopPropagation();
    if (!usuario) { window.location.href = '/login'; return; }
    await supabase.from('carrito').insert([{ usuario_id: usuario.id, producto_id: productoId, cantidad: 1 }]);
    const btn = e.currentTarget as HTMLElement;
    const original = btn.innerHTML;
    btn.innerHTML = 'Agregado';
    btn.style.backgroundColor = '#22c55e';
    btn.style.color = 'white';
    setTimeout(() => { btn.innerHTML = original; btn.style.backgroundColor = ''; btn.style.color = ''; }, 2000);
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
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .prod-card { transition: all 0.22s cubic-bezier(0.4,0,0.2,1); }
        .prod-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .cat-btn:hover { background-color: #fff5e6 !important; color: #f90 !important; }
        .add-btn:hover { background-color: #f90 !important; color: #111 !important; border-color: #f90 !important; }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
      `}</style>

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <Image
              src="/logo.png"
              alt="Driny"
              width={75}
              height={75}
              style={{
                width: 'auto',
                height: '75px'
              }}
            />
          </a>

          <div style={{ flex: 1, display: 'flex', maxWidth: '560px' }}>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ flex: 1, padding: '11px 16px', border: '2px solid #f90', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '14px', outline: 'none', backgroundColor: 'white', color: '#333' }}
            />
            <button style={{ padding: '11px 18px', backgroundColor: '#f90', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>

          <div style={{ flex: 1 }}></div>

          <a href="/carrito" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#555', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '13px', fontWeight: '600' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Carrito
          </a>

          {usuario?.tipo === 'vendedor' && (
            <a href="/vender" style={{ backgroundColor: '#f90', color: '#111', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
              + Publicar
            </a>
          )}
        </div>

        {/* BREADCRUMB */}
        <div style={{ borderTop: '1px solid #f5f5f5' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 24px' }}>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a>
              {' › '}
              <span style={{ color: '#333', fontWeight: '600' }}>Productos</span>
              {categoriaActiva !== 'Todos' && <span style={{ color: '#f90' }}>{' › '}{categoriaActiva}</span>}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* SIDEBAR */}
        <aside style={{ width: '220px', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* CATEGORIAS */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#111', marginBottom: '14px', paddingBottom: '10px', borderBottom: '2px solid #f90', fontFamily: 'Arial Black, sans-serif' }}>
              Categorias
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {categorias.map(cat => (
                <button
                  key={cat}
                  className="cat-btn"
                  onClick={() => setCategoriaActiva(cat)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: categoriaActiva === cat ? '700' : '500',
                    backgroundColor: categoriaActiva === cat ? '#f90' : 'transparent',
                    color: categoriaActiva === cat ? '#111' : '#555',
                    fontSize: '13px',
                    transition: 'all 0.15s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ORDENAR */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#111', marginBottom: '14px', paddingBottom: '10px', borderBottom: '2px solid #f90', fontFamily: 'Arial Black, sans-serif' }}>
              Ordenar por
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { valor: 'relevancia', label: 'Relevancia' },
                { valor: 'menor', label: 'Menor precio' },
                { valor: 'mayor', label: 'Mayor precio' },
              ].map(op => (
                <button
                  key={op.valor}
                  className="cat-btn"
                  onClick={() => setOrdenar(op.valor)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: ordenar === op.valor ? '700' : '500',
                    backgroundColor: ordenar === op.valor ? '#f90' : 'transparent',
                    color: ordenar === op.valor ? '#111' : '#555',
                    fontSize: '13px',
                    transition: 'all 0.15s'
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* BANNER VENDER */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d1a00)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>Vende en Driny</p>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '14px', lineHeight: 1.5 }}>Llega a miles de compradores gratis</p>
            <a href="/vende-con-nosotros" style={{ display: 'block', backgroundColor: '#f90', color: '#111', padding: '8px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px' }}>
              Empezar ahora
            </a>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* BARRA RESULTADOS */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '14px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
            <div>
              <span style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>
                {cargando ? 'Cargando...' : `${filtrados.length} productos`}
              </span>
              {categoriaActiva !== 'Todos' && (
                <span style={{ marginLeft: '8px', backgroundColor: '#fff5e6', color: '#f90', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: '1px solid #ffe0b2' }}>
                  {categoriaActiva}
                  <button onClick={() => setCategoriaActiva('Todos')} style={{ background: 'none', border: 'none', color: '#f90', cursor: 'pointer', marginLeft: '4px', fontWeight: 'bold', fontSize: '13px', padding: 0 }}>x</button>
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setVistaGrid(!vistaGrid)}
                style={{ background: 'none', border: '1px solid #eee', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', color: '#888' }}
                title={vistaGrid ? 'Vista lista' : 'Vista grilla'}
              >
                {vistaGrid ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* PRODUCTOS */}
          {cargando ? (
            <div style={{ display: 'grid', gridTemplateColumns: vistaGrid ? 'repeat(auto-fill, minmax(200px, 1fr))' : '1fr', gap: '14px' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="skeleton" style={{ borderRadius: '12px', height: vistaGrid ? '280px' : '100px' }}></div>
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '80px 40px', textAlign: 'center', border: '1px solid #eee', animation: 'fadeIn 0.3s ease' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>No encontramos productos</p>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Intenta con otra categoria o termino de busqueda</p>
              <button onClick={() => { setCategoriaActiva('Todos'); setBusqueda(''); }} style={{ backgroundColor: '#f90', color: '#111', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                Ver todos los productos
              </button>
            </div>
          ) : vistaGrid ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', animation: 'fadeIn 0.3s ease' }}>
              {filtrados.map(p => (
                <div
                  key={p.id}
                  className="prod-card"
                  onClick={() => window.location.href = '/producto/' + p.id}
                  style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ height: '170px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} alt={p.nombre}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
                        onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ fontSize: '56px' }}>{p.emoji || '🛍️'}</div>
                    )}
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.categoria}</p>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '10px', lineHeight: 1.3, height: '36px', overflow: 'hidden' }}>{p.nombre}</p>
                    <p style={{ fontWeight: '800', fontSize: '18px', color: '#111', marginBottom: '12px' }}>
                      ${Number(p.precio).toLocaleString('es-CO')}
                      <span style={{ fontSize: '11px', color: '#888', fontWeight: 'normal' }}> COP</span>
                    </p>
                    <button
                      className="add-btn"
                      onClick={e => agregarAlCarrito(e, p.id)}
                      style={{ width: '100%', padding: '9px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s' }}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s ease' }}>
              {filtrados.map(p => (
                <div
                  key={p.id}
                  className="prod-card"
                  onClick={() => window.location.href = '/producto/' + p.id}
                  style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', display: 'flex', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ width: '140px', minWidth: '140px', height: '120px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.nombre} />
                    ) : (
                      <div style={{ fontSize: '40px' }}>{p.emoji || '🛍️'}</div>
                    )}
                  </div>
                  <div style={{ flex: 1, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>{p.categoria}</p>
                      <p style={{ fontWeight: '600', fontSize: '15px', color: '#333', marginBottom: '6px' }}>{p.nombre}</p>
                      {p.descripcion && <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>{p.descripcion.slice(0, 80)}{p.descripcion.length > 80 ? '...' : ''}</p>}
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '20px', flexShrink: 0 }}>
                      <p style={{ fontWeight: '800', fontSize: '20px', color: '#111', marginBottom: '12px' }}>
                        ${Number(p.precio).toLocaleString('es-CO')}
                        <span style={{ fontSize: '12px', color: '#888', fontWeight: 'normal', display: 'block' }}>COP</span>
                      </p>
                      <button
                        className="add-btn"
                        onClick={e => agregarAlCarrito(e, p.id)}
                        style={{ padding: '9px 20px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      >
                        Agregar al carrito
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}