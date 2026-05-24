"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState("comprador");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const registrar = async () => {
    if (!nombre || !email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres");
      return;
    }

    setCargando(true);
    setError("");
    setMensaje("");

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, tipo }
      }
    });

    if (authError) {
      setError("Error al crear la cuenta: " + authError.message);
      setCargando(false);
      return;
    }

    const { error: dbError } = await supabase
      .from('usuarios')
      .insert([{ nombre, email, tipo }]);

    if (dbError) {
      setError("Error al guardar los datos");
      setCargando(false);
      return;
    }

    setMensaje("¡Cuenta creada exitosamente! Revisa tu correo para confirmar.");
    setCargando(false);
  };

  return (
    <main style={{
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>

      <nav style={{
        backgroundColor: '#111',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <a href="/" style={{ color: '#f90', fontSize: '26px', fontWeight: 'bold', textDecoration: 'none' }}>Driny</a>
        <a href="/login" style={{ color: 'white', fontSize: '14px', textDecoration: 'none' }}>
          ¿Ya tienes cuenta? <span style={{ color: '#f90', fontWeight: 'bold' }}>Inicia sesión</span>
        </a>
      </nav>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px' }}>Crear cuenta</h2>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>Únete a Driny gratis</p>

          {mensaje && (
            <div style={{
              backgroundColor: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#065f46'
            }}>
              ✅ {mensaje}
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#991b1b'
            }}>
              ❌ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {['comprador', 'vendedor'].map(t => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: tipo === t ? '2px solid #f90' : '2px solid #e5e7eb',
                  backgroundColor: tipo === t ? '#fff8ee' : 'white',
                  fontWeight: tipo === t ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: tipo === t ? '#f90' : '#666'
                }}
              >
                {t === 'comprador' ? '🛒 Comprador' : '🏪 Vendedor'}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.border = '2px solid #f90'}
              onBlur={e => e.target.style.border = '2px solid #e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tucorreo@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.border = '2px solid #f90'}
              onBlur={e => e.target.style.border = '2px solid #e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.border = '2px solid #f90'}
              onBlur={e => e.target.style.border = '2px solid #e5e7eb'}
            />
          </div>

          <button
            onClick={registrar}
            disabled={cargando}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: cargando ? '#ccc' : '#f90',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
            ¿Ya tienes cuenta?{' '}
            <a href="/login" style={{ color: '#f90', fontWeight: 'bold', textDecoration: 'none' }}>
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}