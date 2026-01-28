import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, Mic, Paperclip, Calendar, MapPin, Clock,
  Play, Pause, FileText, X, CheckCircle, Ban, Phone
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

  const [inputValue, setInputValue] = useState("");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !id) return;

    const content = inputValue;
    setInputValue("");

    await sendMessage.mutateAsync({
      requestId: id,
      content,
      messageType: "text",
    });
  };

  const handleSendScheduleProposal = async () => {
    if (!id || !scheduleDate || !scheduleTime || !scheduleLocation) {
      toast({ title: "Lengkapi semua data jadwal", variant: "destructive" });
      return;
    }

    await sendMessage.mutateAsync({
      requestId: id,
      content: `📅 Usulan Jadwal Pertemuan:\n\nTanggal: ${format(scheduleDate, "dd MMMM yyyy", { locale: localeId })}\nWaktu: ${scheduleTime}\nLokasi: ${scheduleLocation}`,
      messageType: "schedule_proposal",
      proposedDate: format(scheduleDate, "yyyy-MM-dd"),
      proposedTime: scheduleTime,
      proposedLocation: scheduleLocation,
    });

    // Update request status to negotiating if still pending
    if (request?.status === "pending") {
      await updateRequest.mutateAsync({
        id,
        status: "negotiating",
      });
    }

    setShowScheduleDialog(false);
    setScheduleDate(undefined);
    setScheduleTime("");
    setScheduleLocation("");
    toast({ title: "Usulan jadwal dikirim" });
  };

  const handleAcceptSchedule = async (message: FaceToFaceMessage) => {
    if (!message.proposed_date || !message.proposed_time || !message.proposed_location) return;

    await acceptSchedule.mutateAsync({
      messageId: message.id,
      requestId: id!,
      date: message.proposed_date,
      time: message.proposed_time,
      location: message.proposed_location,
    });
  };

  const handleCancelRequest = async () => {
    if (!id || !cancelReason.trim()) {
      toast({ title: "Masukkan alasan pembatalan", variant: "destructive" });
      return;
    }

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
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Menunggu", className: "bg-yellow-500/10 text-yellow-600" },
      negotiating: { label: "Negosiasi", className: "bg-blue-500/10 text-blue-600" },
      accepted: { label: "Diterima", className: "bg-green-500/10 text-green-600" },
      scheduled: { label: "Terjadwal", className: "bg-primary/10 text-primary" },
      completed: { label: "Selesai", className: "bg-gray-500/10 text-gray-600" },
      cancelled: { label: "Dibatalkan", className: "bg-red-500/10 text-red-600" },
    };
    const config = variants[status] || { label: status, className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const isLawyer = request?.lawyers?.user_id === user?.id;
  const isClient = request?.client_id === user?.id;
  const canChat = ["pending", "negotiating", "accepted"].includes(request?.status || "");

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
            {canChat && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleDialog(true)}
                  className="text-xs"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  Jadwalkan
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCancelDialog(true)}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Ban className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Schedule Info (if scheduled) */}
        {request.status === "scheduled" && request.meeting_date && (
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
              Mulai percakapan untuk membahas jadwal dan lokasi pertemuan
            </div>
          )}
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;
            const isScheduleProposal = message.message_type === "schedule_proposal";

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
                    isScheduleProposal && "border-2 border-dashed border-primary/50"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Accept button for schedule proposal (only for non-sender) */}
                  {isScheduleProposal && !isCurrentUser && !message.is_schedule_accepted && canChat && (
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
            {request.status === "scheduled" ? (
              <>
                <Calendar className="w-5 h-5 text-primary" />
                <p className="text-sm">Jadwal pertemuan sudah dikonfirmasi</p>
              </>
            ) : request.status === "completed" ? (
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

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Batalkan Permintaan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan permintaan ini?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label>Alasan Pembatalan</Label>
            <Textarea
              placeholder="Masukkan alasan..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
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
              Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
