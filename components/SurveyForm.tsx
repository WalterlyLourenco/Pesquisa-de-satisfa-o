import React, { useState } from 'react';
import { Send, Star, User, AlertCircle, MousePointerClick, CalendarClock, Wrench } from 'lucide-react';
import { SurveyResponse } from '../types';

interface SurveyFormProps {
  onSubmit: (data: Omit<SurveyResponse, 'id' | 'timestamp'>) => void;
  onValidateTicket: (ticketId: string) => boolean;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit, onValidateTicket }) => {
  const [ticketId, setTicketId] = useState('');
  const [ticketError, setTicketError] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [easeRating, setEaseRating] = useState(0);
  const [processRating, setProcessRating] = useState(0);
  const [solutionRating, setSolutionRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Handle numeric only input for Ticket ID
  // CRITICAL: Keep as string to preserve leading zeros (e.g. "0001")
  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers regex, but store as string
    if (/^\d*$/.test(value)) {
      setTicketId(value);
      // Clear error while typing to allow correction
      if (ticketError) setTicketError('');
    }
  };

  // Immediate validation when user leaves the field
  const handleTicketBlur = () => {
    if (ticketId.trim()) {
      const exists = onValidateTicket(ticketId);
      if (exists) {
        setTicketError("Este chamado já foi avaliado anteriormente. Verifique o número.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError('');

    // Validation: All fields mandatory except comment
    if (!ticketId.trim()) {
      setTicketError("O número do chamado é obrigatório.");
      return;
    }
    if (!customerId.trim()) {
      alert("Por favor, preencha a identificação do cliente.");
      return;
    }
    if (easeRating === 0 || processRating === 0 || solutionRating === 0) {
      alert("Por favor, preencha todas as etapas da avaliação de qualidade.");
      return;
    }

    // Validate Ticket ID uniqueness (Final check)
    const exists = onValidateTicket(ticketId);
    if (exists) {
      setTicketError("Avaliação para este chamado já respondido!");
      return;
    }

    onSubmit({
      ticketId: ticketId,
      customerId: customerId,
      easeRating,
      processRating,
      solutionRating,
      comment
    });
    setSubmitted(true);
  };

  const RatingGroup = ({ 
    label, 
    description,
    value, 
    setValue, 
    icon: Icon 
  }: { 
    label: string, 
    description: string,
    value: number, 
    setValue: (val: number) => void,
    icon: React.ElementType
  }) => (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="font-semibold text-gray-800">{label}</h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
      
      <div className="flex justify-center gap-3 mt-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            className={`p-1 transition-transform hover:scale-110 focus:outline-none ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star className="w-10 h-10 fill-current" />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
        <span>Muito Insatisfeito</span>
        <span>Muito Satisfeito</span>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Avaliação Recebida!</h2>
        <p className="text-gray-600 mb-6">Suas informações sobre a qualidade do atendimento foram registradas com sucesso.</p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setTicketId('');
            setTicketError('');
            setCustomerId('');
            setEaseRating(0);
            setProcessRating(0);
            setSolutionRating(0);
            setComment('');
          }}
          className="text-blue-600 font-medium hover:underline"
        >
          Avaliar outro chamado
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-blue-700 p-8 text-white text-center">
        <h1 className="text-3xl font-bold mb-2">Qualidade do Atendimento</h1>
        <p className="text-blue-100 text-sm max-w-lg mx-auto">
          Avalie detalhadamente sua experiência desde a abertura até a conclusão técnica.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Número do Chamado <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                value={ticketId}
                onChange={handleTicketChange}
                onBlur={handleTicketBlur}
                placeholder="Ex: 001234"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all font-mono text-lg tracking-wide ${
                  ticketError 
                    ? 'border-red-500 focus:ring-red-200 focus:border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {ticketError && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-xs font-semibold animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>{ticketError}</span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">Apenas números permitidos (zeros à esquerda são mantidos).</p>
            </div>
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Identificação do Cliente <span className="text-red-500">*</span></label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="Email ou Nome completo"
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
              </div>
            </div>
        </div>

        <div className="space-y-2">
            <RatingGroup 
            label="Facilidade de Abertura" 
            description="Quão fácil foi encontrar o canal de suporte e registrar sua solicitação inicial?"
            value={easeRating} 
            setValue={setEaseRating} 
            icon={MousePointerClick}
            />

            <RatingGroup 
            label="Direcionamento e Agendamento" 
            description="O chamado foi direcionado para o time correto e o agendamento foi respeitado?"
            value={processRating} 
            setValue={setProcessRating} 
            icon={CalendarClock}
            />

            <RatingGroup 
            label="Ações e Conclusão Técnica" 
            description="As ações tomadas pelo técnico foram assertivas para resolver o problema definitivamente?"
            value={solutionRating} 
            setValue={setSolutionRating} 
            icon={Wrench}
            />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Comentários Adicionais (Opcional)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Detalhe se houve algum problema específico no processo..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-[0.98] duration-150"
        >
          <Send className="w-5 h-5" />
          Enviar Avaliação de Qualidade
        </button>
      </form>
    </div>
  );
};

export default SurveyForm;