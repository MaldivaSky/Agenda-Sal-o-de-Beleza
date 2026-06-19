import React from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Calendar, Users, BarChart3, LogOut, Scissors } from 'lucide-react';

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return <Outlet />;

  const isAdmin = currentUser.role === 'ADMIN';

  const adminNav = [
    { to: "/agenda", icon: <Calendar className="w-6 h-6" />, label: 'Agenda' },
    { to: "/servicos", icon: <Scissors className="w-6 h-6" />, label: 'Serviços' },
    { to: "/clientes", icon: <Users className="w-6 h-6" />, label: 'Clientes' },
    { to: "/portal-admin", icon: <Home className="w-6 h-6" />, label: 'O Portal' },
    { to: "/financeiro", icon: <BarChart3 className="w-6 h-6" />, label: 'Finanças' },
  ];

  const clientNav = [
    { to: "/agendar", icon: <Calendar className="w-6 h-6" />, label: 'Agendar' },
    { to: "/historico", icon: <Scissors className="w-6 h-6" />, label: 'Histórico' },
  ];

  const navLinks = isAdmin ? adminNav : clientNav;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16 md:pb-0">
      <header className="bg-fuchsia-600 text-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg">
              <Link to="/">Espaço Eli Trassi</Link>
            </h1>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-fuchsia-700 transition" aria-label="Sair">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 flex flex-col">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 md:sticky md:top-16 md:border-b md:h-16 z-10">
        <div className="max-w-4xl mx-auto flex justify-around p-2 md:justify-start md:gap-8 md:px-4">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full py-1 text-xs md:text-sm md:flex-row md:gap-2 transition-colors ${
                  isActive ? 'text-fuchsia-600 font-medium' : 'text-gray-500 hover:text-fuchsia-500'
                }`
              }
            >
              {link.icon}
              <span className="mt-1 md:mt-0">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Floating WhatsApp Button (Only for clients) */}
      {!isAdmin && (
        <a 
          href="https://api.whatsapp.com/send?phone=5511999999999&text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20o%20suporte%2Fatendimento%21"
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-8 bg-green-500 text-white p-3.5 rounded-full shadow-lg hover:bg-green-600 transition hover:scale-110 z-50 flex items-center justify-center"
          title="Falar com a Eli/Atendimento no WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
        </a>
      )}
    </div>
  );
}
