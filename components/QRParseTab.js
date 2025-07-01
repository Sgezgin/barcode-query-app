import { useState, useRef } from 'react';
import { Upload, FileText, X, Play, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import * as XLSX from 'xlsx';

const QRParseTab = ({ onParseComplete }) => {
  const [uploadedData, setUploadedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [processingIndex, setProcessingIndex] = useState(-1);
  const fileInputRef = useRef();

  // QR kod temizleme fonksiyonu - parantezleri, boşlukları ve tire işaretlerini kaldırır
  const cleanQRCode = (qrCode) => {
    if (!qrCode || typeof qrCode !== 'string') {
      return '';
    }
    
    // Adım adım temizleme işlemi
    let cleaned = qrCode;
    
    // 1. Tüm parantez türlerini kaldır
    cleaned = cleaned.replace(/[()[\]{}]/g, '');
    
    // 2. Tüm boşlukları kaldır
    cleaned = cleaned.replace(/\s+/g, '');
    
    // 3. Tire işaretlerini kaldır
    cleaned = cleaned.replace(/-/g, '');
    
    // 4. Trim işlemi
    cleaned = cleaned.trim();
    
    console.log('QR Temizleme:', {
      original: qrCode,
      cleaned: cleaned,
      changed: qrCode !== cleaned
    });
    
    return cleaned;
  };

  // Güncellenmiş QR kod parçalama fonksiyonu
  const parseQRCode = (qrCode) => {
    if (!qrCode || typeof qrCode !== 'string') {
      return {
        barkod: '',
        seriNo: '',
        sonKullanmaTarihi: '',
        partiNo: '',
        error: 'Geçersiz QR kod'
      };
    }

    try {
      // QR kodu temizle
      const cleanedQRCode = cleanQRCode(qrCode);
      
      let result = {
        barkod: '',
        seriNo: '',
        sonKullanmaTarihi: '',
        partiNo: '',
        error: null
      };

      let currentIndex = 0;
      
      while (currentIndex < cleanedQRCode.length) {
        // İlk 2-3 karakteri kod olarak oku
        let code = '';
        let codeLength = 2;
        
        // 3 haneli kodları kontrol et (010)
        if (currentIndex + 2 < cleanedQRCode.length) {
          const threeDigitCode = cleanedQRCode.substring(currentIndex, currentIndex + 3);
          if (threeDigitCode === '010') {
            code = threeDigitCode;
            codeLength = 3;
          }
        }
        
        // 2 haneli kodları kontrol et (21, 17, 10)
        if (!code && currentIndex + 1 < cleanedQRCode.length) {
          const twoDigitCode = cleanedQRCode.substring(currentIndex, currentIndex + 2);
          if (['21', '17', '10'].includes(twoDigitCode)) {
            code = twoDigitCode;
            codeLength = 2;
          }
        }
        
        if (!code) {
          currentIndex++;
          continue;
        }
        
        currentIndex += codeLength;
        
        // Koda göre değer uzunluğunu belirle
        switch (code) {
          case '010':
            // BARKOD (13 karakter)
            if (currentIndex + 13 <= cleanedQRCode.length) {
              result.barkod = cleanedQRCode.substring(currentIndex, currentIndex + 13);
              currentIndex += 13;
            }
            break;
            
          case '21':
            // SERİ NO - Sonraki kod etiketine veya string sonuna kadar
            let serialEnd = currentIndex;
            while (serialEnd < cleanedQRCode.length) {
              const char = cleanedQRCode[serialEnd];
              // Sonraki kod etiketlerini ara (10, 17, 21, 010)
              const remaining = cleanedQRCode.substring(serialEnd);
              if (remaining.startsWith('10') || remaining.startsWith('17') || 
                  remaining.startsWith('21') || remaining.startsWith('010') ||
                  char === ' ' || char === ';' || char === '\u001D') {
                break;
              }
              serialEnd++;
            }
            result.seriNo = cleanedQRCode.substring(currentIndex, serialEnd);
            currentIndex = serialEnd;
            
            // GS karakterini atla
            if (currentIndex < cleanedQRCode.length && cleanedQRCode[currentIndex] === '\u001D') {
              currentIndex++;
            }
            break;
            
          case '17':
            // SON KULLANMA (6 hane - YYMMDD)
            if (currentIndex + 6 <= cleanedQRCode.length) {
              const dateValue = cleanedQRCode.substring(currentIndex, currentIndex + 6);
              if (dateValue.length === 6) {
                const year = '20' + dateValue.substring(0, 2);
                const month = dateValue.substring(2, 4);
                const day = dateValue.substring(4, 6);
                result.sonKullanmaTarihi = `${day}.${month}.${year}`;
              }
              currentIndex += 6;
            }
            break;
            
          case '10':
            // PARTİ/LOT - Kalan tüm karakterler
            result.partiNo = cleanedQRCode.substring(currentIndex);
            currentIndex = cleanedQRCode.length; // Döngüyü bitir
            break;
            
          default:
            currentIndex++;
            break;
        }
      }

      return result;
    } catch (error) {
      return {
        barkod: '',
        seriNo: '',
        sonKullanmaTarihi: '',
        partiNo: '',
        error: 'QR kod parçalama hatası: ' + error.message
      };
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let qrCodes = [];

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Excel file processing
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          
          // Process all sheets
          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            // İlk satır header olduğu için atlıyoruz
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (row && row[0]) { // İlk sütundaki QR kodunu al
                const qrCode = String(row[0]).trim();
                if (qrCode && qrCode !== '' && qrCode !== 'undefined' && qrCode !== 'null') {
                  qrCodes.push(qrCode);
                }
              }
            }
          });
        } else if (file.name.endsWith('.txt')) {
          // Text file processing
          const text = e.target.result;
          const lines = text.split('\n');
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && trimmed !== '' && trimmed !== 'undefined' && trimmed !== 'null') {
              qrCodes.push(trimmed);
            }
          });
        }

        // Remove duplicates and filter empty values
        qrCodes = [...new Set(qrCodes)].filter(code => {
          const cleaned = cleanQRCode(code);
          return cleaned && cleaned.length > 10; // En az 10 karakter olmalı
        });
        setUploadedData(qrCodes);
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-3 rounded-xl backdrop-blur-lg z-50 animate-slide-up';
        toast.textContent = `${qrCodes.length} adet QR kod bulundu!`;
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

  const handleBulkParse = async () => {
    if (uploadedData.length === 0) return;

    setIsProcessing(true);
    setProcessingIndex(0);
    const results = [];

    try {
      for (let i = 0; i < uploadedData.length; i++) {
        setProcessingIndex(i);
        
        const qrCode = uploadedData[i];
        const parsed = parseQRCode(qrCode);
        
        results.push({
          originalQR: qrCode,
          cleanedQR: cleanQRCode(qrCode), // Temizlenmiş QR kodu kaydet
          barkod: parsed.barkod,
          seriNo: parsed.seriNo,
          sonKullanmaTarihi: parsed.sonKullanmaTarihi,
          partiNo: parsed.partiNo,
          error: parsed.error,
          timestamp: new Date().toISOString()
        });

        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      onParseComplete(results);
      
      // Show completion message
      const successCount = results.filter(r => !r.error).length;
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-3 rounded-xl backdrop-blur-lg z-50 animate-slide-up';
      toast.textContent = `QR parçalama tamamlandı! ${successCount}/${results.length} başarılı`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 4000);

    } catch (error) {
      console.error('Bulk parse error:', error);
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
        <h2 className="text-2xl font-bold text-white mb-2">QR Karekod Parçalama</h2>
        <p className="text-white/70">
          Excel (.xlsx) veya Text (.txt) dosyası yükleyerek QR kodlarını barkod, seri numarası, tarih ve parti bilgilerine ayırın.
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
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-2">
                QR Kod Dosyası Yükleyin
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
                <span>Yüklenen QR Kodları ({uploadedData.length} adet)</span>
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
                  {data.length > 50 ? data.substring(0, 50) + '...' : data}
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
                    className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((processingIndex + 1) / uploadedData.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Parse Button */}
            <button
              onClick={handleBulkParse}
              disabled={isProcessing}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="loading-spinner"></div>
                  <span>QR Kodları Parçalanıyor... ({processingIndex + 1}/{uploadedData.length})</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Play className="w-5 h-5" />
                  <span>QR Parçalama Başlat</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Help Section - Güncellenmiş kurallar */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-white font-medium">QR Parçalama Kuralları (Güncellenmiş)</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• <strong>Otomatik Temizleme:</strong> Parantezler (), köşeli parantezler [], boşluklar, tire (-) ve özel karakterler otomatik kaldırılır</li>
                <li>• <strong>Minimum Uzunluk:</strong> Temizlenmiş QR kod en az 10 karakter olmalı</li>
                <li>• <strong>010:</strong> BARKOD (13 karakter)</li>
                <li>• <strong>21:</strong> SERİ NO (Sonraki kod etiketine kadar)</li>
                <li>• <strong>17:</strong> SON KULLANMA (6 hane - YYMMDD formatı)</li>
                <li>• <strong>10:</strong> PARTİ/LOT (Kalan tüm karakterler)</li>
                <li>• Excel dosyalarında ilk sütundaki QR kodları işlenir</li>
                <li>• TXT dosyalarında her satırdaki QR kod ayrı işlenir</li>
                <li>• Duplicate ve boş QR kodları otomatik olarak temizlenir</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRParseTab;