import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface EarningsDashboardProps {
  lawyerId?: string;
}

interface ConsultationData {
  id: string;
  price: number;
  status: string;
  created_at: string;
  ended_at: string | null;
  topic: string;
  profiles?: {
    full_name: string | null;
  };
}

export function EarningsDashboard({ lawyerId }: EarningsDashboardProps) {
  const [period, setPeriod] = useState("6months");

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['lawyer-earnings', lawyerId],
    queryFn: async () => {
      if (!lawyerId) return [];
      
      const { data, error } = await supabase
        .from('consultations')
        .select('id, price, status, created_at, ended_at, topic, client_id')
        .eq('lawyer_id', lawyerId)
        .eq('status', 'completed')
        .order('ended_at', { ascending: false });

      if (error) throw error;

      // Fetch client profiles
      const enrichedData = await Promise.all(
        (data || []).map(async (consultation) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', consultation.client_id)
            .maybeSingle();

          return {
            ...consultation,
            profiles: profile || undefined
          };
        })
      );

      return enrichedData as ConsultationData[];
    },
    enabled: !!lawyerId
  });

  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "1month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case "1year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    }

    const previousStartDate = new Date(startDate);
    const periodDiff = now.getTime() - startDate.getTime();
    previousStartDate.setTime(startDate.getTime() - periodDiff);

    const filteredConsultations = consultations.filter(c => {
      const endDate = c.ended_at ? new Date(c.ended_at) : new Date(c.created_at);
      return endDate >= startDate;
    });

    const previousConsultations = consultations.filter(c => {
      const endDate = c.ended_at ? new Date(c.ended_at) : new Date(c.created_at);
      return endDate >= previousStartDate && endDate < startDate;
    });

    const totalEarnings = filteredConsultations.reduce((sum, c) => sum + c.price, 0);
    const previousEarnings = previousConsultations.reduce((sum, c) => sum + c.price, 0);
    const totalConsultations = filteredConsultations.length;
    const averagePerConsultation = totalConsultations > 0 ? totalEarnings / totalConsultations : 0;

    // Generate monthly data
    const monthlyData: { month: string; amount: number }[] = [];
    const months = period === "1year" ? 12 : period === "6months" ? 6 : period === "3months" ? 3 : 1;
    
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthEarnings = consultations
        .filter(c => {
          const endDate = c.ended_at ? new Date(c.ended_at) : new Date(c.created_at);
          return endDate >= monthDate && endDate <= monthEnd;
        })
        .reduce((sum, c) => sum + c.price, 0);

      monthlyData.push({
        month: monthDate.toLocaleDateString('id-ID', { month: 'short' }),
        amount: monthEarnings
      });
    }

    return {
      totalEarnings,
      previousEarnings,
      totalConsultations,
      averagePerConsultation,
      monthlyData,
      recentTransactions: filteredConsultations.slice(0, 5)
    };
  }, [consultations, period]);

  const growthPercentage = stats.previousEarnings > 0 
    ? ((stats.totalEarnings - stats.previousEarnings) / stats.previousEarnings) * 100
    : 0;
  const isPositiveGrowth = growthPercentage > 0;

  const maxAmount = Math.max(...stats.monthlyData.map(d => d.amount), 1);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}jt`;
    }
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Statistik Pendapatan</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">1 Bulan</SelectItem>
            <SelectItem value="3months">3 Bulan</SelectItem>
            <SelectItem value="6months">6 Bulan</SelectItem>
            <SelectItem value="1year">1 Tahun</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Stats */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Pendapatan</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
              {stats.previousEarnings > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {isPositiveGrowth ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`text-xs font-medium ${isPositiveGrowth ? "text-success" : "text-destructive"}`}>
                    {isPositiveGrowth ? "+" : ""}{growthPercentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">dari periode sebelumnya</span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{stats.totalConsultations}</p>
            <p className="text-[10px] text-muted-foreground">Konsultasi Selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <BarChart3 className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{formatCurrency(stats.averagePerConsultation)}</p>
            <p className="text-[10px] text-muted-foreground">Rata-rata</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      {stats.monthlyData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Pendapatan Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {stats.monthlyData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/20 rounded-t-md relative overflow-hidden transition-all hover:bg-primary/30"
                    style={{ height: `${Math.max((item.amount / maxAmount) * 100, 5)}%` }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all"
                      style={{ height: '100%' }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Transaksi Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.recentTransactions.length > 0 ? (
            stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{tx.profiles?.full_name || 'Anonim'}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="tag" className="text-[10px]">Konsultasi</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(tx.ended_at || tx.created_at)}
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-success">+{formatCurrency(tx.price)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada transaksi
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
