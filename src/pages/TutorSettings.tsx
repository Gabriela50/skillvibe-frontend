import React, { useState, useEffect } from 'react';
import { User, Mail, DollarSign, Briefcase, BookOpen, FileText, Save, CheckCircle, AlertCircle, Loader2, Plus, X } from 'lucide-react';
import { tutorApi, TutorProfile } from '../services/api';

const TutorSettings = () => {
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await tutorApi.getMyProfile();
      setProfile(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar el perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await tutorApi.updateProfile({
        bio: profile.bio,
        hourlyRate: profile.hourlyRate,
        yearsOfExperience: profile.yearsOfExperience,
        subjects: profile.subjects,
        credentialsUrl: profile.credentialsUrl,
        profilePictureUrl: profile.profilePictureUrl
      });
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil.' });
    } finally {
      setSaving(false);
    }
  };

  const addSubject = () => {
    if (newSubject && profile && !profile.subjects.includes(newSubject)) {
      setProfile({ ...profile, subjects: [...profile.subjects, newSubject] });
      setNewSubject('');
    }
  };

  const removeSubject = (sub: string) => {
    if (profile) {
      setProfile({ ...profile, subjects: profile.subjects.filter(s => s !== sub) });
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
    </div>
  );

  if (!profile) return <div className="container">Error al cargar el perfil.</div>;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '900px', paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Ajustes de Perfil Profesional</h1>
        <p style={{ color: 'var(--text-muted)' }}>Gestiona tu información pública, tarifas y materias para atraer a más estudiantes.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main Form */}
        <form onSubmit={handleSave} className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nombre Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="form-input" style={{ paddingLeft: '3rem', opacity: 0.7 }} value={profile.fullName} disabled />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="form-input" style={{ paddingLeft: '3rem', opacity: 0.7 }} value={profile.email} disabled />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tarifa por Hora ($)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: '3rem' }} 
                  value={profile.hourlyRate}
                  onChange={(e) => setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Años de Experiencia</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ paddingLeft: '3rem' }} 
                  value={profile.yearsOfExperience}
                  onChange={(e) => setProfile({ ...profile, yearsOfExperience: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Biografía Profesional</label>
            <div style={{ position: 'relative' }}>
              <FileText size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-muted)' }} />
              <textarea 
                className="form-input" 
                rows={5} 
                style={{ paddingLeft: '3rem', resize: 'none' }}
                placeholder="Cuéntales a tus alumnos sobre tu metodología y experiencia..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600 }}>Materias que dictas</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {profile.subjects.map(sub => (
                <span key={sub} style={{ background: 'rgba(168,85,247,0.1)', color: 'var(--accent-primary)', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {sub} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSubject(sub)} />
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <BookOpen size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '3rem' }} 
                  placeholder="Nueva materia..." 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                />
              </div>
              <button type="button" onClick={addSubject} className="btn" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none' }}>
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Guardar Cambios
            </button>
          </div>

          {message.text && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              padding: '1rem', borderRadius: '12px',
              background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
              color: message.type === 'success' ? '#10b981' : '#f87171',
              border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.2)'}`
            }}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </div>
          )}
        </form>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--accent-primary)', margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', color: 'white', fontWeight: 700, overflow: 'hidden' }}>
              {profile.profilePictureUrl ? <img src={profile.profilePictureUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile.fullName.charAt(0)}
            </div>
            <h3 style={{ marginBottom: '0.25rem' }}>{profile.fullName}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Tutor Verificado</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
               <span style={{ fontSize: '0.8rem', background: '#10b981', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>VERIFICADO</span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} color="var(--accent-primary)" /> Estado del Perfil
            </h4>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: '85%', height: '100%', background: 'linear-gradient(to right, #a855f7, #ec4899)' }}></div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tu perfil está completado al 85%. Sube tus certificados para llegar al 100%.</p>
          </div>
        </div>
      </div>
      
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TutorSettings;
