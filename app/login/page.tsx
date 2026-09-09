import { Wrench } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-80 rounded-full bg-action/15 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Wrench className="size-7" strokeWidth={2.25} />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">SIGO Oficina</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Entre com sua conta para continuar</p>
        </div>
        <LoginForm redirectTo={redirect} />
      </div>
    </div>
  );
}
