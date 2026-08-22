"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadLogoEtiqueta, removerLogoEtiqueta } from "@/lib/actions";

export function EtiquetaLogoUpload({ logoUrl }: { logoUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(logoUrl);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const formData = new FormData();
    formData.set("logo", file);
    startTransition(async () => {
      try {
        const url = await uploadLogoEtiqueta(formData);
        setPreview(url);
        toast.success("Logo da etiqueta atualizada");
      } catch (error) {
        setPreview(logoUrl);
        toast.error(error instanceof Error ? error.message : "Erro ao enviar a logo");
      }
    });
  }

  function handleRemover() {
    startTransition(async () => {
      try {
        await removerLogoEtiqueta();
        setPreview(null);
        toast.success("Logo da etiqueta removida");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover a logo");
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Logo da etiqueta" className="size-full object-contain" />
        ) : (
          <ImageIcon className="size-8 text-muted-foreground" />
        )}
      </div>
      <div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" />
            {isPending ? "Enviando..." : preview ? "Trocar Logo" : "Enviar Logo"}
          </Button>
          {preview && (
            <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={handleRemover}>
              <X className="size-4" />
              Remover
            </Button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          PNG, JPG ou SVG até 2MB. Ideal em formato horizontal (larga e baixa).
        </p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  );
}
