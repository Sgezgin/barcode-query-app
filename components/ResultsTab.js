import { useState } from 'react';
import { Download, FileText, Search, Filter, Eye, EyeOff, CheckCircle, XCircle, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';

const ResultsTab = ({ queryResults }) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, success, error
  const [expandedResults, setExpandedResults] = useState(new Set());

  // Filter results based on search and status
  const filteredResults = queryResults.filter(result => {
    const matchesSearch = result.carrierLabel.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         result.barcodes.some(barcode => barcode.toLowerCase().includes(searchFilter.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'success' && result.success) ||
                         (statusFilter === 'error' && !result.success);
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: queryResults.length,
    success: queryResults.filter(r => r.success).length,
    error: queryResults.filter(r => !r.success).length,
    totalBarcodes: queryResults.reduce((sum, r) => sum + (r.barcodes?.length || 0), 0)
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
    const exportData = [];
    
    filteredResults.forEach(result => {
      if (result.barcodes && result.barcodes.length > 0) {
        result.barcodes.forEach((barcode, index) => {
          exportData.push({
            'Sıra': exportData.length + 1,
            'Carrier Label': result.carrierLabel,
            'Barcode': barcode,
            'Barcode Sırası': index + 1,
            'Toplam Barcode': result.barcodes.length,
            'Durum': result.success ? 'Başarılı' : 'Hata',
            'Hata Mesajı': result.error || '',
            'Tarih': new Date(result.timestamp).toLocaleString('tr-TR')
          });
        });
      } else {
        exportData.push({
          'Sıra': exportData.length + 1,
          'Carrier Label': result.carrierLabel,
          'Barcode': result.success ? 'Barcode bulunamadı' : 'Hata',
          'Barcode Sırası': 0,
          'Toplam Barcode': 0,
          'Durum': result.success ? 'Başarılı (Boş)' : 'Hata',
          'Hata Mesajı': result.error || '',
          'Tarih': new Date(result.timestamp).toLocaleString('tr-TR')
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Barcode Sonuçları');
    XLSX.writeFile(wb, `barcode_results_${new Date().toISOString().split('T')[0]}.xlsx`);

    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-3 rounded-xl backdrop-blur-lg z-50 animate-slide-up';
    toast.textContent = 'Excel dosyası başarıyla indirildi!';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  // Export to TXT
  const exportToTxt = () => {
    let content = `Barcode Sorgulama Sonuçları\n`;
    content += `Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
    content += `Toplam Sonuç: ${filteredResults.length}\n`;
    content += `${'='.repeat(50)}\n\n`;

    filteredResults.forEach((result, index) => {
      content += `${index + 1}. Carrier Label: ${result.carrierLabel}\n`;
      content += `   Durum: ${result.success ? 'Başarılı' : 'Hata'}\n`;
      
      if (result.success && result.barcodes && result.barcodes.length > 0) {
        content += `   Bulunan Barcodes (${result.barcodes.length} adet):\n`;
        result.barcodes.forEach((barcode, bIndex) => {
          content += `   ${bIndex + 1}. ${barcode}\n`;
        });
      } else if (result.success) {
        content += `   Sonuç: Barcode bulunamadı\n`;
      } else {
        content += `   Hata: ${result.error}\n`;
      }
      
      content += `   Tarih: ${new Date(result.timestamp).toLocaleString('tr-TR')}\n`;
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode_results_${new Date().toISOString().split('T')[0]}.txt`;
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

  if (queryResults.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Henüz Sonuç Yok</h3>
          <p className="text-white/70 mb-6">
            Sorgu sonuçlarını görmek için önce bir sorgulama yapın.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">0</div>
              <div className="text-white/60 text-sm">Toplam Sorgu</div>
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
            <h2 className="text-2xl font-bold text-white mb-2">Sorgu Sonuçları</h2>
            <p className="text-white/70">
              Tüm sorgulama sonuçlarınızı görüntüleyin ve yönetin.
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
            <div className="text-white/60 text-sm">Toplam Sorgu</div>
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
            <div className="text-2xl font-bold text-purple-400 mb-1">{stats.totalBarcodes}</div>
            <div className="text-purple-200 text-sm">Toplam Barcode</div>
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
                placeholder="Carrier label veya barcode ara..."
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
          const hasResults = result.barcodes && result.barcodes.length > 0;
          
          return (
            <div key={index} className="card table-row">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* Status Icon */}
                  <div className={`p-2 rounded-xl ${
                    result.success 
                      ? 'bg-green-500/30 text-green-400' 
                      : 'bg-red-500/30 text-red-400'
                  }`}>
                    {result.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  
                  {/* Carrier Label */}
                  <div>
                    <h3 className="text-lg font-semibold text-white font-mono tracking-wider">
                      {result.carrierLabel}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(result.timestamp).toLocaleString('tr-TR')}</span>
                      </span>
                      {hasResults && (
                        <span>{result.barcodes.length} barcode</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge and Expand Button */}
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.success 
                      ? 'bg-green-500/30 text-green-200'
                      : 'bg-red-500/30 text-red-200'
                  }`}>
                    {result.success ? 'Başarılı' : 'Hata'}
                  </span>
                  
                  {hasResults && (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                      title={isExpanded ? 'Daralt' : 'Genişlet'}
                    >
                      {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Result Content */}
              <div className="space-y-3">
                {result.success ? (
                  hasResults ? (
                    <div>
                      {/* Summary */}
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
                        <p className="text-green-200 text-sm">
                          <strong>{result.barcodes.length} adet barcode</strong> başarıyla bulundu
                        </p>
                      </div>

                      {/* Barcodes List */}
                      <div className="space-y-2">
                        <h4 className="text-white/90 font-medium text-sm">Bulunan Barcodes:</h4>
                        
                        {/* Show first 3 or all if expanded */}
                        <div className="space-y-1">
                          {(isExpanded ? result.barcodes : result.barcodes.slice(0, 3)).map((barcode, bIndex) => (
                            <div 
                              key={bIndex} 
                              className="font-mono text-sm text-white/90 bg-black/30 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                            >
                              <span className="text-white/60 mr-3">{bIndex + 1}.</span>
                              {barcode}
                            </div>
                          ))}
                        </div>

                        {/* Show more button */}
                        {!isExpanded && result.barcodes.length > 3 && (
                          <button
                            onClick={() => toggleExpanded(index)}
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                          >
                            + {result.barcodes.length - 3} tane daha göster
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-yellow-200 text-sm">
                        Bu carrier label için barcode bulunamadı
                      </p>
                    </div>
                  )
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-200 text-sm">
                      <strong>Hata:</strong> {result.error || 'Bilinmeyen hata'}
                    </p>
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

export default ResultsTab;