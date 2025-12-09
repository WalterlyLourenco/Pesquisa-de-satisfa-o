import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquarePlus, Database, Check } from 'lucide-react';
import SurveyForm from './components/SurveyForm';
import Dashboard from './components/Dashboard';
import { SurveyResponse, ViewState } from './types';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.SURVEY);
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  const [showToast, setShowToast] = useState(false);

  // Load data from "Database" on mount
  useEffect(() => {
    const data = dbService.getAll();
    setSurveyData(data);
  }, []);

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
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleResetDatabase = () => {
    if (confirm("Tem certeza que deseja resetar o banco de dados para os valores iniciais?")) {
      const resetData = dbService.reset();
      setSurveyData(resetData);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
          <Check className="w-5 h-5" />
          <div>
            <h4 className="font-bold text-sm">Sucesso!</h4>
            <p className="text-xs text-green-100">Avaliação salva no banco de dados.</p>
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
                onClick={() => setCurrentView(ViewState.DASHBOARD)}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  currentView === ViewState.DASHBOARD 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
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
            <SurveyForm onSubmit={handleSurveySubmit} />
            <div className="mt-8 text-center text-sm text-gray-400 flex justify-center items-center gap-2">
              <Database className="w-4 h-4" />
              <p>Conectado ao banco de dados local.</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <Dashboard data={surveyData} onReset={handleResetDatabase} />
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
