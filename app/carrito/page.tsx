"use client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Carrito() {
  const [items, setItems] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login';
        return;
      }
      setUsuario(session.user);
      cargarCarrito(session.user.id);
    });
  }, []);

  const cargarCarrito = async (userId: string) => {
    setCargando(true);
    const { data } = await supabase
      .from('carrito')
      .select('*, productos(*)')
      .eq('usuario_id', userId);
    if (data) setItems(data);
    setCargando(false);
  };

  const eliminar = async (id: string) => {
    await supabase.from('carrito').delete().eq('id', id);
    if (usuario) cargarCarrito(usuario.id);
  };

  const aumentar = async (id: string, cantidad: number) => {
    await supabase.from('carrito').update({ cantidad: cantidad + 1 }).eq('id', id);
    if (usuario) cargarCarrito(usuario.id);
  };

  const disminuir = async (id: string, cantidad: number) => {
    if (cantidad <= 1) return;
    await supabase.from('carrito').update({ cantidad: cantidad - 1 }).eq('id', id);
    if (usuario) cargarCarrito(usuario.id);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.productos?.precio || 0) * item.cantidad, 0);
  const envio = 0;
  const total = subtotal;

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
        <a href="/login" style={{ color: 'white', fontSize: '14px', textDecoration: 'none' }}>Mi cuenta</a>
      </nav>

      <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '24px' }}>🛒 Mi carrito</h1>

        {cargando ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            color: '#888'
          }}>
            <p>Cargando carrito...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '80px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
            <h2 style={{ fontSize: '22px', marginBottom: '12px' }}>Tu carrito está vacío</h2>
            <p style={{ color: '#888', marginBottom: '24px' }}>Agrega productos para continuar</p>
            <a href="/productos" style={{
              backgroundColor: '#f90',
              color: '#111',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: 'bold',
              textDecoration: 'none',
              fontSize: '15px'
            }}>
              Ver productos
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

            {/* LISTA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map(item => (
                <div key={item.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    width: '80px',
                    height: '80px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    flexShrink: 0
                  }}>{item.productos?.emoji || '🛍️'}</div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '6px' }}>
                      {item.productos?.nombre}
                    </p>
                    <p style={{ color: '#f90', fontWeight: 'bold', fontSize: '16px' }}>
                      ${Number(item.productos?.precio).toLocaleString('es-CO')} COP
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => disminuir(item.id, item.cantidad)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        border: '2px solid #e5e7eb', backgroundColor: 'white',
                        fontSize: '18px', cursor: 'pointer'
                      }}
                    >−</button>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => aumentar(item.id, item.cantidad)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        border: '2px solid #e5e7eb', backgroundColor: 'white',
                        fontSize: '18px', cursor: 'pointer'
                      }}
                    >+</button>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Subtotal</p>
                    <p style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      ${(Number(item.productos?.precio) * item.cantidad).toLocaleString('es-CO')}
                    </p>
                  </div>

                  <button
                    onClick={() => eliminar(item.id)}
                    style={{
                      backgroundColor: 'transparent', border: 'none',
                      cursor: 'pointer', fontSize: '20px', color: '#888'
                    }}
                  >🗑️</button>
                </div>
              ))}

              <a href="/productos" style={{
                color: '#f90', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold'
              }}>← Seguir comprando</a>
            </div>

            {/* RESUMEN */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '300px',
              minWidth: '300px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Resumen del pedido</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span>${subtotal.toLocaleString('es-CO')} COP</span>
              </div>

              
                

              <div style={{
                borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '12px',
                display: 'flex', justifyContent: 'space-between', marginBottom: '20px'
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Total</span>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#f90' }}>
                  ${total.toLocaleString('es-CO')} COP
                </span>
              </div>

              <PayPalScriptProvider options={{
  clientId: "AW_ux8LNCrEoHuA9klwfwsp850LjmjMRcZF3HvXkindzGjuC8Nchao6WUmLPpQfRE61JHg2u7Qu97Abf",
  currency: "USD"
}}>
  <PayPalButtons
    style={{ layout: "vertical" }}
    createOrder={(data, actions) => {
      return actions.order.create({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: (total / 4200).toFixed(2)
          },
          description: "Compra en Driny"
        }]
      });
    }}
    onApprove={async (data, actions) => {
  if (actions.order) {
    await actions.order.capture();

    for (const item of items) {
      if (item.productos?.vendedor_id) {
        await supabase.from('notificaciones').insert([{
          usuario_id: item.productos.vendedor_id,
          titulo: '¡Nueva venta! 💰',
          mensaje: `Vendiste "${item.productos.nombre}" por $${Number(item.productos.precio).toLocaleString('es-CO')} COP`
        }]);
      }
    }

    await supabase.from('carrito').delete().eq('usuario_id', usuario.id);
    alert("✅ ¡Pago exitoso! Gracias por tu compra en Driny.");
    window.location.href = "/";
  }
}}
    onError={() => {
      alert("❌ Error al procesar el pago. Intenta de nuevo.");
    }}
  />
</PayPalScriptProvider>

              <div style={{
                backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '12px',
                fontSize: '12px', color: '#666', textAlign: 'center'
              }}>
                🔒 Pago seguro con Wompi
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}