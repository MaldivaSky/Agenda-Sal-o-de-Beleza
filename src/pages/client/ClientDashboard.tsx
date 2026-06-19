import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO, addDays, isSameDay, startOfToday, setHours, setMinutes, parse, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientDashboard() {
  const { state, addAppointment, updateAppointmentStatus } = useApp();
  const { currentUser } = useAuth();
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const initialDate = new Date().getHours() >= 18 ? addDays(startOfToday(), 1) : startOfToday();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const myAppointments = state.appointments
    .filter(a => a.clientId === currentUser?.id)
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const selectedService = state.services.find(s => s.id === selectedServiceId);

  // Generate next 14 days for date selection
  const availableDates = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  // Determine available time slots based on selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedService) return [];
    
    const slots: { time: string; isAvailable: boolean }[] = [];
    const openingTime = 9; // 09:00
    const closingTime = 18; // 18:00
    const slotInterval = 30; // minutes
    
    const now = new Date();
    
    // Get all appointments for the selected day that are NOT cancelled
    const dayAppointments = state.appointments.filter(a => {
      if (a.status === 'CANCELLED') return false;
      return isSameDay(parseISO(a.date), selectedDate);
    });

    for (let h = openingTime; h < closingTime; h++) {
      for (let m = 0; m < 60; m += slotInterval) {
        const slotDate = setMinutes(setHours(selectedDate, h), m);
        const slotTimeStr = format(slotDate, 'HH:mm');
        
        // Skip past times if selected date is today
        if (isSameDay(selectedDate, now) && isBefore(slotDate, now)) {
          continue;
        }

        // Check if this slot conflicts with existing appointments
        // We assume a simple collision: if slot start + service duration overlaps with any existing appt, it's blocked.
        const apptDuration = selectedService.durationMinutes;
        const slotEnd = setMinutes(slotDate, slotDate.getMinutes() + apptDuration);

        const hasConflict = dayAppointments.some(appt => {
          const apptSvc = state.services.find(s => s.id === appt.serviceId);
          if (!apptSvc) return false;
          
          const apptStart = parseISO(appt.date);
          const apptEnd = setMinutes(new Date(apptStart), apptStart.getMinutes() + apptSvc.durationMinutes);
          
          // Conflict if: slotStart < apptEnd AND slotEnd > apptStart
          return isBefore(slotDate, apptEnd) && isBefore(apptStart, slotEnd);
        });

        slots.push({ time: slotTimeStr, isAvailable: !hasConflict });
      }
    }
    
    return slots;
  }, [selectedDate, selectedService, state.appointments, state.services]);


  const handleSchedule = async () => {
    if (!currentUser || !selectedService || !selectedTime) return;
    
    const timeParts = selectedTime.split(':');
    const apptDate = setMinutes(setHours(selectedDate, parseInt(timeParts[0])), parseInt(timeParts[1]));
    
    await addAppointment({
      clientId: currentUser.id,
      serviceId: selectedService.id,
      date: apptDate.toISOString(),
      status: 'PENDING'
    });
    
    // Feedback visual sem bloquear a tela
    const msg = document.createElement('div');
    msg.textContent = 'Agendamento solicitado com sucesso! Aguarde a confirmação.';
    msg.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 4000);
    
    setSelectedTime('');
    setSelectedServiceId('');
  };

  const getService = (id: string) => state.services.find(s => s.id === id);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Agendar Horário</h2>
        <p className="text-gray-600">Escolha o serviço e veja a disponibilidade</p>
      </header>

      <section className="bg-white p-6 rounded-lg shadow-sm border border-fuchsia-100 space-y-6">
        
        {/* Step 1: Select Service */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Qual procedimento?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.services.map(s => (
              <label 
                key={s.id} 
                className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                  selectedServiceId === s.id ? 'border-fuchsia-500 ring-1 ring-fuchsia-500' : 'border-gray-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="service_selection" 
                  value={s.id} 
                  className="sr-only" 
                  checked={selectedServiceId === s.id}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    setSelectedTime('');
                  }}
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">{s.name}</span>
                    <span className="mt-1 flex items-center text-sm text-gray-500">{s.durationMinutes} minutos</span>
                    <span className="mt-2 text-sm font-bold text-fuchsia-600">R$ {s.price.toFixed(2)}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Step 2: Select Date */}
        {selectedServiceId && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Qual dia?</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {availableDates.map(dateStr => {
                const isSelected = isSameDay(dateStr, selectedDate);
                return (
                  <button
                    key={dateStr.toISOString()}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedTime('');
                    }}
                    className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-lg border transition ${
                      isSelected 
                        ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-fuchsia-400'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase">{format(dateStr, 'EEE', { locale: ptBR })}</span>
                    <span className="text-xl font-bold">{format(dateStr, 'dd')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Select Time */}
        {selectedServiceId && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Qual horário?</h3>
            {availableTimeSlots.length === 0 ? (
              <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded text-center border border-gray-200">
                Lamentamos, não há horários para este dia.
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableTimeSlots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={!slot.isAvailable}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-2 px-1 text-sm font-medium rounded-md border transition text-center flex flex-col items-center justify-center ${
                      !slot.isAvailable 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : selectedTime === slot.time 
                          ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-fuchsia-400'
                    }`}
                  >
                    <span>{slot.time}</span>
                    {!slot.isAvailable && <span className="text-[10px] leading-none mt-1">Lotado</span>}
                  </button>
                ))}
              </div>
            )}
            
            {selectedTime && (
              <div className="mt-6 flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Você está solicitando sugerir horário para <strong className="text-gray-900">{selectedService?.name}</strong> em <strong className="text-gray-900">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}</strong>.
                </p>
                <button 
                  onClick={handleSchedule} 
                  className="w-full sm:w-auto px-8 py-3 bg-fuchsia-600 text-white rounded-md font-bold shadow-md hover:bg-fuchsia-700 transition"
                >
                  Enviar Proposta de Agenda
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meus Agendamentos</h3>
        {myAppointments.length === 0 ? (
          <p className="text-gray-500 text-sm">Você ainda não possui agendamentos.</p>
        ) : (
          <div className="space-y-3">
            {myAppointments.map(appt => {
              const service = getService(appt.serviceId);
              return (
                <div key={appt.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{service?.name}</p>
                    <p className="text-sm text-fuchsia-600 font-medium mt-1">
                      {format(parseISO(appt.date), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {appt.status === 'ADMIN_PROPOSED' && (
                       <p className="mt-2 text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded inline-block">
                         Eli sugeriu este novo horário. O que acha?
                       </p>
                    )}
                  </div>
                  <div className="self-start md:self-center flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      appt.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                      appt.status === 'ADMIN_PROPOSED' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                      appt.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      appt.status === 'COMPLETED' ? 'bg-green-50 text-green-800 border-green-200' :
                      'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {appt.status === 'PENDING' ? 'Aguardando Eli' :
                       appt.status === 'ADMIN_PROPOSED' ? 'Nova Proposta' :
                       appt.status === 'CONFIRMED' ? 'Confirmado' :
                       appt.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                    </span>
                    
                    {appt.status === 'ADMIN_PROPOSED' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateAppointmentStatus(appt.id, 'CANCELLED')} className="px-3 py-1 bg-white text-gray-600 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition">
                           Recusar
                        </button>
                        <button onClick={() => updateAppointmentStatus(appt.id, 'CONFIRMED')} className="px-3 py-1 bg-fuchsia-600 text-white rounded text-sm font-medium shadow-sm hover:bg-fuchsia-700 transition">
                           Aceitar Horário
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
