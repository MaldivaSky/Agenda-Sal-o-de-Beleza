import React, { useState } from 'react';
import { useApp } from '../../contexts/AppDataContext';
import { Camera, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminClients() {
  const { state, addProcedureHistory, updateProcedurePhoto } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  const clients = state.users.filter(u => u.role === 'CLIENT' && u.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Base de Clientes</h2>
        <p className="text-gray-600">Histórico de procedimentos e fotos</p>
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
