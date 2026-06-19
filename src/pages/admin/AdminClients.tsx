import React, { useState } from 'react';
import { useApp } from '../../contexts/AppDataContext';
import { Camera, Search, Plus, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminClients() {
  const { state, addProcedureHistory, updateProcedurePhoto, registerClient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', password: '' });
  
  const clients = state.users.filter(u => u.role === 'CLIENT' && u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email || !newClient.password || !newClient.phone) {
        alert("Preencha todos os campos");
        return;
    }
    const user = await registerClient(newClient);
    if (user) {
        setShowRegisterModal(false);
        setNewClient({ name: '', email: '', phone: '', password: '' });
    }
  };

  // Conversão de arquivo para Base64
  const handlePhotoUpload = (clientId: string, e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after', historyId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert("A imagem não pode ter mais de 5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      if (historyId) {
        await updateProcedurePhoto(historyId, type, base64String);
      } else {
        // Create new history entry with photo just for visual logging if no specific appointment tied
        await addProcedureHistory({
          clientId,
          date: new Date().toISOString(),
          notes: 'Upload de foto independente',
          [type === 'before' ? 'beforePhoto' : 'afterPhoto']: base64String
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Base de Clientes</h2>
          <p className="text-gray-600">Histórico de procedimentos e fotos</p>
        </div>
        <button 
          onClick={() => setShowRegisterModal(true)}
          className="bg-fuchsia-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-fuchsia-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </header>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar cliente por nome..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Cadastrar Novo Cliente</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleRegisterClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-none" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input required type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-none" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Telefone</label>
                <input required type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-none" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Padrão (para o cliente acessar)</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fuchsia-500 focus:outline-none" value={newClient.password} onChange={e => setNewClient({...newClient, password: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition text-sm">Cancelar</button>
                <button type="submit" className="bg-fuchsia-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-fuchsia-700 transition text-sm">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {clients.length === 0 ? (
          <p className="text-gray-500">Nenhum cliente encontrado.</p>
        ) : (
          clients.map(client => {
            const clientHistory = state.history.filter(h => h.clientId === client.id).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
            
            return (
              <div key={client.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.phone} • {client.email}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Histórico & Ficha</h4>
                    <label className="cursor-pointer text-xs font-medium text-fuchsia-600 bg-fuchsia-50 px-3 py-1.5 rounded hover:bg-fuchsia-100 transition flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Adicionar Foto Solta
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(client.id, e, 'after')} />
                    </label>
                  </div>

                  {clientHistory.length === 0 ? (
                    <p className="text-xs text-gray-400">Nenhum registro ainda.</p>
                  ) : (
                    <div className="space-y-4">
                      {clientHistory.map(hist => (
                        <div key={hist.id} className="bg-gray-50 p-4 rounded-md border border-gray-100">
                          <p className="text-xs text-gray-500 mb-2">
                            {format(parseISO(hist.date), "dd/MMM/yyyy", { locale: ptBR })}
                          </p>
                          <p className="text-sm text-gray-700 italic">{hist.notes}</p>
                          
                          <div className="mt-3 flex gap-4">
                            <div className="flex-1">
                              <span className="text-xs text-gray-500 block mb-1">Antes</span>
                              {hist.beforePhoto ? (
                                <img src={hist.beforePhoto} alt="Antes" className="w-full h-auto aspect-square object-cover rounded shadow-sm border border-gray-200" />
                              ) : (
                                <label className="flex items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-fuchsia-400">
                                  <span className="text-xs text-gray-400">Upload</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(client.id, e, 'before', hist.id)} />
                                </label>
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="text-xs text-gray-500 block mb-1">Depois</span>
                              {hist.afterPhoto ? (
                                <img src={hist.afterPhoto} alt="Depois" className="w-full h-auto aspect-square object-cover rounded shadow-sm border border-gray-200" />
                              ) : (
                                <label className="flex items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-fuchsia-400">
                                  <span className="text-xs text-gray-400">Upload</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(client.id, e, 'after', hist.id)} />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
