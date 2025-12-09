import React, { useState } from 'react';
import { Send, Star, Clock, CheckCircle, MessageSquare, User } from 'lucide-react';
import { SurveyResponse } from '../types';

interface SurveyFormProps {
  onSubmit: (data: Omit<SurveyResponse, 'id' | 'timestamp'>) => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit }) => {
  const [ticketId, setTicketId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [speedRating, setSpeedRating] = useState(0);
  const [resolutionRating, setResolutionRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (speedRating === 0 || resolutionRating === 0 || qualityRating === 0) {
      alert("Por favor, preencha todas as avaliações.");
      return;
    }
    if (!customerId.trim()) {
      alert("Por favor, identifique-se (ID ou Email).");
      return;
    }

    onSubmit({
      ticketId: ticketId || `TKT-${Math.floor(Math.random() * 10000)}`,
      customerId: customerId,
      speedRating,
      resolutionRating,
      qualityRating,
      comment
    });
    setSubmitted(true);
  };

  const RatingGroup = ({ 
    label, 
    value, 
    setValue, 
    icon: Icon 
  }: { 
    label: string, 
    value: number, 
    setValue: (val: number) => void,
    icon: React.ElementType
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
        <Icon className="w-5 h-5 text-blue-600" />
        <span>{label}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            className={`p-1 transition-transform hover:scale-110 focus:outline-none ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star className="w-8 h-8 fill-current" />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
        <span>Insatisfeito</span>
        <span>Muito Satisfeito</span>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Obrigado!</h2>
        <p className="text-gray-600 mb-6">Sua avaliação é fundamental para melhorarmos nosso tempo de atendimento.</p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setTicketId('');
            setCustomerId('');
            setSpeedRating(0);
            setResolutionRating(0);
            setQualityRating(0);
            setComment('');
          }}
          className="text-blue-600 font-medium hover:underline"
        >
          Enviar nova avaliação
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-blue-600 p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Pesquisa de Satisfação</h1>
        <p className="text-blue-100 text-sm">Ajude-nos a reduzir nosso tempo de resposta avaliando seu último chamado.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número do Chamado (Opcional)</label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="Ex: TKT-1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Identificação do Cliente</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="Email ou Nome"
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
              </div>
            </div>
        </div>

        <RatingGroup 
          label="Velocidade da Primeira Resposta" 
          value={speedRating} 
          setValue={setSpeedRating} 
          icon={Clock}
        />

        <RatingGroup 
          label="Tempo Total até Solução" 
          value={resolutionRating} 
          setValue={setResolutionRating} 
          icon={CheckCircle}
        />

        <RatingGroup 
          label="Qualidade da Solução" 
          value={qualityRating} 
          setValue={setQualityRating} 
          icon={Star}
        />

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Comentários Adicionais
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="O que poderíamos ter feito para resolver seu problema mais rápido?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-95 duration-150"
        >
          <Send className="w-5 h-5" />
          Enviar Avaliação
        </button>
      </form>
    </div>
  );
};

export default SurveyForm;
