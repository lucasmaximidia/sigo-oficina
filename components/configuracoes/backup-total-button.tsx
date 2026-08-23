"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DatabaseBackup } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BackupTotalButton() {
  const [baixando, setBaixando] = useState(false);

  async function handleBackup() {
    setBaixando(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("Erro ao gerar backup");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const nomeArquivo = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? "backup-sigo-oficina.json";
      const a = document.createElement("a");
      a.href = url;
      a.download = nomeArquivo;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup gerado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar backup");
    } finally {
      setBaixando(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-2.5">
          <DatabaseBackup className="size-4.5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Backup Total</p>
            <p className="text-xs text-muted-foreground">
              Baixa um arquivo com todos os dados do sistema (clientes, OS, estoque, financeiro, agenda etc.).
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleBackup} disabled={baixando}>
          {baixando ? "Gerando..." : "Baixar Backup"}
        </Button>
      </CardContent>
    </Card>
  );
}
