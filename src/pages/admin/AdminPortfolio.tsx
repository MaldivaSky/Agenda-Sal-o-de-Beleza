import React, { useState } from 'react';
import { useApp } from '../../contexts/AppDataContext';
import { ImagePlus, Video, Trash2 } from 'lucide-react';

export default function AdminPortfolio() {
  const { state, updateEliStatus, updateHeroImage, addPortfolioItem, removePortfolioItem } = useApp();
  const [desc, setDesc] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem não pode ter mais de 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await addPortfolioItem({
        type: 'image',
        url: base64String,
        description: desc || 'Nova foto adicionada'
      });
      setDesc('');
    };
    reader.readAsDataURL(file);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    await addPortfolioItem({
      type: 'video',
      url: videoUrl,
      description: desc || 'Novo vídeo adicionado'
    });
    setVideoUrl('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900">Meu Portal Profissional</h2>
        <p className="text-gray-600">Controle o seu status para as clientes e seu portfólio de fotos/vídeos</p>
      </header>

      {/* Status Toggle */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Seu Status Atual</h3>
          <p className="text-sm text-gray-500">As clientes vão ver isso na página inicial do aplicativo.</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {(['AVAILABLE', 'BUSY', 'OFF'] as const).map(status => (
            <button
              key={status}
              onClick={() => updateEliStatus(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                state.eliStatus === status 
                  ? (status === 'AVAILABLE' ? 'bg-green-100 text-green-800 shadow-sm border border-green-200' :
                     status === 'BUSY' ? 'bg-orange-100 text-orange-800 shadow-sm border border-orange-200' :
                     'bg-gray-700 text-white shadow-sm border border-gray-600')
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'AVAILABLE' ? 'Disponível' : status === 'BUSY' ? 'Em atendimento' : 'De Folga'}
            </button>
          ))}
        </div>
      </section>

      {/* Portfolio & Hero Upload */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><ImagePlus className="w-5 h-5 text-fuchsia-600" /> Foto Principal (Hero)</h3>
          <p className="text-sm text-gray-500 mb-4">Esta foto será o destaque principal na tela inicial do portal das clientes.</p>
          <div className="space-y-4">
            <label className="flex items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-fuchsia-500 hover:bg-fuchsia-50 transition">
              <div className="space-y-1 text-center">
                <span className="text-fuchsia-600 font-medium">Trocar Foto Principal</span>
                <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = async () => {
                  await updateHeroImage(reader.result as string);
                  alert('Foto principal atualizada!');
                };
                reader.readAsDataURL(file);
              }} />
            </label>
            {state.heroImage && (
              <img src={state.heroImage} alt="Preview" className="w-full h-32 object-cover rounded-md border border-gray-200" />
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><ImagePlus className="w-5 h-5 text-fuchsia-600" /> Subir Foto</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição ou Título</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Mechas iluminadas" className="mt-1 block w-full border-gray-300 rounded-md border px-3 py-2 text-sm focus:ring-fuchsia-500 focus:border-fuchsia-500" />
            </div>
            <div>
              <label className="flex items-center justify-center w-full py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-fuchsia-500 hover:bg-fuchsia-50 transition">
                <div className="space-y-1 text-center">
                  <span className="text-fuchsia-600 font-medium">Clique para escolher uma foto</span>
                  <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddVideo} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Video className="w-5 h-5 text-fuchsia-600" /> Adicionar Vídeo (Link)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição do Vídeo</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Transformação completa" className="mt-1 block w-full border-gray-300 rounded-md border px-3 py-2 text-sm focus:ring-fuchsia-500 focus:border-fuchsia-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Link do YouTube / Instagram / TikTok</label>
              <input required type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="mt-1 block w-full border-gray-300 rounded-md border px-3 py-2 text-sm focus:ring-fuchsia-500 focus:border-fuchsia-500" />
            </div>
            <button type="submit" className="w-full justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-fuchsia-600 hover:bg-fuchsia-700">
              Salvar Vídeo
            </button>
            <p className="text-xs text-gray-500 italic mt-2">Dica: Use links diretos do Youtube para embutir melhor.</p>
          </div>
        </form>
      </section>

      {/* Visualizar Portfolio */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Itens no Portal ({state.portfolio.length})</h3>
        {state.portfolio.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma foto ou vídeo listado no portal do cliente.</p>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {state.portfolio.map(p => (
              <div key={p.id} className="relative group bg-gray-100 rounded-lg overflow-hidden break-inside-avoid shadow-sm border border-gray-200">
                {p.type === 'video' ? (
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <Video className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-blue-600 truncate w-full">{p.url}</p>
                  </div>
                ) : (
                  <img src={p.url} className="w-full h-auto object-cover" alt="portfolio" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                  <p className="text-white text-sm font-medium text-center mb-4">{p.description}</p>
                  <button onClick={() => { if(window.confirm('Excluir do portal?')) removePortfolioItem(p.id); }} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
