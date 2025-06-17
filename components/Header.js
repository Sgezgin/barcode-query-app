import { useState } from 'react';
import { Settings, LogOut, User, Save, X } from 'lucide-react';

const Header = ({ onLogout, credentials, onUpdateCredentials }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [newUsername, setNewUsername] = useState(credentials.username);
  const [newPassword, setNewPassword] = useState(credentials.password);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate save delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onUpdateCredentials({ username: newUsername, password: newPassword });
    setIsSaving(false);
    setShowSettings(false);
    
    // Show success feedback
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-3 rounded-xl backdrop-blur-lg z-50 animate-slide-up';
    toast.textContent = 'Ayarlar başarıyla güncellendi!';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  const handleCancelSettings = () => {
    setNewUsername(credentials.username);
    setNewPassword(credentials.password);
    setShowSettings(false);
  };

  return (
    <>
      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl w-14 h-14 flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-1">
                Barcode Query System
              </h1>
              <p className="text-white/70">
                Carrier Label Sorgulama ve Yönetim Sistemi
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col items-end text-sm text-white/60">
              <span>Aktif Kullanıcı</span>
              <span className="text-white/90 font-medium">{credentials.username}</span>
            </div>
            
            <button
              onClick={() => setShowSettings(true)}
              className="btn-secondary p-3 hover:scale-105"
              title="Ayarlar"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={onLogout}
              className="bg-red-500/30 hover:bg-red-500/50 text-white p-3 rounded-xl backdrop-blur-lg border border-red-500/30 transition-all duration-300 hover:scale-105"
              title="Çıkış Yap"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="card w-full max-w-md animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Sistem Ayarları</h2>
              <button
                onClick={handleCancelSettings}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-medium">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="input-field"
                  placeholder="Yeni kullanıcı adı"
                  disabled={isSaving}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-medium">
                  Şifre
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Yeni şifre"
                  disabled={isSaving}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving || !newUsername || !newPassword}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner"></div>
                      <span>Kaydediliyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Kaydet</span>
                    </div>
                  )}
                </button>
                
                <button
                  onClick={handleCancelSettings}
                  disabled={isSaving}
                  className="flex-1 btn-secondary"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;