"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "../../../lib/supabase";

export default function DetalleProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [producto, setProducto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [resenas, setResenas] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState(5);
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [mensajeResena, setMensajeResena] = useState("");

  useEffect(() => {
    if (id) {
      cargarProducto();
      cargarResenas();
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('username, avatar_url, nombre')
          .eq('email', session.user.email)
          .single();
        setUsuario({ ...session.user, ...perfil });
      }
    });
  }, [id]);

  const cargarProducto = async () => {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setProducto(data);
    setCargando(false);
  };

  const cargarResenas = async () => {
    const { data } = await supabase
      .from('resenas')
      .select('*')
      .eq('producto_id', id)
      .order('created_at', { ascending: false });
    if (data) setResenas(data);
  };

  const agregarAlCarrito = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }
    await supabase.from('carrito').insert([{
      usuario_id: session.user.id,
      producto_id: producto.id,
      cantidad
    }]);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 3000);
  };

  const enviarResena = async () => {
    if (!usuario) {
      window.location.href = '/login';
      return;
    }
    if (!comentario.trim()) return;

    setEnviandoResena(true);
    const { error } = await supabase.from('resenas').insert([{
      producto_id: id,
      usuario_id: usuario.id,
      nombre_usuario: usuario.username || usuario.nombre || usuario.email.split('@')[0],
      avatar_url: usuario.avatar_url || null,
      calificacion,
      comentario
    }]);

    if (!error) {
      setComentario("");
      setCalificacion(5);
      setMensajeResena("¡Reseña publicada!");
      cargarResenas();
      setTimeout(() => setMensajeResena(""), 3000);
    }
    setEnviandoResena(false);
  };

  const promedioCalificacion = resenas.length > 0
    ? (resenas.reduce((acc, r) => acc + r.calificacion, 0) / resenas.length).toFixed(1)
    : null;

  if (cargando) return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#111', padding: '14px 24px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>Cargando producto...</div>
    </main>
  );

  if (!producto) return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#111', padding: '14px 24px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <p style={{ fontSize: '18px', marginBottom: '16px' }}>Producto no encontrado</p>
        <a href="/productos" style={{ color: '#f90', textDecoration: 'none', fontWeight: 'bold' }}>Ver todos los productos</a>
      </div>
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
        gap: '20px'
      }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <div style={{ flex: 1 }}></div>
        <a href="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Mi cuenta</a>
        <a href="/carrito" style={{ color: '#f90', textDecoration: 'none', fontSize: '20px' }}>🛒</a>
      </nav>

      {/* BREADCRUMB */}
      <div style={{ padding: '16px 24px', fontSize: '13px', color: '#888' }}>
        <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a>
        <span> → </span>
        <a href="/productos" style={{ color: '#888', textDecoration: 'none' }}>Productos</a>
        <span> → </span>
        <span style={{ color: '#111' }}>{producto.nombre}</span>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 40px' }}>

        {/* DETALLE */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', marginBottom: '40px' }}>

          {/* IMAGEN */}
          <div style={{
  backgroundColor: 'white',
  borderRadius: '16px',
  overflow: 'hidden',
  width: '420px',
  minWidth: '420px',
  height: '380px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '140px'
}}>
  {producto.imagen_url ? (
    <img
      src={producto.imagen_url}
      alt={producto.nombre}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  ) : (
    producto.emoji || '🛍️'
  )}
</div>

          {/* INFO */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{producto.categoria}</p>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.3 }}>
              {producto.nombre}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ color: '#f90', fontSize: '20px' }}>
                {'★'.repeat(Math.round(Number(promedioCalificacion) || 0))}
                {'☆'.repeat(5 - Math.round(Number(promedioCalificacion) || 0))}
              </span>
              <span style={{ fontSize: '13px', color: '#888' }}>
                {promedioCalificacion ? `${promedioCalificacion} (${resenas.length} reseñas)` : 'Sin reseñas aún'}
              </span>
            </div>

            <div style={{
              backgroundColor: 'white', borderRadius: '12px', padding: '20px',
              marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f90', marginBottom: '4px' }}>
                ${Number(producto.precio).toLocaleString('es-CO')} COP
              </p>
              <p style={{ fontSize: '13px', color: '#22c55e', fontWeight: 'bold' }}>✅ En stock</p>
            </div>

            <div style={{
              backgroundColor: 'white', borderRadius: '12px', padding: '20px',
              marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>Descripción</h3>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
                {producto.descripcion || 'Sin descripción disponible.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Cantidad:</span>
              <button onClick={() => setCantidad(c => Math.max(1, c - 1))} style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: '2px solid #e5e7eb', backgroundColor: 'white', fontSize: '20px', cursor: 'pointer'
              }}>−</button>
              <span style={{ fontWeight: 'bold', fontSize: '18px', minWidth: '24px', textAlign: 'center' }}>{cantidad}</span>
              <button onClick={() => setCantidad(c => c + 1)} style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: '2px solid #e5e7eb', backgroundColor: 'white', fontSize: '20px', cursor: 'pointer'
              }}>+</button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button onClick={agregarAlCarrito} style={{
                flex: 1, padding: '14px',
                backgroundColor: agregado ? '#22c55e' : '#111',
                color: 'white', border: 'none', borderRadius: '10px',
                fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'background-color 0.3s'
              }}>
                {agregado ? '✅ Agregado al carrito' : '🛒 Agregar al carrito'}
              </button>
              <a href="/carrito" style={{
                flex: 1, padding: '14px', backgroundColor: '#f90', color: '#111',
                borderRadius: '10px', fontWeight: 'bold', fontSize: '16px',
                cursor: 'pointer', textDecoration: 'none', textAlign: 'center'
              }}>
                ⚡ Comprar ahora
              </a>
            </div>

            <div style={{
              backgroundColor: 'white', borderRadius: '12px', padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span>🔒</span><span>Pago seguro con PayPal</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span>🔄</span><span>Devoluciones dentro de 30 días</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span>🚚</span><span>Envío a todo Colombia</span>
              </div>
            </div>
          </div>
        </div>

        {/* RESEÑAS */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>
            Reseñas ({resenas.length})
          </h2>

          {/* FORMULARIO RESEÑA */}
          <div style={{
            backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '20px', marginBottom: '28px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
              {usuario ? 'Deja tu reseña' : 'Inicia sesión para dejar una reseña'}
            </h3>

            {mensajeResena && (
              <div style={{
                backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px',
                padding: '10px', marginBottom: '12px', fontSize: '14px', color: '#065f46'
              }}>✅ {mensajeResena}</div>
            )}

            {/* ESTRELLAS */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setCalificacion(star)}
                  style={{
                    fontSize: '28px', background: 'none', border: 'none',
                    cursor: 'pointer', color: star <= calificacion ? '#f90' : '#ddd'
                  }}
                >★</button>
              ))}
            </div>

            <textarea
              placeholder={usuario ? "Escribe tu comentario sobre este producto..." : "Inicia sesión para comentar"}
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              disabled={!usuario}
              rows={3}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', resize: 'vertical', marginBottom: '12px',
                backgroundColor: usuario ? 'white' : '#f3f4f6'
              }}
              onFocus={e => e.target.style.border = '2px solid #f90'}
              onBlur={e => e.target.style.border = '2px solid #e5e7eb'}
            />

            {usuario ? (
              <button
                onClick={enviarResena}
                disabled={enviandoResena || !comentario.trim()}
                style={{
                  padding: '10px 24px', backgroundColor: enviandoResena || !comentario.trim() ? '#ccc' : '#111',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontWeight: 'bold', fontSize: '14px',
                  cursor: enviandoResena || !comentario.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {enviandoResena ? 'Publicando...' : 'Publicar reseña'}
              </button>
            ) : (
              <a href="/login" style={{
                display: 'inline-block', padding: '10px 24px', backgroundColor: '#f90',
                color: '#111', borderRadius: '8px', fontWeight: 'bold',
                fontSize: '14px', textDecoration: 'none'
              }}>
                Iniciar sesión para comentar
              </a>
            )}
          </div>

          {/* LISTA RESEÑAS */}
          {resenas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <p>Sé el primero en dejar una reseña</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {resenas.map(r => (
                <div key={r.id} style={{
                  padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      backgroundColor: '#f90', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 'bold', color: '#111', flexShrink: 0
                    }}>
                      {r.avatar_url ? (
                        <img src={r.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        r.nombre_usuario?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{r.nombre_usuario}</p>
                      <p style={{ fontSize: '12px', color: '#888' }}>
                        {new Date(r.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ marginLeft: 'auto', color: '#f90', fontSize: '16px' }}>
                      {'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>{r.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}