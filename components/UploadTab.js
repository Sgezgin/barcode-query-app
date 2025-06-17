import { useState, useRef } from 'react';
import { Upload, FileText, X, Play, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const UploadTab = ({ onQueryComplete }) => {
  const [uploadedData, setUploadedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let carriers = [];

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Excel file processing
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          
          // Process all sheets
          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            // Find 20-character data
            jsonData.forEach(row => {
              if (Array.isArray(row)) {
                row.forEach(cell => {
                  if (cell && typeof cell === 'string' && cell.length === 20 && /^\d+$/.test(cell)) {
                    carriers.push(cell);
                  }
                });
              }
            });
          });
        } else if (file.name.endsWith('.txt')) {
          // Text file processing
          const text = e.target.result;
          const lines = text.split('\n');
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.length === 20 && /^\d+$/.test(trimmed)) {
              carriers.push(trimmed);
            }
          });
        }

        // Remove duplicates
        carriers = [...new Set(carriers)];
        setUploadedData(carriers);
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-3 rounded-xl backdrop-blur-lg z-50 animate-slide-up';
        toast.textContent = `${carriers.length} adet carrier label bulundu!`;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);

      } catch (error) {
        console.error('File processing error:', error);
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-3 rounded-xl backdrop-blur-lg z-50 animate-slide-up';
        toast.textContent = 'Dosya işleme hatası!';
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    if (file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleBulkQuery = async () => {
    if (uploadedData.length === 0) return;

    setIsProcessing(true);
    setProcessingIndex(0);
    const results = [];

    try {
      for (let i = 0; i < uploadedData.length; i++) {
        setProcessingIndex(i);
        
        const response = await fetch('/api/query-barcode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ carrierLabel: uploadedData[i] }),
        });

        const result = await response.json();
        results.push(result);

        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      onQueryComplete(results);
      
      // Show completion message
      const successCount = results.filter(r => r.success).length;
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-3 rounded-xl backdrop-blur-lg z-50 animate-slide-up';
      toast.textContent = `Toplu sorgulama tamamlandı! ${successCount}/${results.length} başarılı`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 4000);

    } catch (error) {
      console.error('Bulk query error:', error);
    } finally {
      setIsProcessing(false);
      setProcessingIndex(-1);
    }
  };

  const clearUploadedData = () => {
    setUploadedData([]);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Toplu Carrier Label Sorgulama</h2>
        <p className="text-white/70">
          Excel (.xlsx) veya Text (.txt) dosyası yükleyerek toplu sorgulama yapın.
        </p>
      </div>

      <div className="space-y-6">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition-all duration-300">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.txt"
            className="hidden"
            disabled={isProcessing}
          />
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-2">
                Dosya Yükleyin
              </h3>
              <p className="text-white/70 text-sm mb-4">
                Excel (.xlsx) veya Text (.txt) dosyalarını destekliyoruz
              </p>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="btn-primary disabled:opacity-50"
            >
              {isProcessing ? 'İşleniyor...' : 'Dosya Seç'}
            </button>
          </div>
        </div>

        {/* File Processing Status */}
        {fileName && (
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-white/70" />
                <span className="text-white/90 font-medium">{fileName}</span>
              </div>
              {!isProcessing && uploadedData.length === 0 && (
                <button
                  onClick={clearUploadedData}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Uploaded Data Preview */}
        {uploadedData.length > 0 && (
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Yüklenen Veriler ({uploadedData.length} adet)</span>
              </h3>
              <button
                onClick={clearUploadedData}
                disabled={isProcessing}
                className="text-white/60 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Data Preview */}
            <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
              {uploadedData.slice(0, 10).map((data, index) => (
                <div 
                  key={index} 
                  className={`text-white/90 text-sm font-mono bg-black/20 p-2 rounded transition-all duration-200 ${
                    processingIndex === index ? 'bg-indigo-500/30 border border-indigo-400' : ''
                  }`}
                >
                  <span className="text-white/60 mr-2">{index + 1}.</span>
                  {data}
                  {processingIndex === index && (
                    <span className="ml-2 text-indigo-300">← İşleniyor</span>
                  )}
                </div>
              ))}
              {uploadedData.length > 10 && (
                <div className="text-white/60 text-sm text-center py-2">
                  ... ve {uploadedData.length - 10} tane daha
                </div>
              )}
            </div>

            {/* Processing Progress */}
            {isProcessing && processingIndex >= 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>İşlem Durumu</span>
                  <span>{processingIndex + 1} / {uploadedData.length}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((processingIndex + 1) / uploadedData.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Bulk Query Button */}
            <button
              onClick={handleBulkQuery}
              disabled={isProcessing}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="loading-spinner"></div>
                  <span>Toplu Sorgulama Yapılıyor... ({processingIndex + 1}/{uploadedData.length})</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Play className="w-5 h-5" />
                  <span>Toplu Sorgulama Başlat</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-white font-medium">Dosya Formatı Hakkında</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Excel dosyalarında tüm sayfalar taranır</li>
                <li>• Sadece 20 karakterlik sayısal veriler alınır</li>
                <li>• Duplicate veriler otomatik olarak temizlenir</li>
                <li>• TXT dosyalarında her satır ayrı kontrol edilir</li>
                <li>• API limitlerini aşmamak için sorgulamalar arasında kısa bekleme yapılır</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTab;