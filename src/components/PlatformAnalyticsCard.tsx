import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Banknote, MessageCircle, Gavel } from "lucide-react";
import { useAllConsultations, useAllLawyers } from "@/hooks/useSuperAdmin";
import { usePlatformEarnings } from "@/hooks/usePlatformEarnings";

function getLastNMonths(n: number) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
    });
  }
  return months;
}

const IDR = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}rb` : `${v}`;

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))"];

export function PlatformAnalyticsCard() {
  const months = useMemo(() => getLastNMonths(6), []);
  const { data: consultations = [], isLoading: loadingC } = useAllConsultations();
  const { data: lawyers = [], isLoading: loadingL } = useAllLawyers();
  const { data: earnings = [], isLoading: loadingE } = usePlatformEarnings();

  const isLoading = loadingC || loadingL || loadingE;

  const monthlyData = useMemo(() => {
    return months.map((m) => {
      const inMonth = consultations.filter((c) => c.created_at.startsWith(m.key));
      const earnMonth = earnings.filter((e) => e.created_at.startsWith(m.key));
      return {
        ...m,
        consultations: inMonth.length,
        revenue: earnMonth.reduce((s, e) => s + (e.platform_fee || 0), 0),
      };
    });
  }, [consultations, earnings, months]);

  const approvedLawyers = lawyers.filter((l) => l.approval_status === "approved").length;
  const pendingLawyers = lawyers.filter((l) => l.approval_status === "pending").length;
  const totalRevenue = earnings.reduce((s, e) => s + (e.platform_fee || 0), 0);
  const totalConsultations = consultations.length;

  const statusData = [
    { name: "Selesai", value: consultations.filter((c) => c.status === "completed").length },
    { name: "Dibatalkan", value: consultations.filter((c) => ["cancelled", "rejected", "expired"].includes(c.status)).length },
  ];

  const lawyerPieData = [
    { name: "Disetujui", value: approvedLawyers },
    { name: "Menunggu", value: pendingLawyers },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Konsultasi</span>
            </div>
            <p className="text-2xl font-bold">{totalConsultations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Pendapatan Platform</span>
            </div>
            <p className="text-2xl font-bold text-success">Rp {IDR(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Lawyer Aktif</span>
            </div>
            <p className="text-2xl font-bold">{approvedLawyers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Gavel className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground">Menunggu Review</span>
            </div>
            <p className="text-2xl font-bold text-warning">{pendingLawyers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Consultations */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Konsultasi per Bulan
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="consultations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Banknote className="w-4 h-4 text-success" />
            Pendapatan Platform per Bulan
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={monthlyData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={IDR} />
              <Tooltip
                formatter={(v: number) => [`Rp ${v.toLocaleString("id-ID")}`, "Revenue"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Charts */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-0 pt-3 px-3">
            <CardTitle className="text-xs text-muted-foreground">Status Konsultasi</CardTitle>
          </CardHeader>
          <CardContent className="px-1 pb-3">
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value">
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0 pt-3 px-3">
            <CardTitle className="text-xs text-muted-foreground">Status Lawyer</CardTitle>
          </CardHeader>
          <CardContent className="px-1 pb-3">
            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie data={lawyerPieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value">
                  {lawyerPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
