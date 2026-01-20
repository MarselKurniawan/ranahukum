import { useState } from "react";
import { FileText, Image, ExternalLink, X, ZoomIn, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentPreviewCardProps {
  title: string;
  fileUrl: string | null;
  description?: string;
  showPreview?: boolean;
}

export function DocumentPreviewCard({ 
  title, 
  fileUrl, 
  description,
  showPreview = true
}: DocumentPreviewCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!fileUrl) {
    return (
      <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xs text-muted-foreground/70">Belum diupload</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
  const isPdf = /\.pdf$/i.test(fileUrl);

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-elevated transition-all border-success/20 bg-success/5"
        onClick={() => showPreview && setIsOpen(true)}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {isImage ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img 
                  src={fileUrl} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground truncate">{description}</p>
              )}
            </div>
            {showPreview && (
              <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base">{title}</DialogTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => window.open(fileUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <a href={fileUrl} download>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </DialogHeader>
          <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
            {isImage ? (
              <img 
                src={fileUrl} 
                alt={title}
                className="max-w-full mx-auto rounded-lg"
              />
            ) : isPdf ? (
              <iframe
                src={fileUrl}
                className="w-full h-[70vh] rounded-lg"
                title={title}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Preview tidak tersedia</p>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="gradient">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Buka di Tab Baru
                  </Button>
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
