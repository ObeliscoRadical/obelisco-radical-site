import { useState, useRef, useEffect } from 'react';
import { Send, X, Zap, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  serviceRecommendation?: ServiceRecommendation;
}

interface ServiceRecommendation {
  service: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

export default function ElectricalAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente da Obelisco Radical. Descreva seu problema elétrico e vou ajudar a encontrar a solução ideal.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/electrical-assistant`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputValue }),
        }
      );

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
        serviceRecommendation: data.recommendation,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      default:
        return 'bg-green-500/10 border-green-500/30 text-green-400';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'Alta Urgência';
      case 'medium':
        return 'Urgência Moderada';
      default:
        return 'Urgência Baixa';
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-6 top-32 z-30 flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105"
        >
          <div className="rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-zinc-950 shadow-2xl">
            <span className="block whitespace-nowrap">Conte-me aqui</span>
            <span className="block whitespace-nowrap text-sm">seu problema elétrico</span>
          </div>
          <ChevronDown className="h-5 w-5 text-yellow-400 animate-bounce" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-96 flex flex-col bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden" style={{ height: '600px' }}>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-zinc-950 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-950/20 p-2 rounded-lg">
                <Zap size={24} className="text-zinc-950" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Assistente Elétrico</h3>
                <p className="text-xs text-zinc-900">Obelisco Radical</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-zinc-950/20 p-2 rounded-lg transition-colors"
            >
              <X size={20} className="text-zinc-950" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/40">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.isUser
                      ? 'bg-yellow-400 text-zinc-950 rounded-2xl rounded-br-sm'
                      : 'bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm border border-zinc-700'
                  } px-4 py-3`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>

                  {message.serviceRecommendation && (
                    <div className="mt-3 pt-3 border-t border-zinc-600">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 border ${getUrgencyColor(message.serviceRecommendation.urgency)}`}>
                        {getUrgencyLabel(message.serviceRecommendation.urgency)}
                      </div>
                      <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-700">
                        <p className="font-bold text-yellow-400 mb-1">
                          {message.serviceRecommendation.service}
                        </p>
                        <p className="text-xs text-zinc-300 mb-2">
                          {message.serviceRecommendation.description}
                        </p>
                        <p className="text-xs text-zinc-400">
                          ⏱️ Tempo estimado: {message.serviceRecommendation.estimatedTime}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3 border border-zinc-700">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-zinc-900 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Descreva seu problema..."
                className="flex-1 px-4 py-3 border border-zinc-700 bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm text-white placeholder-zinc-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-700 disabled:cursor-not-allowed text-zinc-950 p-3 rounded-xl transition-colors font-medium"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
