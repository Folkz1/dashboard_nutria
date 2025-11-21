import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Wrapped() {
  const { token, year, month } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchWrappedData();
  }, [token, year, month]);

  const fetchWrappedData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wrapped/${token}/${year}/${month}`);
      if (!res.ok) throw new Error('Dados não encontrados');
      const wrappedData = await res.json();
      setData(wrappedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const shareToWhatsApp = () => {
    const url = window.location.href;
    const text = `🥗 Meu NutrIA Wrapped de ${data.period.month}!\n\n✅ ${data.stats.totalAnalyses} análises\n📊 Score médio: ${data.stats.avgScore}\n🔥 ${data.stats.activeDays} dias ativos\n\nVeja o meu: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToInstagram = () => {
    alert('📸 Tire um print desta tela e compartilhe no Instagram Stories!');
  };

  const downloadImage = () => {
    alert('🎨 Função de download em desenvolvimento!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white text-xl">Preparando seu Wrapped...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Ops!</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const slides = [
    // Slide 1: Intro
    <div key="intro" className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 flex items-center justify-center p-8">
      <div className="text-center text-white max-w-2xl">
        <img 
          src="https://i.imgur.com/Diz9NMI.jpeg" 
          alt="NutrIA Logo" 
          className="h-32 w-32 rounded-full mx-auto mb-8 animate-bounce"
        />
        <h1 className="text-6xl font-bold mb-4">NutrIA Wrapped</h1>
        <h2 className="text-4xl font-semibold mb-8">
          {data.period.month} {data.period.year}
        </h2>
        <p className="text-2xl opacity-90">
          Olá, {data.user.name}!
        </p>
        <p className="text-xl opacity-75 mt-4">
          Vamos ver como foi seu mês? 🚀
        </p>
      </div>
    </div>,

    // Slide 2: Total de Análises
    <div key="analyses" className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center p-8">
      <div className="text-center text-white max-w-2xl">
        <p className="text-2xl mb-4 opacity-90">Você analisou</p>
        <div className="text-9xl font-bold mb-4 animate-pulse">
          {data.stats.totalAnalyses}
        </div>
        <p className="text-3xl font-semibold mb-8">produtos</p>
        
        {data.stats.growth > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <p className="text-xl">
              📈 {data.stats.growth}% mais que o mês passado!
            </p>
          </div>
        )}
        
        {data.stats.growth < 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <p className="text-xl">
              Você analisou menos este mês, mas tudo bem! 💪
            </p>
          </div>
        )}
      </div>
    </div>,

    // Slide 3: Score Médio
    <div key="score" className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
      <div className="text-center text-white max-w-2xl">
        <p className="text-2xl mb-4 opacity-90">Seu score médio foi</p>
        <div className="text-9xl font-bold mb-4">
          {data.stats.avgScore}
        </div>
        <p className="text-3xl font-semibold mb-8">/10</p>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8">
          <p className="text-2xl">
            {data.motivationalPhrase}
          </p>
        </div>
      </div>
    </div>,

    // Slide 4: Melhor Produto
    data.highlights.bestProduct && (
      <div key="best" className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center p-8">
        <div className="text-center text-white max-w-2xl">
          <div className="text-6xl mb-6">🏆</div>
          <p className="text-2xl mb-4 opacity-90">Sua melhor escolha foi</p>
          <h2 className="text-4xl font-bold mb-6">
            {data.highlights.bestProduct.product_name}
          </h2>
          <div className="text-7xl font-bold mb-4">
            {data.highlights.bestProduct.score}/10
          </div>
          <p className="text-xl opacity-75">
            Parabéns pela escolha saudável! ✨
          </p>
        </div>
      </div>
    ),

    // Slide 5: Categorias Favoritas
    data.highlights.topCategories.length > 0 && (
      <div key="categories" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
        <div className="text-center text-white max-w-2xl">
          <div className="text-6xl mb-6">📊</div>
          <p className="text-2xl mb-8 opacity-90">Suas categorias favoritas</p>
          <div className="space-y-6">
            {data.highlights.topCategories.map((cat, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">#{index + 1}</span>
                  <span className="text-2xl font-semibold">{cat.category}</span>
                  <span className="text-3xl font-bold">{cat.count}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    // Slide 6: Dias Ativos
    <div key="days" className="min-h-screen bg-gradient-to-br from-teal-900 via-green-900 to-emerald-900 flex items-center justify-center p-8">
      <div className="text-center text-white max-w-2xl">
        <div className="text-6xl mb-6">🔥</div>
        <p className="text-2xl mb-4 opacity-90">Você foi ativo em</p>
        <div className="text-9xl font-bold mb-4">
          {data.stats.activeDays}
        </div>
        <p className="text-3xl font-semibold mb-8">dias</p>
        
        {data.stats.activeDays >= 20 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <p className="text-2xl">
              Consistência incrível! 💪
            </p>
          </div>
        )}
      </div>
    </div>,

    // Slide 7: Ranking
    <div key="ranking" className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center p-8">
      <div className="text-center text-white max-w-2xl">
        <div className="text-6xl mb-6">🎯</div>
        <p className="text-2xl mb-4 opacity-90">Você está no</p>
        <div className="text-9xl font-bold mb-4">
          Top {100 - data.stats.percentile}%
        </div>
        <p className="text-2xl mb-8">dos usuários mais ativos!</p>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
          <p className="text-xl">
            {data.stats.percentile >= 80 ? 'Você é um dos melhores! 🌟' :
             data.stats.percentile >= 50 ? 'Muito bem! Continue assim! 💪' :
             'Vamos melhorar juntos! 🚀'}
          </p>
        </div>
      </div>
    </div>,

    // Slide 8: Conquistas
    data.achievements.length > 0 && (
      <div key="achievements" className="min-h-screen bg-gradient-to-br from-yellow-900 via-amber-900 to-orange-900 flex items-center justify-center p-8">
        <div className="text-center text-white max-w-2xl">
          <div className="text-6xl mb-6">🏆</div>
          <p className="text-3xl mb-8 font-bold">Conquistas Desbloqueadas</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.achievements.map((achievement, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-5xl mb-3">{achievement.icon}</div>
                <p className="text-xl font-bold mb-2">{achievement.title}</p>
                <p className="text-sm opacity-90">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    // Slide 9: Final
    <div key="final" className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 flex items-center justify-center p-8">
      <div className="text-center text-white max-w-2xl">
        <div className="text-8xl mb-4">🎉</div>
        <img 
          src="https://i.imgur.com/Diz9NMI.jpeg" 
          alt="NutrIA Logo" 
          className="h-24 w-24 rounded-full mx-auto mb-4"
        />
        <h2 className="text-5xl font-bold mb-6">
          Esse foi seu {data.period.month}!
        </h2>
        <p className="text-2xl mb-12 opacity-90">
          Continue fazendo escolhas saudáveis! 💚
        </p>
        
        <div className="space-y-4">
          <button
            onClick={shareToWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl text-xl font-semibold transition-all transform hover:scale-105"
          >
            📱 Compartilhar no WhatsApp
          </button>
          
          <button
            onClick={shareToInstagram}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl text-xl font-semibold transition-all transform hover:scale-105"
          >
            📸 Compartilhar no Instagram
          </button>
          
          <button
            onClick={() => window.location.href = `/u/${token}`}
            className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-2xl text-xl font-semibold transition-all"
          >
            👤 Ver Perfil Completo
          </button>
        </div>
        
        <div className="flex items-center justify-center space-x-2 mt-8 opacity-75">
          <img 
            src="https://i.imgur.com/Diz9NMI.jpeg" 
            alt="NutrIA Logo" 
            className="h-6 w-6 rounded-full"
          />
          <p className="text-sm">NutrIA - Seu assistente nutricional</p>
        </div>
      </div>
    </div>
  ].filter(Boolean);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative">
      {/* Slide atual */}
      <div className="transition-all duration-500">
        {slides[currentSlide]}
      </div>

      {/* Navegação */}
      <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center space-x-4 z-50">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full disabled:opacity-30 hover:bg-white/30 transition-all"
        >
          ← Anterior
        </button>
        
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full disabled:opacity-30 hover:bg-white/30 transition-all"
        >
          Próximo →
        </button>
      </div>

      {/* Indicador de slide */}
      <div className="fixed top-8 right-8 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm z-50">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}
