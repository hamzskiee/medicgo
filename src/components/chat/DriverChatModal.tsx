import React, { useState, useRef, useEffect } from "react";
import { X, Send, Phone, MapPin, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  text: string;
  sender: "user" | "driver";
  time: string;
  read?: boolean;
}

interface DriverChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  driverVehicle: string;
  estimatedTime: number;
}

export const DriverChatModal: React.FC<DriverChatModalProps> = ({
  isOpen,
  onClose,
  driverName,
  driverVehicle,
  estimatedTime,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Halo! Saya sedang menuju lokasi Anda. Mohon pastikan alamat sudah benar ya.",
      sender: "driver",
      time: "14:45",
    },
    {
      id: "2",
      text: "Baik pak, terima kasih. Alamatnya sudah benar.",
      sender: "user",
      time: "14:46",
      read: true,
    },
    {
      id: "3",
      text: "Siap! Estimasi tiba sekitar 15-20 menit lagi. Obat sudah dikemas dengan baik dan suhu terjaga.",
      sender: "driver",
      time: "14:47",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickReplies = [
    "Saya tunggu di depan rumah",
    "Bisa parkir di mana?",
    "Mohon hubungi saat tiba",
    "Terima kasih!",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const simulateDriverResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      let response = "Baik, saya mengerti. Terima kasih infonya!";

      if (userMessage.toLowerCase().includes("parkir")) {
        response =
          "Saya bisa parkir di depan rumah atau di samping jalan ya. Nanti saya hubungi jika kesulitan.";
      } else if (
        userMessage.toLowerCase().includes("tunggu") ||
        userMessage.toLowerCase().includes("depan")
      ) {
        response =
          "Siap! Saya akan memberitahu ketika sudah dekat lokasi Anda.";
      } else if (
        userMessage.toLowerCase().includes("hubungi") ||
        userMessage.toLowerCase().includes("tiba")
      ) {
        response = "Baik, saya akan menghubungi Anda begitu tiba di lokasi.";
      } else if (userMessage.toLowerCase().includes("terima kasih")) {
        response = "Sama-sama! Mohon ditunggu ya, sebentar lagi sampai 🙏";
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: "driver",
        time: getCurrentTime(),
      };

      setMessages((prev) => [...prev, newMessage]);
    }, 1500);
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      time: getCurrentTime(),
      read: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Mark as read after a short delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, read: true } : msg
        )
      );
    }, 1000);

    simulateDriverResponse(inputMessage);
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Chat Modal */}
      <div className="relative w-full sm:w-[420px] h-[85vh] sm:h-[600px] bg-card border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-primary p-4 text-primary-foreground">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-2xl">🛵</span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{driverName}</h3>
                <p className="text-sm text-primary-foreground/80">
                  {driverVehicle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Phone className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Location & ETA */}
          <div className="flex items-center justify-between bg-primary-foreground/10 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Dalam perjalanan</span>
            </div>
            <Badge className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30">
              ~{Math.floor(estimatedTime)} menit
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border text-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <div
                  className={`flex items-center justify-end gap-1 mt-1 ${
                    message.sender === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="text-xs">{message.time}</span>
                  {message.sender === "user" && message.read && (
                    <CheckCheck className="h-3.5 w-3.5" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 border-t bg-card">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ketik pesan..."
              className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="rounded-full shrink-0"
              disabled={!inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
