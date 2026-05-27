"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function MisPedidos() {
  const [usuario, setUsuario] = useState<any>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoActivo, setPedidoActivo] = useState<any>(null);
  const [itemsActivos, setItemsActivos] = useState<any[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return; }
      setUsuario(session.user);
      cargarPedidos(session.user.id);
    });
  }, []);

  const cargarPedidos = async (userId: string) => {
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .eq('comprador_id', userId)
      .order('created_at', { ascending: false });
    if (data) setPedidos(data);
    setCargando(false);
  };

  const verDetalle = async (pedido: any) => {
    setPedidoActivo(pedido);
    setCargandoDetalle(true);
    const { data } = await supabase
      .from('pedido_items')
      .select('*')
      .eq('pedido_id', pedido.id);
    if (data) setItemsActivos(data);
    setCargandoDetalle(false);
  };

  const getBadge = (estado: string) => {
    if (estado === 'pagado') return { bg: '#d1fae5', color: '#065f46', label: '✅ Pago confirmado', paso: 1 };
    if (estado === 'preparando') return { bg: '#fef3c7', color: '#92400e', label: '📦 En preparación', paso: 2 };
    if (estado === 'enviado') return { bg: '#dbeafe', color: '#1e40af', label: '🚚 En camino', paso: 3 };
    if (estado === 'entregado') return { bg: '#dcfce7', color: '#166534', label: '🎉 Entregado', paso: 4 };
    if (estado === 'cancelado') return { bg: '#fee2e2', color: '#991b1b', label: '❌ Cancelado', paso: 0 };
    return { bg: '#f3f4f6', color: '#111', label: estado, paso: 1 };
  };

  const pasos = [
    { num: 1, label: 'Pago confirmado', icon: '💳' },
    { num: 2, label: 'Preparando', icon: '📦' },
    { num: 3, label: 'En camino', icon: '🚚' },
    { num: 4, label: 'Entregado', icon: '🎉' },
  ];

  return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>

      <nav style={{ backgroundColor: '#111', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '20px', height: '56px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <div style={{ flex: 1 }}></div>
        <a href="/perfil" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Mi perfil</a>
        <a href="/carrito" style={{ color: '#f90', textDecoration: 'none', fontSize: '20px' }}>🛒</a>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#111', marginBottom: '6px' }}>📦 Mis pedidos</h1>
          <p style={{ fontSize: '14px', color: '#888' }}>Seguimiento en tiempo real de tus compras</p>
        </div>

        {cargando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', animation: 'pulse 1.5s infinite' }}>
                <div style={{ height: '20px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '12px', width: '40%' }}></div>
                <div style={{ height: '14px', backgroundColor: '#f3f4f6', borderRadius: '4px', width: '60%' }}></div>
              </div>
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '80px 40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>📭</div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>No tienes pedidos todavía</h2>
            <p style={{ color: '#888', marginBottom: '28px', fontSize: '15px' }}>Cuando realices una compra podrás ver el estado aquí</p>
            <a href="/productos" style={{ backgroundColor: '#f90', color: '#111', padding: '14px 32px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px' }}>
              Explorar productos
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

            {/* LISTA PEDIDOS */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pedidos.map(pedido => {
                const badge = getBadge(pedido.estado);
                const activo = pedidoActivo?.id === pedido.id;
                return (
                  <div
                    key={pedido.id}
                    onClick={() => verDetalle(pedido)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: activo ? '0 4px 20px rgba(255,153,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
                      border: activo ? '2px solid #f90' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '15px', color: '#111', marginBottom: '4px' }}>
                          Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p style={{ fontSize: '13px', color: '#888' }}>
                          {new Date(pedido.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <div style={{ backgroundColor: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                          {badge.label}
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#f90' }}>
                          ${Number(pedido.total).toLocaleString('es-CO')} COP
                        </p>
                      </div>
                    </div>

                    {pedido.estado !== 'cancelado' && (
                      <div style={{ position: 'relative', marginTop: '8px' }}>
                        <div style={{ position: 'absolute', top: '12px', left: '6%', right: '6%', height: '3px', backgroundColor: '#f3f4f6' }}>
                          <div style={{ height: '100%', backgroundColor: '#f90', borderRadius: '2px', transition: 'width 0.5s', width: badge.paso >= 4 ? '100%' : badge.paso >= 3 ? '66%' : badge.paso >= 2 ? '33%' : '0%' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                          {pasos.map(p => (
                            <div key={p.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                              <div style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: badge.paso >= p.num ? '#f90' : 'white', border: badge.paso >= p.num ? '2px solid #f90' : '2px solid #e5e7eb', marginBottom: '6px', fontSize: '12px', transition: 'all 0.3s' }}>
                                {badge.paso >= p.num ? <span style={{ color: 'white', fontSize: '11px' }}>✓</span> : p.icon}
                              </div>
                              <p style={{ fontSize: '10px', color: badge.paso >= p.num ? '#f90' : '#aaa', fontWeight: badge.paso >= p.num ? 'bold' : 'normal', textAlign: 'center' }}>{p.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DETALLE PEDIDO */}
            {pedidoActivo && (
              <div style={{ width: '380px', minWidth: '380px', backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', position: 'sticky', top: '24px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111' }}>Detalle del pedido</h3>
                  <button onClick={() => setPedidoActivo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#888' }}>✕</button>
                </div>

                <div style={{ backgroundColor: '#f3f4f6', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>NÚMERO DE PEDIDO</p>
                  <p style={{ fontWeight: 'bold', fontSize: '15px', color: '#111' }}>#{pedidoActivo.id.slice(0, 8).toUpperCase()}</p>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    {new Date(pedidoActivo.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* ESTADO ACTUAL */}
                <div style={{ backgroundColor: getBadge(pedidoActivo.estado).bg, borderRadius: '10px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', marginBottom: '4px' }}>
                    {pedidoActivo.estado === 'pagado' ? '✅' : pedidoActivo.estado === 'preparando' ? '📦' : pedidoActivo.estado === 'enviado' ? '🚚' : pedidoActivo.estado === 'entregado' ? '🎉' : '❌'}
                  </p>
                  <p style={{ fontWeight: 'bold', fontSize: '15px', color: getBadge(pedidoActivo.estado).color }}>
                    {getBadge(pedidoActivo.estado).label}
                  </p>
                  <p style={{ fontSize: '12px', color: getBadge(pedidoActivo.estado).color, opacity: 0.8, marginTop: '4px' }}>
                    {pedidoActivo.estado === 'pagado' ? 'El vendedor está revisando tu pedido' :
                     pedidoActivo.estado === 'preparando' ? 'El vendedor está preparando tu paquete' :
                     pedidoActivo.estado === 'enviado' ? 'Tu paquete está en camino a tu dirección' :
                     pedidoActivo.estado === 'entregado' ? '¡Tu pedido llegó exitosamente!' :
                     'Este pedido fue cancelado'}
                  </p>
                </div>

                {/* PRODUCTOS */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#111', marginBottom: '10px' }}>PRODUCTOS</p>
                  {cargandoDetalle ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Cargando...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {itemsActivos.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>🛍️</span>
                            <div>
                              <p style={{ fontWeight: '600', fontSize: '13px', color: '#333' }}>{item.nombre_producto}</p>
                              <p style={{ fontSize: '12px', color: '#888' }}>x{item.cantidad}</p>
                            </div>
                          </div>
                          <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#f90' }}>${(Number(item.precio) * item.cantidad).toLocaleString('es-CO')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DIRECCIÓN */}
                <div style={{ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>📍 DIRECCIÓN DE ENTREGA</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '2px' }}>{pedidoActivo.comprador_nombre}</p>
                  <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>
                    {pedidoActivo.direccion}<br />
                    {pedidoActivo.ciudad}, {pedidoActivo.departamento}
                  </p>
                  {pedidoActivo.notas && (
                    <p style={{ fontSize: '12px', color: '#f90', marginTop: '6px' }}>📝 {pedidoActivo.notas}</p>
                  )}
                </div>

                {/* TOTAL */}
                <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#111' }}>Total pagado</span>
                  <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#f90' }}>${Number(pedidoActivo.total).toLocaleString('es-CO')} COP</span>
                </div>

                <a href="/productos" style={{ display: 'block', textAlign: 'center', marginTop: '16px', backgroundColor: '#111', color: '#f90', padding: '12px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>
                  🛍️ Seguir comprando
                </a>

              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

    </main>
  );
}