import localforage from 'localforage';
import { AppState, User, Service } from '../types';

localforage.config({
  name: 'EspacoEliTrassiApp'
});

const DEFAULT_STATE: AppState = {
  users: [
    // Default Admin User
    {
      id: 'admin-1',
      name: 'Eli Trassi',
      email: 'admin@elitrassi.com',
      phone: '11999999999',
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

export const Storage = {
  async loadState(): Promise<AppState> {
    const state = await localforage.getItem<AppState>('appState');
    if (!state) {
      // Initialize with default state
      await this.saveState(DEFAULT_STATE);
      return DEFAULT_STATE;
    }
    // Ensure new properties from state updates are populated
    const mergedState: AppState = {
      ...DEFAULT_STATE,
      ...state,
      portfolio: state.portfolio || DEFAULT_STATE.portfolio,
      eliStatus: state.eliStatus || DEFAULT_STATE.eliStatus,
      services: state.services || DEFAULT_STATE.services,
      users: state.users || DEFAULT_STATE.users,
      appointments: state.appointments || DEFAULT_STATE.appointments,
      history: state.history || DEFAULT_STATE.history
    };
    
    // Save the merged state back so it updates
    await this.saveState(mergedState);
    return mergedState;
  },

  async saveState(state: AppState): Promise<void> {
    await localforage.setItem('appState', state);
  }
};
