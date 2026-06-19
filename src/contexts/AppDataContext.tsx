import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, User, Appointment, ProcedureHistory, Service, EliStatus, PortfolioItem } from '../types';
import { Storage } from '../store/storage';

interface AppDataContextType {
  state: AppState;
  loading: boolean;
  registerClient: (user: Omit<User, 'id' | 'role'>) => Promise<User | null>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  addProcedureHistory: (history: Omit<ProcedureHistory, 'id'>) => Promise<void>;
  updateProcedurePhoto: (id: string, photoType: 'before' | 'after', base64: string) => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  updateEliStatus: (status: EliStatus) => Promise<void>;
  updateHeroImage: (url: string) => Promise<void>;
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  removePortfolioItem: (id: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({ 
    users: [], services: [], appointments: [], history: [], portfolio: [], eliStatus: 'AVAILABLE' 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Storage.loadState().then((data) => {
      setState(data);
      setLoading(false);
    });
  }, []);

  const saveAndSetState = async (newState: AppState) => {
    await Storage.saveState(newState);
    setState(newState);
  };

  const registerClient = async (userInfo: Omit<User, 'id' | 'role'>) => {
    // Basic mock check
    if (state.users.find((u) => u.email === userInfo.email)) {
      alert("Email já cadastrado");
      return null;
    }
    
    const newUser: User = {
      ...userInfo,
      id: `client-${Date.now()}`,
      role: 'CLIENT'
    };
    
    await saveAndSetState({
      ...state,
      users: [...state.users, newUser]
    });
    return newUser;
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `appt-${Date.now()}`
    };
    await saveAndSetState({
      ...state,
      appointments: [...state.appointments, newAppointment]
    });
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    await saveAndSetState({
      ...state,
      appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a)
    });
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    await saveAndSetState({
      ...state,
      appointments: state.appointments.map(a => a.id === id ? { ...a, ...updates } : a)
    });
  };

  const addProcedureHistory = async (history: Omit<ProcedureHistory, 'id'>) => {
    const newHistory: ProcedureHistory = {
      ...history,
      id: `hist-${Date.now()}`
    };
    await saveAndSetState({
      ...state,
      history: [...state.history, newHistory]
    });
  };

  const updateProcedurePhoto = async (id: string, photoType: 'before' | 'after', base64: string) => {
    await saveAndSetState({
      ...state,
      history: state.history.map(h => {
        if (h.id === id) {
          return {
            ...h,
            [photoType === 'before' ? 'beforePhoto' : 'afterPhoto']: base64
          };
        }
        return h;
      })
    });
  };

  const addService = async (service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: `svc-${Date.now()}`
    };
    await saveAndSetState({
      ...state,
      services: [...state.services, newService]
    });
  };

  const updateService = async (id: string, serviceUpdate: Partial<Service>) => {
    await saveAndSetState({
      ...state,
      services: state.services.map(s => s.id === id ? { ...s, ...serviceUpdate } : s)
    });
  };

  const deleteService = async (id: string) => {
    await saveAndSetState({
      ...state,
      services: state.services.filter(s => s.id !== id)
    });
  };

  const updateEliStatus = async (status: EliStatus) => {
    await saveAndSetState({ ...state, eliStatus: status });
  };

  const updateHeroImage = async (url: string) => {
    await saveAndSetState({ ...state, heroImage: url });
  };

  const addPortfolioItem = async (item: Omit<PortfolioItem, 'id'>) => {
    const newItem: PortfolioItem = {
      ...item,
      id: `port-${Date.now()}`
    };
    await saveAndSetState({ ...state, portfolio: [newItem, ...state.portfolio] });
  };

  const removePortfolioItem = async (id: string) => {
    await saveAndSetState({ ...state, portfolio: state.portfolio.filter(p => p.id !== id) });
  };

  return (
    <AppDataContext.Provider value={{
      state, loading, registerClient, addAppointment, updateAppointmentStatus, updateAppointment,
      addProcedureHistory, updateProcedurePhoto,
      addService, updateService, deleteService,
      updateEliStatus, updateHeroImage, addPortfolioItem, removePortfolioItem
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppDataProvider');
  }
  return context;
}
