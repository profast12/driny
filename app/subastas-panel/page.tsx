"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

const categorias = ["Electronica", "Ropa", "Hogar", "Deportes", "Juguetes", "Autos", "Arte", "Coleccionables", "Otro"];

export default function SubastasPanel() {
  const [usuario, setUsuario] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [misSubastas, setMisSubastas] = useState<any[]>([]);
  const [tab, setTab] = useState<'activas' | 'crear' | 'historial'>('activas');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [subiendoFotos, setSubiendoFotos] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Electronica',
    precio_base: '',
    incremento_minimo: '5000',
    duracion_horas: '24',
  });

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return; }
      setUsuario(session.user);
      const { data: p } = await supabase.from('usuarios').select('*').eq('email', session.user.email).single();
      if (p) {
        setPerfil(p);
        if (p.tipo !== 'vendedor') { window.location.href = '/vende-con-nosotros'; return; }
        cargarSubastas(session.user.id);
      }
      setCargando(false);
    });
  }, []);

  const cargarSubastas = async (userId: string) => {
    const { data } = await supabase.from('subastas_real').select('*').eq('vendedor_id', userId).order('created_at', { ascending: false });
    if (data) setMisSubastas(data);
  };

  const subirFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (imagenes.length + files.length > 4) { setError('Maximo 4 fotos por subasta'); return; }
    setSubiendoFotos(true);
    setError('');
    const nuevasUrls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const nombre = `subasta_${usuario.id}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('productos').upload(nombre, file, { upsert: true });
      if (uploadError) { setError('Error al subir foto'); continue; }
      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(nombre);
      nuevasUrls.push(urlData.publicUrl);
    }
    setImagenes(prev => [...prev, ...nuevasUrls]);
    setSubiendoFotos(false);
  };

  const eliminarFoto = (url: string) => {
    setImagenes(prev => prev.filter(img => img !== url));
  };

  const crearSubasta = async () => {
    if (!form.nombre || !form.descripcion || !form.precio_base) { setError('Completa todos los campos'); return; }
    if (imagenes.length === 0) { setError('Debes subir al menos 1 foto'); return; }
    setEnviando(true); setError(''); setMensaje('');
    const tiempoFin = new Date();
    tiempoFin.setHours(tiempoFin.getHours() + Number(form.duracion_horas));
    const { error: dbError } = await supabase.from('subastas_real').insert([{
      vendedor_id: usuario.id,
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      precio_base: Number(form.precio_base),
      precio_actual: Number(form.precio_base),
      incremento_minimo: Number(form.incremento_minimo),
      tiempo_fin: tiempoFin.toISOString(),
      imagenes: imagenes,
      imagen_url: imagenes[0],
      activa: true
    }]);
    if (dbError) { setError('Error al crear la subasta'); setEnviando(false); return; }
    setMensaje('Subasta creada exitosamente');
    setForm({ nombre: '', descripcion: '', categoria: 'Electronica', precio_base: '', incremento_minimo: '5000', duracion_horas: '24' });
    setImagenes([]);
    cargarSubastas(usuario.id);
    setTab('activas');
    setEnviando(false);
  };

  const cancelarSubasta = async (id: string) => {
    await supabase.from('subastas_real').update({ activa: false }).eq('id', id);
    cargarSubastas(usuario.id);
  };

  const tiempoRestante = (fin: string) => {
    const diff = new Date(fin).getTime() - new Date().getTime();
    if (diff <= 0) return 'Finalizada';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  if (cargando) return (
    <main style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white', fontSize: '16px' }}>Cargando panel...</div>
    </main>
  );

  return (
    <main style={{ backgroundColor: '#0f0f0f', minHeight: '100vh', color: 'white' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 10px rgba(255,153,0,0.3); } 50% { box-shadow: 0 0 25px rgba(255,153,0,0.6); } }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(255,153,0,0.15); }
        .btn-hover:hover { opacity: 0.85; transform: scale(0.98); }
        .foto-item:hover .foto-delete { opacity: 1 !important; }
      `}</style>

      <nav style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <span style={{ color: '#333' }}>|</span>
        <span style={{ color: '#888', fontSize: '14px' }}>Panel de Subastas</span>
        <div style={{ flex: 1 }}></div>
        <a href="/vender" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Mis ventas</a>
        <a href="/perfil" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>Mi perfil</a>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', animation: 'fadeIn 0.4s ease' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', background: 'linear-gradient(135deg, #f90, #ff6b00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Panel de Subastas
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>Gestiona tus subastas en tiempo real</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Subastas activas', valor: misSubastas.filter(s => s.activa && new Date(s.tiempo_fin) > new Date()).length, color: '#22c55e' },
            { label: 'Total subastas', valor: misSubastas.length, color: '#f90' },
            { label: 'Finalizadas', valor: misSubastas.filter(s => !s.activa || new Date(s.tiempo_fin) <= new Date()).length, color: '#888' },
          ].map((stat, i) => (
            <div key={i} className="card-hover" style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a2a', transition: 'all 0.2s' }}>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>{stat.valor}</p>
              <p style={{ fontSize: '13px', color: '#666' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
          {[
            { id: 'activas', label: 'Mis subastas' },
            { id: 'crear', label: 'Crear subasta' },
            { id: 'historial', label: 'Historial' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', backgroundColor: tab === t.id ? '#f90' : 'transparent', color: tab === t.id ? '#111' : '#666' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'activas' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {misSubastas.filter(s => s.activa && new Date(s.tiempo_fin) > new Date()).length === 0 ? (
              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #2a2a2a' }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No tienes subastas activas</p>
                <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>Crea tu primera subasta</p>
                <button onClick={() => setTab('crear')} style={{ backgroundColor: '#f90', color: '#111', padding: '12px 28px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  Crear subasta
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {misSubastas.filter(s => s.activa && new Date(s.tiempo_fin) > new Date()).map(s => (
                  <div key={s.id} className="card-hover" style={{ backgroundColor: '#1a1a1a', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2a2a2a', transition: 'all 0.2s' }}>
                    <div style={{ height: '160px', backgroundColor: '#111', overflow: 'hidden', position: 'relative' }}>
                      {s.imagenes && s.imagenes.length > 0 ? (
                        <img src={s.imagenes[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={s.nombre} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🛍️</div>
                      )}
                      <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#22c55e', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>EN VIVO</div>
                      {s.imagenes && s.imagenes.length > 1 && (
                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '3px 8px', borderRadius: '10px', fontSize: '11px' }}>+{s.imagenes.length - 1} fotos</div>
                      )}
                    </div>
                    <div style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '3px' }}>{s.nombre}</p>
                          <p style={{ fontSize: '12px', color: '#666' }}>{s.categoria}</p>
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#111', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                        <p style={{ fontSize: '11px', color: '#666', marginBottom: '3px' }}>PRECIO ACTUAL</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f90' }}>${Number(s.precio_actual).toLocaleString('es-CO')} COP</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                        <div>
                          <p style={{ color: '#666', fontSize: '11px' }}>OFERTAS</p>
                          <p style={{ fontWeight: 'bold' }}>{s.total_ofertas}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#666', fontSize: '11px' }}>TIEMPO</p>
                          <p style={{ fontWeight: 'bold', color: '#f90', fontSize: '12px' }}>{tiempoRestante(s.tiempo_fin)}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a href={`/subasta/${s.id}`} target="_blank" style={{ flex: 1, textAlign: 'center', backgroundColor: '#f90', color: '#111', padding: '9px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>Ver subasta</a>
                        <button onClick={() => cancelarSubasta(s.id)} style={{ padding: '9px 12px', backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#888', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'crear' && (
          <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '600px' }}>
            <div style={{ backgroundColor: '#1a1a1a', borderRadius: '16px', padding: '32px', border: '1px solid #2a2a2a' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Nueva subasta</h2>

              {mensaje && <div style={{ backgroundColor: '#22c55e22', border: '1px solid #22c55e44', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '14px', color: '#22c55e' }}>✓ {mensaje}</div>}
              {error && <div style={{ backgroundColor: '#ef444422', border: '1px solid #ef444444', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '14px', color: '#ef4444' }}>✕ {error}</div>}

              {/* FOTOS */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Fotos del producto ({imagenes.length}/4) — Minimo 1, maximo 4
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  {imagenes.map((url, i) => (
                    <div key={i} className="foto-item" style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: i === 0 ? '2px solid #f90' : '1px solid #2a2a2a' }}>
                      <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={'foto ' + (i + 1)} />
                      {i === 0 && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,153,0,0.9)', padding: '3px', textAlign: 'center', fontSize: '9px', fontWeight: 'bold', color: '#111' }}>PRINCIPAL</div>
                      )}
                      <button
                        className="foto-delete"
                        onClick={() => eliminarFoto(url)}
                        style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {imagenes.length < 4 && (
                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{ aspectRatio: '1', borderRadius: '8px', border: '2px dashed #2a2a2a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#111', transition: 'all 0.2s', gap: '4px' }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = '#f90'}
                      onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a'}
                    >
                      <span style={{ fontSize: '20px', color: '#444' }}>+</span>
                      <span style={{ fontSize: '9px', color: '#444' }}>{subiendoFotos ? 'Subiendo...' : 'Agregar'}</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={subirFotos}
                  style={{ display: 'none' }}
                />
                <p style={{ fontSize: '11px', color: '#555' }}>La primera foto sera la imagen principal de la subasta</p>
              </div>

              {[
                { label: 'Nombre del producto', key: 'nombre', type: 'text', placeholder: 'Ej: iPhone 14 Pro 256GB' },
                { label: 'Precio base (COP)', key: 'precio_base', type: 'number', placeholder: 'Ej: 500000' },
                { label: 'Incremento minimo (COP)', key: 'incremento_minimo', type: 'number', placeholder: 'Ej: 5000' },
                { label: 'Duracion en horas', key: 'duracion_horas', type: 'number', placeholder: 'Ej: 24' },
              ].map(campo => (
                <div key={campo.key} style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{campo.label}</label>
                  <input
                    type={campo.type}
                    placeholder={campo.placeholder}
                    value={form[campo.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [campo.key]: e.target.value }))}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2a2a2a', backgroundColor: '#111', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}
                    onFocus={e => e.target.style.border = '1px solid #f90'}
                    onBlur={e => e.target.style.border = '1px solid #2a2a2a'}
                  />
                </div>
              ))}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categoria</label>
                <select value={form.categoria} onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value }))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2a2a2a', backgroundColor: '#111', color: 'white', fontSize: '14px', outline: 'none' }}>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Descripcion</label>
                <textarea
                  placeholder="Describe el producto: estado, caracteristicas, que incluye..."
                  value={form.descripcion}
                  onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={4}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #2a2a2a', backgroundColor: '#111', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const }}
                  onFocus={e => e.target.style.border = '1px solid #f90'}
                  onBlur={e => e.target.style.border = '1px solid #2a2a2a'}
                />
              </div>

              <button onClick={crearSubasta} disabled={enviando || subiendoFotos} style={{ width: '100%', padding: '14px', backgroundColor: '#f90', color: '#111', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: enviando || subiendoFotos ? 'not-allowed' : 'pointer', opacity: enviando || subiendoFotos ? 0.7 : 1 }}>
                {enviando ? 'Creando subasta...' : subiendoFotos ? 'Subiendo fotos...' : 'Publicar subasta'}
              </button>
            </div>
          </div>
        )}

        {tab === 'historial' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {misSubastas.filter(s => !s.activa || new Date(s.tiempo_fin) <= new Date()).length === 0 ? (
              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #2a2a2a' }}>
                <p style={{ color: '#666', fontSize: '15px' }}>No tienes subastas finalizadas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {misSubastas.filter(s => !s.activa || new Date(s.tiempo_fin) <= new Date()).map(s => (
                  <div key={s.id} style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2a2a', display: 'flex' }}>
                    <div style={{ width: '80px', height: '80px', flexShrink: 0, overflow: 'hidden', backgroundColor: '#111' }}>
                      {s.imagenes && s.imagenes.length > 0 ? (
                        <img src={s.imagenes[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🛍️</div>
                      )}
                    </div>
                    <div style={{ flex: 1, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{s.nombre}</p>
                        <p style={{ fontSize: '12px', color: '#666' }}>{s.categoria} — {s.total_ofertas} ofertas</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 'bold', color: '#f90' }}>${Number(s.precio_actual).toLocaleString('es-CO')} COP</p>
                        <a href={'/subasta-resultado?id=' + s.id} style={{ fontSize: '12px', color: '#f90', textDecoration: 'none', marginTop: '4px', display: 'block' }}>Ver resultado</a>
                      </div>
                    </div>
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