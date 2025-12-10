import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquarePlus, Database, Check, Lock, Loader2, Wifi, Cloud, CloudOff } from 'lucide-react';
import SurveyForm from './components/SurveyForm';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import { SurveyResponse, ViewState } from './types';
// Import from the new Database folder
import { database } from './services/database';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.SURVEY);
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  
  // Loading States
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', msg: '' });
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Clear Data Modal State
  const [showClearDataModal, setShowClearDataModal] = useState(false);

  // Load data from "Database" on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsAppLoading(true);
    try {
      const data = await database.getAll();
      setSurveyData(data);
    } catch (error) {
      console.error("Erro ao conectar com banco de dados", error);
      setToastMessage({ title: 'Erro de Conexão', msg: 'Não foi possível carregar os dados.' });
      setShowToast(true);
    } finally {
      setIsAppLoading(false);
    }
  };

  // Validation function to prevent duplicate tickets
  const handleValidateTicket = async (ticketId: string): Promise<boolean> => {
    return await database.checkTicketExists(ticketId);
  };

  const handleSurveySubmit = async (newResponse: Omit<SurveyResponse, 'id' | 'timestamp'>) => {
    setIsProcessing(true);
    
    const fullResponse: SurveyResponse = {
      ...newResponse,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    
    try {
      // Save to Database (Cloud or Local based on config)
      await database.add(fullResponse);
      
      // Update local state by refetching or appending (appending is faster)
      setSurveyData(prev => [...prev, fullResponse]);
      
      // Show feedback
      setToastMessage({ title: 'Sucesso!', msg: 'Avaliação salva com sucesso.' });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      alert("Erro ao salvar dados. Verifique sua conexão com o servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteResponse = async (id: string) => {
    // Optimistic Update: Update UI immediately, then sync
    const originalData = [...surveyData];
    setSurveyData(prevData => prevData.filter(item => item.id !== id));

    try {
      const success = await database.remove(id);
      if (!success) throw new Error("Falha na remoção");
    } catch (error) {
      // Revert if failed
      setSurveyData(originalData);
      alert("Falha ao excluir registro do banco de dados.");
    }
  };

  const handleResetDatabaseClick = () => {
    setShowClearDataModal(true);
  };

  const handleClearDataConfirm = async (password: string) => {
    if (password === 'Service123') {
      setIsProcessing(true);
      try {
        await database.clear();
        setSurveyData([]);
        setShowClearDataModal(false);
        alert("Sucesso: Base de dados foi limpa.");
      } catch (e) {
        alert("Erro ao limpar dados. A API pode não suportar limpeza total.");
      } finally {
        setIsProcessing(false);
      }
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

  const handleRefreshData = async () => {
    await fetchData();
  };

  // Global Loading Screen
  if (isAppLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-blue-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Conectando ao TicketTrack DB...</h2>
        <p className="text-sm text-gray-400">Sincronizando registros...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/30 z-[200] flex items-center justify-center backdrop-blur-[1px]">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="font-medium text-gray-700">Processando requisição...</span>
          </div>
        </div>
      )}

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
        title="Zerar Banco de Dados"
        description="ATENÇÃO: Esta ação apagará TODOS os dados registrados."
        buttonText="Confirmar Exclusão Total"
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
              
              {/* Connection Status Indicator */}
              <div className="ml-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 border transition-all bg-gray-100 text-gray-600 border-gray-200">
                <Database className="w-3 h-3" />
                <span>Database v2.0</span>
              </div>
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
              <Cloud className="w-4 h-4" />
              <p>Os dados serão armazenados na pasta <strong>services/database</strong>.</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {isAuthenticated ? (
              <Dashboard 
                data={surveyData} 
                onReset={handleResetDatabaseClick} 
                onDelete={handleDeleteResponse}
                onRefresh={handleRefreshData}
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