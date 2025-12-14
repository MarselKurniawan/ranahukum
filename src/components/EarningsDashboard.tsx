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
import { useState } from "react";

interface EarningsData {
  totalEarnings: number;
  previousPeriodEarnings: number;
  totalConsultations: number;
  averagePerConsultation: number;
  pendingPayments: number;
  monthlyData: { month: string; amount: number }[];
}

const mockEarningsData: EarningsData = {
  totalEarnings: 45750000,
  previousPeriodEarnings: 38200000,
  totalConsultations: 305,
  averagePerConsultation: 150000,
  pendingPayments: 2250000,
  monthlyData: [
    { month: "Jul", amount: 5200000 },
    { month: "Agu", amount: 6100000 },
    { month: "Sep", amount: 5800000 },
    { month: "Okt", amount: 7200000 },
    { month: "Nov", amount: 8500000 },
    { month: "Des", amount: 12950000 },
  ],
};

export function EarningsDashboard() {
  const [period, setPeriod] = useState("6months");
  const data = mockEarningsData;

  const growthPercentage = ((data.totalEarnings - data.previousPeriodEarnings) / data.previousPeriodEarnings) * 100;
  const isPositiveGrowth = growthPercentage > 0;

  const maxAmount = Math.max(...data.monthlyData.map(d => d.amount));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}jt`;
    }
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

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
              <p className="text-2xl font-bold">{formatCurrency(data.totalEarnings)}</p>
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
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{data.totalConsultations}</p>
            <p className="text-[10px] text-muted-foreground">Konsultasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <BarChart3 className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{formatCurrency(data.averagePerConsultation)}</p>
            <p className="text-[10px] text-muted-foreground">Rata-rata</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Calendar className="w-5 h-5 mx-auto text-warning mb-1" />
            <p className="text-lg font-bold">{formatCurrency(data.pendingPayments)}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Pendapatan Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {data.monthlyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/20 rounded-t-md relative overflow-hidden transition-all hover:bg-primary/30"
                  style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all"
                    style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Transaksi Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Andi Pratama", type: "Konsultasi", amount: 150000, date: "Hari ini" },
            { name: "Siti Rahayu", type: "Pendampingan", amount: 5000000, date: "Kemarin" },
            { name: "Budi Hartono", type: "Konsultasi", amount: 150000, date: "2 hari lalu" },
          ].map((tx, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{tx.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="tag" className="text-[10px]">{tx.type}</Badge>
                  <span className="text-xs text-muted-foreground">{tx.date}</span>
                </div>
              </div>
              <span className="font-semibold text-success">+{formatCurrency(tx.amount)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
