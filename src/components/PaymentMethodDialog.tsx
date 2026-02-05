 import { useState } from "react";
 import { CreditCard, Building2, Smartphone, CheckCircle, Copy, Loader2 } from "lucide-react";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Label } from "@/components/ui/label";
 import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
 import { Card, CardContent } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { toast } from "sonner";
 
 interface PaymentMethodDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   amount: number;
   onConfirmPayment: () => Promise<void>;
   isPending?: boolean;
 }
 
 const PAYMENT_METHODS = [
   {
     id: "bca",
     name: "BCA Virtual Account",
     type: "bank",
     icon: Building2,
     accountNumber: "8810 1234 5678 9012",
     accountName: "PT Rana Hukum Indonesia",
     instructions: [
       "Login ke BCA Mobile/KlikBCA",
       "Pilih Transfer > Virtual Account",
       "Masukkan nomor VA di atas",
       "Konfirmasi pembayaran",
     ],
   },
   {
     id: "mandiri",
     name: "Mandiri Virtual Account",
     type: "bank",
     icon: Building2,
     accountNumber: "8901 2345 6789 0123",
     accountName: "PT Rana Hukum Indonesia",
     instructions: [
       "Login ke Livin by Mandiri",
       "Pilih Bayar > Multipayment",
       "Masukkan nomor VA di atas",
       "Konfirmasi pembayaran",
     ],
   },
   {
     id: "gopay",
     name: "GoPay",
     type: "ewallet",
     icon: Smartphone,
     instructions: [
       "Buka aplikasi Gojek/GoPay",
       "Scan QR Code yang akan tampil",
       "Konfirmasi pembayaran di aplikasi",
     ],
   },
   {
     id: "ovo",
     name: "OVO",
     type: "ewallet",
     icon: Smartphone,
     instructions: [
       "Buka aplikasi OVO",
       "Pilih Transfer > Ke Rekening",
       "Masukkan nomor yang tertera",
       "Konfirmasi pembayaran",
     ],
   },
   {
     id: "dana",
     name: "DANA",
     type: "ewallet",
     icon: Smartphone,
     instructions: [
       "Buka aplikasi DANA",
       "Pilih Kirim > Ke Rekening Bank",
       "Masukkan nomor yang tertera",
       "Konfirmasi pembayaran",
     ],
   },
 ];
 
 export function PaymentMethodDialog({
   open,
   onOpenChange,
   amount,
   onConfirmPayment,
   isPending = false,
 }: PaymentMethodDialogProps) {
   const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
   const [step, setStep] = useState<"select" | "details">("select");
 
   const selectedPaymentMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
 
   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat("id-ID", {
       style: "currency",
       currency: "IDR",
       minimumFractionDigits: 0,
     }).format(value);
   };
 
   const handleCopy = (text: string) => {
     navigator.clipboard.writeText(text.replace(/\s/g, ""));
     toast.success("Nomor berhasil disalin");
   };
 
   const handleConfirm = async () => {
     await onConfirmPayment();
     setStep("select");
     setSelectedMethod(null);
   };
 
   const handleClose = (open: boolean) => {
     if (!open) {
       setStep("select");
       setSelectedMethod(null);
     }
     onOpenChange(open);
   };
 
   return (
     <Dialog open={open} onOpenChange={handleClose}>
       <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
         {step === "select" ? (
           <>
             <DialogHeader>
               <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
               <DialogDescription>
                 Total pembayaran: <span className="font-bold text-primary">{formatCurrency(amount)}</span>
               </DialogDescription>
             </DialogHeader>
 
             <div className="py-4 space-y-4">
               {/* Bank Transfer */}
               <div>
                 <Label className="text-xs text-muted-foreground mb-2 block">Transfer Bank</Label>
                 <RadioGroup value={selectedMethod || ""} onValueChange={setSelectedMethod}>
                   <div className="space-y-2">
                     {PAYMENT_METHODS.filter((m) => m.type === "bank").map((method) => (
                       <label
                         key={method.id}
                         className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                           selectedMethod === method.id
                             ? "border-primary bg-primary/5"
                             : "border-border hover:bg-muted/50"
                         }`}
                       >
                         <RadioGroupItem value={method.id} className="sr-only" />
                         <method.icon className="w-5 h-5 text-primary" />
                         <span className="flex-1 text-sm font-medium">{method.name}</span>
                         {selectedMethod === method.id && (
                           <CheckCircle className="w-4 h-4 text-primary" />
                         )}
                       </label>
                     ))}
                   </div>
                 </RadioGroup>
               </div>
 
               {/* E-Wallet */}
               <div>
                 <Label className="text-xs text-muted-foreground mb-2 block">E-Wallet</Label>
                 <RadioGroup value={selectedMethod || ""} onValueChange={setSelectedMethod}>
                   <div className="space-y-2">
                     {PAYMENT_METHODS.filter((m) => m.type === "ewallet").map((method) => (
                       <label
                         key={method.id}
                         className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                           selectedMethod === method.id
                             ? "border-primary bg-primary/5"
                             : "border-border hover:bg-muted/50"
                         }`}
                       >
                         <RadioGroupItem value={method.id} className="sr-only" />
                         <method.icon className="w-5 h-5 text-primary" />
                         <span className="flex-1 text-sm font-medium">{method.name}</span>
                         {selectedMethod === method.id && (
                           <CheckCircle className="w-4 h-4 text-primary" />
                         )}
                       </label>
                     ))}
                   </div>
                 </RadioGroup>
               </div>
             </div>
 
             <DialogFooter>
               <Button
                 className="w-full"
                 disabled={!selectedMethod}
                 onClick={() => setStep("details")}
               >
                 Lanjutkan
               </Button>
             </DialogFooter>
           </>
         ) : (
           <>
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                 {selectedPaymentMethod && <selectedPaymentMethod.icon className="w-5 h-5" />}
                 {selectedPaymentMethod?.name}
               </DialogTitle>
               <DialogDescription>
                 Selesaikan pembayaran dalam 24 jam
               </DialogDescription>
             </DialogHeader>
 
             <div className="py-4 space-y-4">
               {/* Amount */}
               <Card className="border-primary bg-primary/5">
                 <CardContent className="p-4">
                   <p className="text-xs text-muted-foreground">Total Pembayaran</p>
                   <p className="text-2xl font-bold text-primary">{formatCurrency(amount)}</p>
                 </CardContent>
               </Card>
 
               {/* Account Details */}
               {selectedPaymentMethod?.accountNumber && (
                 <div className="space-y-2">
                   <Label className="text-xs text-muted-foreground">Nomor Virtual Account</Label>
                   <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                     <span className="flex-1 font-mono text-lg font-bold">
                       {selectedPaymentMethod.accountNumber}
                     </span>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleCopy(selectedPaymentMethod.accountNumber || "")}
                     >
                       <Copy className="w-4 h-4" />
                     </Button>
                   </div>
                   {selectedPaymentMethod.accountName && (
                     <p className="text-xs text-muted-foreground">
                       a.n. {selectedPaymentMethod.accountName}
                     </p>
                   )}
                 </div>
               )}
 
               {/* Instructions */}
               <div className="space-y-2">
                 <Label className="text-xs text-muted-foreground">Cara Pembayaran</Label>
                 <div className="space-y-2">
                   {selectedPaymentMethod?.instructions.map((instruction, index) => (
                     <div key={index} className="flex items-start gap-2 text-sm">
                       <Badge variant="outline" className="shrink-0 w-5 h-5 p-0 justify-center">
                         {index + 1}
                       </Badge>
                       <span>{instruction}</span>
                     </div>
                   ))}
                 </div>
               </div>
 
               {/* Warning */}
               <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                 <p className="text-xs text-warning">
                   ⚠️ Pastikan nominal transfer sesuai sampai digit terakhir untuk mempercepat verifikasi.
                 </p>
               </div>
             </div>
 
             <DialogFooter className="flex flex-col gap-2">
               <Button
                 className="w-full"
                 onClick={handleConfirm}
                 disabled={isPending}
               >
                 {isPending ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Memproses...
                   </>
                 ) : (
                   <>
                     <CheckCircle className="w-4 h-4 mr-2" />
                     Saya Sudah Bayar
                   </>
                 )}
               </Button>
               <Button variant="outline" className="w-full" onClick={() => setStep("select")}>
                 Ganti Metode
               </Button>
             </DialogFooter>
           </>
         )}
       </DialogContent>
     </Dialog>
   );
 }