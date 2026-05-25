export default function PedidoExitoso() {
  return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#111', padding: '14px 24px' }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎉</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>¡Pedido exitoso!</h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
          Tu pago fue procesado correctamente. El vendedor recibirá tu información de envío.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a href="/perfil" style={{
            backgroundColor: '#111', color: '#f90', padding: '14px 28px',
            borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px'
          }}>Ver mis compras</a>
          <a href="/productos" style={{
            backgroundColor: '#f90', color: '#111', padding: '14px 28px',
            borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px'
          }}>Seguir comprando</a>
        </div>
      </div>
    </main>
  );
}