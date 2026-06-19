export type Role = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // For mock ONLY, never in real app
  role: Role;
}

export type ServiceType = 'Depilação' | 'Cabelo' | 'Coloração' | 'Outro';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  price: number;
  durationMinutes: number;
}

export type AppointmentStatus = 'PENDING' | 'ADMIN_PROPOSED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  clientId: string;
  date: string; // ISO String
  serviceId: string;
  status: AppointmentStatus;
}

export interface ProcedureHistory {
  id: string;
  clientId: string;
  appointmentId?: string;
  date: string;
  notes: string;
  beforePhoto?: string; // Base64
  afterPhoto?: string; // Base64
}

export type EliStatus = 'AVAILABLE' | 'BUSY' | 'OFF';

export interface PortfolioItem {
  id: string;
  type: 'image' | 'video';
  url: string; // base64 for images, or URL for Youtube/links
  description: string;
}

export interface AppState {
  users: User[];
  services: Service[];
  appointments: Appointment[];
  history: ProcedureHistory[];
  portfolio: PortfolioItem[];
  eliStatus: EliStatus;
  heroImage?: string;
}
