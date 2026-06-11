"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

const categorias = ["Electronica", "Ropa", "Hogar", "Deportes", "Juguetes", "Autos", "Arte", "Coleccionables", "Otro"];

const estadosProducto = [
  { valor: 'nuevo', label: 'Nuevo', desc: 'Sin uso, en empaque original' },
  { valor: 'usado_como_nuevo', label: 'Usado - Como nuevo', desc: 'Usado pero en perfectas condiciones' },
  { valor: 'usado_buen_estado', label: 'Usado - Buen estado', desc: 'Con uso normal, sin danos visibles' },
  { valor: 'usado_aceptable', label: 'Usado - Aceptable', desc: 'Con senales de uso, funciona correctamente' },
];

const disponibilidades = [
  { valor: 'disponible', label: 'Disponible', desc: 'Listo para enviar' },
  { valor: 'bajo_pedido', label: 'Bajo pedido', desc: 'Se consigue por encargo' },
  { valor: 'ultima_unidad', label: 'Ultima unidad', desc: 'Solo queda una disponible' },
  { valor: 'pausado', label: 'Pausado', desc: 'Temporalmente no disponible' },
];

export default function Vender() {
  const [usuario, setUsuario] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [misProductos, setMisProductos] = useState<any[]>([]);
  const [publicando, setPublicando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [subiendoFotos, setSubiendoFotos] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nombre: '',
    precio: '',
    categoria: 'Electronica',
    descripcion: '',
    estado_producto: 'nuevo',
    disponibilidad: 'disponible',
    sku: '1',
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return; }
      setUsuario(session.user);
      const { data: p } = await supabase.from('usuarios').select('*').eq('auth_id', session.user.id).maybeSingle();
      if (p) {
        setPerfil(p);
        if (p.tipo !== 'vendedor') { window.location.href = '/vende-con-nosotros'; return; }
        cargarProductos(session.user.id);
      }
      setCargando(false);
    });
  }, []);

  const cargarProductos = async (userId: string) => {
    const { data } = await supabase.from('productos').select('*').eq('vendedor_id', userId).order('created_at', { ascending: false });
    if (data) setMisProductos(data);
  };

  const subirFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (imagenes.length + files.length > 4) { setError('Maximo 4 fotos por producto'); return; }
    setSubiendoFotos(true); setError('');
    const nuevas: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const nombre = `prod_${usuario.id}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('productos').upload(nombre, file, { upsert: true });
      if (upErr) { setError('Error al subir foto'); continue; }
      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(nombre);
      nuevas.push(urlData.publicUrl);
    }
    setImagenes(prev => [...prev, ...nuevas]);
    setSubiendoFotos(false);
  };

  const eliminarFoto = (url: string) => setImagenes(prev => prev.filter(i => i !== url));

  const publicarProducto = async () => {
    if (!form.nombre.trim() || !form.precio) { setError('Nombre y precio son obligatorios'); return; }
    if (imagenes.length === 0) { setError('Debes subir al menos 1 foto'); return; }
    if (Number(form.sku) < 1) { setError('El SKU debe ser al menos 1'); return; }
    setPublicando(true); setError(''); setMensaje('');

    const { error: dbErr } = await supabase.from('productos').insert([{
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      categoria: form.categoria,
      descripcion: form.descripcion.trim(),
      imagen_url: imagenes[0],
      imagenes: imagenes,
      vendedor_id: usuario.id,
      estado_producto: form.estado_producto,
      disponibilidad: form.disponibilidad,
      sku: Number(form.sku),
    }]);

    if (dbErr) { setError('Error al publicar el producto'); setPublicando(false); return; }
    setMensaje('Producto publicado exitosamente');
    setForm({ nombre: '', precio: '', categoria: 'Electronica', descripcion: '', estado_producto: 'nuevo', disponibilidad: 'disponible', sku: '1' });
    setImagenes([]);
    cargarProductos(usuario.id);
    setPublicando(false);
    setTimeout(() => setMensaje(''), 4000);
  };

  const eliminarProducto = async (id: string) => {
    await supabase.from('productos').delete().eq('id', id);
    cargarProductos(usuario.id);
  };

  if (cargando) return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#888' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f90', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }}></div>
        <p>Cargando panel...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .input-v:focus { border-color: #f90 !important; box-shadow: 0 0 0 3px rgba(255,153,0,0.1) !important; }
        .estado-btn:hover { border-color: #f90 !important; }
        .foto-item:hover .foto-del { opacity: 1 !important; }
        .prod-row:hover { background-color: #fff8f0 !important; }
        @media (max-width: 900px) {
          .vender-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {confirmarEliminar && (
  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
    <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '36px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease', textAlign: 'center' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef2f2', border: '2px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111', marginBottom: '10px', fontFamily: 'Arial Black, sans-serif' }}>
        Eliminar publicacion
      </h3>
      <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '24px' }}>
        Esta accion es permanente y no se puede deshacer. El producto dejara de ser visible para los compradores.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={async () => {
            await supabase.from('productos').delete().eq('id', confirmarEliminar);
            cargarProductos(usuario.id);
            setConfirmarEliminar(null);
          }}
          style={{ width: '100%', padding: '13px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Arial Black, sans-serif' }}
          onMouseOver={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626'}
          onMouseOut={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#ef4444'}
        >
          Si, eliminar publicacion
        </button>
        <button
          onClick={() => setConfirmarEliminar(null)}
          style={{ width: '100%', padding: '13px', backgroundColor: 'white', color: '#333', border: '2px solid #eee', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#eee'; (e.currentTarget as HTMLElement).style.color = '#333'; }}
        >
          No, mantener publicacion
        </button>
      </div>
    </div>
  </div>
)}

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#111', letterSpacing: '-1px', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#f90', borderRadius: '50%', marginBottom: '3px', marginLeft: '1px' }}></div>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #f90, #ff6b00)', borderRadius: '2px', marginTop: '1px' }}></div>
          </a>
          <span style={{ color: '#ddd' }}>|</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#555' }}>Panel de vendedor</span>
          <div style={{ flex: 1 }}></div>
          <a href="/subastas-panel" style={{ color: '#666', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Mis subastas</a>
          <a href="/perfil" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '900', color: '#111', border: '2px solid #ffe0b2' }}>
              {perfil?.avatar_url ? <img src={perfil.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (perfil?.nombre || 'V').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#f90' }}>{perfil?.username || perfil?.nombre || 'Vendedor'}</span>
          </a>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px', animation: 'fadeIn 0.4s ease' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111', marginBottom: '6px', fontFamily: 'Arial Black, sans-serif' }}>Panel de vendedor</h1>
          <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Publica y administra tus productos en Driny</p>
        </div>

        <div className="vender-grid" style={{ display: 'grid', gridTemplateColumns: '520px 1fr', gap: '24px', alignItems: 'flex-start' }}>

          {/* FORMULARIO */}
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111', marginBottom: '24px', paddingBottom: '14px', borderBottom: '2px solid #f90', fontFamily: 'Arial Black, sans-serif' }}>
              Publicar producto
            </h2>

            {mensaje && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <p style={{ fontSize: '13px', color: '#22c55e', margin: 0, fontWeight: '600' }}>{mensaje}</p>
              </div>
            )}
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* FOTOS */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                Fotos del producto <span style={{ color: '#ef4444' }}>*</span> <span style={{ color: '#bbb', fontWeight: 'normal' }}>({imagenes.length}/4 — min. 1)</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {imagenes.map((url, i) => (
                  <div key={i} className="foto-item" style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: i === 0 ? '2px solid #f90' : '1px solid #eee' }}>
                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={'foto ' + (i + 1)} />
                    {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,153,0,0.9)', padding: '3px', textAlign: 'center', fontSize: '9px', fontWeight: '700', color: '#111' }}>PRINCIPAL</div>}
                    <button className="foto-del" onClick={() => eliminarFoto(url)} style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>✕</button>
                  </div>
                ))}
                {imagenes.length < 4 && (
                  <div onClick={() => fileRef.current?.click()} style={{ aspectRatio: '1', borderRadius: '10px', border: '2px dashed #e5e5e5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#fafafa', gap: '4px', transition: 'all 0.2s' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f90'; (e.currentTarget as HTMLElement).style.backgroundColor = '#fff8f0'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5'; (e.currentTarget as HTMLElement).style.backgroundColor = '#fafafa'; }}
                  >
                    {subiendoFotos ? (
                      <div style={{ width: '20px', height: '20px', border: '2px solid #f90', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span style={{ fontSize: '10px', color: '#bbb' }}>Agregar</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={subirFotos} style={{ display: 'none' }} />
              <p style={{ fontSize: '11px', color: '#bbb', marginTop: '6px' }}>La primera foto sera la imagen principal</p>
            </div>

            {/* NOMBRE */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Nombre del producto <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" placeholder="Ej: iPhone 14 Pro 256GB Morado" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="input-v" style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }} />
            </div>

            {/* PRECIO Y SKU */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Precio COP <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '13px', fontWeight: '700' }}>$</span>
                  <input type="number" placeholder="0" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} className="input-v" style={{ width: '100%', padding: '12px 14px 12px 26px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>SKU (unidades)</label>
                <input type="number" placeholder="1" min="1" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} className="input-v" style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }} />
              </div>
            </div>

            {/* CATEGORIA */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Categoria</label>
              <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} className="input-v" style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white', cursor: 'pointer' }}>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* ESTADO DEL PRODUCTO */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Estado del producto</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {estadosProducto.map(e => (
                  <div key={e.valor} className="estado-btn" onClick={() => setForm(p => ({ ...p, estado_producto: e.valor }))} style={{ padding: '10px 14px', borderRadius: '10px', border: form.estado_producto === e.valor ? '2px solid #f90' : '2px solid #eee', backgroundColor: form.estado_producto === e.valor ? '#fff8f0' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: form.estado_producto === e.valor ? '5px solid #f90' : '2px solid #ddd', flexShrink: 0, transition: 'all 0.15s' }}></div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: form.estado_producto === e.valor ? '#111' : '#555', margin: 0, marginBottom: '2px' }}>{e.label}</p>
                      <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DISPONIBILIDAD */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Disponibilidad</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {disponibilidades.map(d => (
                  <div key={d.valor} className="estado-btn" onClick={() => setForm(p => ({ ...p, disponibilidad: d.valor }))} style={{ padding: '10px 12px', borderRadius: '10px', border: form.disponibilidad === d.valor ? '2px solid #f90' : '2px solid #eee', backgroundColor: form.disponibilidad === d.valor ? '#fff8f0' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: form.disponibilidad === d.valor ? '#f90' : '#555', margin: 0, marginBottom: '2px' }}>{d.label}</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DESCRIPCION */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Descripcion</label>
              <textarea placeholder="Describe detalladamente tu producto: caracteristicas, accesorios incluidos, garantia, etc..." value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={4} className="input-v" style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white', resize: 'vertical', fontFamily: 'Arial, sans-serif' }} />
            </div>

            <button onClick={publicarProducto} disabled={publicando || subiendoFotos} style={{ width: '100%', padding: '14px', background: publicando || subiendoFotos ? '#f0f0f0' : 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '15px', color: publicando || subiendoFotos ? '#bbb' : '#111', cursor: publicando || subiendoFotos ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'Arial Black, sans-serif' }}>
              {publicando ? 'Publicando...' : subiendoFotos ? 'Subiendo fotos...' : 'Publicar producto'}
            </button>
          </div>

          {/* MIS PRODUCTOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #f90' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Mis productos</h2>
                <span style={{ backgroundColor: '#fff8f0', color: '#f90', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', border: '1px solid #ffe0b2' }}>{misProductos.length}</span>
              </div>

              {misProductos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '14px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>No has publicado productos</p>
                  <p style={{ fontSize: '13px', color: '#888' }}>Usa el formulario para publicar tu primer producto</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {misProductos.map(p => (
                    <div key={p.id} className="prod-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee', transition: 'all 0.2s' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '8px', backgroundColor: 'white', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', flexShrink: 0 }}>
                        {p.imagen_url ? <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.nombre} /> : (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '700', fontSize: '13px', color: '#333', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</p>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#888' }}>{p.categoria}</span>
                          <span style={{ color: '#ddd' }}>·</span>
                          <span style={{ fontSize: '11px', color: p.disponibilidad === 'disponible' ? '#22c55e' : p.disponibilidad === 'pausado' ? '#ef4444' : '#f90', fontWeight: '700' }}>
                            {disponibilidades.find(d => d.valor === p.disponibilidad)?.label || p.disponibilidad}
                          </span>
                          <span style={{ color: '#ddd' }}>·</span>
                          <span style={{ fontSize: '11px', color: '#888' }}>SKU: {p.sku}</span>
<span style={{ color: '#ddd' }}>·</span>
<span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '700' }}>
  {p.cantidad_vendida || 0} vendido{(p.cantidad_vendida || 0) !== 1 ? 's' : ''}
</span>
                        </div>
                      </div>
                      <p style={{ fontWeight: '800', fontSize: '14px', color: '#111', flexShrink: 0 }}>${Number(p.precio).toLocaleString('es-CO')}</p>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <a href={'/producto/' + p.id} style={{ padding: '6px 12px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '700', transition: 'all 0.2s' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                        >Ver</a>
                        <button onClick={() => setConfirmarEliminar(p.id)} style={{ padding: '6px 12px', backgroundColor: 'white', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', transition: 'all 0.2s' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ef4444'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                        >Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { label: 'Total productos', valor: misProductos.length, color: '#f90' },
{ label: 'Disponibles', valor: misProductos.filter(p => p.disponibilidad === 'disponible').length, color: '#22c55e' },
{ label: 'Total vendidos', valor: misProductos.reduce((a, p) => a + (Number(p.cantidad_vendida) || 0), 0), color: '#3b82f6' },
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <p style={{ fontSize: '24px', fontWeight: '900', color: stat.color, margin: 0, fontFamily: 'Arial Black, sans-serif' }}>{stat.valor}</p>
                  <p style={{ fontSize: '11px', color: '#888', margin: 0, marginTop: '4px' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}