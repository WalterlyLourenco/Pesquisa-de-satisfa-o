import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquarePlus, Database, Check, Lock } from 'lucide-react';
import SurveyForm from './components/SurveyForm';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import { SurveyResponse, ViewState } from './types';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.SURVEY);
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', msg: '' });
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Clear Data Modal State
  const [showClearDataModal, setShowClearDataModal] = useState(false);

  // Load data from "Database" on mount
  useEffect(() => {
    const data = dbService.getAll();
    setSurveyData(data);
  }, []);

  // Validation function to prevent duplicate tickets
  const handleValidateTicket = (ticketId: string): boolean => {
    return dbService.checkTicketExists(ticketId);
  };

  const handleSurveySubmit = (newResponse: Omit<SurveyResponse, 'id' | 'timestamp'>) => {
    const fullResponse: SurveyResponse = {
      ...newResponse,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    
    // Save to Database
    const updatedList = dbService.add(fullResponse);
    setSurveyData(updatedList);
    
    // Show feedback
    setToastMessage({ title: 'Sucesso!', msg: 'Avaliação salva no banco de dados.' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteResponse = (id: string) => {
    // IMMEDIATE ACTION: No confirmation dialog to ensure it works
    // Remove from Database
    dbService.remove(id);
    
    // Update UI state immediately
    setSurveyData(prevData => {
      const newData = prevData.filter(item => item.id !== id);
      return newData;
    });

    // Optional feedback could be added here, but keeping it fast
  };

  const handleResetDatabaseClick = () => {
    setShowClearDataModal(true);
  };

  const handleClearDataConfirm = (password: string) => {
    if (password === 'Service123') {
      const emptyData = dbService.clear();
      setSurveyData(emptyData);
      setShowClearDataModal(false);
      alert("Sucesso: Todas as informações foram zeradas.");
    } else {
      alert("Senha incorreta!");
    }
  };

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      setCurrentView(ViewState.DASHBOARD);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogin = (password: string) => {
    if (password === 'Alterar123') {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setCurrentView(ViewState.DASHBOARD);
    } else {
      alert("Senha incorreta!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Auth Modal for Dashboard Access */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />

      {/* Auth Modal for Clear Data Action */}
      <LoginModal 
        isOpen={showClearDataModal} 
        onClose={() => setShowClearDataModal(false)}
        onLogin={handleClearDataConfirm}
        title="Zerar Dashboard"
        description="ATENÇÃO: Esta ação apagará TODOS os dados permanentemente. Para confirmar, digite a senha administrativa."
        buttonText="Confirmar Exclusão"
        isDestructive={true}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
          <Check className="w-5 h-5" />
          <div>
            <h4 className="font-bold text-sm">{toastMessage.title}</h4>
            <p className="text-xs text-green-100">{toastMessage.msg}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg text-white font-bold mr-3">T</span>
              <span className="text-xl font-bold text-gray-900 tracking-tight">TicketTrack AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView(ViewState.SURVEY)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  currentView === ViewState.SURVEY 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Pesquisa</span>
              </button>
              <button
                onClick={handleDashboardClick}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  currentView === ViewState.DASHBOARD 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isAuthenticated ? <LayoutDashboard className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow py-8 bg-gray-50">
        {currentView === ViewState.SURVEY ? (
          <div className="container mx-auto px-4 animate-fade-in-up">
            <SurveyForm 
              onSubmit={handleSurveySubmit} 
              onValidateTicket={handleValidateTicket} 
            />
            <div className="mt-8 text-center text-sm text-gray-400 flex justify-center items-center gap-2">
              <Database className="w-4 h-4" />
              <p>Conectado ao banco de dados local.</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {isAuthenticated ? (
              <Dashboard 
                data={surveyData} 
                onReset={handleResetDatabaseClick} 
                onDelete={handleDeleteResponse}
              />
            ) : (
              // Fallback protection if manual state change happens
              <div className="flex items-center justify-center h-64 text-gray-500">
                Acesso negado.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} TicketTrack AI. Platforma de Qualidade de Suporte.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;