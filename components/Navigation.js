import { Search, Eye, Upload, FileText } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab, resultCount }) => {
  const tabs = [
    {
      id: 'query',
      label: 'Tek Sorgulama',
      icon: Search,
      description: 'Manuel carrier label girişi'
    },
    {
      id: 'upload',
      label: 'Toplu Sorgulama',
      icon: Upload,
      description: 'Excel/TXT dosya yükleme'
    },
    {
      id: 'results',
      label: 'Sonuçlar',
      icon: Eye,
      description: 'Sorgu sonuçlarını görüntüle',
      badge: resultCount > 0 ? resultCount : null
    }
  ];

  return (
    <div className="card mb-6">
      <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
        {tabs.map(({ id, label, icon: Icon, description, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 group ${
              activeTab === id
                ? 'bg-white text-indigo-600 shadow-lg transform scale-105'
                : 'text-white hover:bg-white/20 hover:transform hover:scale-102'
            }`}
          >
            <Icon className={`w-5 h-5 ${activeTab === id ? 'text-indigo-600' : 'text-white'}`} />
            
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">{label}</span>
              <span className={`text-xs ${
                activeTab === id ? 'text-indigo-400' : 'text-white/60'
              }`}>
                {description}
              </span>
            </div>

            {/* Badge for results count */}
            {badge && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                {badge > 99 ? '99+' : badge}
              </span>
            )}

            {/* Active indicator */}
            {activeTab === id && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-indigo-600 rounded-full"></div>
            )}

            {/* Hover effect */}
            <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
              activeTab !== id ? 'group-hover:bg-gradient-to-r group-hover:from-white/5 group-hover:to-white/10' : ''
            }`}></div>
          </button>
        ))}
      </div>

      {/* Tab description */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-white/70 text-sm">
          {activeTab === 'query' && 'Tek bir carrier label kodunu manuel olarak girerek sorgulama yapın.'}
          {activeTab === 'upload' && 'Excel veya TXT dosyası yükleyerek toplu sorgulama yapın. Sistem otomatik olarak 20 karakterlik kodları algılar.'}
          {activeTab === 'results' && 'Tüm sorgulama sonuçlarınızı görüntüleyin, filtreleyin ve export edin.'}
        </p>
      </div>
    </div>
  );
};

export default Navigation;