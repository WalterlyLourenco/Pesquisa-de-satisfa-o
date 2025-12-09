import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { BrainCircuit, Loader2, TrendingUp, AlertTriangle, MessageSquare, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { SurveyResponse, AIAnalysisResult } from '../types';
import { analyzeSurveyData } from '../services/geminiService';

interface DashboardProps {
  data: SurveyResponse[];
  onReset?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = data.length;
    if (total === 0) return { total: 0, avgSpeed: 0, avgResolution: 0, avgQuality: 0, recentTrend: [] };

    const avgSpeed = data.reduce((acc, cur) => acc + cur.speedRating, 0) / total;
    const avgResolution = data.reduce((acc, cur) => acc + cur.resolutionRating, 0) / total;
    const avgQuality = data.reduce((acc, cur) => acc + cur.qualityRating, 0) / total;
    
    const recentTrend = data.slice(-10).map((d, i) => ({
      name: `Ticket ${d.ticketId.split('-')[1] || d.ticketId.substring(0,4)}`,
      speed: d.speedRating,
      resolution: d.resolutionRating
    }));

    return { total, avgSpeed, avgResolution, avgQuality, recentTrend };
  }, [data]);

  const handleRunAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const result = await analyzeSurveyData(data);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const StatCard = ({ title, value, subtext, color }: { title: string, value: string, subtext: string, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <div className={`text-3xl font-bold mt-2 ${color}`}>{value}</div>
      <p className="text-gray-400 text-xs mt-1">{subtext}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard de Atendimento</h2>
          <p className="text-gray-500">Monitoramento de satisfação e tempo de resposta</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                Total de Avaliações: {metrics.total}
            </span>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Satisfação Velocidade" 
          value={metrics.avgSpeed.toFixed(1) + "/5"}
          subtext="Média de avaliação da 1ª resposta"
          color="text-blue-600"
        />
        <StatCard 
          title="Tempo de Resolução" 
          value={metrics.avgResolution.toFixed(1) + "/5"}
          subtext="Satisfação com a duração total"
          color="text-indigo-600"
        />
        <StatCard 
          title="Qualidade da Solução" 
          value={metrics.avgQuality.toFixed(1) + "/5"}
          subtext="Eficácia da resposta final"
          color="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Tendência de Atendimento (Últimos 10)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.recentTrend}>
                  <defs>
                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis domain={[0, 5]} stroke="#9ca3af" fontSize={12} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="speed" name="Velocidade" stroke="#2563eb" fillOpacity={1} fill="url(#colorSpeed)" />
                  <Area type="monotone" dataKey="resolution" name="Resolução" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Comentários Recentes</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {data.slice().reverse().slice(0, 5).map((response) => (
                <div key={response.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="font-medium text-gray-800 text-sm block">{response.customerId}</span>
                            <span className="text-xs text-gray-500">{response.ticketId}</span>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200"><Clock size={12} className="text-blue-500"/> {response.speedRating}</span>
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200"><CheckCircle size={12} className="text-green-500"/> {response.resolutionRating}</span>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm italic mt-2">"{response.comment || "Sem comentário"}"</p>
                </div>
              ))}
              {data.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Nenhum comentário encontrado.</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="lg:col-span-1">
          <div className="bg-white h-full rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl">
              <div className="flex items-center gap-2 text-indigo-700 mb-2">
                <BrainCircuit className="w-6 h-6" />
                <h3 className="font-bold text-lg">IA Insights</h3>
              </div>
              <p className="text-sm text-indigo-600/80 mb-4">
                Utilize o Gemini para analisar padrões nos tempos de resposta e sugerir melhorias.
              </p>
              <button
                onClick={handleRunAnalysis}
                disabled={loadingAnalysis || data.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loadingAnalysis ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  "Gerar Relatório Inteligente"
                )}
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {!analysis && !loadingAnalysis && (
                <div className="text-center text-gray-400 py-10">
                  <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Execute a análise para ver insights.</p>
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
                      Pontos de Dor (Gargalos)
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
    </div>
  );
};

export default Dashboard;
