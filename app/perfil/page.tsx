"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

export default function Perfil() {
  const [usuario, setUsuario] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [compras, setCompras] = useState<any[]>([]);
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
      if (!session) {
        window.location.href = '/login';
        return;
      }
      setUsuario(session.user);
      cargarDatos(session.user);
    });
  }, []);

  const cargarDatos = async (user: any) => {
    const { data: perfilData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', user.email)
      .single();
    if (perfilData) {
      setPerfil(perfilData);
      setNombre(perfilData.nombre || "");
      setUsername(perfilData.username || "");
      setAvatarUrl(perfilData.avatar_url || "");
    }

    const { data: carritoData } = await supabase
      .from('carrito')
      .select('*, productos(*)')
      .eq('usuario_id', user.id);
    if (carritoData) setCompras(carritoData);

    const { data: productosData } = await supabase
      .from('productos')
      .select('*')
      .eq('vendedor_id', user.id)
      .order('created_at', { ascending: false });
    if (productosData) setProductos(productosData);

    setCargando(false);
  };

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoFoto(true);
    const extension = file.name.split('.').pop();
    const nombreArchivo = `${usuario.id}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('avatares')
      .upload(nombreArchivo, file, { upsert: true });

    if (uploadError) {
      setError("Error al subir la foto");
      setSubiendoFoto(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('avatares')
      .getPublicUrl(nombreArchivo);

    const url = urlData.publicUrl;
    setAvatarUrl(url);

    await supabase
      .from('usuarios')
      .update({ avatar_url: url })
      .eq('email', usuario.email);

    setSubiendoFoto(false);
    setMensaje("¡Foto actualizada correctamente!");
    setTimeout(() => setMensaje(""), 3000);
  };

  const guardarInfo = async () => {
    setGuardando(true);
    setError("");
    setMensaje("");

    const { error: dbError } = await supabase
      .from('usuarios')
      .update({ nombre, username })
      .eq('email', usuario.email);

    if (dbError) {
      if (dbError.message.includes('unique')) {
        setError("Ese nombre de usuario ya está en uso");
      } else {
        setError("Error al guardar los cambios");
      }
      setGuardando(false);
      return;
    }

    setMensaje("¡Información actualizada correctamente!");
    setGuardando(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (cargando) return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#111', padding: '14px 24px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>Cargando perfil...</div>
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
        justifyContent: 'space-between'
      }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/carrito" style={{ color: '#f90', textDecoration: 'none', fontSize: '20px' }}>🛒</a>
          <button onClick={cerrarSesion} style={{
            backgroundColor: 'transparent',
            border: '1px solid #666',
            color: '#aaa',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }}>Cerrar sesión</button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* HEADER PERFIL */}
        <div style={{
          backgroundColor: '#111',
          borderRadius: '16px',
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '24px',
          color: 'white'
        }}>
          {/* FOTO */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundColor: '#f90',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#111',
                cursor: 'pointer',
                overflow: 'hidden',
                border: '3px solid #f90'
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                perfil?.nombre?.charAt(0).toUpperCase() || usuario?.email?.charAt(0).toUpperCase()
              )}
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#f90',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >📷</div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={subirFoto}
              style={{ display: 'none' }}
            />
          </div>

          <div>
            {subiendoFoto && <p style={{ color: '#f90', fontSize: '13px', marginBottom: '4px' }}>Subiendo foto...</p>}
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>
              {perfil?.nombre || 'Usuario'}
            </h1>
            {perfil?.username && (
              <p style={{ color: '#f90', fontSize: '14px', marginBottom: '4px' }}>@{perfil.username}</p>
            )}
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>{usuario?.email}</p>
            <span style={{
              backgroundColor: '#f90',
              color: '#111',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {perfil?.tipo === 'vendedor' ? '🏪 Vendedor' : '🛒 Comprador'}
            </span>
          </div>

          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ color: '#aaa', fontSize: '13px' }}>Miembro desde</p>
            <p style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {new Date(usuario?.created_at).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { id: 'info', label: '👤 Mi información' },
            { id: 'compras', label: '🛒 Mis compras' },
            { id: 'productos', label: '📦 Mis productos' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: tab === t.id ? 'bold' : 'normal',
                backgroundColor: tab === t.id ? '#111' : 'white',
                color: tab === t.id ? '#f90' : '#666',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: INFO */}
        {tab === 'info' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Mi información</h3>

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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                Nombre completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px',
                  border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.border = '2px solid #f90'}
                onBlur={e => e.target.style.border = '2px solid #e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                Nombre de usuario
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: '#888', fontSize: '15px'
                }}>@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="tunombredeusuario"
                  style={{
                    width: '100%', padding: '12px 12px 12px 28px', borderRadius: '8px',
                    border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.border = '2px solid #f90'}
                  onBlur={e => e.target.style.border = '2px solid #e5e7eb'}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Solo letras, números y guiones bajos</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={usuario?.email}
                disabled
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px',
                  border: '2px solid #e5e7eb', fontSize: '15px',
                  backgroundColor: '#f3f4f6', color: '#888', boxSizing: 'border-box'
                }}
              />
              <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>El correo no se puede cambiar</p>
            </div>

            <button
              onClick={guardarInfo}
              disabled={guardando}
              style={{
                padding: '12px 28px',
                backgroundColor: guardando ? '#ccc' : '#f90',
                border: 'none', borderRadius: '8px',
                fontWeight: 'bold', fontSize: '15px',
                cursor: guardando ? 'not-allowed' : 'pointer'
              }}
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}

        {/* TAB: COMPRAS */}
        {tab === 'compras' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
              Mis compras ({compras.length})
            </h3>
            {compras.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                <p style={{ marginBottom: '16px' }}>No has realizado compras todavía</p>
                <a href="/productos" style={{ color: '#f90', textDecoration: 'none', fontWeight: 'bold' }}>Ver productos</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {compras.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '12px'
                  }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '10px',
                      backgroundColor: 'white', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '28px'
                    }}>{item.productos?.emoji || '🛍️'}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.productos?.nombre}</p>
                      <p style={{ fontSize: '13px', color: '#888' }}>Cantidad: {item.cantidad}</p>
                    </div>
                    <p style={{ fontWeight: 'bold', color: '#f90' }}>
                      ${(Number(item.productos?.precio) * item.cantidad).toLocaleString('es-CO')} COP
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PRODUCTOS */}
        {tab === 'productos' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Mis productos ({productos.length})</h3>
              <a href="/vender" style={{
                backgroundColor: '#f90', color: '#111', padding: '8px 16px',
                borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px'
              }}>+ Publicar producto</a>
            </div>
            {productos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <p style={{ marginBottom: '16px' }}>No has publicado productos todavía</p>
                <a href="/vender" style={{ color: '#f90', textDecoration: 'none', fontWeight: 'bold' }}>Publicar mi primer producto</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {productos.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '12px'
                  }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '10px',
                      backgroundColor: 'white', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '28px'
                    }}>{p.emoji || '🛍️'}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{p.nombre}</p>
                      <p style={{ fontSize: '13px', color: '#888' }}>{p.categoria}</p>
                    </div>
                    <p style={{ fontWeight: 'bold', color: '#f90' }}>
                      ${Number(p.precio).toLocaleString('es-CO')} COP
                    </p>
                    <a href={`/producto/${p.id}`} style={{
                      color: '#111', textDecoration: 'none', fontSize: '13px',
                      padding: '6px 12px', backgroundColor: 'white',
                      borderRadius: '6px', fontWeight: 'bold'
                    }}>Ver</a>
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