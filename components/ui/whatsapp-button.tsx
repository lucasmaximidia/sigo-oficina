import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatsappButton({ telefone, className }: { telefone?: string | null; className?: string }) {
  const digits = telefone?.replace(/\D/g, "");
  if (!digits) return null;

  return (
    <a
      href={`https://wa.me/55${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir conversa no WhatsApp"
      aria-label="Abrir conversa no WhatsApp"
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-success hover:bg-success/10",
        className
      )}
    >
      <MessageCircle className="size-4" />
    </a>
  );
}
