import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Scissors } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      alert('Credenciais inválidas. (Dica de teste: admin@elitrassi.com / admin)');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-4">
          <img src="/logo.svg" alt="Espaço Eli Trassi Logo" className="w-full h-full object-contain rounded-full shadow-md border border-gray-100" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Espaço Eli Trassi</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Beleza e Cuidado Pessoal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
              >
                Entrar
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Primeira vez aqui?{' '}
              <Link to="/registrar" className="font-medium text-fuchsia-600 hover:text-fuchsia-500">
                Crie sua conta
              </Link>
            </p>
            <p className="text-sm">
              <Link to="/" className="font-medium text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
                Voltar para a página inicial
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
