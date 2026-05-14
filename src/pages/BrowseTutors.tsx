import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, SlidersHorizontal, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { tutorApi, TutorProfile, TutorSearchParams } from '../services/api';
import TutorCard from '../components/TutorCard';
import BookingModal from '../components/BookingModal';

const BrowseTutors = () => {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters state
  const [filters, setFilters] = useState<TutorSearchParams>({
    query: '',
    subject: '',
    minPrice: undefined,
    maxPrice: undefined,
    minExperience: undefined,
    onlyVerified: true,
    page: 0,
    size: 12
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);

  const fetchTutors = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await tutorApi.search({ ...filters, page });
      setTutors(data.content);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err) {
      setError('Error al cargar tutores. Inténtalo de nuevo más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTutors();
    }, 400); // Debounce
    return () => clearTimeout(timer);
  }, [fetchTutors]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFilters(prev => ({
      ...prev,
      [name]: val === '' ? undefined : val,
      page: 0 // Reset to first page on filter change
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      subject: '',
      minPrice: undefined,
      maxPrice: undefined,
      minExperience: undefined,
      onlyVerified: true,
      page: 0,
      size: 12
    });
    setPage(0);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Encuentra a tu Tutor Ideal
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
          Expertos verificados listos para ayudarte a dominar cualquier habilidad.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Mobile Filter Toggle */}
        <button 
          className="btn" 
          style={{ display: 'none', width: '100%', marginBottom: '1rem', gap: '0.5rem', justifyContent: 'center' }}
          id="mobile-filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} /> {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>

        {/* Sidebar Filters */}
        <div className={`glass-card ${showFilters ? 'show' : ''}`} style={{ 
          flex: '0 0 300px', 
          padding: '2rem', 
          height: 'fit-content',
          position: 'sticky',
          top: '100px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={20} color="#a855f7" /> Filtros
            </h3>
            <button onClick={clearFilters} style={{ background: 'transparent', border: 'none', color: '#ec4899', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              Limpiar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Materia</label>
              <select 
                name="subject" 
                className="form-input" 
                value={filters.subject || ''} 
                onChange={handleFilterChange}
              >
                <option value="">Todas las materias</option>
                <option value="Programación">Programación</option>
                <option value="Matemáticas">Matemáticas</option>
                <option value="Inglés">Inglés</option>
                <option value="Diseño UI/UX">Diseño UI/UX</option>
                <option value="Física">Física</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Precio Máximo ($/h)</label>
              <input 
                type="number" 
                name="maxPrice" 
                className="form-input" 
                placeholder="Ej: 50" 
                value={filters.maxPrice || ''} 
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Mín. Años de Experiencia</label>
              <input 
                type="number" 
                name="minExperience" 
                className="form-input" 
                placeholder="Ej: 2" 
                value={filters.minExperience || ''} 
                onChange={handleFilterChange}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="onlyVerified" 
                id="onlyVerified" 
                checked={filters.onlyVerified} 
                onChange={handleFilterChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="onlyVerified" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Solo tutores verificados</label>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {/* Search Bar */}
          <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Search size={20} color="var(--text-muted)" />
            <input 
              type="text" 
              name="query"
              className="form-input" 
              placeholder="Buscar por nombre o palabras clave..." 
              style={{ border: 'none', padding: '0.5rem' }}
              value={filters.query}
              onChange={handleFilterChange}
            />
          </div>

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-card" style={{ height: '400px', animation: 'pulse 1.5s infinite' }}>
                  <div style={{ height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1rem' }}></div>
                  <div style={{ height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '60%', marginBottom: '1rem' }}></div>
                  <div style={{ height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1rem' }}></div>
                </div>
              ))}
            </div>
          )}

          {!loading && tutors.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h3>No encontramos tutores con esos filtros</h3>
              <p style={{ color: 'var(--text-muted)' }}>Prueba ajustando tus criterios de búsqueda o limpia los filtros.</p>
              <button className="btn" onClick={clearFilters} style={{ marginTop: '1rem' }}>Limpiar Filtros</button>
            </div>
          )}

          {!loading && tutors.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {tutors.map(tutor => (
                  <TutorCard 
                    key={tutor.id} 
                    tutor={tutor} 
                    onBook={(t) => setSelectedTutor(t)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
                  <button 
                    className="btn" 
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    style={{ padding: '0.5rem' }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span style={{ fontWeight: 600 }}>Página {page + 1} de {totalPages}</span>
                  <button 
                    className="btn" 
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    style={{ padding: '0.5rem' }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @media (max-width: 768px) {
          #mobile-filter-btn { display: flex !important; }
          .glass-card { flex: 1 1 100% !important; position: static !important; }
          .glass-card:not(.show) { display: none; }
        }
      `}</style>

      {selectedTutor && (
        <BookingModal 
          tutor={selectedTutor} 
          onClose={() => setSelectedTutor(null)} 
          onSuccess={() => {
            // Podríamos actualizar el balance del usuario aquí si lo tuviéramos en un contexto global
            console.log('Booking successful!');
          }}
        />
      )}
    </div>
  );
};

export default BrowseTutors;
