import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportarCsvButton({ tipo, label = "Exportar CSV" }: { tipo: string; label?: string }) {
  return (
    <Button asChild variant="outline" size="sm">
      <a href={`/api/export?tipo=${tipo}`}>
        <Download className="size-4" />
        {label}
      </a>
    </Button>
  );
}
