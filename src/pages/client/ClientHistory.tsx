import React from 'react';
import { useApp } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientHistory() {
  const { state } = useApp();
  const { currentUser } = useAuth();
  
  const myHistory = state.history
    .filter(h => h.clientId === currentUser?.id)
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Meu Histórico</h2>
        <p className="text-gray-600">Acompanhe sua evolução e procedimentos</p>
      </header>

      {myHistory.length === 0 ? (
        <div className="bg-white p-6 rounded-lg text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500">Nenhum registro no seu histórico ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {myHistory.map(hist => (
            <div key={hist.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="mb-4">
                <p className="font-medium text-fuchsia-600">
                  {format(parseISO(hist.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-sm text-gray-700 italic mt-1 bg-gray-50 p-2 rounded">"{hist.notes}"</p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-xs text-gray-500 font-medium block mb-2 uppercase tracking-wide">Antes</span>
                  {hist.beforePhoto ? (
                    <img src={hist.beforePhoto} alt="Antes" className="w-full h-auto aspect-square object-cover rounded shadow border border-gray-200" />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded border border-gray-200 text-gray-400 text-xs text-center p-2">
                      Sem foto
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs text-gray-500 font-medium block mb-2 uppercase tracking-wide">Depois</span>
                  {hist.afterPhoto ? (
                    <img src={hist.afterPhoto} alt="Depois" className="w-full h-auto aspect-square object-cover rounded shadow border border-gray-200" />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded border border-gray-200 text-gray-400 text-xs text-center p-2">
                      Sem foto
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
