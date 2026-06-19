import React, { useState } from 'react';
import { useApp } from '../../contexts/AppDataContext';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { ServiceType } from '../../types';

export default function AdminServices() {
  const { state, addService, updateService, deleteService } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Cabelo' as ServiceType,
    price: '',
    durationMinutes: ''
  });

  const resetForm = () => {
    setFormData({ name: '', type: 'Cabelo', price: '', durationMinutes: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      type: service.type,
      price: service.price.toString(),
      durationMinutes: service.durationMinutes.toString()
    });
    setEditingId(service.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      type: formData.type as ServiceType,
      price: Number(formData.price),
      durationMinutes: Number(formData.durationMinutes)
    };

    if (editingId) {
      await updateService(editingId, payload);
    } else {
      await addService(payload);
    }
    resetForm();
  };

  const serviceTypes: ServiceType[] = ['Depilação', 'Cabelo', 'Coloração', 'Outro'];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Serviços e Preços</h2>
          <p className="text-gray-600">Gerencie o que você oferece às clientes</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700 transition shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Novo Serviço
          </button>
        )}
      </header>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-fuchsia-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Editar Serviço' : 'Novo Serviço'}</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome do Serviço</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md border px-3 py-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoria</label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ServiceType})} className="mt-1 block w-full border-gray-300 rounded-md border px-3 py-2 bg-white focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm">
                {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
              <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md border px-3 py-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duração (minutos)</label>
              <input required type="number" min="5" step="5" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md border px-3 py-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm" />
            </div>
          </div>
          <div className="flexjustify-end">
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none">
              {editingId ? 'Salvar Alterações' : 'Adicionar Serviço'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {state.services.map(service => (
          <div key={service.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 leading-tight">{service.name}</h4>
                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{service.type}</span>
              </div>
              <p className="text-lg font-bold text-fuchsia-600 mb-1">R$ {service.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{service.durationMinutes} minutos</p>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
              <button onClick={() => handleEdit(service)} className="p-1.5 text-gray-400 hover:text-blue-600 transition" aria-label="Editar">
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { if(window.confirm('Excluir este serviço?')) deleteService(service.id); }} 
                className="p-1.5 text-gray-400 hover:text-red-600 transition" aria-label="Excluir">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
