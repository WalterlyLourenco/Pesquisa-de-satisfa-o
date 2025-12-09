import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend
} from 'recharts';
import { BrainCircuit, Loader2, TrendingUp, AlertTriangle, MessageSquare, MousePointerClick, CalendarClock, Wrench, RefreshCw, Clock, Download, Search, X } from 'lucide-react';
import { SurveyResponse, AIAnalysisResult } from '../types';
import { analyzeSurveyData } from '../services/geminiService';

interface DashboardProps {
  data: SurveyResponse[];
  onReset?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    
    const recentTrend = filteredData.slice(-20).map((d) => ({ // Increased to 20 to show more trend context
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
      // Analyze currently visible data
      const result = await analyzeSurveyData(filteredData);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleDownloadExcel = () => {
    if (filteredData.length === 0) {
      alert("Não há dados filtrados para exportar.");
      return;
    }

    // Define CSV Headers
    const headers = [
      "ID Interno",
      "Chamado",
      "Cliente",
      "Facilidade Abertura (1-5)",
      "Processo/Agendamento (1-5)",
      "Solução Técnica (1-5)",
      "Comentário",
      "Data/Hora"
    ];

    // Convert data to CSV format using Semicolon (;) for better Excel compatibility in many regions
    const csvRows = [
      headers.join(';'), // Header row
      ...filteredData.map(row => {
        // Escape quotes within comments and wrap in quotes. 
        // Remove line breaks from comments to prevent breaking CSV rows.
        const cleanComment = row.comment 
          ? `"${row.comment.replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ")}"` 
          : '""';
        const cleanCustomer = `"${row.customerId}"`; 

        return [
          row.id,
          row.ticketId,
          cleanCustomer,
          row.easeRating,
          row.processRating,
          row.solutionRating,
          cleanComment,
          row.timestamp
        ].join(';');
      })
    ];

    // Add BOM (\uFEFF) so Excel recognizes it as UTF-8
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard de Qualidade</h2>
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

              <div className="h-8 w-px bg-gray-300 mx-1 hidden md:block"></div>

              {onReset && (
                <button 
                  onClick={onReset}
                  className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Resetar Banco de Dados"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
          </div>
        </div>

        {/* Filter Bar */}
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
          <div className="text-sm text-gray-500">
            Exibindo <strong>{metrics.total}</strong> resultados {searchTerm && '(filtrado)'}
          </div>
        </div>
      </div>

      {metrics.total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
           <Search className="w-12 h-12 text-gray-300 mb-4" />
           <p className="text-gray-500 font-medium">Nenhum resultado encontrado para o filtro.</p>
           <button 
             onClick={() => setSearchTerm('')}
             className="mt-2 text-blue-600 hover:underline text-sm"
           >
             Limpar filtros
           </button>
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
            {/* Charts Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Visualização dos Chamados</h3>
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

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Avaliações ({metrics.total})</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {filteredData.slice().reverse().map((response) => (
                    <div key={response.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                            <div>
                                <span className="font-bold text-gray-800 text-sm block">{response.customerId}</span>
                                <span className="text-xs text-gray-500 font-mono bg-gray-200 px-1 py-0.5 rounded">Chamado #{response.ticketId}</span>
                                <span className="text-xs text-gray-400 ml-2">{new Date(response.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200" title="Abertura"><MousePointerClick size={12} className="text-blue-500"/> {response.easeRating}</span>
                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200" title="Agendamento"><CalendarClock size={12} className="text-indigo-500"/> {response.processRating}</span>
                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200" title="Solução"><Wrench size={12} className="text-green-500"/> {response.solutionRating}</span>
                            </div>
                        </div>
                        {response.comment && (
                           <p className="text-gray-600 text-sm italic mt-2 border-l-2 border-gray-300 pl-3">"{response.comment}"</p>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="lg:col-span-1">
              <div className="bg-white h-full rounded-xl shadow-sm border border-gray-100 flex flex-col">
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
                
                <div className="p-6 flex-1 overflow-y-auto">
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
    </div>
  );
};

export default Dashboard;
