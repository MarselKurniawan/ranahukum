import { useState } from "react";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LegalCalculator() {
  const navigate = useNavigate();

  // Notary Calculator State
  const [propertyValue, setPropertyValue] = useState("");
  const [transactionType, setTransactionType] = useState("jual-beli");

  // Inheritance Calculator State
  const [inheritanceValue, setInheritanceValue] = useState("");
  const [heirs, setHeirs] = useState({ spouse: true, children: 2, parents: 0, siblings: 0 });

  // Severance Calculator State
  const [yearsWorked, setYearsWorked] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [terminationType, setTerminationType] = useState("resign");

  // Notary calculation
  const calculateNotaryFees = () => {
    const value = parseFloat(propertyValue.replace(/\D/g, "")) || 0;
    if (value === 0) return null;

    let notaryFee = 0;
    if (value <= 100000000) {
      notaryFee = value * 0.025;
    } else if (value <= 1000000000) {
      notaryFee = value * 0.015;
    } else {
      notaryFee = value * 0.01;
    }
    notaryFee = Math.max(notaryFee, 500000);

    const bphtb = value * 0.05; // BPHTB 5%
    const pph = transactionType === "jual-beli" ? value * 0.025 : 0; // PPh 2.5% for seller
    const ajtbFee = value * 0.01; // AJB fee ~1%

    return {
      notaryFee,
      bphtb,
      pph,
      ajtbFee,
      total: notaryFee + bphtb + ajtbFee,
    };
  };

  // Inheritance calculation (simplified Islamic law - faraidh)
  const calculateInheritance = () => {
    const value = parseFloat(inheritanceValue.replace(/\D/g, "")) || 0;
    if (value === 0) return null;

    const shares: { name: string; share: string; amount: number }[] = [];
    let remaining = value;

    if (heirs.spouse) {
      const spouseShare = heirs.children > 0 ? 0.125 : 0.25;
      const amount = value * spouseShare;
      shares.push({ name: "Pasangan", share: `${spouseShare * 100}%`, amount });
      remaining -= amount;
    }

    if (heirs.children > 0) {
      const perChild = remaining / heirs.children;
      for (let i = 0; i < heirs.children; i++) {
        shares.push({ name: `Anak ${i + 1}`, share: `${((perChild / value) * 100).toFixed(1)}%`, amount: perChild });
      }
    }

    return shares;
  };

  // Severance calculation based on UU Cipta Kerja
  const calculateSeverance = () => {
    const years = parseFloat(yearsWorked) || 0;
    const salary = parseFloat(monthlySalary.replace(/\D/g, "")) || 0;
    if (salary === 0) return null;

    // Pesangon calculation based on years worked
    let pesangonMonths = 0;
    if (years < 1) pesangonMonths = 1;
    else if (years < 2) pesangonMonths = 2;
    else if (years < 3) pesangonMonths = 3;
    else if (years < 4) pesangonMonths = 4;
    else if (years < 5) pesangonMonths = 5;
    else if (years < 6) pesangonMonths = 6;
    else if (years < 7) pesangonMonths = 7;
    else if (years < 8) pesangonMonths = 8;
    else pesangonMonths = 9;

    // UPMK (Uang Penghargaan Masa Kerja)
    let upmkMonths = 0;
    if (years >= 3 && years < 6) upmkMonths = 2;
    else if (years >= 6 && years < 9) upmkMonths = 3;
    else if (years >= 9 && years < 12) upmkMonths = 4;
    else if (years >= 12 && years < 15) upmkMonths = 5;
    else if (years >= 15 && years < 18) upmkMonths = 6;
    else if (years >= 18 && years < 21) upmkMonths = 7;
    else if (years >= 21 && years < 24) upmkMonths = 8;
    else if (years >= 24) upmkMonths = 10;

    // Multiplier based on termination type
    let multiplier = 1;
    if (terminationType === "phk-efisiensi") multiplier = 1;
    else if (terminationType === "phk-pelanggaran") multiplier = 0.5;
    else if (terminationType === "resign") multiplier = 0;

    const pesangon = salary * pesangonMonths * multiplier;
    const upmk = salary * upmkMonths;
    const uph = salary * 0.15 * (pesangonMonths + upmkMonths); // 15% for rights replacement

    return {
      pesangonMonths,
      upmkMonths,
      pesangon,
      upmk,
      uph,
      total: pesangon + upmk + uph,
    };
  };

  const notaryResult = calculateNotaryFees();
  const inheritanceResult = calculateInheritance();
  const severanceResult = calculateSeverance();

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const handleCurrencyInput = (value: string, setter: (val: string) => void) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue) {
      setter(parseInt(numericValue).toLocaleString("id-ID"));
    } else {
      setter("");
    }
  };

  return (
    <MobileLayout>
      <TooltipProvider>
        {/* Header */}
        <div className="gradient-hero px-4 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/20 backdrop-blur-sm text-primary-foreground hover:bg-background/30"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">Kalkulator Hukum</h1>
              <p className="text-xs text-primary-foreground/70">Estimasi biaya & perhitungan legal</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          <Tabs defaultValue="notary" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="notary" className="text-xs">Notaris</TabsTrigger>
              <TabsTrigger value="inheritance" className="text-xs">Waris</TabsTrigger>
              <TabsTrigger value="severance" className="text-xs">Pesangon</TabsTrigger>
            </TabsList>

            {/* Notary Calculator */}
            <TabsContent value="notary" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Biaya Notaris & Pajak Properti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Nilai Properti</Label>
                    <Input
                      placeholder="Rp 500.000.000"
                      value={propertyValue}
                      onChange={(e) => handleCurrencyInput(e.target.value, setPropertyValue)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Jenis Transaksi</Label>
                    <Select value={transactionType} onValueChange={setTransactionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jual-beli">Jual Beli</SelectItem>
                        <SelectItem value="hibah">Hibah</SelectItem>
                        <SelectItem value="waris">Waris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {notaryResult && (
                <Card className="border-primary/20 bg-primary/5 animate-fade-in">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm">Estimasi Biaya</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          Biaya Notaris
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">1-2.5% dari nilai transaksi</p>
                            </TooltipContent>
                          </Tooltip>
                        </span>
                        <span className="font-medium">{formatCurrency(notaryResult.notaryFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          BPHTB (5%)
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Bea Perolehan Hak Tanah & Bangunan</p>
                            </TooltipContent>
                          </Tooltip>
                        </span>
                        <span className="font-medium">{formatCurrency(notaryResult.bphtb)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Biaya AJB</span>
                        <span className="font-medium">{formatCurrency(notaryResult.ajtbFee)}</span>
                      </div>
                      {notaryResult.pph > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">PPh Penjual (2.5%)</span>
                          <span className="font-medium">{formatCurrency(notaryResult.pph)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-semibold">Total Estimasi</span>
                        <span className="font-bold text-primary">{formatCurrency(notaryResult.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Inheritance Calculator */}
            <TabsContent value="inheritance" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Pembagian Waris (Faraidh)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Total Harta Warisan</Label>
                    <Input
                      placeholder="Rp 1.000.000.000"
                      value={inheritanceValue}
                      onChange={(e) => handleCurrencyInput(e.target.value, setInheritanceValue)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Jumlah Anak</Label>
                      <Input
                        type="number"
                        min="0"
                        value={heirs.children}
                        onChange={(e) => setHeirs({ ...heirs, children: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Pasangan Hidup</Label>
                      <Select
                        value={heirs.spouse ? "ada" : "tidak"}
                        onValueChange={(v) => setHeirs({ ...heirs, spouse: v === "ada" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ada">Ada</SelectItem>
                          <SelectItem value="tidak">Tidak Ada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {inheritanceResult && inheritanceResult.length > 0 && (
                <Card className="border-primary/20 bg-primary/5 animate-fade-in">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm">Pembagian Waris</h4>
                    <div className="space-y-2 text-sm">
                      {inheritanceResult.map((heir, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {heir.name} ({heir.share})
                          </span>
                          <span className="font-medium">{formatCurrency(heir.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      * Perhitungan menggunakan hukum waris Islam (faraidh). Konsultasikan dengan ahli waris untuk pembagian yang akurat.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Severance Calculator */}
            <TabsContent value="severance" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Pesangon & Hak Karyawan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Gaji Bulanan</Label>
                    <Input
                      placeholder="Rp 5.000.000"
                      value={monthlySalary}
                      onChange={(e) => handleCurrencyInput(e.target.value, setMonthlySalary)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Masa Kerja (Tahun)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="5"
                      value={yearsWorked}
                      onChange={(e) => setYearsWorked(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Jenis PHK</Label>
                    <Select value={terminationType} onValueChange={setTerminationType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phk-efisiensi">PHK Efisiensi/Merger</SelectItem>
                        <SelectItem value="phk-pelanggaran">PHK Pelanggaran</SelectItem>
                        <SelectItem value="resign">Resign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {severanceResult && (
                <Card className="border-primary/20 bg-primary/5 animate-fade-in">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm">Estimasi Hak</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Pesangon ({severanceResult.pesangonMonths} bulan)
                        </span>
                        <span className="font-medium">{formatCurrency(severanceResult.pesangon)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          UPMK ({severanceResult.upmkMonths} bulan)
                        </span>
                        <span className="font-medium">{formatCurrency(severanceResult.upmk)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uang Penggantian Hak</span>
                        <span className="font-medium">{formatCurrency(severanceResult.uph)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-semibold">Total Estimasi</span>
                        <span className="font-bold text-primary">{formatCurrency(severanceResult.total)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      * Berdasarkan UU Cipta Kerja. Nilai aktual dapat berbeda tergantung perjanjian kerja.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </MobileLayout>
  );
}
