import { useState } from "react";
import { ArrowLeft, Download, FileText, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  downloadCount: number;
  fileSize: string;
}

const documentTemplates: DocumentTemplate[] = [
  {
    id: "1",
    name: "Surat Kuasa Umum",
    category: "Perdata",
    description: "Template surat kuasa untuk keperluan umum seperti pengurusan dokumen.",
    downloadCount: 1250,
    fileSize: "45 KB",
  },
  {
    id: "2",
    name: "Perjanjian Sewa Menyewa",
    category: "Pertanahan",
    description: "Kontrak sewa menyewa properti lengkap dengan klausul standar.",
    downloadCount: 890,
    fileSize: "62 KB",
  },
  {
    id: "3",
    name: "Surat Gugatan Perceraian",
    category: "Keluarga",
    description: "Template gugatan cerai untuk diajukan ke Pengadilan Agama/Negeri.",
    downloadCount: 2100,
    fileSize: "55 KB",
  },
  {
    id: "4",
    name: "Kontrak Kerja Karyawan",
    category: "Ketenagakerjaan",
    description: "Perjanjian kerja waktu tertentu (PKWT) sesuai UU Ketenagakerjaan.",
    downloadCount: 1800,
    fileSize: "78 KB",
  },
  {
    id: "5",
    name: "Akta Pendirian PT",
    category: "Bisnis",
    description: "Template akta pendirian Perseroan Terbatas standar.",
    downloadCount: 650,
    fileSize: "95 KB",
  },
  {
    id: "6",
    name: "Surat Perjanjian Jual Beli Tanah",
    category: "Pertanahan",
    description: "Akta jual beli tanah/bangunan lengkap dengan syarat dan ketentuan.",
    downloadCount: 1450,
    fileSize: "72 KB",
  },
  {
    id: "7",
    name: "Surat Wasiat",
    category: "Keluarga",
    description: "Template wasiat untuk pembagian harta warisan.",
    downloadCount: 520,
    fileSize: "48 KB",
  },
  {
    id: "8",
    name: "Somasi / Teguran Hukum",
    category: "Perdata",
    description: "Surat somasi untuk teguran sebelum melakukan upaya hukum.",
    downloadCount: 980,
    fileSize: "38 KB",
  },
  {
    id: "9",
    name: "Perjanjian Kerjasama Bisnis",
    category: "Bisnis",
    description: "MoU dan kontrak kerjasama antar pihak bisnis.",
    downloadCount: 720,
    fileSize: "85 KB",
  },
  {
    id: "10",
    name: "Surat Resign / Pengunduran Diri",
    category: "Ketenagakerjaan",
    description: "Template surat pengunduran diri profesional.",
    downloadCount: 1100,
    fileSize: "25 KB",
  },
];

const categories = ["Semua", "Perdata", "Pertanahan", "Keluarga", "Ketenagakerjaan", "Bisnis"];

export default function DocumentTemplates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const filteredTemplates = documentTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (template: DocumentTemplate) => {
    toast.success(`Mengunduh ${template.name}...`);
    // In real app, this would trigger actual file download
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="gradient-hero px-4 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/20 backdrop-blur-sm text-primary-foreground hover:bg-background/30"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-primary-foreground">Template Dokumen</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/95 border-0"
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template List */}
        <div className="space-y-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="animate-fade-in">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{template.name}</h3>
                        <Badge variant="tag" className="text-[10px] mt-1">{template.category}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{template.fileSize}</span>
                        <span>{template.downloadCount.toLocaleString()} unduhan</span>
                      </div>
                      <Button
                        size="sm"
                        variant="gradient"
                        className="h-8 text-xs gap-1"
                        onClick={() => handleDownload(template)}
                      >
                        <Download className="w-3 h-3" />
                        Unduh
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">Tidak ada template ditemukan</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
