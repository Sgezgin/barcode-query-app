import { Search, QrCode } from 'lucide-react';

const ModuleSelection = ({ onModuleSelect }) => {
  const modules = [
    {
      id: 'barcode',
      title: 'Carrier Label Sorgulama',
      description: 'Carrier Label kodlarını sorgulayın ve barcode bilgilerini alın',
      icon: Search,
      color: 'from-blue-500 to-purple-600',
      features: [
        'Tek ve toplu sorgulama',
        'Excel/TXT dosya desteği',
        'API entegrasyonu',
        'Sonuç raporlama'
      ]
    },
    {
      id: 'qr',
      title: 'Eczane Karekod Parçalama',
      description: 'QR kodlarını barkod, seri no, tarih ve parti bilgilerine ayırın',
      icon: QrCode,
      color: 'from-green-500 to-blue-600',
      features: [
        'QR kod parçalama',
        'Excel dosya işleme',
        'Otomatik veri ayrıştırma',
        'Detaylı raporlama'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Sistem Modülleri
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Kullanmak istediğiniz modülü seçin. Her modül farklı işlevler ve araçlar sunar.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {modules.map((module) => {
          const IconComponent = module.icon;
          
          return (
            <div
              key={module.id}
              onClick={() => onModuleSelect(module.id)}
              className="card hover:scale-105 transform transition-all duration-300 cursor-pointer group"
            >
              {/* Module Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className={`bg-gradient-to-r ${module.color} rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {module.title}
                  </h2>
                  <p className="text-white/70 text-sm">
                    {module.description}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                  Özellikler
                </h3>
                <ul className="space-y-2">
                  {module.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3 text-white/80">
                      <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button className="w-full btn-primary group-hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-center space-x-2">
                  <span>Modülü Seç</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="text-center mt-12">
        <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg border border-white/20">
          <p className="text-white/70 text-sm">
            <strong className="text-white">Not:</strong> Modüller arasında geçiş yapmak için üst menüdeki geri butonunu kullanabilirsiniz.
            Her modülün kendi veri setleri ve işlemleri vardır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModuleSelection;