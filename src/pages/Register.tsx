import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TUTOR'>('STUDENT');
  
  // Extra fields for Tutor
  const [bio, setBio] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [identityCardUrl, setIdentityCardUrl] = useState('');
  const [degreeUrl, setDegreeUrl] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('');
  const [subjects, setSubjects] = useState('');

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === 'TUTOR') {
        const subjectList = subjects.split(',').map(s => s.trim()).filter(s => s !== '');
        
        await authApi.registerTutor({
          fullName, email, password,
          bio, profilePictureUrl, identityCardUrl, degreeUrl,
          hourlyRate: Number(hourlyRate),
          yearsOfExperience: Number(yearsOfExperience),
          subjects: subjectList
        });
        
        toast.success('¡Registro exitoso! Tu perfil como tutor está pendiente de verificación.', { duration: 6000 });
        setTimeout(() => navigate('/login'), 4000);
      } else {
        // 1. Register user
        await authApi.register({ fullName, email, password, role });
        // 2. Auto-login after registration
        const { data } = await authApi.login({ email, password });
        login(data.token, data.user);
        toast.success('¡Cuenta creada con éxito!');
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al registrar. Revisa los datos o puede que el email ya esté en uso.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div className="auth-container glass-card" style={{ maxWidth: '540px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <UserPlus size={48} color="#a855f7" style={{ marginBottom: '1rem' }} />
          <h2>Crear cuenta</h2>
          <p style={{ color: 'var(--text-muted)' }}>Únete a la comunidad SkillVibes</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">¿Cómo participarás?</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{
                flex: 1, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                border: `2px solid ${role === 'STUDENT' ? '#a855f7' : 'var(--border-color)'}`,
                background: role === 'STUDENT' ? 'rgba(168,85,247,0.1)' : 'transparent',
                textAlign: 'center', transition: 'all 0.2s ease'
              }}>
                <input
                  type="radio" value="STUDENT" name="role"
                  checked={role === 'STUDENT'}
                  onChange={() => setRole('STUDENT')}
                  style={{ display: 'none' }}
                />
                🎓 Estudiante
              </label>
              <label style={{
                flex: 1, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                border: `2px solid ${role === 'TUTOR' ? '#a855f7' : 'var(--border-color)'}`,
                background: role === 'TUTOR' ? 'rgba(168,85,247,0.1)' : 'transparent',
                textAlign: 'center', transition: 'all 0.2s ease'
              }}>
                <input
                  type="radio" value="TUTOR" name="role"
                  checked={role === 'TUTOR'}
                  onChange={() => setRole('TUTOR')}
                  style={{ display: 'none' }}
                />
                👨‍🏫 Tutor
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Nombre completo</label>
            <input
              type="text" id="fullName" className="form-input"
              value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo" required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              type="email" id="reg-email" className="form-input"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com" required autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Contraseña</label>
            <input
              type="password" id="reg-password" className="form-input"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres" minLength={6} required autoComplete="new-password"
            />
          </div>

          {role === 'TUTOR' && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
              padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem', marginTop: '0.5rem'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#a855f7' }}>📋 Perfil Profesional</h4>
              
              <div className="form-group">
                <label className="form-label" htmlFor="bio">Biografía Profesional (Mín. 50 caracteres)</label>
                <textarea
                  id="bio" className="form-input" rows={3}
                  value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos sobre ti, tu metodología y por qué los estudiantes deberían elegirte."
                  required={role === 'TUTOR'} minLength={50}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="hourlyRate">Tarifa por Hora ($)</label>
                  <input
                    type="number" id="hourlyRate" className="form-input"
                    value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ej. 15.50" required={role === 'TUTOR'} min="1" step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="yearsOfExperience">Años de Exp.</label>
                  <input
                    type="number" id="yearsOfExperience" className="form-input"
                    value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ej. 3" required={role === 'TUTOR'} min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subjects">Materias (separadas por coma)</label>
                <input
                  type="text" id="subjects" className="form-input"
                  value={subjects} onChange={(e) => setSubjects(e.target.value)}
                  placeholder="Ej. Matemáticas, Física, Programación" required={role === 'TUTOR'}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profilePictureUrl">URL Foto de Perfil</label>
                <input
                  type="url" id="profilePictureUrl" className="form-input"
                  value={profilePictureUrl} onChange={(e) => setProfilePictureUrl(e.target.value)}
                  placeholder="https://ejemplo.com/mifoto.jpg" required={role === 'TUTOR'}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="identityCardUrl">URL Cédula de Identidad</label>
                <input
                  type="url" id="identityCardUrl" className="form-input"
                  value={identityCardUrl} onChange={(e) => setIdentityCardUrl(e.target.value)}
                  placeholder="Documento para validación" required={role === 'TUTOR'}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="degreeUrl">URL Título o Soporte Académico</label>
                <input
                  type="url" id="degreeUrl" className="form-input"
                  value={degreeUrl} onChange={(e) => setDegreeUrl(e.target.value)}
                  placeholder="Certificado de estudios" required={role === 'TUTOR'}
                />
              </div>
            </div>
          )}

            <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Registrarme'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#a855f7', textDecoration: 'none' }}>Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

