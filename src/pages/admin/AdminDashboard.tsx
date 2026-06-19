import React, { useState } from 'react';
import { useApp } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, MessageCircle, Calendar, Users, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { state, updateAppointmentStatus, updateAppointment, addProcedureHistory } = useApp();
  const { currentUser } = useAuth();
  
  const [proposingId, setProposingId] = useState<string | null>(null);
  const [proposalDate, setProposalDate] = useState('');
  const [proposalTime, setProposalTime] = useState('');

  const handleSendWhatsApp = (phone: string, name: string, date: string) => {
    const time = format(parseISO(date), 'HH:mm');
    const msg = `Olá ${name}! Passando para lembrar do nosso agendamento hoje às ${time} no Espaço Eli Trassi. Confirmado?`;
    window.open(`https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(msg)}`, '_blank');
  };
  
  const handleChatWhatsApp = (phone: string, name: string) => {
    const msg = `Olá ${name}, aqui é do Espaço Eli Trassi. `;
    window.open(`https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSendProposal = async (id: string, phone: string, name: string) => {
    if (!proposalDate || !proposalTime) return;
    const [year, month, day] = proposalDate.split('-');
    const [hours, mins] = proposalTime.split(':');
    const dt = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(mins));
    
    await updateAppointment(id, { date: dt.toISOString(), status: 'ADMIN_PROPOSED' });
    
    const timeStr = format(dt, "dd/MM/yyyy 'às' HH:mm");
    const msg = `Olá ${name}! O horário que você pediu estava ocupado, mas preparei uma proposta de agendamento para o dia ${timeStr}. Acesse o portal para confirmar!`;
    window.open(`https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(msg)}`, '_blank');
    
    setProposingId(null);
    setProposalDate('');
    setProposalTime('');
  };

  const pendingProposals = state.appointments
    .filter(a => a.status === 'PENDING')
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const todayAppointments = state.appointments
    .filter(a => isToday(parseISO(a.date)) && a.status !== 'PENDING' && a.status !== 'CANCELLED')
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const getClient = (id: string) => state.users.find(u => u.id === id);
  const getService = (id: string) => state.services.find(s => s.id === id);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Olá, {currentUser?.name}</h2>
        <p className="text-gray-600">Aqui está o seu resumo administrativo de hoje</p>
      </header>

      {/* Seção de Solicitações Pendentes (Propostas) */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-fuchsia-700 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {pendingProposals.length > 0 ? (
                <><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-fuchsia-500"></span></>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300"></span>
              )}
            </span>
            Propostas de Agenda ({pendingProposals.length})
          </h3>
        </div>
        
        {pendingProposals.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center border border-gray-100">
            <p className="text-gray-500">Não há solicitações de agendamento pendentes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProposals.map(appt => {
              const client = getClient(appt.clientId);
              const service = getService(appt.serviceId);
              if (!client || !service) return null;

              return (
                <div key={appt.id} className="bg-fuchsia-50 p-4 rounded-lg shadow-sm border border-fuchsia-200 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <p className="text-xs font-bold text-fuchsia-600 uppercase tracking-wider mb-1">Novo Pedido</p>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-gray-900 text-lg">{client.name}</p>
                        <button 
                          onClick={() => handleChatWhatsApp(client.phone, client.name)}
                          className="bg-green-100 text-green-700 p-1.5 rounded-full hover:bg-green-200 transition"
                          title="Chamar no WhatsApp"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-800">
                        📅 {format(parseISO(appt.date), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                      <p className="text-sm text-gray-600">{service.name} - R$ {service.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button 
                         onClick={() => updateAppointmentStatus(appt.id, 'CANCELLED')}
                         className="px-3 py-2 bg-white text-red-600 border border-red-200 rounded-md text-sm font-bold hover:bg-red-50 transition">
                        Recusar
                      </button>
                      <button 
                         onClick={() => setProposingId(proposingId === appt.id ? null : appt.id)}
                         className="px-3 py-2 bg-white text-fuchsia-700 border border-fuchsia-300 rounded-md text-sm font-bold hover:bg-fuchsia-100 transition">
                        Propor Novo Horário
                      </button>
                      <button 
                         onClick={() => updateAppointmentStatus(appt.id, 'CONFIRMED')}
                         className="px-4 py-2 bg-fuchsia-600 text-white rounded-md text-sm font-bold shadow hover:bg-fuchsia-700 transition">
                        Aprovar
                      </button>
                    </div>
                  </div>
                  
                  {proposingId === appt.id && (
                    <div className="border-t border-fuchsia-200 pt-4 mt-2">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Propor uma nova data/hora</h4>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input type="date" value={proposalDate} onChange={e => setProposalDate(e.target.value)} className="rounded border-gray-300 text-sm focus:ring-fuchsia-500 max-w-xs" />
                        <input type="time" value={proposalTime} onChange={e => setProposalTime(e.target.value)} className="rounded border-gray-300 text-sm focus:ring-fuchsia-500 max-w-xs" />
                        <button onClick={() => handleSendProposal(appt.id, client.phone, client.name)} className="bg-fuchsia-600 text-white px-4 py-2 text-sm font-bold rounded shadow hover:bg-fuchsia-700">
                          Enviar Proposta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Seção Agenda do Dia */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 w-full">Agenda de Hoje (Confirmados)</h3>
        </div>
        
        {todayAppointments.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center border border-gray-200">
            <p className="text-gray-500">Nenhum agendamento confirmado para hoje.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map(appt => {
              const client = getClient(appt.clientId);
              const service = getService(appt.serviceId);
              if (!client || !service) return null;

              return (
                <div key={appt.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <div className="flex justify-between items-start md:justify-start md:gap-4 mb-2">
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <span className="text-sm text-fuchsia-600 font-bold bg-fuchsia-100 px-3 py-0.5 rounded-full">
                        {format(parseISO(appt.date), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{service.name} - R$ {service.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSendWhatsApp(client.phone, client.name, appt.date)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100 transition"
                    >
                      <MessageCircle className="w-4 h-4" /> Lembrete WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Link to="/agenda-lista" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2 hover:bg-gray-50 transition">
          <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-full"><Calendar className="w-6 h-6" /></div>
          <span className="font-medium text-gray-900">Ver Agenda Completa</span>
        </Link>
        <Link to="/clientes" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2 hover:bg-gray-50 transition">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Users className="w-6 h-6" /></div>
          <span className="font-medium text-gray-900">Base de Clientes</span>
        </Link>
      </section>
    </div>
  );
}
