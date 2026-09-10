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
  { icon: WashingMachine, label: "Máquina de Lavar" },
  { icon: Wind, label: "Lava e Seca" },
  { icon: Utensils, label: "Lava Louças" },
];

const DIFERENCIAIS = [
  { icon: PackageCheck, title: "Peças originais", description: "Sem economia na qualidade do reparo — usamos peças originais." },
  { icon: Award, title: "Mais de 30 anos de tradição", description: "Décadas de experiência consertando eletrodomésticos na região." },
  { icon: BadgeCheck, title: "Qualidade", description: "Atenção aos detalhes em cada reparo, do diagnóstico à entrega." },
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
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
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
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/garantias/consultar">Consultar garantia</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-24 size-80 rounded-full bg-action/15 blur-3xl" />

          <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3.5 py-1.5 text-xs font-semibold text-success">
                <ShieldCheck className="size-3.5" />
                {garantiaDias} dias de garantia em todos os serviços
              </span>
              <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Conserto de eletrodomésticos com quem você confia
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                A {nomeEmpresa} cuida do seu equipamento com diagnóstico honesto, peças de qualidade e prazo de
                entrega combinado com você.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {whatsappHref && (
                  <Button asChild size="lg">
                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="size-4.5" />
                      Chamar no WhatsApp
                    </a>
                  </Button>
                )}
                <Button asChild variant="secondary" size="lg">
                  <Link href="/garantias/consultar">
                    <ShieldCheck className="size-4.5" />
                    Consultar minha garantia
                  </Link>
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/site/banner-servicos.webp" alt="Serviços da oficina" className="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40 py-14">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <h2 className="text-center font-display text-2xl font-bold text-foreground">O que a gente conserta</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {SERVICOS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center shadow-sm"
                >
                  <div className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
                    <Icon className="size-5.5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-center font-display text-2xl font-bold text-foreground">Por que escolher a gente</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {DIFERENCIAIS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40 py-14">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <h2 className="text-center font-display text-2xl font-bold text-foreground">Marcas que atendemos</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
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

        <section className="border-t border-border bg-primary py-14 text-primary-foreground">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
            <ShieldCheck className="size-9" />
            <h2 className="mt-3 font-display text-2xl font-bold">Já é nosso cliente?</h2>
            <p className="mt-2 max-w-md text-sm text-primary-foreground/80">
              Consulte a validade da garantia do seu reparo digitando o telefone usado no cadastro.
            </p>
            <Button asChild variant="secondary" size="lg" className="mt-6">
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
