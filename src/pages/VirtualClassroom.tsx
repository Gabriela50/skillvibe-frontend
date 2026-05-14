import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles, User, Video, Mic, ScreenShare, Settings, Layout } from 'lucide-react';
import { ReactSketchCanvas, CanvasPath } from 'react-sketch-canvas';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import html2canvas from 'html2canvas';

// Configuración de la API externa (Smart Edu)
const SMART_EDU_API_URL = 'http://localhost:8081'; 

const VirtualClassroom = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [connected, setConnected] = useState(false);
  const canvasRef = useRef<any>(null);
  const stompClient = useRef<Client | null>(null);

  // 1. Conectar a los WebSockets de Smart Edu
  useEffect(() => {
    const socket = new SockJS(`${SMART_EDU_API_URL}/ws-board`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        setConnected(true);
        // Suscribirse a los eventos de la sala
        client.subscribe(`/topic/room/${roomId}/board`, (message) => {
          const event = JSON.parse(message.body);
          if (event.action === 'add' && event.element?.type === 'path') {
             const pathData = JSON.parse(event.element.content);
             canvasRef.current?.loadPaths([pathData]);
          } else if (event.action === 'clear') {
             canvasRef.current?.clearCanvas();
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      }
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [roomId]);

  // 2. Sincronizar trazos
  const handleStroke = (path: CanvasPath) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/room/${roomId}/board`,
        body: JSON.stringify({
          action: 'add',
          element: {
            type: 'path',
            content: JSON.stringify(path)
          }
        })
      });
    }
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/room/${roomId}/board`,
        body: JSON.stringify({ action: 'clear' })
      });
    }
  };

  // 3. Consumir la IA de Smart Edu
  const handleAnalyze = async () => {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;

    setLoadingAI(true);
    try {
      const canvas = await html2canvas(canvasContainer);
      const base64Image = canvas.toDataURL('image/png').split(',')[1];

      // Llamada a la API de Smart Edu
      const response = await axios.post(`${SMART_EDU_API_URL}/api/exercises/analyze`, {
        subject: 'Matemáticas', // Podríamos hacerlo dinámico
        base64Image: base64Image
      });

      setFeedback(response.data.aiFeedback);
    } catch (err) {
      console.error('Error al analizar:', err);
      setFeedback('Error al conectar con el servicio de IA de Smart Edu.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="classroom-layout" style={{ height: 'calc(100vh - 70px)', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1rem', padding: '1rem', background: '#0f172a' }}>
      
      {/* Main Area: Video + Board */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        
        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.5)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <ChevronLeft size={20} /> Salir del Aula
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: connected ? '#10b981' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#10b981' : '#f87171' }} />
              {connected ? 'Sincronizado' : 'Desconectado'}
            </span>
          </div>
        </div>

        {/* Board Area */}
        <div id="canvas-container" style={{ flex: 1, background: 'white', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={4}
            strokeColor="#1e293b"
            onStroke={handleStroke}
            style={{ width: '100%', height: '100%' }}
          />
          
          {/* Toolbar Overlay */}
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '50px', display: 'flex', gap: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
             <button onClick={handleClear} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.5rem' }} title="Limpiar">Limpiar</button>
             <button onClick={handleAnalyze} disabled={loadingAI} style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)', border: 'none', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
               {loadingAI ? 'Analizando...' : <><Sparkles size={16} /> Analizar con IA</>}
             </button>
          </div>
        </div>

        {/* Video Strip (Mock) */}
        <div style={{ display: 'flex', gap: '1rem', height: '120px' }}>
          <div style={{ flex: 1, background: '#1e293b', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>Tú (Estudiante)</div>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><User size={40} color="#64748b" /></div>
          </div>
          <div style={{ flex: 1, background: '#1e293b', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>Profesor</div>
             <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Video size={40} color="#64748b" /></div>
          </div>
          <div style={{ width: '200px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button style={{ background: '#334155', border: 'none', borderRadius: '8px', color: 'white' }}><Mic size={20} /></button>
            <button style={{ background: '#334155', border: 'none', borderRadius: '8px', color: 'white' }}><Video size={20} /></button>
            <button style={{ background: '#334155', border: 'none', borderRadius: '8px', color: 'white' }}><ScreenShare size={20} /></button>
            <button style={{ background: '#334155', border: 'none', borderRadius: '8px', color: 'white' }}><Settings size={20} /></button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: AI Feedback & Chat */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ flex: 1, background: 'rgba(30,41,59,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            <Sparkles size={20} color="#a855f7" /> Retroalimentación IA
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.95rem', lineHeight: '1.6', color: '#cbd5e1' }}>
            {feedback ? (
              <div className="animate-fade-in" style={{ background: 'rgba(168,85,247,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.1)' }}>
                {feedback}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>
                <Layout size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p>Usa la pizarra y pulsa "Analizar con IA" para recibir correcciones en tiempo real.</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ height: '250px', background: 'rgba(30,41,59,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>Hoy, 10:30 AM</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" placeholder="Escribe un mensaje..." style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.5rem 1rem', color: 'white', fontSize: '0.9rem' }} />
            <button style={{ background: '#a855f7', border: 'none', borderRadius: '8px', padding: '0.5rem', color: 'white' }}><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualClassroom;
