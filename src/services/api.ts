import axios from 'axios';

// Base URL from env variable (for Vercel) or proxied via vite.config.ts (for local)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillvibes_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server returns 401, clear session and redirect to login
api.interceptors.response.use(
  (response) => {
    // Desenvuelve el ApiResponse del backend automáticamente
    if (response.data && typeof response.data.success === 'boolean') {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skillvibes_token');
      localStorage.removeItem('skillvibes_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  role: string;
  balance: number;
}

export interface AuthResponseDTO {
  token: string;
  user: UserResponseDTO;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string; // "STUDENT" | "TUTOR"
}

export interface TutorRegistrationRequest {
  fullName: string;
  email: string;
  password: string;
  bio: string;
  profilePictureUrl: string;
  identityCardUrl: string;
  degreeUrl: string;
  hourlyRate: number;
  yearsOfExperience: number;
  subjects: string[];
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponseDTO>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<UserResponseDTO>('/auth/register', data),

  registerTutor: (data: TutorRegistrationRequest) =>
    api.post<UserResponseDTO>('/auth/register/tutor', data),

  getUser: (id: number) =>
    api.get<UserResponseDTO>(`/auth/${id}`),
};

// ── Tutorias ─────────────────────────────────────────────────────────────────

export interface Tutoria {
  id: number;
  materia: string;
  descripcion: string;
  precio: number;
  fechaHora: string; // ISO string from backend
  meetingLink: string;
  estado: string; // "PROGRAMADA" | "EN_CURSO" | "FINALIZADA"
  tutor: UserResponseDTO;
  estudiante: UserResponseDTO;
}

export interface CrearTutoriaRequest {
  materia: string;
  descripcion: string;
  precio: number;
  fechaHora: string;
  meetingLink: string;
  tutor: { id: number };
  estudiante: { id: number };
}

export interface BookingRequest {
  tutorId: number;
  materia: string;
  descripcion: string;
  fechaHora: string;
}

export const tutoriasApi = {
  getMyBoard: (userId: number) =>
    api.get<Tutoria[]>(`/tutorias/mi-tablero/${userId}`),

  create: (data: CrearTutoriaRequest) =>
    api.post<Tutoria>('/tutorias/programar', data),

  reservar: (data: BookingRequest) =>
    api.post<Tutoria>('/tutorias/reservar', data),

  finalize: (id: number) =>
    api.put<Tutoria>(`/tutorias/${id}/finalizar`),
};

// ── Tutors ───────────────────────────────────────────────────────────────────

export interface TutorProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  bio: string;
  profilePictureUrl: string;
  hourlyRate: number;
  yearsOfExperience: number;
  subjects: string[];
  isVerified: boolean;
  credentialsUrl?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface TutorSearchParams {
  query?: string;
  subject?: string;
  minPrice?: number;
  maxPrice?: number;
  minExperience?: number;
  onlyVerified?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export const tutorApi = {
  search: (params: TutorSearchParams) =>
    api.get<PageResponse<TutorProfile>>('/tutor/search', { params }),

  getMyProfile: () =>
    api.get<TutorProfile>('/tutor/profile'),

  updateProfile: (data: Partial<TutorProfile>) =>
    api.put<TutorProfile>('/tutor/profile', data),
};

export const pagoApi = {
  createCheckout: (amount: number) =>
    api.post<string>('/pagos/checkout', { amount }),

  getHistorial: () =>
    api.get<any[]>('/pagos/historial'),
};

export default api;
