import type { ReactNode } from "react";

// Tela de status "solta" (sem a casca do app — sidebar/topbar), usada fora
// da área autenticada: 404 de uma URL que não bate com nenhuma rota e erro
// de uma página fora de app/(app) (ex.: login). Reaproveita o mesmo
// tratamento visual da tela de login (logo em ícone + glow de fundo).
export function StatusScreen({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-80 rounded-full bg-action/15 blur-3xl" />

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          {icon}
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {children && <div className="mt-6 flex items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}
