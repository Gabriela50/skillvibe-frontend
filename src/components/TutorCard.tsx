import React from 'react';
import { Star, Clock, BookOpen, ChevronRight, CheckCircle } from 'lucide-react';
import { TutorProfile } from '../services/api';

interface TutorCardProps {
  tutor: TutorProfile;
  onClick?: () => void;
  onBook?: (tutor: TutorProfile) => void;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor, onClick, onBook }) => {
  return (
    <div className="glass-card item-card animate-scale-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <img 
          src={tutor.profilePictureUrl || `https://ui-avatars.com/api/?name=${tutor.fullName}&background=random`} 
          alt={tutor.fullName} 
          style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }}
        />
        {tutor.isVerified && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--bg-color)', borderRadius: '50%', padding: '4px', display: 'flex', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CheckCircle size={20} color="#10b981" fill="#10b981" stroke="white" />
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{tutor.fullName}</h3>
          <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
            ${tutor.hourlyRate?.toFixed(2)}/h
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {tutor.subjects.slice(0, 3).map((sub) => (
            <span key={sub} className="item-badge" style={{ fontSize: '0.7rem' }}>{sub}</span>
          ))}
          {tutor.subjects.length > 3 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{tutor.subjects.length - 3} más</span>}
        </div>

        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem', 
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          {tutor.bio || 'Sin biografía disponible.'}
        </p>

        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Star size={14} color="#eab308" fill="#eab308" />
            <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>4.9</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={14} />
            <span>{tutor.yearsOfExperience} años exp.</span>
          </div>
        </div>
      </div>

      <button 
        className="btn btn-primary" 
        onClick={() => onBook?.(tutor)}
        style={{ marginTop: '1.5rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
      >
        Reservar Ahora <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default TutorCard;
