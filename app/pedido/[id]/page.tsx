"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "../../../lib/supabase";

export default function DetallePedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pedido, setPedido] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState('');
  const [actualizando, setActualizando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (id) cargarPedido();
  }, [id]);

  const cargarPedido = async () => {
    const { data: pedidoData } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();
    if (pedidoData) {
      setPedido(pedidoData);
      setEstado(pedidoData.estado);
    }

    const { data: itemsData } = await supabase
      .from('pedido_items')
      .select('*')
      .eq('pedido_id', id);
    if (itemsData) setItems(itemsData);

    setCargando(false);
  };

  const actualizarEstado = async (nuevoEstado: string) => {
    setActualizando(true);
    await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', id);
    setEstado(nuevoEstado);
    setMensaje(`Estado actualizado a: ${nuevoEstado}`);
    setActualizando(false);
    setTimeout(() => setMensaje(''), 3000);
  };

  const estadoColor: any = {
    'pagado': { bg: '#d1fae5', color: '#065f46', label: '✅ Pagado' },
    'preparando': { bg: '#fef3c7', color: '#92400e', label: '📦 Preparando' },
    'enviado': { bg: '#dbeafe', color: '#1e40af', label: '🚚 Enviado' },
    'entregado': { bg: '#f3f4f6', color: '#374151', label: '🎉 Entregado' },
    'cancelado': { bg: '#fee2e2', color: '#991b1b', label: '❌ Cancelado' },
  };

  if (cargando) return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#111', padding: '14px 24px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>Cargando pedido...</div>
    </main>
  );

  if (!pedido) return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#111', padding: '14px 24px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>Pedido no encontrado</div>
    </main>
  );

  return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        backgroundColor: '#111', padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <a href="/vender" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>← Volver al panel</a>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
              Pedido #{id.slice(0, 8).toUpperCase()}
            </h1>
            <p style={{ fontSize: '14px', color: '#888' }}>
              {new Date(pedido.created_at).toLocaleDateString('es-CO', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <div style={{
            backgroundColor: estadoColor[estado]?.bg || '#f3f4f6',
            color: estadoColor[estado]?.color || '#111',
            padding: '8px 16px', borderRadius: '20px',
            fontWeight: 'bold', fontSize: '14px'
          }}>
            {estadoColor[estado]?.label || estado}
          </div>
        </div>

        {mensaje && (
          <div style={{
            backgroundColor: '#d1fae5', border: '1px solid #6ee7b7',
            borderRadius: '8px', padding: '12px', marginBottom: '20px',
            fontSize: '14px', color: '#065f46'
          }}>✅ {mensaje}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* INFO COMPRADOR */}
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 Información del comprador
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Nombre</p>
                <p style={{ fontWeight: 'bold' }}>{pedido.comprador_nombre}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Correo</p>
                <p style={{ fontWeight: 'bold' }}>{pedido.comprador_email}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Teléfono / WhatsApp</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontWeight: 'bold' }}>{pedido.telefono}</p>
                  
                    href={`https://wa.me/${pedido.telefono.replace(/\D/g, '')}`}
                    target="_blank"
                    style={{
                      backgroundColor: '#25d366', color: 'white',
                      padding: '4px 10px', borderRadius: '6px',
                      textDecoration: 'none', fontSize: '12px', fontWeight: 'bold'
                    }}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* DIRECCIÓN ENVÍO */}
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📦 Dirección de envío
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Dirección</p>
                <p style={{ fontWeight: 'bold' }}>{pedido.direccion}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Ciudad</p>
                <p style={{ fontWeight: 'bold' }}>{pedido.ciudad}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Departamento / País</p>
                <p style={{ fontWeight: 'bold' }}>{pedido.departamento}</p>
              </div>
              {pedido.notas && (
                <div>
                  <p style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Notas</p>
                  <p style={{ fontWeight: 'bold', color: '#f90' }}>📝 {pedido.notas}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRODUCTOS */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>🛍️ Productos del pedido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '10px'
              }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '8px',
                  backgroundColor: 'white', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '24px', flexShrink: 0
                }}>🛍️</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '2px' }}>{item.nombre_producto}</p>
                  <p style={{ fontSize: '13px', color: '#888' }}>Cantidad: {item.cantidad}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold', color: '#f90', fontSize: '15px' }}>
                    ${(Number(item.precio) * item.cantidad).toLocaleString('es-CO')} COP
                  </p>
                  <p style={{ fontSize: '12px', color: '#888' }}>${Number(item.precio).toLocaleString('es-CO')} c/u</p>
                </div>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 0', borderTop: '2px solid #f3f4f6', marginTop: '4px'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Total pagado</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#f90' }}>
                ${Number(pedido.total).toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>
        </div>

        {/* PASOS A SEGUIR */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>📋 Pasos a seguir</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                numero: '1',
                titulo: 'Confirmar el pedido',
                descripcion: 'Revisa que tengas el producto disponible y en buen estado.',
                completado: ['preparando', 'enviado', 'entregado'].includes(estado)
              },
              {
                numero: '2',
                titulo: 'Empacar el producto',
                descripcion: 'Empaca el producto de forma segura. Incluye una nota de agradecimiento si quieres.',
                completado: ['enviado', 'entregado'].includes(estado)
              },
              {
                numero: '3',
                titulo: 'Coordinar el envío',
                descripcion: `Contacta al comprador por WhatsApp al ${pedido.telefono} para coordinar la entrega. Puedes usar Coordinadora, Interrapidísimo o Servientrega.`,
                completado: ['enviado', 'entregado'].includes(estado)
              },
              {
                numero: '4',
                titulo: 'Marcar como enviado',
                descripcion: 'Cuando entregues el paquete a la transportadora, actualiza el estado del pedido.',
                completado: ['entregado'].includes(estado)
              },
            ].map((paso, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: paso.completado ? '#22c55e' : '#f3f4f6',
                  color: paso.completado ? 'white' : '#888',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '14px'
                }}>
                  {paso.completado ? '✓' : paso.numero}
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{paso.titulo}</p>
                  <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{paso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTUALIZAR ESTADO */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>🔄 Actualizar estado del pedido</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { valor: 'preparando', label: '📦 Preparando', color: '#f59e0b' },
              { valor: 'enviado', label: '🚚 Enviado', color: '#3b82f6' },
              { valor: 'entregado', label: '🎉 Entregado', color: '#22c55e' },
              { valor: 'cancelado', label: '❌ Cancelado', color: '#ef4444' },
            ].map(e => (
              <button
                key={e.valor}
                onClick={() => actualizarEstado(e.valor)}
                disabled={actualizando || estado === e.valor}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: 'none',
                  fontWeight: 'bold', fontSize: '14px', cursor: estado === e.valor ? 'not-allowed' : 'pointer',
                  backgroundColor: estado === e.valor ? e.color : '#f3f4f6',
                  color: estado === e.valor ? 'white' : '#666',
                  opacity: actualizando ? 0.6 : 1
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '12px' }}>
            El comprador será notificado cuando actualices el estado de su pedido.
          </p>
        </div>

      </div>
    </main>
  );
}