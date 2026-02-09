import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, Banknote, AlertTriangle, CheckCircle, 
  Clock, FileText, Shield, ChevronDown, ChevronUp, X, XCircle
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  useAssistanceRequest, 
  useAssistanceMessages, 
  useAssistanceStatusHistory,
  useSendAssistanceMessage,
  useAcceptPriceOffer,
  useUpdatePaymentStatus,
  useUpdateClientIdentity,
  useAppSetting,
  ASSISTANCE_STAGES
} from "@/hooks/useLegalAssistance";
import { useCancelAssistance } from "@/hooks/useCancelRequest";
import { CancelRequestDialog } from "@/components/CancelRequestDialog";
import { ClientIdentityForm, ClientIdentityData } from "@/components/ClientIdentityForm";
import { MeetingScheduleForm } from "@/components/MeetingScheduleForm";
import { SuratKuasaUpload } from "@/components/SuratKuasaUpload";
import { LegalAssistanceTerms } from "@/components/LegalAssistanceTerms";
import { calculatePlatformFee } from "@/hooks/usePlatformEarnings";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function LegalAssistanceChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: request, isLoading } = useAssistanceRequest(id || '');
  const { data: messages = [] } = useAssistanceMessages(id || '');
  const { data: statusHistory = [] } = useAssistanceStatusHistory(id || '');
  const { data: platformFeeSetting } = useAppSetting('platform_fee_pendampingan');
  const sendMessage = useSendAssistanceMessage();
  const acceptPrice = useAcceptPriceOffer();
  const updatePayment = useUpdatePaymentStatus();
  const updateIdentity = useUpdateClientIdentity();
  const cancelAssistance = useCancelAssistance();
  
  // Get platform fee from settings
  const platformFeeConfig = platformFeeSetting?.value as { type?: 'fixed' | 'percentage'; amount?: number } | undefined;
  const feeType = platformFeeConfig?.type || 'percentage';
  const feeValue = platformFeeConfig?.amount || 5;
  
  const [inputMessage, setInputMessage] = useState("");
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [pendingPriceOffer, setPendingPriceOffer] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("chat");

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Check for pending price offers
  useEffect(() => {
    const lastPriceOffer = [...messages].reverse().find(m => m.is_price_offer);
    if (lastPriceOffer && request?.status === 'negotiating' && lastPriceOffer.sender_id !== user?.id) {
      setPendingPriceOffer(lastPriceOffer.offered_price);
    } else {
      setPendingPriceOffer(null);
    }
  }, [messages, request, user]);

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

  const handleAcceptPrice = async () => {
    if (!pendingPriceOffer || !id) return;

    // Check if identity is filled
    if (!request?.identity_verified) {
      toast({
        title: "Lengkapi Data Diri Terlebih Dahulu",
        description: "Anda harus mengisi data identitas sebelum menyetujui harga",
        variant: "destructive"
      });
      setActiveTab("identity");
      return;
    }

    try {
      await acceptPrice.mutateAsync({
        requestId: id,
        agreedPrice: pendingPriceOffer
      });
      toast({ title: "Harga disepakati! Silakan lanjutkan pembayaran." });
      setShowPaymentDialog(true);
    } catch (error) {
      toast({
        title: "Gagal menyetujui harga",
        variant: "destructive"
      });
    }
  };

  const handleSubmitIdentity = async (data: ClientIdentityData) => {
    if (!id) return;

    try {
      await updateIdentity.mutateAsync({
        requestId: id,
        clientName: data.client_name,
        clientAddress: data.client_address,
        clientAge: data.client_age,
        clientReligion: data.client_religion,
        clientNik: data.client_nik,
        caseType: data.case_type
      });
      toast({ title: "Data identitas berhasil disimpan!" });
    } catch (error) {
      toast({
        title: "Gagal menyimpan data",
        variant: "destructive"
      });
    }
  };

  const handlePayment = async () => {
    if (!id) return;

    try {
      await updatePayment.mutateAsync({
        requestId: id,
        paymentStatus: 'paid'
      });
      toast({ title: "Pembayaran berhasil! Pendampingan hukum akan segera dimulai." });
      setShowPaymentDialog(false);
    } catch (error) {
      toast({
        title: "Gagal memproses pembayaran",
        variant: "destructive"
      });
    }
  };

  const handleCancelRequest = async (reason: string) => {
    if (!id) return;
    
    try {
      await cancelAssistance.mutateAsync({
        requestId: id,
        cancelReason: reason
      });
      toast({ title: "Pendampingan berhasil dibatalkan" });
      setShowCancelDialog(false);
      navigate(-1);
    } catch (error) {
      toast({
        title: "Gagal membatalkan pendampingan",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>;
      case 'negotiating':
        return <Badge variant="outline" className="border-warning text-warning"><Banknote className="w-3 h-3 mr-1" />Negosiasi</Badge>;
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

  if (isLoading) {
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

  const isClient = user?.id === request.client_id;
  const otherParty = isClient ? request.lawyer : request.client;

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={isClient ? request.lawyer?.image_url || undefined : request.client?.avatar_url || undefined} />
            <AvatarFallback>
              {(isClient ? request.lawyer?.name : request.client?.full_name)?.[0] || 'K'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm truncate">
                {isClient ? request.lawyer?.name : (request.client?.full_name || 'Memuat...')}
              </h2>
              {request.display_id && (
                <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {request.display_id}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(request.status)}
            </div>
          </div>
          {/* Cancel Button - show only if not completed/cancelled */}
          {(request.status === 'pending' || request.status === 'negotiating') && (
            <Button 
              variant="ghost" 
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="w-5 h-5" />
            </Button>
          )}
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

        {/* Status/Stage Info (Collapsible) */}
        {request.status === 'in_progress' && (
          <Collapsible open={showStatusHistory} onOpenChange={setShowStatusHistory}>
            <CollapsibleTrigger asChild>
              <div className="px-4 pb-3 cursor-pointer">
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Status Saat Ini</p>
                        <p className="text-sm font-medium">{getCurrentStageLabel()}</p>
                      </div>
                    </div>
                    {showStatusHistory ? 
                      <ChevronUp className="w-4 h-4 text-muted-foreground" /> : 
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                  </CardContent>
                </Card>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-3">
                <Card>
                  <CardContent className="p-3 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">Riwayat Status</p>
                    {statusHistory.map((history, idx) => {
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
                    })}
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
      </div>

      {/* Tabs for Chat / Identity */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        {(request.status === 'negotiating' || request.status === 'pending') && !request.identity_verified && (
          <div className="px-4 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
              <TabsTrigger value="identity" className="flex-1">Data Identitas</TabsTrigger>
            </TabsList>
          </div>
        )}

        <TabsContent value="chat" className="flex-1 mt-0 overflow-hidden">
      <ScrollArea ref={scrollRef} className="flex-1 p-4" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="space-y-4">
          {/* Case Description Card */}
          <Card className="bg-muted/30">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">Deskripsi Kasus:</p>
              <p className="text-sm">{request.case_description}</p>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Harga mulai dari:</span>
                <span className="font-semibold text-primary">
                  Rp {(request.lawyer?.pendampingan_price || 0).toLocaleString('id-ID')}
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
                          <Banknote className="w-4 h-4" />
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

          {/* Pending Price Offer Action (for client) */}
          {pendingPriceOffer && isClient && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4">
                <div className="text-center">
                  <Banknote className="w-8 h-8 mx-auto text-warning mb-2" />
                  <p className="text-sm font-medium mb-1">Penawaran Harga Baru</p>
                  <p className="text-2xl font-bold text-warning mb-3">
                    Rp {pendingPriceOffer.toLocaleString('id-ID')}
                  </p>
                  {!request?.identity_verified && (
                    <div className="mb-3 space-y-2">
                      <p className="text-xs text-destructive">
                        ⚠️ Isi data identitas dulu sebelum menyetujui
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-warning text-warning hover:bg-warning/10"
                        onClick={() => setActiveTab("identity")}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Isi Data Identitas
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm">
                      Nego Lagi
                    </Button>
                    <Button 
                      variant="gradient" 
                      size="sm" 
                      onClick={handleAcceptPrice}
                      disabled={!request?.identity_verified}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Setuju
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
        </TabsContent>

        <TabsContent value="identity" className="flex-1 mt-0 overflow-auto p-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">Data Identitas Klien</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Lengkapi data identitas Anda untuk melanjutkan proses pendampingan
              </p>
              <ClientIdentityForm
                initialData={{
                  client_name: request.client_name || '',
                  client_address: request.client_address || '',
                  client_age: request.client_age || undefined,
                  client_religion: request.client_religion || '',
                  client_nik: request.client_nik || '',
                  case_type: request.case_type || '',
                }}
                onSubmit={handleSubmitIdentity}
                isSubmitting={updateIdentity.isPending}
                isVerified={request.identity_verified || false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Input Area */}
      {(request.status === 'pending' || request.status === 'negotiating') && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
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

      {/* In Progress - Chat disabled */}
      {request.status === 'in_progress' && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <div className="text-center text-sm text-muted-foreground">
            <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
            Pendampingan hukum sedang berjalan. Komunikasi dilakukan melalui lawyer.
          </div>
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
              Pendampingan hukum telah selesai. Terima kasih telah menggunakan layanan kami.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/legal-assistance/my-requests')}
            >
              Lihat Riwayat Pendampingan
            </Button>
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pembayaran Pendampingan Hukum</DialogTitle>
            <DialogDescription>
              Lakukan pembayaran untuk memulai pendampingan hukum
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(() => {
              const baseAmount = request.agreed_price || 0;
              const { platformFee, totalAmount } = calculatePlatformFee(baseAmount, feeType, feeValue);
              return (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Biaya Pendampingan</span>
                    <span className="font-semibold">
                      Rp {baseAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">
                      Biaya Platform {feeType === 'percentage' ? `(${feeValue}%)` : ''}
                    </span>
                    <span className="font-semibold">
                      Rp {platformFee.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-primary">
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })()}
            
            <div className="text-xs text-muted-foreground">
              Dengan melakukan pembayaran, Anda menyetujui syarat dan ketentuan layanan pendampingan hukum.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Batal
            </Button>
            <Button variant="gradient" onClick={handlePayment} disabled={updatePayment.isPending}>
              {updatePayment.isPending ? 'Memproses...' : 'Bayar Sekarang'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <CancelRequestDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelRequest}
        type="pendampingan"
        userType={isClient ? "client" : "lawyer"}
        isLoading={cancelAssistance.isPending}
      />
    </MobileLayout>
  );
}
