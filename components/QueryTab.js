import { useState } from 'react';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';

const QueryTab = ({ onQueryComplete }) => {
  const [carrierLabel, setCarrierLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleQuery = async () => {
    if (!carrierLabel.trim() || carrierLabel.length !== 20) {
      return;
    }

    setIsLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/query-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carrierLabel: carrierLabel.trim() }),
      });

      const result = await response.json();
      setLastResult(result);
      onQueryComplete([result]);

      // Show success/error toast
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 px-6 py-3 rounded-xl backdrop-blur-lg z-50 animate-slide-up ${
        result.success 
          ? 'bg-green-500/20 border border-green-500/50 text-green-200' 
          : 'bg-red-500/20 border border-red-500/50 text-red-200'
      }`;
      toast.textContent = result.success 
        ? `${result.barcodes.length} barcode bulundu!` 
        : 'Sorgulama başarısız!';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);

    } catch (error) {
      console.error('Query error:', error);
      setLastResult({
        success: false,
        carrierLabel,
        barcodes: [],
        error: 'Bağlantı hatası'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only numbers
    if (value.length <= 20) {
      setCarrierLabel(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && carrierLabel.length === 20 && !isLoading) {
      handleQuery();
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Tek Carrier Label Sorgulama</h2>
        <p className="text-white/70">
          20 karakterlik carrier label kodunu girerek barcode sorgulama yapın.
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-white/90 text-sm font-medium">
            Carrier Label (20 karakter)
          </label>
          
          <div className="relative">
            <input
              type="text"
              value={carrierLabel}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="00486995264164408060"
              className={`input-field pr-16 font-mono text-lg tracking-wider ${
                carrierLabel.length === 20 
                  ? 'border-green-500/50 focus:border-green-500' 
                  : carrierLabel.length > 0 
                    ? 'border-yellow-500/50 focus:border-yellow-500'
                    : ''
              }`}
              disabled={isLoading}
            />
            
            {/* Character counter */}
            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium ${
              carrierLabel.length === 20 
                ? 'text-green-400' 
                : carrierLabel.length > 0 
                  ? 'text-yellow-400'
                  : 'text-white/50'
            }`}>
              {carrierLabel.length}/20
            </div>
          </div>

          {/* Validation message */}
          {carrierLabel.length > 0 && carrierLabel.length !== 20 && (
            <div className="flex items-center space-x-2 text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Carrier label tam 20 karakter olmalıdır</span>
            </div>
          )}
          
          {carrierLabel.length === 20 && (
            <div className="flex items-center space-x-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Karakter uzunluğu doğru</span>
            </div>
          )}
        </div>

        {/* Query Button */}
        <button
          onClick={handleQuery}
          disabled={isLoading || carrierLabel.length !== 20}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="loading-spinner"></div>
              <span>Sorgulanıyor...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <Search className="w-5 h-5" />
              <span>Sorgula</span>
            </div>
          )}
        </button>

        {/* Quick Result Preview */}
        {lastResult && (
          <div className={`p-6 rounded-xl backdrop-blur-lg border animate-slide-up ${
            lastResult.success 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Sorgu Sonucu</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                lastResult.success 
                  ? 'bg-green-500/30 text-green-200'
                  : 'bg-red-500/30 text-red-200'
              }`}>
                {lastResult.success ? 'Başarılı' : 'Başarısız'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-white/70 text-sm">Carrier Label:</span>
                <div className="font-mono text-white bg-black/20 p-2 rounded mt-1">
                  {lastResult.carrierLabel}
                </div>
              </div>
              
              {lastResult.success && lastResult.barcodes.length > 0 ? (
                <div>
                  <span className="text-white/70 text-sm">
                    Bulunan Barcodes ({lastResult.barcodes.length} adet):
                  </span>
                  <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                    {lastResult.barcodes.slice(0, 3).map((barcode, index) => (
                      <div key={index} className="font-mono text-sm text-white/90 bg-black/20 p-2 rounded">
                        {barcode}
                      </div>
                    ))}
                    {lastResult.barcodes.length > 3 && (
                      <div className="text-white/60 text-sm text-center py-2">
                        ... ve {lastResult.barcodes.length - 3} tane daha
                      </div>
                    )}
                  </div>
                </div>
              ) : lastResult.success ? (
                <div className="text-white/70 text-sm">
                  Bu carrier label için barcode bulunamadı.
                </div>
              ) : (
                <div className="text-red-300 text-sm">
                  Hata: {lastResult.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Example Values */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="text-white font-medium mb-3">Örnek Carrier Label Kodları:</h4>
          <div className="space-y-2">
            {[
              '00486995401093226383',
              '00486995401093226444',
              '00486996802443192522',
              '00486995802016414014'
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setCarrierLabel(example)}
                className="block w-full text-left font-mono text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded transition-all duration-200"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryTab;