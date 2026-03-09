import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, MessageCircle, Banknote } from "lucide-react";

interface LawyerAnalyticsCardProps {
  lawyerId?: string;
}

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
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}jt`
    : v >= 1_000
    ? `${(v / 1_000).toFixed(0)}rb`
    : `${v}`;

export function LawyerAnalyticsCard({ lawyerId }: LawyerAnalyticsCardProps) {
  const months = useMemo(() => getLastNMonths(6), []);

  const { data, isLoading } = useQuery({
    queryKey: ["lawyer-analytics", lawyerId],
    queryFn: async () => {
      if (!lawyerId) return [];
      const { data: consultations, error } = await supabase
        .from("consultations")
        .select("id, price, status, created_at")
        .eq("lawyer_id", lawyerId);
      if (error) throw error;
      return consultations || [];
    },
    enabled: !!lawyerId,
  });

  const chartData = useMemo(() => {
    if (!data) return months.map((m) => ({ ...m, count: 0, income: 0 }));
    return months.map((m) => {
      const inMonth = data.filter((c) => c.created_at.startsWith(m.key));
      const completed = inMonth.filter((c) => c.status === "completed");
      return {
        ...m,
        count: inMonth.length,
        income: completed.reduce((sum, c) => sum + (c.price || 0), 0),
      };
    });
  }, [data, months]);

  const totalConsultations = data?.length || 0;
  const totalIncome = data?.filter((c) => c.status === "completed").reduce((s, c) => s + (c.price || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
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
              <span className="text-xs text-muted-foreground">Total Pendapatan</span>
            </div>
            <p className="text-2xl font-bold text-success">Rp {IDR(totalIncome)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Consultation Bar Chart */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Konsultasi 6 Bulan Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                formatter={(v: number) => [`${v} konsultasi`, ""]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Income Line Chart */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Banknote className="w-4 h-4 text-success" />
            Pendapatan 6 Bulan Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={IDR} />
              <Tooltip
                formatter={(v: number) => [`Rp ${v.toLocaleString("id-ID")}`, "Pendapatan"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--success))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
