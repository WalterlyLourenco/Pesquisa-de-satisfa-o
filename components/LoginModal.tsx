import React, { useState } from 'react';
import { Lock, X, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    // Pass password up to parent to validate
    onLogin(password);
    // Reset internal state
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-800">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg">Acesso Administrativo</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">
            Para visualizar o Dashboard com as respostas e análises, por favor insira a senha de administrador.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Senha</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 transition-all ${
                  error 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                }`}
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">Senha incorreta. Tente novamente.</p>}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
