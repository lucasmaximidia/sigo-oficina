import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Phone,
  MapPin,
  MessageCircle,
  Award,
  PackageCheck,
  BadgeCheck,
  WashingMachine,
  Wind,
  Utensils,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { formatPhoneBR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SERVICOS = [
  { icon: WashingMachine, label: "Máquina de Lavar", tone: "primary" as const },
  { icon: Wind, label: "Lava e Seca", tone: "action" as const },
  { icon: Utensils, label: "Lava Louças", tone: "success" as const },
];

const DIFERENCIAIS = [
  {
    icon: PackageCheck,
    title: "Peças originais",
    description: "Sem economia na qualidade do reparo — usamos peças originais.",
    tone: "primary" as const,
  },
  {
    icon: Award,
    title: "Mais de 30 anos de tradição",
    description: "Décadas de experiência consertando eletrodomésticos na região.",
    tone: "action" as const,
  },
  {
    icon: BadgeCheck,
    title: "Qualidade",
    description: "Atenção aos detalhes em cada reparo, do diagnóstico à entrega.",
    tone: "success" as const,
  },
];

const MARCAS = [
  "Brastemp",
  "Consul",
  "Electrolux",
  "LG",
  "Panasonic",
  "Midea",
  "Mueller",
  "GE",
  "Continental",
  "Suggar",
  "Colormaq",
];

const TONE_CLASSES = {
  primary: { bg: "bg-primary", soft: "bg-primary/10", text: "text-primary", glow: "bg-primary/25" },
  action: { bg: "bg-action", soft: "bg-action/10", text: "text-action", glow: "bg-action/25" },
  success: { bg: "bg-success", soft: "bg-success/10", text: "text-success", glow: "bg-success/25" },
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("dados_publicos_empresa").maybeSingle();

  const nomeEmpresa = data?.nome_empresa || "Casa dos Reparos";
  const telefoneDigits = data?.telefone?.replace(/\D/g, "") ?? "";
  const telefoneFormatado = data?.telefone ? formatPhoneBR(data.telefone) : null;
  const whatsappHref = telefoneDigits ? `https://wa.me/55${telefoneDigits}` : null;
  const garantiaDias = data?.garantia_prazo_dias ?? 90;

  return (
    <div className="h-dvh overflow-y-auto overscroll-contain bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-6">
          <div className="flex items-center gap-2.5">
            {data?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logo_url} alt={nomeEmpresa} className="h-9 w-auto object-contain" />
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Wrench className="size-5" strokeWidth={2.25} />
              </div>
            )}
            <p className="font-display text-base font-bold text-foreground">{nomeEmpresa}</p>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex">
              <Link href="/garantias/consultar">Consultar garantia</Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="rounded-full">
              <Link href="/login">Entrar</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/banner-servicos.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.07] blur-sm dark:opacity-[0.05]"
          />
          <div className="pointer-events-none absolute inset-0 bg-background/60" />

          <div className="pointer-events-none absolute -top-40 -left-32 size-96 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute top-20 right-0 size-72 rounded-full bg-action/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 size-80 rounded-full bg-success/15 blur-3xl" />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center md:py-24">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3.5 py-1.5 text-xs font-semibold text-success">
              <ShieldCheck className="size-3.5" />
              {garantiaDias} dias de garantia em todos os serviços
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Conserto de eletrodomésticos com quem você confia
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              A {nomeEmpresa} cuida do seu equipamento com diagnóstico honesto, peças de qualidade e prazo de
              entrega combinado com você.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {whatsappHref && (
                <Button asChild size="lg" className="rounded-full px-7">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4.5" />
                    Chamar no WhatsApp
                  </a>
                </Button>
              )}
              <Button asChild variant="secondary" size="lg" className="rounded-full px-7">
                <Link href="/garantias/consultar">
                  <ShieldCheck className="size-4.5" />
                  Consultar minha garantia
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground sm:gap-8">
              <span className="inline-flex items-center gap-1.5">
                <Award className="size-4 text-action" />
                30+ anos de tradição
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="inline-flex items-center gap-1.5">
                <PackageCheck className="size-4 text-primary" />
                Peças originais
              </span>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40 py-16">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <h2 className="text-center font-display text-3xl font-bold text-foreground">O que a gente conserta</h2>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {SERVICOS.map(({ icon: Icon, label, tone }) => {
                const t = TONE_CLASSES[tone];
                return (
                  <div
                    key={label}
                    className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
                  >
                    <div className={`pointer-events-none absolute -top-6 -right-6 size-20 rounded-full ${t.glow} blur-2xl`} />
                    <div className={`relative flex size-14 items-center justify-center rounded-2xl ${t.bg} text-white shadow-md`}>
                      <Icon className="size-7" />
                    </div>
                    <p className="relative text-sm font-semibold text-foreground">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-center font-display text-3xl font-bold text-foreground">Por que escolher a gente</h2>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {DIFERENCIAIS.map(({ icon: Icon, title, description, tone }) => {
                const t = TONE_CLASSES[tone];
                return (
                  <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className={`flex size-12 items-center justify-center rounded-2xl ${t.soft} ${t.text}`}>
                      <Icon className="size-6" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40 py-16">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <h2 className="text-center font-display text-3xl font-bold text-foreground">Marcas que atendemos</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {MARCAS.map((marca) => (
                <span
                  key={marca}
                  className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground shadow-sm"
                >
                  {marca}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-border bg-primary py-16 text-primary-foreground">
          <div className="pointer-events-none absolute -top-24 -left-10 size-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 size-72 rounded-full bg-action/25 blur-3xl" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck className="size-7" />
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold">Já é nosso cliente?</h2>
            <p className="mt-2 max-w-md text-sm text-primary-foreground/80">
              Consulte a validade da garantia do seu reparo digitando o telefone usado no cadastro.
            </p>
            <Button asChild variant="secondary" size="lg" className="mt-6 rounded-full px-7">
              <Link href="/garantias/consultar">Consultar garantia</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:px-6">
          <div className="flex items-center gap-2.5">
            {data?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logo_url} alt={nomeEmpresa} className="h-8 w-auto object-contain" />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wrench className="size-4" strokeWidth={2.25} />
              </div>
            )}
            <p className="text-sm font-bold text-foreground">{nomeEmpresa}</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground sm:flex-row sm:gap-5">
            {telefoneFormatado && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {telefoneFormatado}
              </span>
            )}
            {data?.endereco && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {data.endereco}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/70">
            &copy; {new Date().getFullYear()} {nomeEmpresa} ·{" "}
            <Link href="/login" className="hover:underline">
              Acesso da equipe
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
