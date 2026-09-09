import { LoginForm } from "@/app/login/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">SIGO Oficina</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre com sua conta para continuar</p>
        </div>
        <LoginForm redirectTo={redirect} />
      </div>
    </div>
  );
}
