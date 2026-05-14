import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseTutors from './pages/BrowseTutors';
import VirtualClassroom from './pages/VirtualClassroom';
import TutorSettings from './pages/TutorSettings';
import './App.css';

function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <img src="/logo.png" alt="SkillVibes Logo" className="nav-logo" />
        SkillVibes
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Inicio</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="nav-link">Mis Tutorías</Link>
            {user?.role === 'ROLE_TUTOR' && (
              <Link to="/tutor/settings" className="nav-link">Configuración de Perfil</Link>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {user?.fullName}
            </span>
            <button
              onClick={handleLogout}
              className="btn"
              style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)' }}
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Iniciar Sesión</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <NavBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/browse" element={<BrowseTutors />} />
              <Route path="/classroom/:id" element={<VirtualClassroom />} />
              <Route path="/tutor/settings" element={<TutorSettings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
