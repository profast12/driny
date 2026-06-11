"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import jsPDF from 'jspdf';

export default function DetallePedido() {
  const [id, setId] = useState('');
  const [pedido, setPedido] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState('');
  const [actualizando, setActualizando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const parts = window.location.pathname.split('/');
    setId(parts[parts.length - 1]);
  }, []);

  useEffect(() => {
    if (id) cargarPedido();
  }, [id]);

  const cargarPedido = async () => {
    const { data: p } = await supabase.from('pedidos').select('*').eq('id', id).single();
    if (p) { setPedido(p); setEstado(p.estado); }
    const { data: its } = await supabase.from('pedido_items').select('*').eq('pedido_id', id);
    if (its) setItems(its);
    setCargando(false);
  };

 const actualizarEstado = async (s: string) => {
  setActualizando(true);

  await supabase.from('pedidos').update({ estado: s }).eq('id', id);

  if (s === 'entregado') {
    for (const item of items) {
      const { data: prod } = await supabase
        .from('productos')
        .select('sku, cantidad_vendida')
        .eq('id', item.producto_id)
        .single();

      if (prod) {
        await supabase.from('productos').update({
          sku: Math.max(0, (prod.sku || 0) - (item.cantidad || 1)),
          cantidad_vendida: (prod.cantidad_vendida || 0) + (item.cantidad || 1),
        }).eq('id', item.producto_id);
      }
    }
  }

  const mensajeEstado =
    s === 'preparando' ? 'Tu pedido esta siendo preparado' :
    s === 'enviado' ? 'Tu pedido esta en camino' :
    s === 'entregado' ? 'Tu pedido fue entregado' :
    s === 'cancelado' ? 'Tu pedido fue cancelado' :
    'Tu pedido fue actualizado';

  await supabase.from('notificaciones').insert([{
    usuario_id: pedido.comprador_id,
    titulo: 'Actualizacion de tu pedido',
    mensaje: mensajeEstado + ' — Haz clic para ver el estado',
    pedido_id: id,
  }]);

  setEstado(s);
  setMensaje('Estado actualizado correctamente');
  setActualizando(false);
  setTimeout(() => setMensaje(''), 3000);
};

  const descargarGuia = () => {
    const doc = new jsPDF();
    const naranja: [number, number, number] = [255, 153, 0];
    const negro: [number, number, number] = [17, 17, 17];
    const gris: [number, number, number] = [100, 100, 100];
    const grisClaro: [number, number, number] = [240, 240, 240];

    doc.setFillColor(...naranja);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('DRINY', 14, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text('Guia de Envio', 14, 30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Pedido #' + id.slice(0, 8).toUpperCase(), 196, 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(new Date(pedido.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }), 196, 25, { align: 'right' });

    doc.setDrawColor(...naranja);
    doc.setLineWidth(1);
    doc.line(0, 35, 210, 35);

    let y = 50;
    doc.setFillColor(...grisClaro);
    doc.rect(14, y - 6, 182, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...negro);
    doc.text('DESTINATARIO', 16, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(pedido.comprador_nombre, 14, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...gris);
    doc.text('Direccion: ' + pedido.direccion, 14, y);
    y += 7;
    doc.text('Ciudad: ' + pedido.ciudad, 14, y);
    y += 7;
    doc.text('Departamento: ' + pedido.departamento, 14, y);
    y += 7;
    doc.text('Telefono: ' + pedido.telefono, 14, y);
    y += 7;
    doc.text('Correo: ' + pedido.comprador_email, 14, y);
    if (pedido.notas) {
      y += 7;
      doc.setTextColor(180, 100, 0);
      doc.text('Nota: ' + pedido.notas, 14, y);
    }

    y += 12;
    doc.setDrawColor(...grisClaro);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);

    y += 10;
    doc.setFillColor(...grisClaro);
    doc.rect(14, y - 6, 182, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...negro);
    doc.text('PRODUCTOS', 16, y);

    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...gris);
    doc.text('Producto', 14, y);
    doc.text('Cant.', 140, y);
    doc.text('Precio', 165, y);
    doc.text('Total', 190, y, { align: 'right' });
    y += 2;
    doc.setDrawColor(...grisClaro);
    doc.line(14, y, 196, y);

    items.forEach(item => {
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...negro);
      doc.setFontSize(10);
      doc.text(item.nombre_producto, 14, y);
      doc.text(String(item.cantidad), 143, y);
      doc.text('$' + Number(item.precio).toLocaleString('es-CO'), 165, y);
      doc.text('$' + (Number(item.precio) * item.cantidad).toLocaleString('es-CO'), 196, y, { align: 'right' });
    });

    y += 6;
    doc.setDrawColor(...grisClaro);
    doc.line(14, y, 196, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...negro);
    doc.text('TOTAL:', 140, y);
    doc.setTextColor(...naranja);
    doc.text('$' + Number(pedido.total).toLocaleString('es-CO') + ' COP', 196, y, { align: 'right' });

    y += 12;
    doc.setDrawColor(...grisClaro);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);

    y += 10;
    doc.setFillColor(...grisClaro);
    doc.rect(14, y - 6, 182, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...negro);
    doc.text('INSTRUCCIONES DE ENVIO', 16, y);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...gris);
    const instruccionesTexto = [
      '1. Presenta esta guia en la paqueteria de tu eleccion.',
      '2. Puedes usar: Coordinadora, Interrapidisimo, Servientrega o TCC.',
      '3. El empleado digitara los datos del destinatario.',
      '4. Guarda el numero de guia y compartelo con el comprador.',
      '5. Actualiza el estado del pedido en Driny una vez enviado.',
    ];
    instruccionesTexto.forEach(inst => {
      doc.text(inst, 14, y);
      y += 7;
    });

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...negro);
    doc.text('Paqueterias recomendadas:', 14, y);
    y += 8;
    const paqueterias = [
      { nombre: 'Coordinadora', web: 'coordinadora.com', tel: '01 8000 510 888' },
      { nombre: 'Interrapidisimo', web: 'interrapidisimo.com', tel: '01 8000 912 800' },
      { nombre: 'Servientrega', web: 'servientrega.com.co', tel: '01 8000 112 211' },
      { nombre: 'TCC', web: 'tcc.com.co', tel: '01 8000 910 444' },
    ];
    paqueterias.forEach(p => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...negro);
      doc.setFontSize(9);
      doc.text(p.nombre + ':', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...gris);
      doc.text('Web: ' + p.web + '  |  Tel: ' + p.tel, 50, y);
      y += 7;
    });

    y = 275;
    doc.setFillColor(...naranja);
    doc.rect(0, y, 210, 25, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DRINY', 14, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('driny.vercel.app', 14, y + 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Generado el ' + new Date().toLocaleDateString('es-CO'), 196, y + 10, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text('Colombia', 196, y + 17, { align: 'right' });

    doc.save('Guia-Driny-' + id.slice(0, 8).toUpperCase() + '.pdf');
  };

  const paso = estado === 'entregado' ? 4 : estado === 'enviado' ? 3 : estado === 'preparando' ? 2 : 1;

  const badge = estado === 'pagado' ? { bg: '#d1fae5', color: '#065f46', label: '✅ Pago confirmado' }
    : estado === 'preparando' ? { bg: '#fef3c7', color: '#92400e', label: '📦 En preparación' }
    : estado === 'enviado' ? { bg: '#dbeafe', color: '#1e40af', label: '🚚 En camino' }
    : estado === 'entregado' ? { bg: '#dcfce7', color: '#166534', label: '🎉 Entregado' }
    : estado === 'cancelado' ? { bg: '#fee2e2', color: '#991b1b', label: '❌ Cancelado' }
    : { bg: '#f3f4f6', color: '#111', label: estado };

  const pasos = [
    { num: 1, label: 'Pago confirmado', icon: '💳' },
    { num: 2, label: 'Preparando', icon: '📦' },
    { num: 3, label: 'En camino', icon: '🚚' },
    { num: 4, label: 'Entregado', icon: '🎉' },
  ];

  const instrucciones = [
    { icon: '✅', titulo: 'Confirma la disponibilidad', desc: 'Verifica que tienes el producto listo para enviar en buen estado.' },
    { icon: '📦', titulo: 'Empaca con cuidado', desc: 'Usa una caja o bolsa resistente. Si es frágil agrega relleno protector.' },
    { icon: '📞', titulo: 'Contacta al comprador', desc: pedido ? 'Escríbele por WhatsApp al ' + pedido.telefono + ' para coordinar la entrega.' : '' },
    { icon: '🚚', titulo: 'Envía el pedido', desc: 'Puedes usar Coordinadora, Interrapidísimo, Servientrega o TCC.' },
    { icon: '🔄', titulo: 'Actualiza el estado', desc: 'Una vez enviado cambia el estado para mantener informado al comprador.' },
  ];

  const btnEstados = [
    { valor: 'preparando', label: '📦 Preparando pedido', color: '#f59e0b', desc: 'Estás alistando el producto' },
    { valor: 'enviado', label: '🚚 Pedido enviado', color: '#3483fa', desc: 'Ya entregaste a transportadora' },
    { valor: 'entregado', label: '🎉 Pedido entregado', color: '#00a650', desc: 'El comprador lo recibió' },
    { valor: 'cancelado', label: '❌ Cancelar pedido', color: '#ef4444', desc: 'No puedes completar el pedido' },
  ];

  if (cargando) return (
    <main style={{ backgroundColor: '#ebebeb', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#f90', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ color: '#111', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>Cargando pedido...</div>
    </main>
  );

  if (!pedido) return (
    <main style={{ backgroundColor: '#ebebeb', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#f90', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ color: '#111', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>Pedido no encontrado</div>
    </main>
  );

  return (
    <main style={{ backgroundColor: '#ebebeb', minHeight: '100vh' }}>

      <nav style={{ backgroundColor: '#f90', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '24px', height: '56px' }}>
        <a href="/" style={{ color: '#111', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <span style={{ color: '#111', opacity: 0.5 }}>|</span>
        <span style={{ color: '#111', fontSize: '14px', fontWeight: 'bold' }}>Panel de ventas</span>
        <div style={{ flex: 1 }}></div>
        <a href="/vender" style={{ color: '#111', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>← Volver al panel</a>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>

        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
          <a href="/vender" style={{ color: '#3483fa', textDecoration: 'none' }}>Mis ventas</a>
          {' › '}Pedido #{id.slice(0, 8).toUpperCase()}
        </p>

        {mensaje !== '' && (
          <div style={{ backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#065f46' }}>
            ✅ {mensaje}
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>Pedido #{id.slice(0, 8).toUpperCase()}</h1>
              <p style={{ fontSize: '13px', color: '#999' }}>
                {new Date(pedido.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div style={{ backgroundColor: badge.bg, color: badge.color, padding: '6px 14px', borderRadius: '4px', fontWeight: '600', fontSize: '13px' }}>
              {badge.label}
            </div>
          </div>

          {estado !== 'cancelado' && (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', left: '8%', right: '8%', height: '3px', backgroundColor: '#e0e0e0', zIndex: 0 }}>
                <div style={{ height: '100%', backgroundColor: '#3483fa', width: paso >= 4 ? '100%' : paso >= 3 ? '66%' : paso >= 2 ? '33%' : '0%' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {pasos.map(p => (
                  <div key={p.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: paso >= p.num ? '#3483fa' : 'white', border: paso >= p.num ? '2px solid #3483fa' : '2px solid #e0e0e0', marginBottom: '8px', fontSize: '14px' }}>
                      {paso >= p.num ? <span style={{ color: 'white' }}>✓</span> : p.icon}
                    </div>
                    <p style={{ fontSize: '11px', color: paso >= p.num ? '#3483fa' : '#999', fontWeight: paso >= p.num ? '600' : 'normal', textAlign: 'center' }}>{p.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>🛍️ Productos vendidos</h2>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f7f7f7' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '6px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>🛍️</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '4px' }}>{item.nombre_producto}</p>
                    <p style={{ fontSize: '13px', color: '#999' }}>Cantidad: {item.cantidad}</p>
                    <p style={{ fontSize: '13px', color: '#999' }}>Precio unitario: ${Number(item.precio).toLocaleString('es-CO')} COP</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '700', fontSize: '16px', color: '#333' }}>${(Number(item.precio) * item.cantidad).toLocaleString('es-CO')}</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>COP</p>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px' }}>
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>Total recibido</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#00a650' }}>${Number(pedido.total).toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>👤 Datos del comprador</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>NOMBRE</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{pedido.comprador_nombre}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>CORREO</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{pedido.comprador_email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>TELÉFONO</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{pedido.telefono}</p>
                    <a href={"https://wa.me/" + pedido.telefono.replace(/\D/g, '')} target="_blank" style={{ backgroundColor: '#25d366', color: 'white', padding: '3px 10px', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>WhatsApp</a>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>📦 Dirección de envío</h2>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ fontSize: '32px' }}>🗺️</div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>{pedido.comprador_nombre}</p>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8 }}>{pedido.direccion}<br />{pedido.ciudad}, {pedido.departamento}</p>
                  {pedido.notas && (
                    <div style={{ marginTop: '10px', backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '6px', padding: '8px 12px' }}>
                      <p style={{ fontSize: '13px', color: '#795548' }}>📝 <strong>Nota:</strong> {pedido.notas}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>📋 Pasos a seguir</h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {instrucciones.map((inst, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px 0', borderBottom: i < instrucciones.length - 1 ? '1px solid #f7f7f7' : 'none' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: paso > i + 1 ? '#3483fa' : paso === i + 1 ? '#f90' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>
                      {paso > i + 1 ? <span style={{ color: 'white', fontSize: '14px' }}>✓</span> : inst.icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '4px' }}>{inst.titulo}</p>
                      <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{inst.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>📄 Guía de envío</h3>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>Descarga e imprime esta guía para llevar a la paquetería</p>
              <button onClick={descargarGuia} style={{ width: '100%', padding: '12px', backgroundColor: '#111', color: '#f90', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                ⬇️ Descargar guía PDF
              </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Actualizar estado</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {btnEstados.map(e => (
                  <button key={e.valor} onClick={() => actualizarEstado(e.valor)} disabled={actualizando || estado === e.valor}
                    style={{ padding: '12px 14px', borderRadius: '6px', border: estado === e.valor ? '2px solid ' + e.color : '1px solid #e0e0e0', fontWeight: '600', fontSize: '13px', cursor: estado === e.valor ? 'not-allowed' : 'pointer', backgroundColor: estado === e.valor ? e.color : 'white', color: estado === e.valor ? 'white' : '#333', textAlign: 'left', opacity: actualizando ? 0.6 : 1 }}>
                    {e.label}
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 'normal', color: estado === e.valor ? 'rgba(255,255,255,0.8)' : '#999', marginTop: '2px' }}>{e.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Resumen financiero</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#666' }}>Subtotal</span>
                  <span style={{ fontWeight: '600' }}>${Number(pedido.total).toLocaleString('es-CO')} COP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#666' }}>Comisión Driny (5%)</span>
                  <span style={{ fontWeight: '600', color: '#ef4444' }}>-${(Number(pedido.total) * 0.05).toLocaleString('es-CO')} COP</span>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                  <span style={{ fontWeight: '700' }}>Tu ganancia</span>
                  <span style={{ fontWeight: '700', color: '#00a650' }}>${(Number(pedido.total) * 0.95).toLocaleString('es-CO')} COP</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0f7ff', borderRadius: '8px', padding: '16px', border: '1px solid #c2d9ff' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1565c0', marginBottom: '10px' }}>📞 Contacto rápido</h3>
              <p style={{ fontSize: '13px', color: '#333', marginBottom: '12px' }}>{pedido.comprador_nombre}</p>
              <a href={"https://wa.me/" + pedido.telefono.replace(/\D/g, '') + "?text=" + encodeURIComponent("Hola " + pedido.comprador_nombre + ", te contacto por tu pedido en Driny #" + id.slice(0, 8).toUpperCase())} target="_blank"
                style={{ backgroundColor: '#25d366', color: 'white', padding: '10px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', textAlign: 'center', width: '100%', boxSizing: 'border-box' as const }}>
                💬 Escribir por WhatsApp
              </a>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}