import { useState } from 'react';
import { Download, FileText, Search, Filter, Eye, EyeOff, CheckCircle, XCircle, Clock, QrCode } from 'lucide-react';
import * as XLSX from 'xlsx';

const QRResultsTabOld = ({ qrResults }) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, success, error
  const [expandedResults, setExpandedResults] = useState(new Set());

  // Filter results based on search and status
  const filteredResults = qrResults.filter(result => {
    const matchesSearch = result.originalQR.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         result.barkod.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         result.seriNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         result.partiNo.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'success' && !result.error) ||
                         (statusFilter === 'error' && result.error);
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: qrResults.length,
    success: qrResults.filter(r => !r.error).length,
    error: qrResults.filter(r => r.error).length,
    uniqueBarcodes: new Set(qrResults.filter(r => !r.error && r.barkod).map(r => r.barkod)).size
  };

  // Toggle expanded view for a result
  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredResults.map((result, index) => ({
      'Sıra': index + 1,
      'QR Kod': result.originalQR,
      'Barkod': result.barkod || 'Bulunamadı',
      'Seri Numarası': result.seriNo || 'Bulunamadı',
      'Son Kullanma Tarihi': result.sonKullanmaTarihi || 'Bulunamadı',
      'Parti Numarası': result.partiNo || 'Bulunamadı',
      'Durum': result.error ? 'Hata' : 'Başarılı',
      'Hata Mesajı': result.error || '',
      'İşlem Tarihi': new Date(result.timestamp).toLocaleString('tr-TR')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'QR Parçalama Sonuçları');
    XLSX.writeFile(wb, `qr_parse_results_${new Date().toISOString().split('T')[0]}.xlsx`);

    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-3 rounded-xl backdrop-blur-lg z-50 animate-slide-up';
    toast.textContent = 'Excel dosyası başarıyla indirildi!';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  // Export to TXT
  const exportToTxt = () => {
    let content = `QR Karekod Parçalama Sonuçları\n`;
    content += `Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
    content += `Toplam Sonuç: ${filteredResults.length}\n`;
    content += `${'='.repeat(50)}\n\n`;

    filteredResults.forEach((result, index) => {
      content += `${index + 1}. QR Kod: ${result.originalQR}\n`;
      content += `   Durum: ${result.error ? 'Hata' : 'Başarılı'}\n`;
      
      if (!result.error) {
        content += `   Barkod: ${result.barkod || 'Bulunamadı'}\n`;
        content += `   Seri Numarası: ${result.seriNo || 'Bulunamadı'}\n`;
        content += `   Son Kullanma Tarihi: ${result.sonKullanmaTarihi || 'Bulunamadı'}\n`;
        content += `   Parti Numarası: ${result.partiNo || 'Bulunamadı'}\n`;
      } else {
        content += `   Hata: ${result.error}\n`;
      }
      
      content += `   İşlem Tarihi: ${new Date(result.timestamp).toLocaleString('tr-TR')}\n`;
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr_parse_results_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-3 rounded-xl backdrop-blur-lg z-50 animate-slide-up';
    toast.textContent = 'TXT dosyası başarıyla indirildi!';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  if (qrResults.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Henüz Sonuç Yok</h3>
          <p className="text-white/70 mb-6">
            QR parçalama sonuçlarını görmek için önce bir QR parçalama işlemi yapın.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">0</div>
              <div className="text-white/60 text-sm">Toplam QR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">0</div>
              <div className="text-white/60 text-sm">Başarılı</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">0</div>
              <div className="text-white/60 text-sm">Hata</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">QR Parçalama Sonuçları</h2>
            <p className="text-white/70">
              QR kodları parçalama işlemlerinin sonuçlarını görüntüleyin ve yönetin.
            </p>
          </div>
          
          {/* Export Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={exportToExcel}
              className="bg-green-500/30 hover:bg-green-500/50 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center space-x-2 border border-green-500/30"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
            <button
              onClick={exportToTxt}
              className="bg-blue-500/30 hover:bg-blue-500/50 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center space-x-2 border border-blue-500/30"
            >
              <FileText className="w-4 h-4" />
              <span>TXT</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
            <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-white/60 text-sm">Toplam QR</div>
          </div>
          <div className="bg-green-500/20 rounded-xl p-4 text-center border border-green-500/30">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.success}</div>
            <div className="text-green-200 text-sm">Başarılı</div>
          </div>
          <div className="bg-red-500/20 rounded-xl p-4 text-center border border-red-500/30">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.error}</div>
            <div className="text-red-200 text-sm">Hata</div>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-4 text-center border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400 mb-1">{stats.uniqueBarcodes}</div>
            <div className="text-purple-200 text-sm">Benzersiz Barkod</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          {/* Search Filter */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="QR kod, barkod, seri no veya parti ara..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'Tümü', icon: Filter },
              { id: 'success', label: 'Başarılı', icon: CheckCircle },
              { id: 'error', label: 'Hata', icon: XCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setStatusFilter(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  statusFilter === id
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Results Info */}
        {(searchFilter || statusFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-white/70 text-sm">
              {filteredResults.length} sonuç gösteriliyor
              {searchFilter && ` (${searchFilter} araması için)`}
              {statusFilter !== 'all' && ` (${statusFilter === 'success' ? 'başarılı' : 'hatalı'} sonuçlar)`}
            </p>
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.map((result, index) => {
          const isExpanded = expandedResults.has(index);
          const hasError = Boolean(result.error);
          
          return (
            <div key={index} className="card table-row">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* Status Icon */}
                  <div className={`p-2 rounded-xl ${
                    !hasError 
                      ? 'bg-green-500/30 text-green-400' 
                      : 'bg-red-500/30 text-red-400'
                  }`}>
                    {!hasError ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  
                  {/* QR Code Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-white font-mono tracking-wider">
                      {result.originalQR.length > 30 ? result.originalQR.substring(0, 30) + '...' : result.originalQR}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(result.timestamp).toLocaleString('tr-TR')}</span>
                      </span>
                      {!hasError && result.barkod && (
                        <span>Barkod: {result.barkod}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge and Expand Button */}
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    !hasError 
                      ? 'bg-green-500/30 text-green-200'
                      : 'bg-red-500/30 text-red-200'
                  }`}>
                    {!hasError ? 'Başarılı' : 'Hata'}
                  </span>
                  
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                    title={isExpanded ? 'Daralt' : 'Genişlet'}
                  >
                    {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Result Content */}
              <div className="space-y-3">
                {!hasError ? (
                  <div>
                    {/* Summary */}
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
                      <p className="text-green-200 text-sm">
                        QR kod başarıyla parçalandı
                      </p>
                    </div>

                    {/* Parsed Data */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="bg-black/20 rounded-lg p-3">
                          <span className="text-white/60 text-sm block">Son Kullanma Tarihi:</span>
                          <span className="text-white font-mono">{result.sonKullanmaTarihi || 'Bulunamadı'}</span>
                        </div>
                        <div className="bg-black/20 rounded-lg p-3">
                          <span className="text-white/60 text-sm block">Parti Numarası:</span>
                          <span className="text-white font-mono">{result.partiNo || 'Bulunamadı'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Full QR Code (if expanded) */}
                    {isExpanded && (
                      <div className="mt-4">
                        <div className="bg-black/20 rounded-lg p-3">
                          <span className="text-white/60 text-sm block mb-2">Tam QR Kod:</span>
                          <span className="text-white/90 font-mono text-xs break-all">{result.originalQR}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-200 text-sm">
                      <strong>Hata:</strong> {result.error}
                    </p>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-red-500/20">
                        <span className="text-white/60 text-sm block mb-2">QR Kod:</span>
                        <span className="text-white/90 font-mono text-xs break-all">{result.originalQR}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredResults.length === 0 && (searchFilter || statusFilter !== 'all') && (
        <div className="card text-center py-12">
          <div className="bg-gray-500/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-white/60" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Sonuç Bulunamadı</h3>
          <p className="text-white/70 mb-4">
            Arama kriterlerinize uygun sonuç bulunamadı.
          </p>
          <button
            onClick={() => {
              setSearchFilter('');
              setStatusFilter('all');
            }}
            className="btn-secondary"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  );
};

export default QRResultsTabOld;