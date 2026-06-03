"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

export default function Perfil() {
  const [usuario, setUsuario] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState("info");
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return; }
      setUsuario(session.user);
      cargarDatos(session.user);
    });
  }, []);

  const cargarDatos = async (user: any) => {
    const { data: perfilData } = await supabase
      .from('usuarios').select('*').eq('auth_id', user.id).maybeSingle();

    if (perfilData) {
      setPerfil(perfilData);
      setNombre(perfilData.nombre || "");
      setUsername(perfilData.username || "");
      setAvatarUrl(perfilData.avatar_url || "");
    } else {
      const { data: perfilEmail } = await supabase
        .from('usuarios').select('*').eq('email', user.email).maybeSingle();
      if (perfilEmail) {
        setPerfil(perfilEmail);
        setNombre(perfilEmail.nombre || "");
        setUsername(perfilEmail.username || "");
        setAvatarUrl(perfilEmail.avatar_url || "");
        await supabase.from('usuarios').update({ auth_id: user.id }).eq('id', perfilEmail.id);
      }
    }

    const { data: pedidosData } = await supabase
      .from('pedidos').select('*').eq('comprador_id', user.id)
      .order('created_at', { ascending: false });
    if (pedidosData) setPedidos(pedidosData);

    const { data: productosData } = await supabase
      .from('productos').select('*').eq('vendedor_id', user.id)
      .order('created_at', { ascending: false });
    if (productosData) setProductos(productosData);

    setCargando(false);
  };

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !perfil) return;
    setSubiendoFoto(true);
    setError("");
    const extension = file.name.split('.').pop();
    const nombreArchivo = `avatar_${perfil.id}_${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('avatares').upload(nombreArchivo, file, { upsert: true });
    if (uploadError) { setError("Error al subir la foto"); setSubiendoFoto(false); return; }
    const { data: urlData } = supabase.storage.from('avatares').getPublicUrl(nombreArchivo);
    const url = urlData.publicUrl;
    setAvatarUrl(url);
    await supabase.from('usuarios').update({ avatar_url: url }).eq('id', perfil.id);
    setSubiendoFoto(false);
    setMensaje("Foto actualizada correctamente");
    setTimeout(() => setMensaje(""), 3000);
  };

  const guardarInfo = async () => {
    if (!perfil) return;
    setGuardando(true); setError(""); setMensaje("");

    if (username !== perfil?.username) {
      if (perfil?.username_updated_at) {
        const dias = Math.floor((new Date().getTime() - new Date(perfil.username_updated_at).getTime()) / (1000 * 60 * 60 * 24));
        if (dias < 30) {
          setError(`Puedes cambiar tu username en ${30 - dias} dias`);
          setGuardando(false); return;
        }
      }
      const { error: dbError } = await supabase.from('usuarios')
        .update({ nombre, username, username_updated_at: new Date().toISOString() })
        .eq('id', perfil.id);
      if (dbError) {
        setError(dbError.message.includes('unique') ? 'Ese username ya esta en uso' : 'Error al guardar');
        setGuardando(false); return;
      }
    } else {
      const { error: dbError } = await supabase.from('usuarios')
        .update({ nombre }).eq('id', perfil.id);
      if (dbError) { setError('Error al guardar'); setGuardando(false); return; }
    }

    setPerfil((prev: any) => ({ ...prev, nombre, username }));
    setMensaje("Informacion actualizada correctamente");
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getBadgePedido = (estado: string) => {
    if (estado === 'pagado') return { bg: '#d1fae5', color: '#065f46', label: 'Pagado' };
    if (estado === 'preparando') return { bg: '#fef3c7', color: '#92400e', label: 'Preparando' };
    if (estado === 'enviado') return { bg: '#dbeafe', color: '#1e40af', label: 'Enviado' };
    if (estado === 'entregado') return { bg: '#dcfce7', color: '#166534', label: 'Entregado' };
    if (estado === 'cancelado') return { bg: '#fee2e2', color: '#991b1b', label: 'Cancelado' };
    return { bg: '#f3f4f6', color: '#666', label: estado };
  };

  if (cargando) return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '14px 24px' }}>
        <span style={{ fontSize: '22px', fontWeight: '900', color: '#111', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#888' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #f90', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }}></div>
          <p style={{ fontSize: '14px' }}>Cargando tu perfil...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );

  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .input-field:focus { border-color: #f90 !important; box-shadow: 0 0 0 3px rgba(255,153,0,0.1) !important; }
        .tab-btn:hover { color: #f90 !important; }
        .prod-row:hover { background-color: #fff8f0 !important; }
        .avatar-wrap:hover .avatar-overlay { opacity: 1 !important; }
        @media (max-width: 768px) {
          .perfil-header { flex-direction: column !important; text-align: center !important; align-items: center !important; }
          .perfil-meta { margin-left: 0 !important; text-align: center !important; }
          .tabs-row { overflow-x: auto; }
        }
      `}</style>

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#111', letterSpacing: '-1px', fontFamily: 'Arial Black, sans-serif' }}>DRINY</span>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#f90', borderRadius: '50%', marginBottom: '3px', marginLeft: '1px' }}></div>
            </div>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #f90, #ff6b00)', borderRadius: '2px', marginTop: '1px' }}></div>
          </a>
          <div style={{ flex: 1 }}></div>
          <a href="/productos" style={{ color: '#666', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Productos</a>
          <a href="/carrito" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e5e5', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Carrito
          </a>
          <button onClick={cerrarSesion} style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', color: '#888', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Cerrar sesion
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 20px', animation: 'fadeIn 0.4s ease' }}>

        {/* HEADER PERFIL */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
          <div className="perfil-header" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>

            {/* AVATAR */}
            <div className="avatar-wrap" style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
              <div style={{ width: '88px', height: '88px', borderRadius: '50%', backgroundColor: '#f90', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', color: '#111', border: '3px solid #ffe0b2', fontFamily: 'Arial Black, sans-serif' }}>
                {avatarUrl ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" /> : (perfil?.nombre || usuario?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              {subiendoFoto && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={subirFoto} style={{ display: 'none' }} />
            </div>

            {/* INFO */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>{perfil?.nombre || 'Usuario'}</h1>
                <div style={{ backgroundColor: perfil?.tipo === 'vendedor' ? '#fff8f0' : '#f0fdf4', color: perfil?.tipo === 'vendedor' ? '#f90' : '#22c55e', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', border: perfil?.tipo === 'vendedor' ? '1px solid #ffe0b2' : '1px solid #bbf7d0' }}>
                  {perfil?.tipo === 'vendedor' ? 'Vendedor' : 'Comprador'}
                </div>
              </div>
              {perfil?.username && <p style={{ color: '#f90', fontSize: '14px', fontWeight: '700', margin: '0 0 4px' }}>@{perfil.username}</p>}
              <p style={{ color: '#888', fontSize: '13px', margin: '0 0 8px' }}>{usuario?.email}</p>
              <p style={{ color: '#bbb', fontSize: '12px', margin: 0 }}>
                Miembro desde {new Date(usuario?.created_at).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* STATS */}
            <div className="perfil-meta" style={{ marginLeft: 'auto', display: 'flex', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '12px 16px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '22px', fontWeight: '900', color: '#f90', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>{productos.length}</p>
                <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Productos</p>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 16px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                <p style={{ fontSize: '22px', fontWeight: '900', color: '#f90', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>{pedidos.length}</p>
                <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Pedidos</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs-row" style={{ display: 'flex', gap: '4px', marginBottom: '20px', backgroundColor: 'white', borderRadius: '12px', padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee', width: 'fit-content' }}>
  {[
    { id: 'info', label: 'Mi informacion', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, mostrar: true },
    { id: 'pedidos', label: 'Mis pedidos', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, mostrar: perfil?.tipo !== 'vendedor' },
    { id: 'productos', label: 'Mis productos', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, mostrar: perfil?.tipo === 'vendedor' },
  ].filter(t => t.mostrar).map(t => (
    <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)} style={{ padding: '9px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: tab === t.id ? '#111' : '#888', backgroundColor: tab === t.id ? '#f90' : 'transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
      {t.icon}{t.label}
    </button>
  ))}
</div>

        {/* TAB INFO */}
        {tab === 'info' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f90' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Mi informacion</h2>
            </div>

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '500px' }}>

              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Nombre completo</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre completo" className="input-field" style={{ width: '100%', padding: '12px 14px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Nombre de usuario</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#f90', fontWeight: '700', fontSize: '14px' }}>@</span>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9_]/g, ''))} placeholder="tunombredeusuario" className="input-field" style={{ width: '100%', padding: '12px 14px 12px 32px', border: '2px solid #eee', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const, color: '#333', backgroundColor: 'white' }} />
                </div>
                <p style={{ fontSize: '11px', color: '#bbb', marginTop: '5px' }}>Solo letras, numeros y guion bajo. Cambiable cada 30 dias.</p>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Correo electronico</label>
                <input type="email" value={usuario?.email || ''} disabled style={{ width: '100%', padding: '12px 14px', border: '2px solid #f0f0f0', borderRadius: '10px', fontSize: '14px', backgroundColor: '#fafafa', color: '#bbb', boxSizing: 'border-box' as const }} />
                <p style={{ fontSize: '11px', color: '#bbb', marginTop: '5px' }}>El correo no se puede cambiar</p>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Tipo de cuenta</label>
                <div style={{ padding: '12px 14px', border: '2px solid #f0f0f0', borderRadius: '10px', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: perfil?.tipo === 'vendedor' ? '#f90' : '#22c55e' }}></div>
                  <span style={{ fontSize: '14px', color: '#555', fontWeight: '600', textTransform: 'capitalize' }}>{perfil?.tipo || 'comprador'}</span>
                </div>
              </div>

              <div style={{ paddingTop: '8px' }}>
                <button onClick={guardarInfo} disabled={guardando} style={{ padding: '13px 28px', background: guardando ? '#f0f0f0' : 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '14px', color: guardando ? '#bbb' : '#111', cursor: guardando ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'Arial Black, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {guardando ? (
                    <>
                      <div style={{ width: '14px', height: '14px', border: '2px solid #bbb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                      Guardando...
                    </>
                  ) : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB PEDIDOS */}
        {tab === 'pedidos' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f90' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Mis pedidos ({pedidos.length})</h2>
            </div>

            {pedidos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>No has realizado pedidos todavia</p>
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>Explora nuestros productos y haz tu primera compra</p>
                <a href="/productos" style={{ backgroundColor: '#f90', color: '#111', padding: '11px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>Ver productos</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pedidos.map(p => {
                  const badge = getBadgePedido(p.estado);
                  return (
                    <div key={p.id} className="prod-row" onClick={() => window.location.href = '/mis-pedidos'} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f90" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '700', fontSize: '14px', color: '#333', marginBottom: '3px' }}>Pedido #{p.id.slice(0, 8).toUpperCase()}</p>
                        <p style={{ fontSize: '12px', color: '#888' }}>{new Date(p.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: '800', fontSize: '15px', color: '#111', marginBottom: '4px' }}>${Number(p.total).toLocaleString('es-CO')} COP</p>
                        <div style={{ backgroundColor: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'inline-block' }}>{badge.label}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  );
                })}
                <a href="/mis-pedidos" style={{ display: 'block', textAlign: 'center', padding: '12px', color: '#f90', border: '1.5px solid #f90', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '13px', marginTop: '4px', transition: 'all 0.2s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                >
                  Ver seguimiento detallado
                </a>
              </div>
            )}
          </div>
        )}

        {/* TAB PRODUCTOS */}
        {tab === 'productos' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f90' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>Mis productos ({productos.length})</h2>
              <a href="/vender" style={{ backgroundColor: '#f90', color: '#111', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '13px' }}>+ Publicar</a>
            </div>

            {productos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>No has publicado productos todavia</p>
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>Empieza a vender hoy mismo de forma gratuita</p>
                <a href="/vender" style={{ backgroundColor: '#f90', color: '#111', padding: '11px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>Publicar primer producto</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {productos.map(p => (
                  <div key={p.id} className="prod-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee', transition: 'all 0.2s' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '10px', backgroundColor: 'white', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', flexShrink: 0 }}>
                      {p.imagen_url ? <img src={p.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.nombre} /> : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '700', fontSize: '14px', color: '#333', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</p>
                      <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{p.categoria}</p>
                    </div>
                    <p style={{ fontWeight: '800', fontSize: '15px', color: '#111', flexShrink: 0 }}>${Number(p.precio).toLocaleString('es-CO')} <span style={{ fontSize: '11px', color: '#888', fontWeight: 'normal' }}>COP</span></p>
                    <a href={'/producto/' + p.id} style={{ padding: '7px 14px', backgroundColor: 'white', color: '#f90', border: '1.5px solid #f90', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '700', flexShrink: 0, transition: 'all 0.2s' }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                    >
                      Ver
                    </a>
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