"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { criarIcone } from "@/lib/locacao-actions";

export function IconeDialog() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await criarIcone(formData);
        toast.success("Ícone adicionado");
        setOpen(false);
        setPreview(null);
        formRef.current?.reset();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao adicionar ícone");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" />
          Novo ícone
        </Button>
      </DialogTrigger>
      <DialogContent className="locacao-theme">
        <DialogHeader>
          <DialogTitle>Novo ícone</DialogTitle>
          <DialogDescription>
            Use uma imagem com fundo e estilo parecidos com os ícones já cadastrados, pra manter o visual consistente.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Pré-visualização" className="size-full object-contain" />
              ) : (
                <ImageIcon className="size-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <Label htmlFor="arquivo" className="mb-1.5 block">
                Imagem
              </Label>
              <Input id="arquivo" name="arquivo" type="file" accept="image/*" required onChange={handleFileChange} />
              <p className="mt-1 text-xs text-muted-foreground">PNG, SVG ou WebP com fundo.</p>
            </div>
          </div>
          <div>
            <Label htmlFor="nome" className="mb-1.5 block">
              Nome
            </Label>
            <Input id="nome" name="nome" required placeholder="Ex.: Quadriciclo vermelho" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              <Upload className="size-4" />
              {isPending ? "Enviando..." : "Adicionar ícone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
