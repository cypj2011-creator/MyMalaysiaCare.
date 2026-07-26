import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

// Web Speech API types
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const getSpeechRecognition = (): (new () => SpeechRecognitionInstance) | null => {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
};

const ChatBot = () => {
  const { t, lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: t("helloMessage"),
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const cleanBotText = (text: string) =>
    text
      .replace(/\*\*\s*\.\s*\*\*/g, ".")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages((prev) => [
      {
        id: 1,
        text: t("helloMessage"),
        isBot: true,
      },
      ...prev.slice(1),
    ]);
  }, [lang, t]);

  const startRecording = () => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      toast.error("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (!window.isSecureContext) {
      toast.error("Voice input needs a secure (https) connection.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = lang === "zh" ? "zh-CN" : lang === "ms" ? "ms-MY" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      let finalText = "";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }
        setInput(finalText + interim);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsRecording(false);
        if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
          toast.error("Microphone permission denied. Please allow mic access.");
        } else if (e?.error === "no-speech") {
          toast.error("No speech detected. Please try again.");
        } else {
          toast.error("Voice input failed. Please try again.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
        const text = finalText.trim();
        if (text) {
          setInput("");
          handleSendMessage(text);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      toast.success("Listening… speak now");
    } catch (error) {
      console.error("startRecording error:", error);
      setIsRecording(false);
      toast.error("Could not start voice input.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsRecording(false);
  };


  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: textToSend,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const systemPrompt = lang === 'zh' 
        ? '你是一个有用的环保助手。请用中文回答有关回收和环境保护的问题。保持回答简洁明了。'
        : lang === 'ms'
        ? 'Anda adalah pembantu alam sekitar yang membantu. Jawab soalan tentang kitar semula dan perlindungan alam sekitar dalam Bahasa Melayu. Pastikan jawapan ringkas dan jelas.'
        : 'You are a helpful environmental assistant. Answer questions about recycling and environmental protection in English. Keep answers concise and clear.';

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          message: textToSend,
          language: lang,
          systemPrompt
        }
      });

      if (error) {
        console.error("Chat error:", error);
        toast.error("Failed to get response. Please try again.");
        const errorMessage: Message = {
          id: messages.length + 2,
          text: "Sorry, I encountered an error. Please try again!",
          isBot: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const botMessage: Message = {
          id: messages.length + 2,
          text: cleanBotText(data.message || "I'm sorry, I couldn't generate a response."),
          isBot: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred.");
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, something went wrong. Please try again later!",
        isBot: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => handleSendMessage();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-custom-lg gradient-primary z-50 animate-float"
        size="icon"
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] flex flex-col shadow-custom-xl z-50 animate-bounce-in">
          {/* Header */}
          <div className="gradient-hero text-white p-3 sm:p-4 rounded-t-lg">
            <h3 className="font-semibold text-sm sm:text-base break-words">{t("aiAssistant")}</h3>
            <p className="text-xs sm:text-sm text-white/90 break-words leading-relaxed">{t("askMeAnything")}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-2.5 sm:p-3 ${
                    message.isBot
                      ? "bg-muted text-foreground"
                      : "gradient-primary text-white"
                  }`}
                >
                  <p className="text-xs sm:text-sm break-words leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("typeYourQuestion")}
              className="flex-1"
              disabled={isLoading || isRecording}
            />
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              disabled={isLoading}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
            <Button
              onClick={handleSend}
              size="icon"
              className="gradient-primary"
              disabled={isLoading || isRecording}
              aria-label="Send message"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
