import { useState, useRef, useEffect } from "react";
import { Send, X, Zap, ChevronDown } from "lucide-react";

export default function ElectricalAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Ola! Sou o assistente da Obelisco Radical. Descreva seu problema eletrico e vou ajudar a encontrar a solucao ideal.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const config = window.electricalAssistantConfig;
    const supabaseUrl = config?.supabaseUrl;
    const supabaseKey = config?.supabaseKey;

    const messageToSend = inputValue;

    const userMessage = {
      id: Date.now().toString(),
      text: messageToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Configuracao do Supabase nao encontrada.");
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/electrical-assistant`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageToSend,
          }),
        }
      );

      const data = await response.json();

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text:
          data?.response ||
          "Recebi sua mensagem, mas nao consegui gerar uma resposta agora.",
        isUser: false,
        timestamp: new Date(),
        serviceRecommendation: data?.recommendation,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      default:
        return "bg-green-500/10 border-green-500/30 text-green-400";
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case "high":
        return "Alta Urgencia";
      case "medium":
        return "Urgencia Moderada";
      default:
        return "Urgencia Baixa";
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-6 top-32 z-30 flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105"
          data-testid="chat-trigger-btn"
        >
          <div className="rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-zinc-950 shadow-2xl">
            <span className="block whitespace-nowrap">Conte-me aqui</span>
            <span className="block whitespace-nowrap text-sm">
              seu problema eletrico
            </span>
          </div>
          <ChevronDown className="h-5 w-5 text-yellow-400 animate-bounce" />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-40 w-96 flex flex-col bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
          style={{ height: "600px" }}
          data-testid="chat-window"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-zinc-950 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-950/20 p-2 rounded-lg">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Assistente Eletrico</h3>
                <p className="text-xs text-zinc-900">Obelisco Radical</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-zinc-950/20 p-2 rounded-lg transition-colors"
              data-testid="chat-close-btn"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/40">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.isUser
                      ? "bg-yellow-400 text-zinc-950 rounded-2xl rounded-br-sm"
                      : "bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm border border-zinc-700"
                  } px-4 py-3`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>

                  {message.serviceRecommendation && (
                    <div className="mt-3 pt-3 border-t border-zinc-600">
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 border ${getUrgencyColor(
                          message.serviceRecommendation.urgency
                        )}`}
                      >
                        {getUrgencyLabel(
                          message.serviceRecommendation.urgency
                        )}
                      </div>

                      <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-700">
                        <p className="font-bold text-yellow-400 mb-1">
                          {message.serviceRecommendation.service}
                        </p>
                        <p className="text-xs text-zinc-300 mb-2">
                          {message.serviceRecommendation.description}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Tempo estimado:{" "}
                          {message.serviceRecommendation.estimatedTime}
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
                  <span className="animate-pulse">Digitando...</span>
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
                onKeyDown={handleKeyPress}
                placeholder="Descreva seu problema..."
                className="flex-1 px-4 py-3 border border-zinc-700 bg-zinc-950 rounded-xl text-white placeholder-zinc-500 outline-none focus:border-yellow-400 transition"
                data-testid="chat-input"
              />

              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 p-3 rounded-xl transition"
                data-testid="chat-send-btn"
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
