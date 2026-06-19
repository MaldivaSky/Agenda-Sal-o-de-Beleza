import { collection, doc, getDocs, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppState, User, Service, Appointment, ProcedureHistory, PortfolioItem } from '../types';

const DEFAULT_STATE: AppState = {
  users: [
    {
      id: 'admin-1',
      name: 'Eli Trassi',
      email: 'elitrassi@gmail.com',
      phone: '11952365338',
      password: 'admin',
      role: 'ADMIN'
    }
  ],
  services: [
    { id: 's-1', name: 'Escova e Corte', type: 'Cabelo', price: 80, durationMinutes: 60 },
    { id: 's-2', name: 'Luzes', type: 'Coloração', price: 250, durationMinutes: 180 },
    { id: 's-3', name: 'Depilação Perna', type: 'Depilação', price: 50, durationMinutes: 40 },
  ],
  appointments: [],
  history: [],
  portfolio: [
    { id: 'p-1', type: 'image', url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80', description: 'Coloração e Corte Misto' },
    { id: 'p-2', type: 'image', url: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80', description: 'Maquiagem e Penteado' }
  ],
  eliStatus: 'AVAILABLE'
};

const getCollectionData = async <T,>(colName: string): Promise<T[]> => {
  const snapshot = await getDocs(collection(db, colName));
  return snapshot.docs.map(doc => doc.data() as T);
};

export const Storage = {
  async loadState(): Promise<AppState> {
    try {
      const users = await getCollectionData<User>('users');
      const services = await getCollectionData<Service>('services');
      const appointments = await getCollectionData<Appointment>('appointments');
      const history = await getCollectionData<ProcedureHistory>('history');
      const portfolio = await getCollectionData<PortfolioItem>('portfolio');
      
      const metaDoc = await getDoc(doc(db, 'metadata', 'main'));
      const metadata = metaDoc.exists() ? metaDoc.data() : {};
      
      // Force update of admin-1 document so the new credentials take effect right away
      if (users.length > 0) {
        await setDoc(doc(db, 'users', 'admin-1'), DEFAULT_STATE.users[0], { merge: true });
        // Update local users array with the overwritten admin
        const adminIndex = users.findIndex(u => u.id === 'admin-1');
        if (adminIndex >= 0) {
           users[adminIndex] = DEFAULT_STATE.users[0];
        } else {
           users.push(DEFAULT_STATE.users[0]);
        }
      }

      const state: AppState = {
        users: users.length > 0 ? users : DEFAULT_STATE.users,
        services: services.length > 0 ? services : DEFAULT_STATE.services,
        appointments: appointments.length > 0 ? appointments : DEFAULT_STATE.appointments,
        history: history.length > 0 ? history : DEFAULT_STATE.history,
        portfolio: portfolio.length > 0 ? portfolio : DEFAULT_STATE.portfolio,
        eliStatus: metadata.eliStatus || DEFAULT_STATE.eliStatus,
        heroImage: metadata.heroImage || DEFAULT_STATE.heroImage
      };
      
      // If we loaded default data, save it to Bootstrap the DB
      if (users.length === 0) {
        await this.bootstrapDB(state);
      }
      
      return state;
    } catch (e) {
      console.error("Failed to load from Firebase", e);
      return DEFAULT_STATE;
    }
  },

  async bootstrapDB(state: AppState) {
    // Only used to initialize the DB first time
    const batch = writeBatch(db);
    state.users.forEach(u => batch.set(doc(db, 'users', u.id), u));
    state.services.forEach(s => batch.set(doc(db, 'services', s.id), s));
    state.portfolio.forEach(p => batch.set(doc(db, 'portfolio', p.id), p));
    batch.set(doc(db, 'metadata', 'main'), { 
      eliStatus: state.eliStatus, 
      heroImage: state.heroImage || null 
    });
    await batch.commit();
  },

  async saveState(state: AppState): Promise<void> {
    // Warning: writing entire state every time is brutal but it keeps compatibility with existing AppDataContext
    // We update everything. Since we don't have too many entities, this is fine for now.
    // A proper rewrite would do individual document writes.
    const batch = writeBatch(db);
    
    // Using set() on each will overwrite the doc.
    state.users.forEach(u => batch.set(doc(db, 'users', u.id), u));
    state.services.forEach(s => batch.set(doc(db, 'services', s.id), s));
    state.appointments.forEach(a => batch.set(doc(db, 'appointments', a.id), a));
    state.history.forEach(h => batch.set(doc(db, 'history', h.id), h));
    state.portfolio.forEach(p => batch.set(doc(db, 'portfolio', p.id), p));
    
    batch.set(doc(db, 'metadata', 'main'), { 
      eliStatus: state.eliStatus, 
      heroImage: state.heroImage || null 
    });
    
    // Note: this implementation won't DELETE items correctly since we don't know what was removed.
    // For deletes, we should really update AppDataContext to write specifically.
    
    await batch.commit();
  }
};
