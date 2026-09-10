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
  Search,
  UserCog,
  CalendarCheck,
  Clock,
  Users,
  ThumbsUp,
  Gem,
  Target,
  HeartHandshake,
  Home,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { formatPhoneBR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const HERO_FEATURES = [
  { icon: Wrench, label: "Conserto de Lavadoras" },
  { icon: Search, label: "Diagnóstico Preciso" },
  { icon: UserCog, label: "Técnicos Especializados" },
  { icon: PackageCheck, label: "Peças Originais" },
  { icon: CalendarCheck, label: "Atendimento Agendado" },
  { icon: ShieldCheck, label: "Serviço com Garantia" },
];

const FEATURE_STRIP = [
  { icon: Clock, title: "Atendimento com horário agendado", description: "Mais comodidade e menos espera." },
  { icon: ShieldCheck, title: "Serviço com garantia", description: "Segurança para o seu dia a dia." },
  { icon: Users, title: "Equipe especializada", description: "Profissionais capacitados e experientes." },
];

const SERVICOS = [
  {
    image: "/site/produto-lava-e-seca.webp",
    label: "Lava e Seca",
    description: "Diagnóstico e reparo de todos os modelos, com peças originais e garantia.",
    tone: "action" as const,
  },
  {
    image: "/site/produto-maquina-lavar.webp",
    label: "Máquina de Lavar",
    description: "Conserto, manutenção preventiva e corretiva para diversas marcas.",
    tone: "primary" as const,
  },
  {
    image: "/site/produto-lava-loucas.webp",
    label: "Lava Louças",
    description: "Assistência especializada para deixar sua lava-louças funcionando perfeitamente.",
    tone: "success" as const,
  },
];

const VALORES = [
  { icon: Gem, label: "Qualidade" },
  { icon: ThumbsUp, label: "Confiança" },
  { icon: Award, label: "Experiência" },
  { icon: HeartHandshake, label: "Atendimento Humanizado" },
  { icon: Target, label: "Solução Completa" },
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
  { nome: "LG", logo: null },
  { nome: "Panasonic", logo: null },
  { nome: "Midea", logo: null },
  { nome: "Mueller", logo: null },
  { nome: "GE", logo: "/site/marcas/ge.png" },
  { nome: "Continental", logo: "/site/marcas/continental.png" },
  { nome: "Suggar", logo: "/site/marcas/suggar.png" },
  { nome: "Colormaq", logo: "/site/marcas/colormaq.png" },
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2.5">
            {data?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logo_url} alt={nomeEmpresa} className="h-9 w-auto object-contain" />
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Wrench className="size-5" strokeWidth={2.25} />
              </div>
            )}
            <div className="leading-tight">
              <p className="font-display text-base font-bold text-foreground">{nomeEmpresa}</p>
              <p className="hidden text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase sm:block">
                Assistência técnica especializada
              </p>
            </div>
          </div>
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
            {whatsappHref && (
              <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <CalendarCheck className="size-4" />
                  Agendar Atendimento
                </a>
              </Button>
            )}
            <Button
              asChild
              size="sm"
              className="rounded-full bg-primary-hover text-action hover:bg-primary"
            >
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/banner-fundo.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full origin-right scale-110 object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background from-40% to-transparent" />
          <div className="absolute inset-0 bg-background/10 dark:bg-background/40" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/logo-mark.png"
            alt={nomeEmpresa}
            className="absolute top-6 right-6 hidden h-20 w-auto drop-shadow-lg sm:block md:top-8 md:right-10 md:h-28"
          />

          <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3.5 py-1.5 text-xs font-semibold text-success">
                <ShieldCheck className="size-3.5" />
                {garantiaDias} dias de garantia em todos os serviços
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Seu eletrodoméstico
                <br />
                <span className="text-primary">em boas mãos.</span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Assistência técnica especializada com qualidade, agilidade e confiança.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {HERO_FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon className="size-4.5" />
                    </div>
                    <p className="text-xs leading-tight font-medium text-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="h-px w-8 bg-primary" />
                Do defeito à solução, sem complicação!
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
            </div>
          </div>

          <div className="relative mx-auto hidden max-w-6xl justify-end px-4 pb-8 md:flex md:px-6">
            <div className="flex max-w-xs items-center gap-3 rounded-2xl bg-card/95 px-4 py-3 shadow-lg ring-1 ring-border backdrop-blur">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Home className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Sua rotina não pode parar. <span className="text-muted-foreground">Nós cuidamos do resto.</span>
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40 py-10">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-3 md:px-6">
            {FEATURE_STRIP.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-center gap-3">
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
              {SERVICOS.map(({ image, label, description, tone }) => {
                const t = TONE_CLASSES[tone];
                const saibaMaisHref = whatsappHref
                  ? `${whatsappHref}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre o conserto de ${label}.`)}`
                  : "/garantias/consultar";
                return (
                  <div key={label} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={label} className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                      <a
                        href={saibaMaisHref}
                        target={whatsappHref ? "_blank" : undefined}
                        rel={whatsappHref ? "noopener noreferrer" : undefined}
                        className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold ${t.text} hover:underline`}
                      >
                        Saiba mais
                        <ArrowRight className="size-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {VALORES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Icon className="size-4.5 text-primary" />
                  {label}
                </div>
              ))}
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

        <section id="marcas" className="py-16">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <h2 className="text-center font-display text-3xl font-bold text-foreground">Marcas que atendemos</h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {MARCAS.map(({ nome, logo }) =>
                logo ? (
                  <div
                    key={nome}
                    className="flex h-14 w-32 items-center justify-center rounded-xl border border-border bg-card p-2.5 shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo} alt={nome} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <span
                    key={nome}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground shadow-sm"
                  >
                    {nome}
                  </span>
                )
              )}
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

      <footer id="contato" className="border-t border-border py-10">
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
