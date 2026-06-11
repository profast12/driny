"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image"
import { supabase } from "../../lib/supabase";

const categorias = ["Todas", "Electronica", "Ropa", "Hogar", "Deportes", "Juguetes", "Autos", "Arte", "Coleccionables", "Otro"];
const estados = ["Todos", "nuevo", "usado_como_nuevo", "usado_buen_estado", "usado_aceptable"];
const estadoLabels: any = {
  "Todos": "Todos los estados",
  "nuevo": "Nuevo",
  "usado_como_nuevo": "Usado - Como nuevo",
  "usado_buen_estado": "Usado - Buen estado",
  "usado_aceptable": "Usado - Aceptable",
};

export default function Busqueda() {
  const [historial, setHistorial] = useState<string[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [query, setQuery] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [productos, setProductos] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [estadoActivo, setEstadoActivo] = useState('Todos');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [ordenar, setOrdenar] = useState('relevancia');
  const [vistaGrid, setVistaGrid] = useState(true);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sugerenciasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  setQuery(q);
  setQueryInput(q);
  cargarHistorial();
  if (q) buscar(q);
}, []);

  useEffect(() => {
    const cerrar = (e: MouseEvent) => {
      if (sugerenciasRef.current && !sugerenciasRef.current.contains(e.target as Node)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener('click', cerrar);
    return () => document.removeEventListener('click', cerrar);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (queryInput.trim().length >= 2) cargarSugerencias(queryInput);
      else setSugerencias([]);
    }, 300);
    return () => clearTimeout(timeout);
  }, [queryInput]);

  const cargarHistorial = () => {
  const h = localStorage.getItem('driny_historial');
  if (h) setHistorial(JSON.parse(h));
};

const guardarEnHistorial = (texto: string) => {
  if (!texto.trim()) return;
  const h = JSON.parse(localStorage.getItem('driny_historial') || '[]');
  const nuevo = [texto, ...h.filter((i: string) => i !== texto)].slice(0, 8);
  localStorage.setItem('driny_historial', JSON.stringify(nuevo));
  setHistorial(nuevo);
};

const eliminarDelHistorial = (texto: string) => {
  const nuevo = historial.filter(i => i !== texto);
  localStorage.setItem('driny_historial', JSON.stringify(nuevo));
  setHistorial(nuevo);
};

