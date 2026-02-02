import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, Calendar, MapPin, Clock,
  CheckCircle, Ban, Banknote, AlertTriangle, CreditCard
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useFaceToFaceRequest, 
  useFaceToFaceMessages, 
  useSendFaceToFaceMessage,
  useUpdateFaceToFaceRequest,
  useAcceptScheduleProposal,
  useAcceptFaceToFacePrice,
  useUpdateFaceToFacePayment,
  FaceToFaceMessage
} from "@/hooks/useFaceToFace";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

export default function FaceToFaceChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: request, isLoading: loadingRequest } = useFaceToFaceRequest(id || "");
  const { data: messages = [], isLoading: loadingMessages } = useFaceToFaceMessages(id || "");
  const sendMessage = useSendFaceToFaceMessage();
  const updateRequest = useUpdateFaceToFaceRequest();
  const acceptSchedule = useAcceptScheduleProposal();
  const acceptPrice = useAcceptFaceToFacePrice();
  const updatePayment = useUpdateFaceToFacePayment();

  const [inputValue, setInputValue] = useState("");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("");
  const [pendingPriceOffer, setPendingPriceOffer] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for pending price offers
  useEffect(() => {
    const lastPriceMessage = [...messages].reverse().find(m => m.message_type === "price_offer");
    if (lastPriceMessage && request?.status === 'negotiating' && lastPriceMessage.sender_id !== user?.id) {
      // Parse price from message content
      const priceMatch = lastPriceMessage.content.match(/Rp\s*([\d.,]+)/);
      if (priceMatch) {
        const price = parseInt(priceMatch[1].replace(/\./g, '').replace(/,/g, ''));
        setPendingPriceOffer(price);
      }
    } else if (request?.proposed_price && request?.status === 'negotiating') {
      // Check if the last price was offered by the other party
      const lastPriceMsg = [...messages].reverse().find(m => m.message_type === "price_offer");
      if (lastPriceMsg && lastPriceMsg.sender_id !== user?.id) {
        setPendingPriceOffer(request.proposed_price);
      } else {
        setPendingPriceOffer(null);
      }
    } else {
      setPendingPriceOffer(null);
    }
  }, [messages, request, user]);

  const handleSend = async () => {
    if (!inputValue.trim() || !id) return;

    const content = inputValue;
    setInputValue("");

    try {
      await sendMessage.mutateAsync({
        requestId: id,
        content,
        messageType: "text",
      });
    } catch (error) {
      toast({ title: "Gagal mengirim pesan", variant: "destructive" });
      setInputValue(content);
    }
  };

  const handleSendScheduleProposal = async () => {
    if (!id || !scheduleDate || !scheduleTime || !scheduleLocation) {
      toast({ title: "Lengkapi semua data jadwal", variant: "destructive" });
      return;
    }

    try {
      await sendMessage.mutateAsync({
        requestId: id,
        content: `📅 Usulan Jadwal Pertemuan:\n\nTanggal: ${format(scheduleDate, "dd MMMM yyyy", { locale: localeId })}\nWaktu: ${scheduleTime}\nLokasi: ${scheduleLocation}`,
        messageType: "schedule_proposal",
        proposedDate: format(scheduleDate, "yyyy-MM-dd"),
        proposedTime: scheduleTime,
        proposedLocation: scheduleLocation,
      });

      setShowScheduleDialog(false);
      setScheduleDate(undefined);
      setScheduleTime("");
      setScheduleLocation("");
      toast({ title: "Usulan jadwal dikirim" });
    } catch (error) {
      toast({ title: "Gagal mengirim usulan jadwal", variant: "destructive" });
    }
  };

  const handleAcceptSchedule = async (message: FaceToFaceMessage) => {
    if (!message.proposed_date || !message.proposed_time || !message.proposed_location) return;

    try {
      await acceptSchedule.mutateAsync({
        messageId: message.id,
        requestId: id!,
        date: message.proposed_date,
        time: message.proposed_time,
        location: message.proposed_location,
      });
    } catch (error) {
      toast({ title: "Gagal menerima jadwal", variant: "destructive" });
    }
  };

  const handleAcceptPrice = async () => {
    if (!pendingPriceOffer || !id) return;

    try {
      await acceptPrice.mutateAsync({
        requestId: id,
        agreedPrice: pendingPriceOffer,
      });
      setShowPaymentDialog(true);
    } catch (error) {
      toast({ title: "Gagal menyetujui harga", variant: "destructive" });
    }
  };

  const handlePayment = async () => {
    if (!id) return;

    try {
      await updatePayment.mutateAsync({
        requestId: id,
        paymentStatus: "paid",
      });
      setShowPaymentDialog(false);
      toast({ title: "Pembayaran berhasil! Silakan tentukan jadwal pertemuan." });
    } catch (error) {
      toast({ title: "Gagal memproses pembayaran", variant: "destructive" });
    }
  };

  const handleCancelRequest = async () => {
    if (!id || !cancelReason.trim()) {
      toast({ title: "Masukkan alasan pembatalan", variant: "destructive" });
      return;
    }

    try {
      await updateRequest.mutateAsync({
        id,
        status: "cancelled",
        cancel_reason: cancelReason,
        cancelled_by: user?.id,
        cancelled_at: new Date().toISOString(),
      });

      toast({ title: "Permintaan dibatalkan" });
      setShowCancelDialog(false);
      navigate("/face-to-face");
    } catch (error) {
      toast({ title: "Gagal membatalkan", variant: "destructive" });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Menunggu", className: "bg-yellow-500/10 text-yellow-600" },
      negotiating: { label: "Negosiasi Harga", className: "bg-blue-500/10 text-blue-600" },
      agreed: { label: "Harga Disepakati", className: "bg-green-500/10 text-green-600" },
      in_progress: { label: "Menentukan Jadwal", className: "bg-primary/10 text-primary" },
      scheduled: { label: "Terjadwal", className: "bg-primary/10 text-primary" },
      met: { label: "Sudah Bertemu", className: "bg-success/10 text-success" },
      completed: { label: "Selesai", className: "bg-gray-500/10 text-gray-600" },
      cancelled: { label: "Dibatalkan", className: "bg-red-500/10 text-red-600" },
    };
    const config = variants[status] || { label: status, className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const isLawyer = request?.lawyers?.user_id === user?.id;
  const isClient = request?.client_id === user?.id;
  
  // Chat is enabled for: pending, negotiating, agreed, in_progress, scheduled, met
  const canChat = !["completed", "cancelled"].includes(request?.status || "");
  
  // Can schedule only after payment (in_progress or later)
  const canSchedule = ["in_progress", "scheduled", "met"].includes(request?.status || "") && request?.payment_status === "paid";

  if (loadingRequest || loadingMessages) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-20 w-3/4 ml-auto" />
        </div>
      </MobileLayout>
    );
  }

  if (!request) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <p>Permintaan tidak ditemukan</p>
        </div>
      </MobileLayout>
    );
  }

  const lawyer = request.lawyers;

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img
                src={lawyer?.image_url || "/placeholder.svg"}
                alt={lawyer?.name || "Lawyer"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm">{lawyer?.name}</h2>
                  {request.display_id && (
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {request.display_id}
                    </span>
                  )}
                </div>
                {getStatusBadge(request.status)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canSchedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScheduleDialog(true)}
                className="text-xs"
              >
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Jadwalkan
              </Button>
            )}
            {(request.status === "pending" || request.status === "negotiating") && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCancelDialog(true)}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Ban className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Warning Banner */}
        <div className="px-4 pb-3">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive/80">
              Pembayaran di luar aplikasi akan mengakibatkan banned permanen.
            </p>
          </div>
        </div>

        {/* Agreed Price Info */}
        {request.agreed_price && (
          <div className="px-4 pb-3">
            <Card className="border-success/20 bg-success/5">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground">Harga Disepakati</p>
                    <p className="text-sm font-bold text-success">
                      {formatCurrency(request.agreed_price)}
                    </p>
                  </div>
                </div>
                {request.payment_status === 'unpaid' && isClient && (
                  <Button size="sm" variant="gradient" onClick={() => setShowPaymentDialog(true)}>
                    Bayar Sekarang
                  </Button>
                )}
                {request.payment_status === 'paid' && (
                  <Badge variant="outline" className="border-success text-success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Lunas
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Price Offer (for client) */}
        {pendingPriceOffer && isClient && request.status === "negotiating" && (
          <div className="px-4 pb-3">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Penawaran Harga</p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(pendingPriceOffer)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleAcceptPrice} disabled={acceptPrice.isPending}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Terima
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule Info (if scheduled) */}
        {request.meeting_date && request.payment_status === "paid" && (
          <div className="px-4 pb-3">
            <div className="bg-primary/10 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-primary">📅 Jadwal Pertemuan</p>
              <div className="flex items-center gap-4 text-sm">
                <span>{format(new Date(request.meeting_date), "dd MMM yyyy", { locale: localeId })}</span>
                <span>{request.meeting_time}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {request.meeting_location}
              </p>
            </div>
          </div>
        )}

        {/* Case Description */}
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
            📋 {request.case_type || "Umum"}: {request.case_description}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Mulai negosiasi harga dengan lawyer
            </div>
          )}
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;
            const isScheduleProposal = message.message_type === "schedule_proposal";
            const isPriceOffer = message.message_type === "price_offer";

            return (
              <div
                key={message.id}
                className={cn(
                  "flex animate-fade-in",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md",
                    (isScheduleProposal || isPriceOffer) && "border-2 border-dashed border-primary/50"
                  )}
                >
                  {isPriceOffer && (
                    <div className="flex items-center gap-1 mb-1 text-xs opacity-80">
                      <Banknote className="w-3 h-3" />
                      <span>Penawaran Harga</span>
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Accept button for schedule proposal (only for non-sender) */}
                  {isScheduleProposal && !isCurrentUser && !message.is_schedule_accepted && canSchedule && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full bg-background text-foreground"
                      onClick={() => handleAcceptSchedule(message)}
                      disabled={acceptSchedule.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Terima Jadwal
                    </Button>
                  )}
                  
                  {message.is_schedule_accepted && (
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-80">
                      <CheckCircle className="w-3 h-3" />
                      <span>Jadwal dikonfirmasi</span>
                    </div>
                  )}

                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      isCurrentUser
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {canChat && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-3 z-50">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 rounded-full bg-secondary border-0"
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <Button
              variant="gradient"
              size="icon"
              className="shrink-0 rounded-full"
              onClick={handleSend}
              disabled={!inputValue.trim() || sendMessage.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Completed/Cancelled notice */}
      {!canChat && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-muted/95 backdrop-blur-lg border-t border-border p-4 z-50">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            {request.status === "completed" ? (
              <>
                <CheckCircle className="w-5 h-5 text-success" />
                <p className="text-sm">Pertemuan sudah selesai</p>
              </>
            ) : (
              <>
                <Ban className="w-5 h-5 text-destructive" />
                <p className="text-sm">Permintaan ini sudah dibatalkan</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Schedule Proposal Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Usulkan Jadwal Pertemuan</DialogTitle>
            <DialogDescription>
              Tentukan tanggal, waktu, dan lokasi pertemuan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Calendar className="mr-2 h-4 w-4" />
                    {scheduleDate
                      ? format(scheduleDate, "dd MMMM yyyy", { locale: localeId })
                      : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Waktu</Label>
              <Select value={scheduleTime} onValueChange={setScheduleTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih waktu" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lokasi</Label>
              <Textarea
                placeholder="Alamat lengkap atau nama tempat"
                value={scheduleLocation}
                onChange={(e) => setScheduleLocation(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSendScheduleProposal}
              disabled={!scheduleDate || !scheduleTime || !scheduleLocation || sendMessage.isPending}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Kirim Usulan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pembayaran</DialogTitle>
            <DialogDescription>
              Lakukan pembayaran untuk melanjutkan proses tatap muka
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Total Pembayaran</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(request?.agreed_price || 0)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Biaya konsultasi tatap muka dengan {lawyer?.name}
                </p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              onClick={handlePayment}
              disabled={updatePayment.isPending}
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {updatePayment.isPending ? "Memproses..." : "Bayar Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Batalkan Permintaan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan permintaan ini?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Alasan Pembatalan</Label>
              <Textarea
                placeholder="Jelaskan alasan pembatalan..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="flex-1"
            >
              Kembali
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelRequest}
              disabled={!cancelReason.trim() || updateRequest.isPending}
              className="flex-1"
            >
              {updateRequest.isPending ? "Membatalkan..." : "Batalkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
