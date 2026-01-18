import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useLawyerWithdrawals } from "@/hooks/useLawyerWithdrawal";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function WithdrawalHistory() {
  const { data: withdrawals, isLoading } = useLawyerWithdrawals();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Menunggu
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Diproses
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Selesai
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Riwayat Penarikan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat Penarikan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {withdrawals && withdrawals.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {withdrawal.bank_name} • {withdrawal.account_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(withdrawal.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </p>
                      {withdrawal.admin_notes && (
                        <p className="text-xs mt-1 text-muted-foreground italic">
                          Admin: {withdrawal.admin_notes}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(withdrawal.status)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada riwayat penarikan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
