import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Scissors, Calendar, MapPin, Phone, Instagram, Clock, Video, User, Download, X } from 'lucide-react';

export default function Portal() {
  const { state } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      setShowInstallModal(true);
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('App instalado');
      }
      setInstallPrompt(null);
    });
  };

  const handleBookClick = () => {

    if (currentUser) {
      if (currentUser.role === 'ADMIN') {
        navigate('/agenda');
      } else {
        navigate('/agendar');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-fuchsia-600">
            <Scissors className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-gray-900">Espaço Eli Trassi</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleInstallClick} 
              className="hidden md:flex items-center gap-1 text-sm font-medium text-fuchsia-700 bg-fuchsia-50 px-3 py-1.5 rounded hover:bg-fuchsia-100 transition"
            >
              <Download className="w-4 h-4" /> Instalar App
            </button>
            {currentUser ? (
              <Link to={currentUser.role === 'ADMIN' ? "/agenda" : "/agendar"} className="text-sm font-medium text-gray-600 hover:text-fuchsia-600 transition flex items-center gap-1">
                <User className="w-4 h-4" />{currentUser.name.split(' ')[0]}
              </Link>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-fuchsia-600 transition">
                Entrar
              </Link>
            )}
            <button onClick={handleBookClick} className="bg-fuchsia-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow hover:bg-fuchsia-700 transition transform hover:-translate-y-0.5">
              Agendar Horário
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-100 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="relative flex h-3 w-3">
              {state.eliStatus === 'AVAILABLE' && (
                <><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></>
              )}
              {state.eliStatus === 'BUSY' && (
                <><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></>
              )}
              {state.eliStatus === 'OFF' && (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400"></span>
              )}
            </span>
            <span className={
              state.eliStatus === 'AVAILABLE' ? "text-green-700" :
              state.eliStatus === 'BUSY' ? "text-orange-700" : "text-gray-600"
            }>
              {state.eliStatus === 'AVAILABLE' ? 'Disponível para agendamentos' :
               state.eliStatus === 'BUSY' ? 'Em atendimento no momento' : 'De folga hoje'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Beleza em sua <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-500">
              melhor versão.
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto md:mx-0">
            Especialista em loiros, cortes modernos e depilação. Descubra um espaço feito exclusivamente para cuidar de você.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <button onClick={handleBookClick} className="w-full sm:w-auto bg-fuchsia-600 text-white px-8 py-3.5 rounded-full text-base font-bold shadow-lg hover:shadow-xl hover:bg-fuchsia-700 transition flex items-center justify-center gap-2 group">
              <Calendar className="w-5 h-5 group-hover:scale-110 transition" />
              Garantir meu horário
            </button>
            <button 
              onClick={handleInstallClick} 
              className="w-full sm:w-auto md:hidden bg-white text-fuchsia-700 border border-fuchsia-200 px-8 py-3.5 rounded-full text-base font-bold shadow-sm hover:bg-fuchsia-50 transition flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Instalar Aplicativo
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative w-full max-w-sm md:max-w-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-200 to-pink-100 rounded-full blur-3xl opacity-50 block"></div>
          <img 
            src={state.heroImage || "https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?auto=format&fit=crop&w=800&q=80"} 
            alt="Salão" 
            className="relative z-10 w-full rounded-2xl shadow-2xl object-cover aspect-[4/5] md:aspect-square"
          />
        </div>
      </section>

      {/* Serviços Resumo */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Nossos Serviços</h2>
            <p className="text-gray-500 mt-2">Os procedimentos mais desejados</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.services.slice(0, 6).map(s => (
              <div key={s.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between hover:border-fuchsia-200 hover:shadow-md transition">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.durationMinutes} minutos</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-fuchsia-600 text-lg">R$ {s.price.toFixed(2)}</span>
                  <button onClick={handleBookClick} className="text-sm font-medium bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm hover:text-fuchsia-600">
                    Agendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
              Trabalhos & Transformações
            </h2>
            <p className="text-gray-500 mt-2">Dê uma olhada no que acontece no Espaço Eli Trassi</p>
          </div>
          
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {state.portfolio.map(item => (
              <div key={item.id} className="break-inside-avoid relative group rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
                {item.type === 'video' ? (
                  item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                    <div className="aspect-video w-full">
                      <iframe 
                        className="w-full h-full"
                        src={item.url.replace('watch?v=', 'embed/').split('&')[0]} 
                        title="Video" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                      </iframe>
                    </div>
                  ) : (
                    <video src={item.url} controls className="w-full h-auto" />
                  )
                ) : (
                  <img src={item.url} alt={item.description} className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500" />
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-medium text-sm">{item.description}</p>
                </div>
                {item.type === 'video' && !item.url.includes('youtube') && (
                  <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-fuchsia-400 mb-4">
              <Scissors className="w-6 h-6" />
              <span className="font-bold text-xl tracking-tight text-white">Espaço Eli Trassi</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">Seu momento de beleza e bem-estar, com a exclusividade e carinho que você merece.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Contato</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-fuchsia-500" /> (11) 95236-5338</p>
              <a href="https://maps.app.goo.gl/jeFwaJTfXYNrxWfk7" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-fuchsia-400 transition cursor-pointer">
                <MapPin className="w-4 h-4 text-fuchsia-500" /> R. Dona Benedita, 205
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Redes Sociais</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/elitrassi_/" className="p-2 bg-gray-800 rounded-full hover:bg-fuchsia-600 transition text-gray-300">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://api.whatsapp.com/send?phone=5511952365338&text=Ol%C3%A1%2C%20gostaria%20de%20falar%20sobre%20um%20agendamento%20e%20Atendimento%21"
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition hover:scale-110 z-50 flex items-center justify-center cursor-pointer"
        title="Falar com a Eli/Atendimento no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
      </a>

      {/* Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-fuchsia-100 text-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Instale nosso App</h3>
              <p className="text-sm text-gray-600 mb-6">Tenha acesso rápido aos seus agendamentos diretamente na sua tela inicial.</p>
              
              <div className="bg-gray-50 p-4 rounded-xl text-left space-y-4 mb-6">
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">🍎 No iPhone (Safari):</p>
                  <p className="text-sm text-gray-600">Toque em <strong>Compartilhar</strong> <span className="inline-block border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white mx-1">↑</span> e depois <strong>Adicionar à Tela de Início</strong> <span className="inline-block border border-gray-300 rounded px-1 text-xs bg-white mx-1">+</span>.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">🤖 No Android (Chrome):</p>
                  <p className="text-sm text-gray-600">Toque nos <strong>3 pontinhos</strong> <span className="inline-block border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white mx-1">⋮</span> e depois <strong>Adicionar à tela inicial</strong>.</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowInstallModal(false)}
                className="w-full bg-fuchsia-600 text-white font-bold py-3 rounded-xl hover:bg-fuchsia-700 transition"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
