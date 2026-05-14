import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { tutoriasApi, TutorProfile } from '../services/api';

interface BookingModalProps {
  tutor: TutorProfile;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ tutor, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    description: '',
    materia: tutor.subjects[0] || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fechaHora = `${formData.date}T${formData.time}:00`;
      await tutoriasApi.reservar({
        tutorId: tutor.userId,
        materia: formData.materia,
        descripcion: formData.description,
        fechaHora
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo realizar la reserva. Verifica tu saldo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card animate-scale-in" style={{
        maxWidth: '500px', width: '100%', padding: '2.5rem', position: 'relative',
        border: '1px solid rgba(168,85,247,0.3)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem',
          background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ 
              width: '80px', height: '80px', background: 'rgba(16,185,129,0.1)', 
              borderRadius: '50%', display: 'flex', justifyContent: 'center', 
              alignItems: 'center', margin: '0 auto 1.5rem' 
            }}>
              <CheckCircle2 size={48} color="#10b981" />
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>¡Reserva Confirmada!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Tu clase con {tutor.fullName} ha sido programada con éxito.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Reservar Tutoría</h2>
              <p style={{ color: 'var(--text-muted)' }}>Estás por agendar una sesión con <strong>{tutor.fullName}</strong></p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Fecha</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="date" 
                      required 
                      className="form-input" 
                      style={{ paddingLeft: '3rem' }}
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Hora</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="time" 
                      required 
                      className="form-input" 
                      style={{ paddingLeft: '3rem' }}
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Materia</label>
                <select 
                  className="form-input"
                  value={formData.materia}
                  onChange={(e) => setFormData({...formData, materia: e.target.value})}
                >
                  {tutor.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>¿Qué quieres aprender?</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="Describe brevemente tus dudas o temas a tratar..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ 
                background: 'rgba(168,85,247,0.05)', borderRadius: '12px', 
                padding: '1rem', border: '1px solid rgba(168,85,247,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={18} color="#10b981" />
                  <span style={{ fontWeight: 600 }}>Total a pagar:</span>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                  ${tutor.hourlyRate.toFixed(2)}
                </span>
              </div>

              {error && (
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  color: '#f87171', background: 'rgba(248,113,113,0.1)', 
                  padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' 
                }}>
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Reserva'}
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BookingModal;
