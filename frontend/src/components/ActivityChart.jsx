export default function ActivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📈 Atividade (Últimas 24h)
        </h2>
        <p className="text-center text-gray-500 py-8">
          Sem dados de atividade
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        📈 Atividade (Últimas 24h)
      </h2>
      
      <div className="flex items-end justify-between h-48 space-x-1">
        {data.map((item, index) => {
          const height = (item.count / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center h-40">
                <div
                  className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.count} mensagens
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {item.hour}h
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
