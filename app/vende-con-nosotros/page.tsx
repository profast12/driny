"use client";
import { useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabase";

export default function VendeConNosotros() {

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('tipo')
          .eq('email', session.user.email)
          .single();
        if (perfil?.tipo === 'vendedor') {
          window.location.href = '/vender';
        }
      }
    });
  }, []);

  return (
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        backgroundColor: '#eeeeee',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <a href="/">
  <Image
    src="/logo.png"
    alt="Driny"
    width={60}
    height={60}
    style={{
      width: 'auto',
      height: '60px'
    }}
  />
</a>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Iniciar sesión</a>
          <a href="/registro" style={{
            backgroundColor: '#f90', color: '#111', padding: '8px 16px',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px'
          }}>Crear cuenta</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '80px 24px'
      }}>
        <p style={{ color: '#f90', letterSpacing: '3px', fontSize: '13px', marginBottom: '16px' }}>
          VENDE EN DRINY
        </p>
        <h1 style={{ fontSize: '44px', fontWeight: 'bold', marginBottom: '20px', lineHeight: 1.2 }}>
          Llega a miles de compradores<br />en toda Colombia
        </h1>
        <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '36px', maxWidth: '600px', margin: '0 auto 36px' }}>
          Crea tu tienda gratis, sube tus productos y empieza a vender hoy mismo. Sin costos fijos, solo pagas cuando vendes.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a href="/registro" style={{
            backgroundColor: '#f90', color: '#111', padding: '16px 36px',
            borderRadius: '10px', fontWeight: 'bold', fontSize: '17px', textDecoration: 'none'
          }}>
            Crear cuenta vendedor gratis
          </a>
          <a href="/login" style={{
            backgroundColor: 'transparent', border: '2px solid #f90', color: '#f90',
            padding: '16px 36px', borderRadius: '10px', fontWeight: 'bold',
            fontSize: '17px', textDecoration: 'none'
          }}>
            Ya tengo cuenta
          </a>
        </div>
      </div>

      {/* ESTADISTICAS */}
      <div style={{
        backgroundColor: '#111',
        padding: '40px 24px',
        display: 'flex',
        justifyContent: 'center',
        gap: '60px',
        flexWrap: 'wrap'
      }}>
        {[
          { numero: '0%', label: 'Costo de registro' },
          { numero: '5%', label: 'Comisión por venta' },
          { numero: '24/7', label: 'Soporte disponible' },
          { numero: '100%', label: 'Pagos seguros' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center', color: 'white' }}>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#f90', marginBottom: '4px' }}>{stat.numero}</p>
            <p style={{ fontSize: '14px', color: '#aaa' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* BENEFICIOS */}
      <section style={{ padding: '60px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '48px' }}>
          ¿Por qué vender en Driny?
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {[
            {
              emoji: '🚀',
              titulo: 'Empieza en minutos',
              descripcion: 'Crea tu cuenta, sube tus productos y empieza a recibir pedidos el mismo día. Sin complicaciones.'
            },
            {
              emoji: '💰',
              titulo: 'Sin costos fijos',
              descripcion: 'No pagas nada por registrarte. Solo cobramos una pequeña comisión cuando realizas una venta exitosa.'
            },
            {
              emoji: '🔒',
              titulo: 'Pagos seguros',
              descripcion: 'Integración con PayPal y próximamente más métodos de pago. Tu dinero siempre protegido.'
            },
            {
              emoji: '📦',
              titulo: 'Gestión fácil',
              descripcion: 'Panel de control intuitivo para administrar tus productos, ver tus ventas y gestionar tu inventario.'
            },
            {
              emoji: '🔨',
              titulo: 'Subastas incluidas',
              descripcion: 'Publica subastas de tus productos y genera más ventas con precios dinámicos en tiempo real.'
            },
            {
              emoji: '📊',
              titulo: 'Estadísticas en tiempo real',
              descripcion: 'Visualiza cuántas personas ven tus productos, cuánto vendes y cómo crecer tu negocio.'
            },
          ].map((b, i) => (
            <div key={i} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{b.emoji}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{b.titulo}</h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7 }}>{b.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ backgroundColor: '#111', padding: '60px 24px', color: 'white' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '48px' }}>
          ¿Cómo funciona?
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          flexWrap: 'wrap',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {[
            { numero: '1', titulo: 'Crea tu cuenta', descripcion: 'Regístrate gratis como vendedor en menos de 2 minutos.' },
            { numero: '2', titulo: 'Sube tus productos', descripcion: 'Agrega fotos, descripción y precio de lo que quieres vender.' },
            { numero: '3', titulo: 'Recibe pedidos', descripcion: 'Los compradores encuentran tus productos y pagan de forma segura.' },
            { numero: '4', titulo: 'Cobra tu dinero', descripcion: 'Recibe el pago directamente en tu cuenta de PayPal.' },
          ].map((paso, i) => (
            <div key={i} style={{ textAlign: 'center', maxWidth: '180px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                backgroundColor: '#f90', color: '#111', fontSize: '22px',
                fontWeight: 'bold', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px'
              }}>{paso.numero}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{paso.titulo}</h3>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.6 }}>{paso.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
          ¿Listo para empezar?
        </h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
          Únete a los vendedores que ya están creciendo con Driny
        </p>
        <a href="/registro" style={{
          backgroundColor: '#111', color: '#f90', padding: '16px 40px',
          borderRadius: '10px', fontWeight: 'bold', fontSize: '18px',
          textDecoration: 'none', border: '2px solid #f90'
        }}>
          🏪 Crear mi tienda gratis
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#111', color: '#aaa',
        textAlign: 'center', padding: '24px', fontSize: '13px'
      }}>
        © 2025 Driny — Todos los derechos reservados | Colombia 🇨🇴
      </footer>

    </main>
  );
}