import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, User, Appointment, ProcedureHistory, Service, EliStatus, PortfolioItem } from '../types';
import { Storage } from '../store/storage';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

  const registerClient = async (userInfo: Omit<User, 'id' | 'role'>) => {
    if (state.users.find((u) => u.email === userInfo.email)) {
      alert("Email já cadastrado");
      return null;
    }
    
    const newUser: User = { ...userInfo, id: `client-${Date.now()}`, role: 'CLIENT' };
    await setDoc(doc(db, 'users', newUser.id), newUser);
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return newUser;
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = { ...appointment, id: `appt-${Date.now()}` };
    await setDoc(doc(db, 'appointments', newAppointment.id), newAppointment);
    setState(prev => ({ ...prev, appointments: [...prev.appointments, newAppointment] }));
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const updated = state.appointments.find(a => a.id === id);
    if (updated) {
      const merged = { ...updated, status };
      await setDoc(doc(db, 'appointments', id), merged);
      setState(prev => ({ ...prev, appointments: prev.appointments.map(a => a.id === id ? merged : a) }));
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    const updated = state.appointments.find(a => a.id === id);
    if (updated) {
      const merged = { ...updated, ...updates };
      await setDoc(doc(db, 'appointments', id), merged);
      setState(prev => ({ ...prev, appointments: prev.appointments.map(a => a.id === id ? merged : a) }));
    }
  };

  const addProcedureHistory = async (history: Omit<ProcedureHistory, 'id'>) => {
    const newHistory: ProcedureHistory = { ...history, id: `hist-${Date.now()}` };
    await setDoc(doc(db, 'history', newHistory.id), newHistory);
    setState(prev => ({ ...prev, history: [...prev.history, newHistory] }));
  };

  const updateProcedurePhoto = async (id: string, photoType: 'before' | 'after', base64: string) => {
    const h = state.history.find(h => h.id === id);
    if (h) {
      const updated = { ...h, [photoType === 'before' ? 'beforePhoto' : 'afterPhoto']: base64 };
      await setDoc(doc(db, 'history', id), updated);
      setState(prev => ({ ...prev, history: prev.history.map(item => item.id === id ? updated : item) }));
    }
  };

  const addService = async (service: Omit<Service, 'id'>) => {
    const newService: Service = { ...service, id: `svc-${Date.now()}` };
    await setDoc(doc(db, 'services', newService.id), newService);
    setState(prev => ({ ...prev, services: [...prev.services, newService] }));
  };

  const updateService = async (id: string, serviceUpdate: Partial<Service>) => {
    const s = state.services.find(s => s.id === id);
    if (s) {
      const updated = { ...s, ...serviceUpdate };
      await setDoc(doc(db, 'services', id), updated);
      setState(prev => ({ ...prev, services: prev.services.map(i => i.id === id ? updated : i) }));
    }
  };

  const deleteService = async (id: string) => {
    await deleteDoc(doc(db, 'services', id));
    setState(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));
  };

  const updateEliStatus = async (status: EliStatus) => {
    await setDoc(doc(db, 'metadata', 'main'), { eliStatus: status }, { merge: true });
    setState(prev => ({ ...prev, eliStatus: status }));
  };

  const updateHeroImage = async (url: string) => {
    await setDoc(doc(db, 'metadata', 'main'), { heroImage: url }, { merge: true });
    setState(prev => ({ ...prev, heroImage: url }));
  };

  const addPortfolioItem = async (item: Omit<PortfolioItem, 'id'>) => {
    const newItem: PortfolioItem = { ...item, id: `port-${Date.now()}` };
    await setDoc(doc(db, 'portfolio', newItem.id), newItem);
    setState(prev => ({ ...prev, portfolio: [newItem, ...prev.portfolio] }));
  };

  const removePortfolioItem = async (id: string) => {
    await deleteDoc(doc(db, 'portfolio', id));
    setState(prev => ({ ...prev, portfolio: prev.portfolio.filter(p => p.id !== id) }));
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
