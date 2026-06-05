"use client";
import { useState, useEffect, useRef } from "react";

interface Mensaje {
  role: 'user' | 'assistant';
  content: string;
}

export default function DrinyBot({ idioma = 'es' }: { idioma?: string }) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { role: 'assistant', content: '¡Hola! Soy DrinyBot, tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const saludos: any = {
    'es': '¡Hola! Soy DrinyBot, tu asistente virtual. ¿En qué puedo ayudarte hoy?',
    'en': 'Hi! I\'m DrinyBot, your virtual assistant. How can I help you today?',
    'fr': 'Bonjour! Je suis DrinyBot, votre assistant virtuel. Comment puis-je vous aider?',
    'pt': 'Olá! Sou o DrinyBot, seu assistente virtual. Como posso ajudá-lo hoje?',
    'de': 'Hallo! Ich bin DrinyBot, Ihr virtueller Assistent. Wie kann ich Ihnen helfen?',
    'it': 'Ciao! Sono DrinyBot, il tuo assistente virtuale. Come posso aiutarti oggi?',
    'zh-CN': '你好！我是DrinyBot，您的虚拟助手。今天我能帮您什么？',
    'ja': 'こんにちは！私はDrinyBotです。今日はどのようにお手伝いできますか？',
    'ko': '안녕하세요! 저는 DrinyBot입니다. 오늘 어떻게 도와드릴까요?',
    'ar': 'مرحبا! أنا DrinyBot، مساعدك الافتراضي. كيف يمكنني مساعدتك اليوم؟',
    'ru': 'Привет! Я DrinyBot, ваш виртуальный помощник. Чем могу помочь?',
  };

  const placeholders: any = {
    'es': 'Escribe tu pregunta...',
    'en': 'Type your question...',
    'fr': 'Écrivez votre question...',
    'pt': 'Digite sua pergunta...',
    'de': 'Schreibe deine Frage...',
    'it': 'Scrivi la tua domanda...',
    'zh-CN': '输入您的问题...',
    'ja': '質問を入力してください...',
    'ko': '질문을 입력하세요...',
    'ar': 'اكتب سؤالك...',
    'ru': 'Напишите ваш вопрос...',
  };

  useEffect(() => {
    setMensajes([{ role: 'assistant', content: saludos[idioma] || saludos['es'] }]);
  }, [idioma]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, abierto]);

  useEffect(() => {
    if (abierto) setTimeout(() => inputRef.current?.focus(), 300);
  }, [abierto]);

  const enviar = async () => {
    if (!input.trim() || cargando) return;
    const textoUsuario = input.trim();
    setInput('');

    const nuevosMensajes: Mensaje[] = [...mensajes, { role: 'user', content: textoUsuario }];
    setMensajes(nuevosMensajes);
    setCargando(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nuevosMensajes,
          idioma: idioma,
        }),
      });
      const data = await res.json();
      setMensajes(prev => [...prev, { role: 'assistant', content: data.respuesta }]);
    } catch {
      setMensajes(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.' }]);
    }

    setCargando(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  const limpiar = () => {
    setMensajes([{ role: 'assistant', content: saludos[idioma] || saludos['es'] }]);
  };

  return (
    <>
      <style>{`
        @keyframes botFadeIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes botPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes typing { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        .bot-msg { animation: msgIn 0.25s ease; }
        .bot-fab:hover { transform: scale(1.1) !important; box-shadow: 0 8px 30px rgba(255,153,0,0.5) !important; }
        @media (max-width: 480px) {
          .bot-window { width: calc(100vw - 32px) !important; right: 16px !important; bottom: 80px !important; height: 70vh !important; }
        }
      `}</style>

      {/* BOTON FLOTANTE */}
      <button
        className="bot-fab"
        onClick={() => setAbierto(!abierto)}
        style={{ position: 'fixed', bottom: '24px', right: '24px', width: '58px', height: '58px', borderRadius: '50%', background: 'linear-gradient(135deg, #f90, #ff6b00)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,153,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', animation: 'botPulse 3s infinite' }}
      >
        {abierto ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* VENTANA CHAT */}
      {abierto && (
        <div className="bot-window" style={{ position: 'fixed', bottom: '96px', right: '24px', width: '360px', height: '500px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 999, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'botFadeIn 0.3s ease', border: '1px solid #eee' }}>

          {/* HEADER */}
          <div style={{ background: 'linear-gradient(135deg, #f90, #ff6b00)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '800', fontSize: '15px', color: 'white', margin: 0, fontFamily: 'Arial Black, sans-serif' }}>DrinyBot</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>Asistente virtual · En linea</p>
              </div>
            </div>
            <button onClick={limpiar} title="Nueva conversacion" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
              </svg>
            </button>
          </div>

          {/* MENSAJES */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#fafafa' }}>
            {mensajes.map((msg, i) => (
              <div key={i} className="bot-msg" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-end' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #f90, #ff6b00)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                )}
                <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', backgroundColor: msg.role === 'user' ? '#f90' : 'white', color: msg.role === 'user' ? '#111' : '#333', fontSize: '13px', lineHeight: 1.6, fontWeight: msg.role === 'user' ? '600' : 'normal', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: msg.role === 'assistant' ? '1px solid #eee' : 'none' }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="bot-msg" style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #f90, #ff6b00)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </div>
                <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', backgroundColor: 'white', border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f90', animation: `typing 1.2s ease-in-out ${i * 0.2}s infinite` }}></div>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* SUGERENCIAS RAPIDAS */}
          {mensajes.length === 1 && (
            <div style={{ padding: '8px 12px', backgroundColor: '#fafafa', display: 'flex', gap: '6px', overflowX: 'auto', flexShrink: 0, borderTop: '1px solid #f0f0f0' }}>
              {[
                '¿Cómo comprar?',
                '¿Cómo vender?',
                '¿Cómo funcionan las subastas?',
                '¿Cómo pagar?',
              ].map((sug, i) => (
                <button key={i} onClick={() => { setInput(sug); setTimeout(() => enviar(), 100); }} style={{ padding: '6px 12px', borderRadius: '20px', border: '1.5px solid #f90', backgroundColor: 'white', color: '#f90', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0 }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f90'; (e.currentTarget as HTMLElement).style.color = '#111'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.color = '#f90'; }}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div style={{ padding: '12px 14px', backgroundColor: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholders[idioma] || placeholders['es']}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={cargando}
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #eee', borderRadius: '25px', fontSize: '13px', outline: 'none', transition: 'border 0.2s', backgroundColor: '#fafafa', color: '#333' }}
              onFocus={e => e.target.style.border = '1.5px solid #f90'}
              onBlur={e => e.target.style.border = '1.5px solid #eee'}
            />
            <button onClick={enviar} disabled={cargando || !input.trim()} style={{ width: '38px', height: '38px', borderRadius: '50%', background: input.trim() && !cargando ? 'linear-gradient(135deg, #f90, #ff6b00)' : '#f0f0f0', border: 'none', cursor: input.trim() && !cargando ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !cargando ? 'white' : '#bbb'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          {/* FOOTER */}
          <div style={{ padding: '6px', backgroundColor: 'white', textAlign: 'center', borderTop: '1px solid #f5f5f5' }}>
            <p style={{ fontSize: '10px', color: '#ccc', margin: 0 }}>Powered by <span style={{ color: '#f90', fontWeight: '700' }}>Driny AI</span></p>
          </div>
        </div>
      )}
    </>
  );
}