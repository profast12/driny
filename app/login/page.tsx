"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const iniciarSesion = async () => {
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setCargando(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setError("Correo o contraseña incorrectos");
      setCargando(false);
      return;
    }

    window.location.href = "/";
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
        <a href="/registro" style={{ color: 'white', fontSize: '14px', textDecoration: 'none' }}>
          ¿No tienes cuenta? <span style={{ color: '#f90', fontWeight: 'bold' }}>Regístrate</span>
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
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px' }}>Iniciar sesión</h2>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>Bienvenido de nuevo a Driny</p>

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

          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Tu contraseña"
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

          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', color: '#f90', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</span>
          </div>

          <button
            onClick={iniciarSesion}
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
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
            ¿No tienes cuenta?{' '}
            <a href="/registro" style={{ color: '#f90', fontWeight: 'bold', textDecoration: 'none' }}>
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}