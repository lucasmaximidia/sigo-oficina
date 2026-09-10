import Link from "next/link";
import {
  ShieldCheck,
  Settings,
  CalendarCheck,
  Handshake,
  Phone,
  MapPin,
  MessageCircle,
  PackageCheck,
  Award,
  BadgeCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { formatPhoneBR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const BENEFICIOS = [
  { icon: ShieldCheck, title: "Peças Originais", description: "Mais durabilidade e segurança." },
  { icon: Settings, title: "Técnicos Especializados", description: "Diagnóstico preciso." },
  { icon: CalendarCheck, title: "Atendimento Agendado", description: "Mais comodidade para você." },
  { icon: Handshake, title: "Serviço com Garantia", description: "Tranquilidade em cada serviço." },
];

const SERVICOS = [
  { image: "/site/produto-lava-e-seca.webp", label: "Lava e Seca" },
  { image: "/site/produto-maquina-lavar.webp", label: "Máquina de Lavar" },
  { image: "/site/produto-lava-loucas.webp", label: "Lava Louças" },
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
  { nome: "Brastemp", logo: "/site/marcas/brastemp.png" },
  { nome: "Consul", logo: "/site/marcas/consul.png" },
  { nome: "Electrolux", logo: "/site/marcas/electrolux.png" },
  { nome: "LG", logo: "/site/marcas/lg.png" },
  { nome: "Panasonic", logo: "/site/marcas/panasonic.png" },
  { nome: "Midea", logo: "/site/marcas/midea.png" },
  { nome: "Mueller", logo: "/site/marcas/mueller.png" },
  { nome: "GE", logo: "/site/marcas/ge.png" },
  { nome: "Continental", logo: "/site/marcas/continental.png" },
  { nome: "Suggar", logo: "/site/marcas/suggar.png" },
  { nome: "Colormaq", logo: "/site/marcas/colormaq.png" },
];

const TONE_CLASSES = {
  primary: { soft: "bg-primary/10", text: "text-primary" },
  action: { soft: "bg-action/10", text: "text-action" },
  success: { soft: "bg-success/10", text: "text-success" },
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("dados_publicos_empresa").maybeSingle();

  const nomeEmpresa = data?.nome_empresa || "Casa dos Reparos";
  const telefoneDigits = data?.telefone?.replace(/\D/g, "") ?? "";
  const telefoneFormatado = data?.telefone ? formatPhoneBR(data.telefone) : null;
  const whatsappHref = telefoneDigits ? `https://wa.me/55${telefoneDigits}` : null;

  return (
    <div className="h-dvh overflow-y-auto overscroll-contain bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 md:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data?.logo_url || "/site/logo-completo.png"}
            alt={nomeEmpresa}
            className="h-11 w-auto object-contain md:h-12"
          />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            <a href="#" className="text-primary">
              Início
            </a>
            <a href="#servicos" className="hover:text-foreground">
              Serviços
            </a>
            <a href="#marcas" className="hover:text-foreground">
              Marcas
            </a>
            <a href="#sobre" className="hover:text-foreground">
              Sobre Nós
            </a>
            <a href="#contato" className="hover:text-foreground">
              Contato
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex">
              <Link href="/garantias/consultar">Consultar garantia</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-primary-hover text-action hover:bg-primary">
              <Link href="/login">Entrar</Link>
            </Button>
            {whatsappHref && (
              <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  Agendar Atendimento
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="absolute inset-x-0 top-1/2 hidden aspect-[1440/610] w-full -translate-y-1/2 sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/site/banner-fundo.webp" alt="" aria-hidden="true" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background from-40% to-transparent" />
            <div className="absolute inset-0 bg-background/10 dark:bg-background/40" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <div className="max-w-xl">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Seu eletrodoméstico
                <br />
                <span className="text-primary">em boas mãos.</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Assistência técnica especializada
                <br />
                em lavadoras de roupas das principais marcas.
              </p>

              {whatsappHref && (
                <Button asChild size="lg" className="mt-7 rounded-full px-7">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4.5" />
                    Solicitar atendimento
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40 py-10">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:px-6 lg:grid-cols-4 lg:divide-x lg:divide-border">
            {BENEFICIOS.map(({ icon: Icon, title, description }, i) => (
              <div key={title} className={`flex items-center gap-3 ${i > 0 ? "lg:pl-6" : ""}`}>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="servicos" className="py-16">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-foreground">
                Nossos <span className="text-primary">Serviços</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Manutenção e conserto de eletrodomésticos com excelência.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {SERVICOS.map(({ image, label }) => {
                const href = whatsappHref
                  ? `${whatsappHref}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre o conserto de ${label}.`)}`
                  : "/garantias/consultar";
                return (
                  <a
                    key={label}
                    href={href}
                    target={whatsappHref ? "_blank" : undefined}
                    rel={whatsappHref ? "noopener noreferrer" : undefined}
                    className="block overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={label} className="h-auto w-full" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section id="sobre" className="border-t border-border bg-secondary/40 py-16">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-foreground">Por que escolher a gente</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A {nomeEmpresa} é uma assistência técnica especializada em eletrodomésticos, com mais de 30 anos de
                tradição cuidando dos equipamentos da sua casa com honestidade e capricho.
              </p>
            </div>
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

        <section id="marcas" className="relative overflow-hidden py-16">
          <div className="mx-auto max-w-5xl px-4 text-center md:px-6">
            <div className="flex items-center justify-center gap-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              <span className="h-px w-10 bg-primary/40" />
              Qualidade em cada lavagem
              <span className="h-px w-10 bg-primary/40" />
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
              Marcas que <span className="text-primary">atendemos</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Assistência técnica especializada em lavadoras de roupas das principais marcas do mercado.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {MARCAS.map(({ nome, logo }) => (
                <div
                  key={nome}
                  className="flex h-16 w-36 items-center justify-center rounded-xl border border-border bg-card p-3 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt={nome} className="h-full w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contato" className="bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">Precisa de assistência para sua lavadora?</h2>
              <p className="mt-2 text-sm text-background/70">Do defeito à solução, sem complicação.</p>
            </div>
            {whatsappHref && (
              <Button
                asChild
                size="lg"
                className="shrink-0 rounded-full bg-primary px-7 text-primary-foreground hover:bg-primary-hover"
              >
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  Agendar atendimento
                </a>
              </Button>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-background/15 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                {nomeEmpresa} <span className="text-background/50">•</span> Assistência técnica especializada
              </p>
              <p className="mt-1 text-background/60">Atendimento profissional, peças originais e serviço com garantia.</p>
            </div>
            <div className="flex flex-col items-start gap-1.5 text-background/70 sm:items-end">
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
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-background/15 pt-6 text-xs text-background/50 sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()} {nomeEmpresa}
            </p>
            <Link href="/login" className="hover:text-background hover:underline">
              Acesso da equipe
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
