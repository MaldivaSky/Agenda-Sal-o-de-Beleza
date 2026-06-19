import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppDataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminFinances() {
  const { state } = useApp();

  const data = useMemo(() => {
    const monthlyTotals: Record<string, number> = {};

    // Calculate revenue from COMPLETED appointments
    state.appointments.forEach(appt => {
      if (appt.status === 'COMPLETED') {
        const service = state.services.find(s => s.id === appt.serviceId);
        if (service) {
          const monthYear = format(parseISO(appt.date), 'MMMM yyyy', { locale: ptBR });
          monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + service.price;
        }
      }
    });

    return Object.entries(monthlyTotals).map(([month, total]) => ({
      name: month,
      total: total
    })).reverse(); // Last months first depending on data
  }, [state.appointments, state.services]);

  const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Relatório Financeiro</h2>
        <p className="text-gray-600">Acompanhamento de faturamento mensal</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Receita Total</h3>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">R$ {totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Faturamento Mensal</h3>
        {data.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Não há dados suficientes para exibir o gráfico.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Bar dataKey="total" fill="#d946ef" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
