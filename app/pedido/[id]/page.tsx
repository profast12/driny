"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function DetallePedido({ params }: any) {
  const id = params.id;
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
      .from('pedidos').select('*').eq('id', id).single();
    if (pedidoData) { setPedido(pedidoData); setEstado(pedidoData.estado); }
    const { data: itemsData } = await supabase
      .from('pedido_items').select('*').eq('pedido_id', id);
    if (itemsData) setItems(itemsData);
    setCargando(false);
  };

  const actualizarEstado = async (nuevoEstado: string) => {
    setActualizando(true);
    await supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', id);
    setEstado(nuevoEstado);
    setMensaje("Estado actualizado: " + nuevoEstado);
    setActualizando(false);
    setTimeout(() => setMensaje(''), 3000);
  };

  const pasoCompletado = (paso: number) => {
    if (estado === 'entregado') return true;
    if (estado === 'enviado' && paso <= 3) return true;
    if (estado === 'preparando' && paso <= 1) return true;
    return false;
  };

  const getBadge = () => {
    if (estado === 'pagado') return { bg: '#d1fae5', color: '#065f46', label: '✅ Pagado' };
    if (estado === 'preparando') return { bg: '#fef3c7', color: '#92400e', label: '📦 Preparando' };
    if (estado === 'enviado') return { bg: '#dbeafe', color: '#1e40af', label: '🚚 Enviado' };
    if (estado === 'entregado') return { bg: '#f3f4f6', color: '#374151', label: '🎉 Entregado' };
    if (estado === 'cancelado') return { bg: '#fee2e2', color: '#991b1b', label: '❌ Cancelado' };
    return { bg: '#f3f4f6', color: '#111', label: estado };
  };

  const badge = getBadge();

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

      <nav style={{ backgroundColor: '#111', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <a href="/vender" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>← Volver al panel</a>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
              Pedido #{id.slice(0, 8).toUpperCase()}
            </h1>
            <p style={{ fontSize: '14px', color: '#888' }}>
              {new Date(pedido.created_at).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ backgroundColor: badge.bg, color: badge.color, padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
            {badge.label}
          </div>
        </div>

        {mensaje !== '' && (
          <div style={{ backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '14px', color: '#065f46' }}>
            ✅ {mensaje}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>👤 Información del comprador</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Nombre</p>
                <p style={{ fontWeight: 'bold' }}>{pedido.comprador_nombre}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Correo</p>
                <p style={{ fontWeight: 'bold' }}>{pedido.comprador_email}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Teléfono</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontWeight: 'bold' }}>{pedido.telefono}</p>
                  <a href={"https://wa.me/" + pedido.telefono.replace(/\D/g, '')} target="_blank" style={{ backgroundColor: '#25d366', color: 'white', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>📦 Dirección de envío</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
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

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>🛍️ Productos del pedido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '8px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🛍️</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '2px' }}>{item.nombre_producto}</p>
                  <p style={{ fontSize: '13px', color: '#888' }}>Cantidad: {item.cantidad}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold', color: '#f90', fontSize: '15px' }}>${(Number(item.precio) * item.cantidad).toLocaleString('es-CO')} COP</p>
                  <p style={{ fontSize: '12px', color: '#888' }}>${Number(item.precio).toLocaleString('es-CO')} c/u</p>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #f3f4f6' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Total pagado</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#f90' }}>${Number(pedido.total).toLocaleString('es-CO')} COP</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>📋 Pasos a seguir</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, backgroundColor: pasoCompletado(1) ? '#22c55e' : '#f3f4f6', color: pasoCompletado(1) ? 'white' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                {pasoCompletado(1) ? '✓' : '1'}
              </div>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Confirmar el pedido</p>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>Revisa que tengas el producto disponible y en buen estado.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, backgroundColor: pasoCompletado(2) ? '#22c55e' : '#f3f4f6', color: pasoCompletado(2) ? 'white' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                {pasoCompletado(2) ? '✓' : '2'}
              </div>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Empacar el producto</p>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>Empaca el producto de forma segura. Incluye una nota de agradecimiento si quieres.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, backgroundColor: pasoCompletado(3) ? '#22c55e' : '#f3f4f6', color: pasoCompletado(3) ? 'white' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                {pasoCompletado(3) ? '✓' : '3'}
              </div>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Coordinar el envío</p>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>Contacta al comprador por WhatsApp al {pedido.telefono} para coordinar la entrega. Puedes usar Coordinadora, Interrapidísimo o Servientrega.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, backgroundColor: pasoCompletado(4) ? '#22c55e' : '#f3f4f6', color: pasoCompletado(4) ? 'white' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                {pasoCompletado(4) ? '✓' : '4'}
              </div>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Marcar como enviado</p>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>Cuando entregues el paquete a la transportadora, actualiza el estado del pedido abajo.</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>🔄 Actualizar estado</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => actualizarEstado('preparando')} disabled={actualizando || estado === 'preparando'} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: estado === 'preparando' ? 'not-allowed' : 'pointer', backgroundColor: estado === 'preparando' ? '#f59e0b' : '#f3f4f6', color: estado === 'preparando' ? 'white' : '#666' }}>📦 Preparando</button>
            <button onClick={() => actualizarEstado('enviado')} disabled={actualizando || estado === 'enviado'} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: estado === 'enviado' ? 'not-allowed' : 'pointer', backgroundColor: estado === 'enviado' ? '#3b82f6' : '#f3f4f6', color: estado === 'enviado' ? 'white' : '#666' }}>🚚 Enviado</button>
            <button onClick={() => actualizarEstado('entregado')} disabled={actualizando || estado === 'entregado'} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: estado === 'entregado' ? 'not-allowed' : 'pointer', backgroundColor: estado === 'entregado' ? '#22c55e' : '#f3f4f6', color: estado === 'entregado' ? 'white' : '#666' }}>🎉 Entregado</button>
            <button onClick={() => actualizarEstado('cancelado')} disabled={actualizando || estado === 'cancelado'} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: estado === 'cancelado' ? 'not-allowed' : 'pointer', backgroundColor: estado === 'cancelado' ? '#ef4444' : '#f3f4f6', color: estado === 'cancelado' ? 'white' : '#666' }}>❌ Cancelado</button>
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '12px' }}>El comprador será notificado cuando actualices el estado.</p>
        </div>

      </div>
    </main>
  );
}