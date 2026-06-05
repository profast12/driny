import Image from "next/image";

export default function PoliticaCookies() {
  return (
    <main style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      {/* NAVBAR */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/">
          <Image src="/logo.png" alt="Driny" width={65} height={65} style={{ width: 'auto', height: '55px' }} />
        </a>
        <a href="/" style={{ fontSize: '13px', color: '#f90', textDecoration: 'none', fontWeight: '700' }}>
          Volver al inicio
        </a>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '48px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>

          <div style={{ marginBottom: '36px', paddingBottom: '24px', borderBottom: '2px solid #f90' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111', marginBottom: '8px', fontFamily: 'Arial Black, sans-serif' }}>
              Politica de Cookies
            </h1>
            <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>Ultima actualizacion: Junio 2025</p>
          </div>

          {[
            {
              titulo: '1. Que son las cookies',
              contenido: 'Las cookies son pequenos archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde tus preferencias y mejore tu experiencia de navegacion. Las cookies no contienen informacion personal identificable por si solas.'
            },
            {
              titulo: '2. Cookies que utilizamos',
              contenido: null,
              lista: [
                { nombre: 'Cookies esenciales', desc: 'Necesarias para el funcionamiento basico de Driny. Incluyen cookies de sesion para mantener tu inicio de sesion activo y cookies de seguridad para proteger tu cuenta. No pueden desactivarse.' },
                { nombre: 'Cookies de preferencias', desc: 'Recuerdan tus configuraciones como el idioma seleccionado, la moneda preferida y otras personalizaciones para mejorar tu experiencia.' },
                { nombre: 'Cookies analiticas', desc: 'Nos ayudan a entender como los usuarios interactuan con Driny para mejorar nuestros servicios. La informacion recopilada es anonima y agregada.' },
                { nombre: 'Cookies de Google Translate', desc: 'Cuando utilizas el selector de idioma, Google Translate puede establecer cookies para recordar tu preferencia de idioma.' },
              ]
            },
            {
              titulo: '3. Base legal',
              contenido: 'El uso de cookies en Driny se basa en la Ley 1581 de 2012 (Ley de Habeas Data) y el Decreto 1377 de 2013 de Colombia, que regulan el tratamiento de datos personales. Para cookies no esenciales, solicitamos tu consentimiento expreso antes de activarlas.'
            },
            {
              titulo: '4. Duracion de las cookies',
              contenido: null,
              lista: [
                { nombre: 'Cookies de sesion', desc: 'Se eliminan automaticamente cuando cierras el navegador.' },
                { nombre: 'Cookies persistentes', desc: 'Permanecen en tu dispositivo por un periodo determinado, generalmente entre 30 dias y 1 ano, segun su funcion.' },
              ]
            },
            {
              titulo: '5. Como controlar las cookies',
              contenido: 'Puedes controlar y gestionar las cookies de las siguientes formas:',
              lista: [
                { nombre: 'Configuracion del navegador', desc: 'La mayoria de navegadores permiten controlar las cookies desde su configuracion. Puedes bloquear, eliminar o recibir alertas sobre cookies.' },
                { nombre: 'Opcion de rechazo', desc: 'Al usar Driny por primera vez, puedes rechazar las cookies no esenciales a traves del banner de consentimiento que aparece en pantalla.' },
                { nombre: 'Revocar consentimiento', desc: 'Puedes revocar tu consentimiento en cualquier momento limpiando las cookies de tu navegador o contactandonos.' },
              ]
            },
            {
              titulo: '6. Cookies de terceros',
              contenido: 'Algunos servicios de terceros integrados en Driny pueden establecer sus propias cookies:',
              lista: [
                { nombre: 'PayPal', desc: 'Para procesar pagos de forma segura. Consulta la politica de cookies de PayPal en paypal.com.' },
                { nombre: 'Supabase', desc: 'Para autenticacion y gestion de sesiones de usuario.' },
                { nombre: 'Google Translate', desc: 'Para el servicio de traduccion de la plataforma.' },
              ]
            },
            {
              titulo: '7. Impacto de desactivar cookies',
              contenido: 'Si decides desactivar las cookies esenciales, algunas funciones de Driny pueden no funcionar correctamente, incluyendo el inicio de sesion, el carrito de compras y el proceso de pago. Las cookies no esenciales pueden desactivarse sin afectar las funcionalidades principales.'
            },
            {
              titulo: '8. Actualizaciones a esta politica',
              contenido: 'Podemos actualizar esta politica de cookies periodicamente para reflejar cambios en nuestras practicas o por requisitos legales. Te notificaremos sobre cambios significativos mediante un aviso visible en la plataforma.'
            },
            {
              titulo: '9. Contacto',
              contenido: 'Si tienes preguntas sobre nuestra politica de cookies, puedes contactarnos en: privacidad@driny.co'
            },
          ].map((seccion, i) => (
            <div key={i} style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#111', marginBottom: '12px', fontFamily: 'Arial Black, sans-serif' }}>
                {seccion.titulo}
              </h2>
              {seccion.contenido && (
                <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8, marginBottom: seccion.lista ? '12px' : 0 }}>
                  {seccion.contenido}
                </p>
              )}
              {seccion.lista && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {seccion.lista.map((item, j) => (
                    <div key={j} style={{ backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '14px 16px', border: '1px solid #eee', borderLeft: '3px solid #f90' }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>{item.nombre}</p>
                      <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div style={{ backgroundColor: '#fff8f0', borderRadius: '12px', padding: '20px', border: '1px solid #ffe0b2', marginTop: '8px' }}>
            <p style={{ fontSize: '13px', color: '#f90', fontWeight: '700', marginBottom: '6px' }}>Driny — Marketplace Colombiano</p>
            <p style={{ fontSize: '13px', color: '#888', margin: 0, lineHeight: 1.6 }}>
              Esta politica aplica exclusivamente a driny.vercel.app. Al continuar usando Driny despues de leer esta politica, confirmas que la has entendido y aceptado.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}