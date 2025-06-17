import { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const LoginForm = ({ onLogin, credentials }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === credentials.username && password === credentials.password) {
      onLogin();
    } else {
      setError('Kullanıcı adı veya şifre hatalı!');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">
            Barcode Query
          </h1>
        
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-12"
                placeholder="Kullanıcı adınızı girin"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-12 pr-12"
                placeholder="Şifrenizi girin"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm backdrop-blur-lg animate-slide-up">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-spinner"></div>
                <span>Giriş yapılıyor...</span>
              </div>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        {/* Help Text */}
        {/* <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Demo hesap: <span className="text-white/90 font-mono">admin / admin</span>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginForm;