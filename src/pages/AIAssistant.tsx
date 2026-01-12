import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Bot, User, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { lawCategories, faqByCategory } from "@/data/mockLawyers";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function AIAssistant() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Check FAQ answers first
    for (const category of Object.keys(faqByCategory)) {
      for (const faq of faqByCategory[category]) {
        if (lowerQuestion.includes(faq.question.toLowerCase().slice(0, 20))) {
          return faq.answer;
        }
      }
    }

    // Keyword matching
    if (lowerQuestion.includes("perceraian") || lowerQuestion.includes("cerai")) {
      return faqByCategory.keluarga[0].answer;
    }
    if (lowerQuestion.includes("waris")) {
      return faqByCategory.keluarga[2].answer;
    }
    if (lowerQuestion.includes("tanah") || lowerQuestion.includes("sertifikat")) {
      return faqByCategory.pertanahan[0].answer;
    }
    if (lowerQuestion.includes("phk") || lowerQuestion.includes("kerja")) {
      return faqByCategory.ketenagakerjaan[0].answer;
    }
    if (lowerQuestion.includes("pidana") || lowerQuestion.includes("laporan polisi")) {
      return faqByCategory.pidana[0].answer;
    }
    
    return `Terima kasih atas pertanyaan Anda. Untuk pertanyaan yang lebih spesifik, saya sarankan berkonsultasi langsung dengan pengacara profesional kami.

Pengacara kami dapat memberikan:
✓ Konsultasi personal
✓ Analisis kasus mendalam
✓ Pendampingan hukum

Apakah Anda ingin dihubungkan dengan pengacara yang sesuai?`;
  };

  const handleSend = (content?: string) => {
    const messageContent = content || inputValue;
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(messageContent),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFAQClick = (question: string) => {
    handleSend(question);
  };

  const currentFAQs = selectedCategory ? faqByCategory[selectedCategory] || [] : [];

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => selectedCategory && messages.length === 0 ? setSelectedCategory(null) : navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
              <Bot className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Legal Bot</h2>
              <p className="text-xs text-muted-foreground">
                {selectedCategory ? lawCategories.find(c => c.id === selectedCategory)?.name : "Pilih kategori hukum"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        {!selectedCategory ? (
          /* Category Selection */
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-accent-foreground" />
              </div>
              <h2 className="font-semibold text-lg mb-2">Halo! Saya Legal Bot</h2>
              <p className="text-muted-foreground text-sm">
                Pilih kategori hukum yang ingin Anda tanyakan
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {lawCategories.map((category) => (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:border-primary/50 hover:shadow-elevated transition-all"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <span className="text-3xl mb-2 block">{category.icon}</span>
                    <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* FAQ List */
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">
                {lawCategories.find(c => c.id === selectedCategory)?.icon}
              </span>
              <h2 className="font-semibold text-lg">
                {lawCategories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Pilih pertanyaan atau ketik sendiri
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-xs text-muted-foreground font-medium">Pertanyaan Umum:</p>
              {currentFAQs.map((faq, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => handleFAQClick(faq.question)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-sm">{faq.question}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedCategory(null)}
            >
              Pilih Kategori Lain
            </Button>
          </div>
        ) : (
          /* Chat Messages */
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 animate-fade-in",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-accent-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  )}
                >
                  <div className="text-sm whitespace-pre-line">{message.content}</div>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 animate-fade-in">
                <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggest search lawyer */}
            {messages.length > 0 && !isTyping && (
              <Card className="border-primary/20 bg-primary/5 animate-fade-in">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Butuh konsultasi lebih lanjut?</p>
                    <p className="text-xs text-muted-foreground">Temukan pengacara yang sesuai</p>
                  </div>
                  <Button size="sm" variant="gradient" onClick={() => navigate("/search")}>
                    Cari Pengacara
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input - only show when category selected */}
      {selectedCategory && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-3 z-50">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tanya tentang hukum..."
              className="flex-1 rounded-full bg-secondary border-0"
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button
              variant="gradient"
              size="icon"
              className="shrink-0 rounded-full"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            AI memberikan informasi umum. Untuk kasus spesifik, konsultasikan dengan pengacara.
          </p>
        </div>
      )}
    </MobileLayout>
  );
}
