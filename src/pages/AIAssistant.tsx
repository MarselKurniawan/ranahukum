import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Bot, User, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const suggestedQuestions = [
  "Bagaimana proses perceraian?",
  "Dokumen apa saja untuk sengketa tanah?",
  "Hak karyawan jika di-PHK?",
  "Prosedur pembagian warisan?",
];

const aiResponses: Record<string, string> = {
  perceraian: `Proses perceraian di Indonesia melibatkan beberapa tahap:

1. **Pengajuan Gugatan** - Diajukan ke Pengadilan Agama (Muslim) atau Pengadilan Negeri (non-Muslim)

2. **Dokumen yang Diperlukan**:
   - Surat nikah asli
   - KTP kedua pihak
   - Kartu Keluarga
   - Surat keterangan domisili

3. **Proses Mediasi** - Pengadilan akan memediasi kedua pihak

4. **Sidang** - Jika mediasi gagal, dilanjutkan ke proses persidangan

💡 **Butuh bantuan lebih lanjut?** Konsultasikan dengan pengacara kami untuk pendampingan lengkap.`,

  tanah: `Untuk sengketa tanah, dokumen yang diperlukan:

1. **Sertifikat Tanah** (SHM/SHGB/Girik)
2. **Bukti Pembayaran PBB**
3. **Akta Jual Beli** (jika ada)
4. **Surat Ukur**
5. **IMB** (jika ada bangunan)

⚠️ **Penting**: Simpan semua dokumen asli dengan baik.

💡 Untuk kasus yang kompleks, disarankan berkonsultasi dengan pengacara yang berpengalaman di bidang pertanahan.`,

  phk: `Hak karyawan jika terkena PHK:

1. **Uang Pesangon** - Berdasarkan masa kerja
2. **Uang Penghargaan Masa Kerja**
3. **Uang Penggantian Hak** (cuti, ongkos pulang, dll)

📋 **Rumus Pesangon** (UU Cipta Kerja):
- < 1 tahun: 1 bulan gaji
- 1-2 tahun: 2 bulan gaji
- 2-3 tahun: 3 bulan gaji
- dst...

💡 Hubungi pengacara ketenagakerjaan untuk menghitung hak Anda secara detail.`,

  default: `Terima kasih atas pertanyaan Anda. Untuk pertanyaan yang lebih spesifik dan mendalam, saya sarankan untuk berkonsultasi langsung dengan pengacara profesional kami.

Pengacara kami dapat memberikan:
✓ Konsultasi personal
✓ Analisis kasus mendalam
✓ Pendampingan hukum

Apakah Anda ingin dihubungkan dengan pengacara yang sesuai?`,
};

export default function AIAssistant() {
  const navigate = useNavigate();
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
    if (lowerQuestion.includes("perceraian") || lowerQuestion.includes("cerai")) {
      return aiResponses.perceraian;
    }
    if (lowerQuestion.includes("tanah") || lowerQuestion.includes("sengketa")) {
      return aiResponses.tanah;
    }
    if (lowerQuestion.includes("phk") || lowerQuestion.includes("karyawan") || lowerQuestion.includes("kerja")) {
      return aiResponses.phk;
    }
    return aiResponses.default;
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

    // Simulate AI response
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

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
              <Bot className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Asisten Hukum AI</h2>
              <p className="text-xs text-muted-foreground">Tanya pertanyaan umum</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-accent-foreground" />
            </div>
            <h2 className="font-semibold text-lg mb-2">Halo! Saya Asisten Hukum AI</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Tanyakan pertanyaan hukum umum, saya akan bantu jawab sebaik mungkin
            </p>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Pertanyaan populer:</p>
              {suggestedQuestions.map((question) => (
                <Card
                  key={question}
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => handleSend(question)}
                >
                  <CardContent className="p-3 text-sm text-left">
                    {question}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
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

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
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
          AI dapat memberikan informasi umum. Untuk kasus spesifik, konsultasikan dengan pengacara.
        </p>
      </div>
    </MobileLayout>
  );
}
