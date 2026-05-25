"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Carrito() {
  const [items, setItems] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  const [paso, setPaso] = useState<'carrito' | 'direccion' | 'pago'>('carrito');
  const [direccion, setDireccion] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    notas: ''
  });
  const [errorDireccion, setErrorDireccion] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login';
        return;
      }
      setUsuario(session.user);
      cargarCarrito(session.user.id);

      const { data: perfil } = await supabase
        .from('usuarios')
        .select('nombre')
        .eq('email', session.user.email)
        .single();
      if (perfil) setDireccion(prev => ({ ...prev, nombre: perfil.nombre || '' }));
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

  const validarDireccion = () => {
    if (!direccion.nombre || !direccion.telefono || !direccion.direccion || !direccion.ciudad || !direccion.departamento) {
      setErrorDireccion("Por favor completa todos los campos obligatorios");
      return false;
    }
    setErrorDireccion('');
    return true;
  };

  const guardarPedido = async () => {
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .insert([{
        comprador_id: usuario.id,
        comprador_email: usuario.email,
        comprador_nombre: direccion.nombre,
        direccion: direccion.direccion,
        ciudad: direccion.ciudad,
        departamento: direccion.departamento,
        telefono: direccion.telefono,
        notas: direccion.notas,
        total,
        estado: 'pagado'
      }])
      .select()
      .single();

    if (error || !pedido) return;

    for (const item of items) {
      await supabase.from('pedido_items').insert([{
        pedido_id: pedido.id,
        producto_id: item.productos?.id,
        nombre_producto: item.productos?.nombre,
        precio: item.productos?.precio,
        cantidad: item.cantidad,
        vendedor_id: item.productos?.vendedor_id
      }]);

      if (item.productos?.vendedor_id) {
        await supabase.from('notificaciones').insert([{
          usuario_id: item.productos.vendedor_id,
          titulo: '¡Nueva venta! 💰',
          mensaje: `Vendiste "${item.productos.nombre}" — Comprador: ${direccion.nombre} | Tel: ${direccion.telefono} | Dirección: ${direccion.direccion}, ${direccion.ciudad}, ${direccion.departamento}`,
          pedido_id: pedido.id
        }]);
      }
    }

    await supabase.from('carrito').delete().eq('usuario_id', usuario.id);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.productos?.precio || 0) * item.cantidad, 0);
  const total = subtotal;

  return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        backgroundColor: '#111', padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: '20px'
      }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <div style={{ flex: 1 }}></div>
        <a href="/login" style={{ color: 'white', fontSize: '14px', textDecoration: 'none' }}>Mi cuenta</a>
      </nav>

      {/* PASOS */}
      <div style={{
        backgroundColor: 'white', padding: '16px 24px',
        display: 'flex', justifyContent: 'center', gap: '8px',
        alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        {[
          { id: 'carrito', label: '🛒 Carrito' },
          { id: 'direccion', label: '📦 Dirección' },
          { id: 'pago', label: '💳 Pago' }
        ].map((p, i) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold',
              backgroundColor: paso === p.id ? '#111' : '#f3f4f6',
              color: paso === p.id ? '#f90' : '#888'
            }}>{p.label}</span>
            {i < 2 && <span style={{ color: '#ccc' }}>→</span>}
          </div>
        ))}
      </div>

      <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* PASO 1: CARRITO */}
        {paso === 'carrito' && (
          <>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '24px' }}>🛒 Mi carrito</h1>
            {cargando ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Cargando carrito...</div>
            ) : items.length === 0 ? (
              <div style={{
                backgroundColor: 'white', borderRadius: '16px', padding: '80px',
                textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
                <h2 style={{ fontSize: '22px', marginBottom: '12px' }}>Tu carrito está vacío</h2>
                <a href="/productos" style={{
                  backgroundColor: '#f90', color: '#111', padding: '12px 28px',
                  borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px'
                }}>Ver productos</a>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map(item => (
                    <div key={item.id} style={{
                      backgroundColor: 'white', borderRadius: '12px', padding: '20px',
                      display: 'flex', alignItems: 'center', gap: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      <div style={{
                        backgroundColor: '#f3f4f6', width: '80px', height: '80px',
                        borderRadius: '10px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '36px', flexShrink: 0, overflow: 'hidden'
                      }}>
                        {item.productos?.imagen_url ? (
                          <img src={item.productos.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : item.productos?.emoji || '🛍️'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '6px' }}>{item.productos?.nombre}</p>
                        <p style={{ color: '#f90', fontWeight: 'bold', fontSize: '16px' }}>
                          ${Number(item.productos?.precio).toLocaleString('es-CO')} COP
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => disminuir(item.id, item.cantidad)} style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '2px solid #e5e7eb', backgroundColor: 'white', fontSize: '18px', cursor: 'pointer'
                        }}>−</button>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>
                          {item.cantidad}
                        </span>
                        <button onClick={() => aumentar(item.id, item.cantidad)} style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '2px solid #e5e7eb', backgroundColor: 'white', fontSize: '18px', cursor: 'pointer'
                        }}>+</button>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '120px' }}>
                        <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Subtotal</p>
                        <p style={{ fontWeight: 'bold', fontSize: '16px' }}>
                          ${(Number(item.productos?.precio) * item.cantidad).toLocaleString('es-CO')}
                        </p>
                      </div>
                      <button onClick={() => eliminar(item.id)} style={{
                        backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#888'
                      }}>🗑️</button>
                    </div>
                  ))}
                  <a href="/productos" style={{ color: '#f90', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                    ← Seguir comprando
                  </a>
                </div>

                <div style={{
                  backgroundColor: 'white', borderRadius: '16px', padding: '24px',
                  width: '300px', minWidth: '300px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Resumen</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px' }}>
                    <span style={{ color: '#666' }}>Total</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#f90' }}>
                      ${total.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                  <button
                    onClick={() => setPaso('direccion')}
                    style={{
                      width: '100%', padding: '14px', backgroundColor: '#f90',
                      border: 'none', borderRadius: '8px', fontWeight: 'bold',
                      fontSize: '16px', cursor: 'pointer'
                    }}
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* PASO 2: DIRECCIÓN */}
        {paso === 'direccion' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '24px' }}>📦 Dirección de envío</h1>
            <div style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {errorDireccion && (
                <div style={{
                  backgroundColor: '#fee2e2', border: '1px solid #fca5a5',
                  borderRadius: '8px', padding: '12px', marginBottom: '16px',
                  fontSize: '14px', color: '#991b1b'
                }}>❌ {errorDireccion}</div>
              )}

              {[
                { label: 'Nombre completo *', key: 'nombre', placeholder: 'Tu nombre completo', type: 'text' },
                { label: 'Teléfono *', key: 'telefono', placeholder: 'Ej: 3001234567', type: 'tel' },
                { label: 'Dirección *', key: 'direccion', placeholder: 'Calle, carrera, número, apto', type: 'text' },
                { label: 'Ciudad *', key: 'ciudad', placeholder: 'Ej: Cali', type: 'text' },
                { label: 'Departamento *', key: 'departamento', placeholder: 'Ej: Valle del Cauca', type: 'text' },
                { label: 'Notas adicionales', key: 'notas', placeholder: 'Instrucciones especiales de entrega', type: 'text' },
              ].map(campo => (
                <div key={campo.key} style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                    {campo.label}
                  </label>
                  <input
                    type={campo.type}
                    placeholder={campo.placeholder}
                    value={direccion[campo.key as keyof typeof direccion]}
                    onChange={e => setDireccion(prev => ({ ...prev, [campo.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '8px',
                      border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.border = '2px solid #f90'}
                    onBlur={e => e.target.style.border = '2px solid #e5e7eb'}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => setPaso('carrito')}
                  style={{
                    flex: 1, padding: '12px', backgroundColor: '#f3f4f6',
                    border: 'none', borderRadius: '8px', fontWeight: 'bold',
                    fontSize: '15px', cursor: 'pointer', color: '#666'
                  }}
                >← Volver</button>
                <button
                  onClick={() => {
                    if (validarDireccion()) setPaso('pago');
                  }}
                  style={{
                    flex: 2, padding: '12px', backgroundColor: '#f90',
                    border: 'none', borderRadius: '8px', fontWeight: 'bold',
                    fontSize: '15px', cursor: 'pointer'
                  }}
                >Continuar al pago →</button>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: PAGO */}
        {paso === 'pago' && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '24px' }}>💳 Pago</h1>

            {/* RESUMEN DIRECCIÓN */}
            <div style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>📦 Enviar a</h3>
                <button onClick={() => setPaso('direccion')} style={{
                  background: 'none', border: 'none', color: '#f90', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
                }}>Cambiar</button>
              </div>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
                <strong>{direccion.nombre}</strong><br />
                {direccion.direccion}, {direccion.ciudad}, {direccion.departamento}<br />
                Tel: {direccion.telefono}
                {direccion.notas && <><br />Nota: {direccion.notas}</>}
              </p>
            </div>

            {/* RESUMEN PEDIDO */}
            <div style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>Resumen del pedido</h3>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '14px', marginBottom: '8px'
                }}>
                  <span>{item.productos?.nombre} x{item.cantidad}</span>
                  <span style={{ fontWeight: 'bold' }}>
                    ${(Number(item.productos?.precio) * item.cantidad).toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Total</span>
                <span style={{ fontWeight: 'bold', color: '#f90', fontSize: '18px' }}>
                  ${total.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            {/* PAYPAL */}
            <div style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>Método de pago</h3>
              <PayPalScriptProvider options={{
                clientId: "AU_LWUBY_cVr1GF3VGQMOWe4yXeHv_tCqsZNaQaSEIpGk5zH5DtfTh8s8IpxN3JmNvBFbnBSDIpuosPi",
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
                      await guardarPedido();
                      window.location.href = "/pedido-exitoso";
                    }
                  }}
                  onError={() => {
                    alert("❌ Error al procesar el pago. Intenta de nuevo.");
                  }}
                />
              </PayPalScriptProvider>
            </div>

            <button
              onClick={() => setPaso('direccion')}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#f3f4f6',
                border: 'none', borderRadius: '8px', fontWeight: 'bold',
                fontSize: '15px', cursor: 'pointer', color: '#666', marginTop: '12px'
              }}
            >← Volver</button>
          </div>
        )}
      </div>
    </main>
  );
}