const limpiarHistorial = () => {
  localStorage.removeItem('driny_historial');
  setHistorial([]);
};

  const cargarSugerencias = async (texto: string) => {
    const { data } = await supabase
      .from('productos')
      .select('id, nombre, categoria, precio, imagen_url, emoji')
      .ilike('nombre', `%${texto}%`)
      .limit(6);
    if (data) { setSugerencias(data); setMostrarSugerencias(true); }
  };

  const buscar = async (q: string) => {
    if (!q.trim()) return;
    setCargando(true);
    setMostrarSugerencias(false);
    const { data } = await supabase
      .from('productos')
      .select('*')
      .ilike('nombre', `%${q}%`);
    if (data) setProductos(data);
    setCargando(false);
  };

  const handleBuscar = () => {
  if (!queryInput.trim()) return;
  guardarEnHistorial(queryInput.trim());
  setQuery(queryInput);
  setMostrarHistorial(false);
  buscar(queryInput);
  window.history.pushState({}, '', '/busqueda?q=' + encodeURIComponent(queryInput));
};

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBuscar();
    if (e.key === 'Escape') setMostrarSugerencias(false);
  };

  const seleccionarSugerencia = (prod: any) => {
  guardarEnHistorial(prod.nombre);
  setQueryInput(prod.nombre);
  setQuery(prod.nombre);
  setMostrarSugerencias(false);
  setMostrarHistorial(false);
  buscar(prod.nombre);
  window.history.pushState({}, '', '/busqueda?q=' + encodeURIComponent(prod.nombre));
};

  const filtrados = productos
    .filter(p => categoriaActiva === 'Todas' || p.categoria === categoriaActiva)
    .filter(p => estadoActivo === 'Todos' || p.estado_producto === estadoActivo)
    .filter(p => !precioMin || Number(p.precio) >= Number(precioMin))
    .filter(p => !precioMax || Number(p.precio) <= Number(precioMax))
    .sort((a, b) => {
      if (ordenar === 'menor') return a.precio - b.precio;
      if (ordenar === 'mayor') return b.precio - a.precio;
      if (ordenar === 'recientes') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  const limpiarFiltros = () => {
    setCategoriaActiva('Todas');
    setEstadoActivo('Todos');
    setPrecioMin('');
    setPrecioMax('');
    setOrdenar('relevancia');
  };

  const hayFiltros = categoriaActiva !== 'Todas' || estadoActivo !== 'Todos' || precioMin || precioMax || ordenar !== 'relevancia';

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .prod-card { transition: all 0.22s; }
        .prod-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .sug-item:hover { background-color: #fff8f0 !important; }
        .filtro-btn:hover { border-color: #f90 !important; color: #f90 !important; }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
        @media (max-width: 900px) {
          .busqueda-grid { grid-template-columns: 1fr !important; }
          .sidebar-filtros { display: none; }
          .sidebar-filtros.abierto { display: block !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 200 !important; background: rgba(0,0,0,0.5) !important; padding: 20px !important; }
        }
        @media (max-width: 480px) {
          .prod-grid-b { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
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
  </div>
</a>


          {/* BUSCADOR CON SUGERENCIAS */}
          <div style={{ flex: 1, maxWidth: '600px', position: 'relative' }} ref={sugerenciasRef}>
            <div style={{ display: 'flex' }}>
              <input
  ref={inputRef}
  type="text"
  placeholder="Buscar productos, marcas y mas..."
  value={queryInput}
  onChange={e => { setQueryInput(e.target.value); setMostrarSugerencias(true); setMostrarHistorial(false); }}
  onKeyDown={handleKey}
  onFocus={() => {
    if (sugerencias.length > 0) setMostrarSugerencias(true);
    else if (queryInput.length < 2 && historial.length > 0) setMostrarHistorial(true);
  }}
  style={{ flex: 1, padding: '11px 16px', border: '2px solid #f90', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '14px', outline: 'none', color: '#333', backgroundColor: 'white' }}
/>
              <button onClick={handleBuscar} style={{ padding: '11px 18px', backgroundColor: '#f90', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </div>

            {/* SUGERENCIAS */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #eee', zIndex: 300, overflow: 'hidden', animation: 'slideDown 0.2s ease', marginTop: '4px' }}>
                <div style={{ padding: '8px 14px', borderBottom: '1px solid #f5f5f5' }}>
                  <p style={{ fontSize: '11px', color: '#888', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sugerencias</p>
                </div>
                {sugerencias.map(s => (
                  <div key={s.id} className="sug-item" onClick={() => seleccionarSugerencia(s)} style={{ padding: '11px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f9f9f9', transition: 'background 0.15s' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f5f5f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
                      {s.imagen_url ? <img src={s.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={s.nombre} /> : s.emoji || '🛍️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nombre}</p>
                      <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{s.categoria}</p>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '800', color: '#f90', flexShrink: 0 }}>${Number(s.precio).toLocaleString('es-CO')}</p>
                  </div>
                ))}
                <div style={{ padding: '10px 14px', backgroundColor: '#fafafa', textAlign: 'center' }}>
                  <button onClick={handleBuscar} style={{ background: 'none', border: 'none', color: '#f90', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                    Ver todos los resultados para "{queryInput}"
                  </button>
                </div>
              </div>
            )}

            {/* HISTORIAL */}
            {mostrarHistorial && !mostrarSugerencias && historial.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #eee', zIndex: 300, overflow: 'hidden', animation: 'slideDown 0.2s ease', marginTop: '4px' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Busquedas recientes</p>
                  </div>
                  <button onClick={limpiarHistorial} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: '2px 6px' }}>
                    Limpiar todo
                  </button>
                </div>
                {historial.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: '1px solid #f9f9f9', transition: 'background 0.15s' }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#fff8f0'}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <span onClick={() => { setQueryInput(h); guardarEnHistorial(h); setMostrarHistorial(false); buscar(h); window.history.pushState({}, '', '/busqueda?q=' + encodeURIComponent(h)); }}
                      style={{ flex: 1, fontSize: '13px', color: '#333', cursor: 'pointer', fontWeight: '500' }}>
                      {h}
                    </span>
                    <button onClick={() => eliminarDelHistorial(h)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s' }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                      onMouseOut={e => (e.currentTarget as HTMLElement).style.color = '#ccc'}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}></div>
          <a href="/productos" style={{ color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Ver todos</a>
          <a href="/carrito" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e5e5', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Carrito
          </a>
        </div>

        {/* BREADCRUMB */}
        <div style={{ borderTop: '1px solid #f5f5f5' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '7px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a>{' › '}
              <a href="/productos" style={{ color: '#888', textDecoration: 'none' }}>Productos</a>{' › '}
              <span style={{ color: '#333', fontWeight: '600' }}>Resultados para "{query}"</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>

        {/* BARRA RESULTADOS MOBILE */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>
              {cargando ? 'Buscando...' : `${filtrados.length} resultado${filtrados.length !== 1 ? 's' : ''}`}
              {query && <span style={{ color: '#888', fontWeight: 'normal' }}> para "<strong style={{ color: '#f90' }}>{query}</strong>"</span>}
            </span>
            {hayFiltros && (
              <button onClick={limpiarFiltros} style={{ fontSize: '11px', color: '#ef4444', border: '1px solid #fecaca', backgroundColor: '#fef2f2', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer', fontWeight: '700' }}>
                Limpiar filtros
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setFiltrosAbiertos(!filtrosAbiertos)} className="filtro-btn" style={{ display: 'none', padding: '7px 12px', border: '1.5px solid #eee', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#555', transition: 'all 0.2s', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Filtros {hayFiltros && <span style={{ backgroundColor: '#f90', color: '#111', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>!</span>}
            </button>
            <select value={ordenar} onChange={e => setOrdenar(e.target.value)} style={{ padding: '7px 12px', border: '1.5px solid #eee', borderRadius: '8px', backgroundColor: 'white', fontSize: '12px', color: '#555', outline: 'none', cursor: 'pointer', fontWeight: '600' }}>
              <option value="relevancia">Relevancia</option>
              <option value="menor">Menor precio</option>
              <option value="mayor">Mayor precio</option>
              <option value="recientes">Mas recientes</option>
            </select>
            <button onClick={() => setVistaGrid(!vistaGrid)} style={{ padding: '7px 10px', border: '1.5px solid #eee', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#555', transition: 'all 0.2s' }}>
              {vistaGrid ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              )}
            </button>
          </div>
        </div>

        <div className="busqueda-grid" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'flex-start' }}>

          {/* SIDEBAR FILTROS */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '80px' }}>

            {/* CATEGORIAS */}
            <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#111', marginBottom: '14px', paddingBottom: '10px', borderBottom: '2px solid #f90', fontFamily: 'Arial Black, sans-serif' }}>Categorias</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {categorias.map(cat => (
                  <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: categoriaActiva === cat ? '700' : '500', backgroundColor: categoriaActiva === cat ? '#f90' : 'transparent', color: categoriaActiva === cat ? '#111' : '#555', transition: 'all 0.15s' }}
                    onMouseOver={e => { if (categoriaActiva !== cat) { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff8f0'; (e.currentTarget as HTMLElement).style.color = '#f90'; } }}
                    onMouseOut={e => { if (categoriaActiva !== cat) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#555'; } }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PRECIO */}
            <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#111', marginBottom: '14px', paddingBottom: '10px', borderBottom: '2px solid #f90', fontFamily: 'Arial Black, sans-serif' }}>Rango de precio</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Precio minimo (COP)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '13px' }}>$</span>
                    <input type="number" placeholder="0" value={precioMin} onChange={e => setPrecioMin(e.target.value)} style={{ width: '100%', padding: '9px 10px 9px 22px', border: '1.5px solid #eee', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const, color: '#333' }}
                      onFocus={e => e.target.style.borderColor = '#f90'}
                      onBlur={e => e.target.style.borderColor = '#eee'}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Precio maximo (COP)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '13px' }}>$</span>
                    <input type="number" placeholder="Sin limite" value={precioMax} onChange={e => setPrecioMax(e.target.value)} style={{ width: '100%', padding: '9px 10px 9px 22px', border: '1.5px solid #eee', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const, color: '#333' }}
                      onFocus={e => e.target.style.borderColor = '#f90'}
                      onBlur={e => e.target.style.borderColor = '#eee'}
                    />
                  </div>
                </div>
                {/* RANGOS RAPIDOS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                  <p style={{ fontSize: '11px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, marginBottom: '4px' }}>Rangos rapidos</p>
                  {[
                    { label: 'Menos de $50.000', min: '', max: '50000' },
                    { label: '$50.000 - $200.000', min: '50000', max: '200000' },
                    { label: '$200.000 - $500.000', min: '200000', max: '500000' },
                    { label: 'Mas de $500.000', min: '500000', max: '' },
                  ].map((r, i) => (
                    <button key={i} onClick={() => { setPrecioMin(r.min); setPrecioMax(r.max); }} style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid', borderColor: precioMin === r.min && precioMax === r.max ? '#f90' : '#eee', backgroundColor: precioMin === r.min && precioMax === r.max ? '#fff8f0' : 'white', color: precioMin === r.min && precioMax === r.max ? '#f90' : '#555', fontSize: '11px', fontWeight: '700', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ESTADO */}
            <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#111', marginBottom: '14px', paddingBottom: '10px', borderBottom: '2px solid #f90', fontFamily: 'Arial Black, sans-serif' }}>Estado del producto</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {estados.map(est => (
                  <button key={est} onClick={() => setEstadoActivo(est)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: estadoActivo === est ? '700' : '500', backgroundColor: estadoActivo === est ? '#f90' : 'transparent', color: estadoActivo === est ? '#111' : '#555', transition: 'all 0.15s' }}
                    onMouseOver={e => { if (estadoActivo !== est) { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff8f0'; (e.currentTarget as HTMLElement).style.color = '#f90'; } }}
                    onMouseOut={e => { if (estadoActivo !== est) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#555'; } }}
                  >
                    {estadoLabels[est]}
                  </button>
                ))}
              </div>
            </div>

            {hayFiltros && (
              <button onClick={limpiarFiltros} style={{ padding: '11px', backgroundColor: 'white', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; }}
              >
                Limpiar todos los filtros
              </button>
            )}
          </aside>

          {/* RESULTADOS */}
          <div>
            {cargando ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px' }}>
                {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '280px' }}></div>)}
              </div>
            ) : filtrados.length === 0 ? (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '80px 40px', textAlign: 'center', border: '1px solid #eee', animation: 'fadeIn 0.3s ease' }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '20px' }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <p style={{ fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>
                  {query ? `Sin resultados para "${query}"` : 'Escribe algo para buscar'}
                </p>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
                  {hayFiltros ? 'Prueba ajustando los filtros o busca otro termino' : 'Intenta con otro termino de busqueda'}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {hayFiltros && (
                    <button onClick={limpiarFiltros} style={{ backgroundColor: '#f90', color: '#111', padding: '10px 22px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                      Limpiar filtros
                    </button>
                  )}
                  <a href="/productos" style={{ backgroundColor: 'white', color: '#f90', padding: '10px 22px', borderRadius: '10px', border: '1.5px solid #f90', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>
                    Ver todos los productos
                  </a>
                </div>
              </div>
            ) : vistaGrid ? (
              <div className="prod-grid-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px', animation: 'fadeIn 0.3s ease' }}>
                {filtrados.map(p => (
                  <div key={p.id} className="prod-card" onClick={() => window.location.href = '/producto/' + p.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ height: '160px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {p.imagen_url ? (
                        <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} alt={p.nombre}
                          onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
                          onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                        />
                      ) : (
                        <div style={{ fontSize: '48px' }}>{p.emoji || '🛍️'}</div>
                      )}
                      {p.estado_producto && p.estado_producto !== 'nuevo' && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '700' }}>
                          {estadoLabels[p.estado_producto]?.replace('Usado - ', '') || 'Usado'}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px' }}>
                      <p style={{ fontSize: '11px', color: '#888', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{p.categoria}</p>
                      <p style={{ fontWeight: '600', fontSize: '13px', color: '#333', marginBottom: '8px', height: '34px', overflow: 'hidden', lineHeight: 1.3 }}>{p.nombre}</p>
                      <p style={{ fontWeight: '800', fontSize: '17px', color: '#111', marginBottom: '10px' }}>
                        ${Number(p.precio).toLocaleString('es-CO')}
                        <span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}> COP</span>
                      </p>
                      <button style={{ width: '100%', padding: '8px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', transition: 'all 0.2s' }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                      >
                        Ver producto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s ease' }}>
                {filtrados.map(p => (
                  <div key={p.id} className="prod-card" onClick={() => window.location.href = '/producto/' + p.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer', display: 'flex', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '140px', minWidth: '140px', height: '120px', backgroundColor: '#f9f9f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.imagen_url ? <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.nombre} /> : <div style={{ fontSize: '40px' }}>{p.emoji || '🛍️'}</div>}
                    </div>
                    <div style={{ flex: 1, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', margin: 0 }}>{p.categoria}</p>
                          {p.estado_producto && p.estado_producto !== 'nuevo' && (
                            <span style={{ backgroundColor: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700' }}>
                              {estadoLabels[p.estado_producto]?.replace('Usado - ', '') || 'Usado'}
                            </span>
                          )}
                        </div>
                        <p style={{ fontWeight: '600', fontSize: '15px', color: '#333', marginBottom: '6px' }}>{p.nombre}</p>
                        {p.descripcion && <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.5, margin: 0 }}>{p.descripcion.slice(0, 80)}{p.descripcion.length > 80 ? '...' : ''}</p>}
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: '20px', flexShrink: 0 }}>
                        <p style={{ fontWeight: '800', fontSize: '20px', color: '#111', marginBottom: '10px' }}>
                          ${Number(p.precio).toLocaleString('es-CO')}
                          <span style={{ fontSize: '11px', color: '#888', fontWeight: 'normal', display: 'block' }}>COP</span>
                        </p>
                        <button style={{ padding: '9px 18px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                        >
                          Ver producto
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer style={{ backgroundColor: '#111', color: '#888', padding: '20px', textAlign: 'center', marginTop: '32px' }}>
        <p style={{ fontSize: '12px', margin: 0 }}>© 2026 Driny — Todos los derechos reservados | Colombia</p>
      </footer>
    </main>
  );
}