import React, { useState } from 'react';
import { useApp } from '../../contexts/AppDataContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminSchedule() {
  const { state, updateAppointmentStatus, addAppointment } = useApp();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const sortedAppointments = [...state.appointments].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const getClient = (id: string) => state.users.find(u => u.id === id);
  const getService = (id: string) => state.services.find(s => s.id === id);
  
  const handleAdminSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedService || !selectedDate || !selectedTime) return;
    
    const [year, month, day] = selectedDate.split('-');
    const [hours, mins] = selectedTime.split(':');
    const dt = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(mins));
    
    await addAppointment({
      clientId: selectedClient,
      serviceId: selectedService,
      date: dt.toISOString(),
      status: 'CONFIRMED'
    });
    
    setShowForm(false);
    setSelectedClient('');
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agenda Geral</h2>
          <p className="text-gray-600">Histórico de todos os agendamentos</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-fuchsia-600 text-white px-4 py-2 rounded-md font-medium hover:bg-fuchsia-700 transition">
          {showForm ? 'Cancelar' : '+ Novo Encaixe'}
        </button>
      </header>
      
      {showForm && (
        <form onSubmit={handleAdminSchedule} className="bg-white p-4 rounded-lg shadow-sm border border-fuchsia-100 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <select required value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fuchsia-500 focus:ring-fuchsia-500">
                  <option value="">Selecione um cliente...</option>
                  {state.users.filter(u => u.role === 'CLIENT').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Serviço</label>
                <select required value={selectedService} onChange={e => setSelectedService(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fuchsia-500 focus:ring-fuchsia-500">
                  <option value="">Selecione um serviço...</option>
                  {state.services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <input type="date" required value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fuchsia-500 focus:ring-fuchsia-500" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Hora</label>
                <input type="time" required value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fuchsia-500 focus:ring-fuchsia-500" />
             </div>
          </div>
          <button type="submit" className="w-full bg-fuchsia-600 text-white font-medium py-2 rounded-md hover:bg-fuchsia-700">Confirmar Encaixe Direto</button>
        </form>
      )}

      <div className="space-y-4">
        {sortedAppointments.length === 0 ? (
          <p className="text-gray-500">Nenhum agendamento encontrado.</p>
        ) : (
          sortedAppointments.map(appt => {
            const client = getClient(appt.clientId);
            const service = getService(appt.serviceId);
            if (!client || !service) return null;

            return (
              <div key={appt.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{client.name}</p>
                  <p className="text-sm text-fuchsia-600 font-medium">
                    {format(parseISO(appt.date), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{service.name} - R$ {service.price.toFixed(2)}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2 text-right">
                  <select 
                    value={appt.status} 
                    onChange={(e) => updateAppointmentStatus(appt.id, e.target.value as any)}
                    className={`block w-full pl-3 pr-8 py-1.5 text-sm font-medium border-gray-300 focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 rounded-md border ${
                      appt.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                      appt.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700' :
                      appt.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="COMPLETED">Concluído</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
