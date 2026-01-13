import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, DollarSign, AlertTriangle, CheckCircle, 
  Clock, FileText, Shield, ChevronDown, ChevronUp, Pencil, X
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLawyerProfile } from "@/hooks/useLawyerProfile";
import { 
  useAssistanceRequest, 
  useAssistanceMessages, 
  useAssistanceStatusHistory,
  useSendAssistanceMessage,
  useUpdateAssistanceStatus,
  ASSISTANCE_STAGES
} from "@/hooks/useLegalAssistance";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function LawyerAssistanceChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: lawyerProfile } = useLawyerProfile();
  
  const { data: request, isLoading } = useAssistanceRequest(id || '');
  const { data: messages = [] } = useAssistanceMessages(id || '');
  const { data: statusHistory = [] } = useAssistanceStatusHistory(id || '');
  const sendMessage = useSendAssistanceMessage();
  const updateStatus = useUpdateAssistanceStatus();
  
  const [inputMessage, setInputMessage] = useState("");
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [showPriceOfferDialog, setShowPriceOfferDialog] = useState(false);
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [stageNotes, setStageNotes] = useState("");

  // Redirect if not lawyer
  useEffect(() => {
    if (!loading && role !== 'lawyer') {
      navigate('/auth');
    }
  }, [role, loading, navigate]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !id) return;

    try {
      await sendMessage.mutateAsync({
        requestId: id,
        content: inputMessage.trim()
      });
      setInputMessage("");
    } catch (error) {
      toast({
        title: "Gagal mengirim pesan",
        variant: "destructive"
      });
    }
  };

  const handleSendPriceOffer = async () => {
    if (!offerPrice || !id) return;

    try {
      await sendMessage.mutateAsync({
        requestId: id,
        content: offerNote || `Penawaran harga: Rp ${parseInt(offerPrice).toLocaleString('id-ID')}`,
        isPriceOffer: true,
        offeredPrice: parseInt(offerPrice)
      });

      // Update request status to negotiating
      await updateStatus.mutateAsync({
        requestId: id,
        status: 'negotiating'
      });

      toast({ title: "Penawaran harga berhasil dikirim" });
      setShowPriceOfferDialog(false);
      setOfferPrice("");
      setOfferNote("");
    } catch (error) {
      toast({
        title: "Gagal mengirim penawaran",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStage || !id) return;

    try {
      await updateStatus.mutateAsync({
        requestId: id,
        currentStage: selectedStage,
        stageNotes: stageNotes || undefined
      });

      toast({ title: "Status berhasil diperbarui" });
      setShowUpdateStatusDialog(false);
      setSelectedStage("");
      setStageNotes("");
    } catch (error) {
      toast({
        title: "Gagal memperbarui status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>;
      case 'negotiating':
        return <Badge variant="outline" className="border-warning text-warning"><DollarSign className="w-3 h-3 mr-1" />Negosiasi</Badge>;
      case 'agreed':
        return <Badge variant="outline" className="border-accent text-accent"><CheckCircle className="w-3 h-3 mr-1" />Disepakati</Badge>;
      case 'in_progress':
        return <Badge variant="default"><FileText className="w-3 h-3 mr-1" />Berjalan</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-success text-success"><CheckCircle className="w-3 h-3 mr-1" />Selesai</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCurrentStageLabel = () => {
    if (!request?.current_stage) return null;
    const stage = ASSISTANCE_STAGES.find(s => s.value === request.current_stage);
    return stage?.label || request.current_stage;
  };

  if (loading || isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-[60vh] w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (!request) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <p>Request tidak ditemukan</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={request.client?.avatar_url || undefined} />
            <AvatarFallback>
              {request.client?.full_name?.[0] || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">
              {request.client?.full_name || 'Client'}
            </h2>
            <div className="flex items-center gap-2">
              {getStatusBadge(request.status)}
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="px-4 pb-3">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-destructive">Peringatan Penting</p>
              <p className="text-xs text-destructive/80">
                Negosiasi atau pembayaran di luar aplikasi akan mengakibatkan 
                <span className="font-semibold"> banned permanen </span>
                untuk kedua belah pihak.
              </p>
            </div>
          </div>
        </div>

        {/* Status/Stage Info (Collapsible) - for in_progress or completed */}
        {(request.status === 'in_progress' || request.status === 'completed') && (
          <Collapsible open={showStatusHistory} onOpenChange={setShowStatusHistory}>
            <CollapsibleTrigger asChild>
              <div className="px-4 pb-3 cursor-pointer">
                <Card className={`${request.status === 'completed' ? 'border-success/20 bg-success/5' : 'border-primary/20 bg-primary/5'}`}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {request.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <Shield className="w-4 h-4 text-primary" />
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Status Saat Ini</p>
                        <p className="text-sm font-medium">{getCurrentStageLabel() || 'Belum dimulai'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUpdateStatusDialog(true);
                          }}
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Update
                        </Button>
                      )}
                      {showStatusHistory ? 
                        <ChevronUp className="w-4 h-4 text-muted-foreground" /> : 
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-3">
                <Card>
                  <CardContent className="p-3 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">Riwayat Status</p>
                    {statusHistory.length > 0 ? statusHistory.map((history, idx) => {
                      const stage = ASSISTANCE_STAGES.find(s => s.value === history.stage);
                      return (
                        <div key={history.id} className="flex gap-3">
                          <div className="relative">
                            <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-muted'}`} />
                            {idx !== statusHistory.length - 1 && (
                              <div className="absolute top-3 left-1.5 w-px h-full bg-border -translate-x-1/2" />
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            <p className="text-sm font-medium">{stage?.label || history.stage}</p>
                            {history.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5">{history.notes}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(history.created_at), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                            </p>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-xs text-muted-foreground">Belum ada riwayat status</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

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
                      Rp {request.agreed_price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <Badge variant={request.payment_status === 'paid' ? 'outline' : 'secondary'} 
                  className={request.payment_status === 'paid' ? 'border-success text-success' : ''}>
                  {request.payment_status === 'paid' ? (
                    <><CheckCircle className="w-3 h-3 mr-1" />Lunas</>
                  ) : (
                    <><Clock className="w-3 h-3 mr-1" />Belum Bayar</>
                  )}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="space-y-4">
          {/* Case Description Card */}
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">Deskripsi Kasus:</p>
              <p className="text-sm">{request.case_description}</p>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Harga Anda (mulai dari):</span>
                <span className="font-semibold text-primary">
                  Rp {(lawyerProfile?.pendampingan_price || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isMine ? 'order-2' : 'order-1'}`}>
                  {msg.is_price_offer ? (
                    <Card className={`${isMine ? 'bg-primary text-primary-foreground' : 'bg-accent/20 border-accent/30'}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xs font-medium">Penawaran Harga</span>
                        </div>
                        <p className="text-lg font-bold">
                          Rp {(msg.offered_price || 0).toLocaleString('id-ID')}
                        </p>
                        {msg.content && (
                          <p className="text-sm mt-1 opacity-80">{msg.content}</p>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className={`rounded-2xl px-4 py-2 ${
                      isMine 
                        ? 'bg-primary text-primary-foreground rounded-br-md' 
                        : 'bg-muted rounded-bl-md'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  )}
                  <p className={`text-[10px] text-muted-foreground mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    {format(new Date(msg.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input Area */}
      {(request.status === 'pending' || request.status === 'negotiating') && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <div className="flex gap-2 mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => setShowPriceOfferDialog(true)}
            >
              <DollarSign className="w-4 h-4" />
              Tawarkan Harga
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              size="icon" 
              variant="gradient"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sendMessage.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* In Progress - Show update status */}
      {request.status === 'in_progress' && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <div className="text-center text-sm text-muted-foreground mb-2">
            <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
            Pendampingan hukum sedang berjalan
          </div>
          <Button 
            className="w-full" 
            variant="gradient"
            onClick={() => setShowUpdateStatusDialog(true)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Update Status Pendampingan
          </Button>
        </div>
      )}

      {/* Completed - Show completion notice */}
      {request.status === 'completed' && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-success/20 mx-auto mb-2 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <p className="font-semibold text-success mb-1">Pendampingan Selesai</p>
            <p className="text-xs text-muted-foreground mb-3">
              Pendampingan hukum telah selesai. Terima kasih atas kerjasamanya.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/lawyer/dashboard')}
            >
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Price Offer Dialog */}
      <Dialog open={showPriceOfferDialog} onOpenChange={setShowPriceOfferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tawarkan Harga</DialogTitle>
            <DialogDescription>
              Berikan penawaran harga untuk pendampingan hukum ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Harga Penawaran (Rp)</Label>
              <Input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder={`Minimal ${(lawyerProfile?.pendampingan_price || 0).toLocaleString('id-ID')}`}
              />
              <p className="text-xs text-muted-foreground">
                Harga minimum Anda: Rp {(lawyerProfile?.pendampingan_price || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Textarea
                value={offerNote}
                onChange={(e) => setOfferNote(e.target.value)}
                placeholder="Jelaskan apa saja yang termasuk dalam harga ini..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceOfferDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleSendPriceOffer}
              disabled={!offerPrice || parseInt(offerPrice) < (lawyerProfile?.pendampingan_price || 0) || sendMessage.isPending}
            >
              Kirim Penawaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateStatusDialog} onOpenChange={setShowUpdateStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status Pendampingan</DialogTitle>
            <DialogDescription>
              Update tahap pendampingan hukum saat ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tahap Saat Ini</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahap..." />
                </SelectTrigger>
                <SelectContent>
                  {ASSISTANCE_STAGES.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      <div>
                        <p className="font-medium">{stage.label}</p>
                        <p className="text-xs text-muted-foreground">{stage.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Textarea
                value={stageNotes}
                onChange={(e) => setStageNotes(e.target.value)}
                placeholder="Tambahkan keterangan tentang progress saat ini..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateStatusDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleUpdateStatus}
              disabled={!selectedStage || updateStatus.isPending}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
