import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend
} from 'recharts';
import { 
  BrainCircuit, Loader2, TrendingUp, AlertTriangle, MessageSquare, 
  MousePointerClick, CalendarClock, Wrench, RefreshCw, Clock, 
  Download, Search, X, Trash2, LayoutGrid, LayoutList, Edit, CheckSquare, RefreshCcw
} from 'lucide-react';
import { SurveyResponse, AIAnalysisResult } from '../types';
import { analyzeSurveyData } from '../services/geminiService';

interface DashboardProps {
  data: SurveyResponse[];
  onReset?: () => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset, onDelete, onRefresh }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showManageModal, setShowManageModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter Data based on Search Term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lowerTerm = searchTerm.toLowerCase();
    return data.filter(item => 
      item.ticketId.includes(lowerTerm) || 
      item.customerId.toLowerCase().includes(lowerTerm)
    );
  }, [data, searchTerm]);

  // Metrics Calculation based on Filtered Data
  const metrics = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) return { total: 0, avgEase: 0, avgProcess: 0, avgSolution: 0, recentTrend: [] };

    const avgEase = filteredData.reduce((acc, cur) => acc + cur.easeRating, 0) / total;
    const avgProcess = filteredData.reduce((acc, cur) => acc + cur.processRating, 0) / total;
    const avgSolution = filteredData.reduce((acc, cur) => acc + cur.solutionRating, 0) / total;
    
    const recentTrend = filteredData.slice(-20).map((d) => ({ 
      name: `#${d.ticketId}`,
      ease: d.easeRating,
      process: d.processRating,
      solution: d.solutionRating
    }));

    return { total, avgEase, avgProcess, avgSolution, recentTrend };
  }, [filteredData]);

  const handleRunAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const result = await analyzeSurveyData(filteredData);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleManualRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500); // Visual delay
    }
  };

  const handleDownloadExcel = () => {
    if (filteredData.length === 0) {
      alert("Não há dados filtrados para exportar.");
      return;
    }

    const headers = [
      "ID Interno", "Chamado", "Cliente", 
      "Facilidade Abertura (1-5)", "Processo/Agendamento (1-5)", "Solução Técnica (1-5)", 
      "Comentário", "Data/Hora"
    ];

    const csvRows = [
      headers.join(';'),
      ...filteredData.map(row => {
        const cleanComment = row.comment 
          ? `"${row.comment.replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ")}"` 
          : '""';
        const cleanCustomer = `"${row.customerId}"`; 

        return [
          row.id, row.ticketId, cleanCustomer,
          row.easeRating, row.processRating, row.solutionRating,
          cleanComment, row.timestamp
        ].join(';');
      })
    ];

    const csvString = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tickettrack_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ title, value, subtext, color, icon: Icon }: { title: string, value: string, subtext: string, color: string, icon: any }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</h3>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
        <p className="text-gray-400 text-xs mt-1">{subtext}</p>
      </div>
      <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    // CRITICAL: Stop propagation to prevent card click events or parent containers from intercepting
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Ensure it stops immediately
    e.preventDefault();
    
    // Safety confirmation dialog
    if (window.confirm("Confirmação: Deseja EXCLUIR este registro permanentemente?")) {
      if (onDelete) {
        onDelete(id);
      }
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-700';
    if (rating <= 2) return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              Dashboard de Qualidade
              {onRefresh && (
                <button 
                  onClick={handleManualRefresh}
                  className={`p-2 rounded-full hover:bg-gray-200 transition-all ${isRefreshing ? 'animate-spin bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                  title="Sincronizar dados"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
              )}
            </h2>
            <p className="text-gray-500">Monitoramento da experiência do cliente e eficácia técnica</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </button>

              <button
                onClick={() => setShowManageModal(true)}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Edit className="w-4 h-4" />
                Gerenciar Registros
              </button>

              <div className="h-8 w-px bg-gray-300 mx-1 hidden md:block"></div>

              {onReset && (
                <button 
                  onClick={onReset}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200"
                  title="Zerar Banco de Dados (Requer Senha)"
                >
                  <Trash2 className="w-4 h-4" />
                  Zerar DB
                </button>
              )}
          </div>
        </div>

        {/* Filter & View Mode Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Filtrar por Nº Chamado ou Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 mr-2">
              Visualização:
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button 
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm ${
                  viewMode === 'cards' 
                    ? 'bg-white text-blue-600 shadow-sm font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Blocos</span>
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm ${
                  viewMode === 'table' 
                    ? 'bg-white text-blue-600 shadow-sm font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">Lista Detalhada</span>
              </button>
            </div>
            <div className="text-sm text-gray-500 ml-2 border-l pl-4 border-gray-200">
              Total: <strong>{metrics.total}</strong>
            </div>
          </div>
        </div>
      </div>

      {metrics.total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
           <Search className="w-12 h-12 text-gray-300 mb-4" />
           <p className="text-gray-500 font-medium">
             {searchTerm ? "Nenhum resultado encontrado para o filtro." : "A base de dados está vazia."}
           </p>
           {searchTerm && (
             <button 
               onClick={() => setSearchTerm('')}
               className="mt-2 text-blue-600 hover:underline text-sm"
             >
               Limpar filtros
             </button>
           )}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <StatCard 
              title="Facilidade de Abertura" 
              value={metrics.avgEase.toFixed(1) + "/5"}
              subtext="Média filtrada"
              color="text-blue-600"
              icon={MousePointerClick}
            />
            <StatCard 
              title="Agendamento & Processo" 
              value={metrics.avgProcess.toFixed(1) + "/5"}
              subtext="Média filtrada"
              color="text-indigo-600"
              icon={CalendarClock}
            />
            <StatCard 
              title="Solução Técnica" 
              value={metrics.avgSolution.toFixed(1) + "/5"}
              subtext="Média filtrada"
              color="text-emerald-600"
              icon={Wrench}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Charts & List Section */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Tendência das Últimas Avaliações</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.recentTrend}>
                      <defs>
                        <linearGradient id="colorEase" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSol" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60}/>
                      <YAxis domain={[0, 5]} stroke="#9ca3af" fontSize={12} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Area type="monotone" dataKey="ease" name="Abertura" stroke="#2563eb" fillOpacity={1} fill="url(#colorEase)" />
                      <Area type="monotone" dataKey="process" name="Agendamento" stroke="#4f46e5" fill="none" />
                      <Area type="monotone" dataKey="solution" name="Solução" stroke="#10b981" fillOpacity={1} fill="url(#colorSol)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Display: Cards or Table */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex justify-between items-center">
                  <span>Avaliações Recentes</span>
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                    {viewMode === 'cards' ? 'Visualização: Blocos' : 'Visualização: Tabela'}
                  </span>
                </h3>
                
                <div className="overflow-hidden">
                  {viewMode === 'cards' ? (
                    // CARD VIEW
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pb-12">
                      {filteredData.slice().reverse().map((response) => (
                        <div key={response.id} className="relative group p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all">
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2 pr-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">#{response.ticketId}</span>
                                      <span className="text-xs text-gray-400">{new Date(response.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm block">{response.customerId}</span>
                                </div>
                                <div className="flex gap-2 text-xs text-gray-400 mt-2 sm:mt-0">
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200" title="Abertura"><MousePointerClick size={12} className="text-blue-500"/> {response.easeRating}</span>
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200" title="Agendamento"><CalendarClock size={12} className="text-indigo-500"/> {response.processRating}</span>
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200" title="Solução"><Wrench size={12} className="text-green-500"/> {response.solutionRating}</span>
                                </div>
                            </div>
                            {response.comment && (
                               <p className="text-gray-600 text-sm italic mt-3 border-l-2 border-gray-300 pl-3 bg-white/50 py-1">"{response.comment}"</p>
                            )}
                            
                            {/* Render Delete Button - High Priority Z-Index Wrapper */}
                            {onDelete && (
                              <div className="absolute top-2 right-2 z-50">
                                <button 
                                  type="button"
                                  onClick={(e) => handleDeleteClick(e, response.id)}
                                  className="p-2 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full shadow-sm border border-gray-200 transition-all cursor-pointer hover:scale-110 active:scale-95"
                                  title="Excluir este registro"
                                >
                                  <Trash2 className="w-4 h-4 pointer-events-none" />
                                </button>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // TABLE VIEW
                    <div className="max-h-[600px] overflow-y-auto border rounded-lg custom-scrollbar">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chamado</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Data</th>
                            <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Abertura">Abert.</th>
                            <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Agendamento">Agend.</th>
                            <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Solução">Sol.</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Comentário</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredData.slice().reverse().map((response) => (
                            <tr key={response.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                <span className="bg-gray-100 px-2 py-1 rounded">#{response.ticketId}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                <div className="font-medium text-gray-800">{response.customerId}</div>
                                <div className="text-xs text-gray-400">{new Date(response.timestamp).toLocaleString()}</div>
                              </td>
                              <td className="px-2 py-3 text-center">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getRatingColor(response.easeRating)}`}>
                                  {response.easeRating}
                                </span>
                              </td>
                              <td className="px-2 py-3 text-center">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getRatingColor(response.processRating)}`}>
                                  {response.processRating}
                                </span>
                              </td>
                              <td className="px-2 py-3 text-center">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getRatingColor(response.solutionRating)}`}>
                                  {response.solutionRating}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {response.comment ? (
                                  <span className="italic block max-w-xs truncate" title={response.comment}>"{response.comment}"</span>
                                ) : (
                                  <span className="text-gray-300 text-xs">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                {onDelete && (
                                    <button 
                                      type="button"
                                      onClick={(e) => handleDeleteClick(e, response.id)}
                                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-colors cursor-pointer"
                                      title="Excluir Avaliação"
                                    >
                                      <Trash2 className="w-4 h-4 pointer-events-none" />
                                    </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="lg:col-span-1">
              <div className="bg-white h-full rounded-xl shadow-sm border border-gray-100 flex flex-col sticky top-6">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                  <div className="flex items-center gap-2 text-indigo-700 mb-2">
                    <BrainCircuit className="w-6 h-6" />
                    <h3 className="font-bold text-lg">IA Quality Insights</h3>
                  </div>
                  <p className="text-sm text-indigo-600/80 mb-4">
                    {searchTerm 
                      ? "Analisando apenas os dados filtrados." 
                      : "Analise gargalos na abertura, falhas no agendamento e a eficácia técnica."}
                  </p>
                  <button
                    onClick={handleRunAnalysis}
                    disabled={loadingAnalysis || filteredData.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loadingAnalysis ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      "Gerar Relatório de Qualidade"
                    )}
                  </button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                  {!analysis && !loadingAnalysis && (
                    <div className="text-center text-gray-400 py-10">
                      <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Execute a análise para identificar problemas no processo.</p>
                    </div>
                  )}
                  
                  {analysis && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sentimento Geral</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          analysis.overallSentiment === 'Positivo' ? 'bg-green-100 text-green-700' :
                          analysis.overallSentiment === 'Negativo' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {analysis.overallSentiment}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          Resumo Executivo
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed bg-blue-50 p-3 rounded-lg">
                          {analysis.summary}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          Pontos de Falha
                        </h4>
                        <ul className="space-y-2">
                          {analysis.painPoints.map((point, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-500" />
                          Recomendações
                        </h4>
                        <ul className="space-y-2">
                          {analysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* NEW: Management Modal (Edit/Delete List) */}
      {showManageModal && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-scale-in">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div>
                 <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                   <Edit className="w-5 h-5 text-blue-600" />
                   Gerenciar Respostas
                 </h3>
                 <p className="text-sm text-gray-500">Visualize todas as respostas e exclua registros individualmente.</p>
               </div>
               <button onClick={() => setShowManageModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                 <X className="w-6 h-6 text-gray-500" />
               </button>
             </div>
             
             <div className="flex-1 overflow-auto bg-white p-6">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm text-xs uppercase text-gray-500 font-semibold">
                      <tr>
                        <th className="p-4 border-b">Data / Hora</th>
                        <th className="p-4 border-b">Chamado</th>
                        <th className="p-4 border-b">Cliente</th>
                        <th className="p-4 border-b text-center" title="Facilidade/Processo/Solução">Notas (F/P/S)</th>
                        <th className="p-4 border-b w-1/3">Comentário</th>
                        <th className="p-4 border-b text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {data.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-400">Nenhum registro encontrado no banco de dados.</td></tr>
                      ) : (
                        data.slice().reverse().map(item => (
                          <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                            <td className="p-4 whitespace-nowrap text-gray-500 text-xs">
                              {new Date(item.timestamp).toLocaleDateString()} <br/>
                              <span className="text-gray-400">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="p-4 font-mono font-medium">#{item.ticketId}</td>
                            <td className="p-4 font-medium">{item.customerId}</td>
                            <td className="p-4 text-center">
                              <div className="inline-flex gap-1">
                                <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${getRatingColor(item.easeRating)}`}>{item.easeRating}</span>
                                <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${getRatingColor(item.processRating)}`}>{item.processRating}</span>
                                <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${getRatingColor(item.solutionRating)}`}>{item.solutionRating}</span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-500 italic">
                              {item.comment ? `"${item.comment}"` : <span className="text-gray-300">-</span>}
                            </td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={(e) => handleDeleteClick(e, item.id)}
                                className="bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 mx-auto shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                              >
                                <Trash2 className="w-3 h-3 pointer-events-none" /> 
                                Excluir
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
             
             <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button 
                  onClick={() => setShowManageModal(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Fechar
                </button>
             </div>
           </div>
         </div>
       )}

    </div>
  );
};

export default Dashboard;