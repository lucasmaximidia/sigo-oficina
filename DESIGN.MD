---
name: SIGO Oficina Interface
colors:
  background: '#f4f5fb'
  foreground: '#14162a'
  card: '#ffffff'
  card-foreground: '#14162a'
  popover: '#ffffff'
  popover-foreground: '#14162a'
  primary: '#2542b8'
  primary-hover: '#1e3593'
  primary-foreground: '#ffffff'
  action: '#e2793d'
  action-hover: '#c96a30'
  action-foreground: '#ffffff'
  secondary: '#eceefa'
  secondary-foreground: '#4a4d68'
  muted: '#eceefa'
  muted-foreground: '#6b6e85'
  accent: '#e9ecfa'
  accent-foreground: '#2542b8'
  destructive: '#dc2626'
  destructive-foreground: '#ffffff'
  success: '#4f7a24'
  success-foreground: '#ffffff'
  warning: '#f59e0b'
  warning-foreground: '#7c4a05'
  info: '#2563eb'
  info-foreground: '#ffffff'
  border: '#dfe1f0'
  input: '#cfd3ea'
  ring: '#2542b8'
  sidebar: '#ffffff'
  sidebar-foreground: '#14162a'
  sidebar-border: '#eceefa'
  sidebar-active: '#e9ecfa'
  sidebar-active-foreground: '#2542b8'
colors-dark:
  background: '#0e1018'
  foreground: '#eceefb'
  card: '#171a28'
  primary: '#6a86ff'
  action: '#e2793d'
  destructive: '#f0605c'
  success: '#9ccc65'
  warning: '#fbbf24'
  info: '#60a5fa'
  border: '#262b40'
  sidebar: '#0c0e17'
typography:
  sans: Inter (var(--font-inter)) — corpo, tabelas, formulários
  display: Space Grotesk (var(--font-display), com fallback para Inter) — títulos e números grandes (stat cards)
rounded:
  base: 0.75rem
  sm: calc(base - 6px)   # 6px
  md: calc(base - 2px)   # 10px
  lg: base                # 12px
  xl: calc(base + 6px)   # 18px
  full: pill (badges, avatars, dots de status)
spacing:
  card-padding-mobile: 1rem (16px)
  card-padding-desktop: 1.25rem (20px), via `md:p-5`
  page-gap: 1.25rem–1.5rem entre seções
---

## Como este arquivo se mantém correto

Este documento descreve o sistema de design **como ele existe hoje no código**, não uma aspiração. A fonte da verdade são os arquivos abaixo — se você mudar um deles, atualize este arquivo na mesma alteração:

- `app/globals.css` — tokens de cor (`:root` / `.dark`), radius, fontes (`@theme inline`).
- `app/layout.tsx` — carregamento das fontes (Inter + Space Grotesk).
- `components/ui/*` — variantes reais de botão, badge, card, input etc. (shadcn/ui + CVA).

## Brand & Style

O SIGO Oficina é um sistema de gestão para uma oficina de conserto de eletrodomésticos (2 usuários). A identidade visual combina uma base **shadcn/ui** (cards, tabelas e formulários previsíveis, focados em uso diário rápido) com uma cor de marca própria — indigo como primária, laranja como cor de ação/destaque — em vez da paleta zinc/slate padrão do shadcn.

Duas telas usam um tratamento visual mais elaborado, deliberadamente distinto do resto do app: a página de **login** (logo em ícone, glow de fundo com círculos borrados, ícones nos inputs) e a aba **Configurações → Etiquetas** (ilustração de impressora térmica, preview ao vivo "saindo" da impressora). O restante do app (dashboard, OS, estoque, financeiro, agenda, orçamentos, PDV, clientes, garantias) segue o padrão mais neutro de cards/tabelas/badges descrito abaixo.

## Cores

- **Primary** (`#2542b8`, indigo): ações primárias em contexto neutro, foco de inputs (`ring`), ícones de destaque em cabeçalhos de card, links.
- **Action** (`#e2793d`, laranja): usado como cor do **botão primário padrão** (`Button` variant `default`) — CTA principal de cada tela.
- **Secondary/Muted/Accent** (`#eceefa`/`#e9ecfa`, lilás bem claro): fundos de hover, badges neutras, superfícies "rebaixadas".
- **Semântico**: `success` (verde), `warning` (âmbar), `destructive` (vermelho), `info` (azul) — usados em `Badge`, bordas/fundos tintados de card (ex.: cartão de alerta com `border-destructive/30 bg-destructive/5`) e dots de status.
- **Dark mode**: paleta paralela completa em `.dark` (fundo quase preto `#0e1018`, primary clareado para `#6a86ff` para manter contraste) — alternável via `components/layout/theme-toggle.tsx`, persistido em `localStorage`.

## Tipografia

Duas famílias, carregadas via `next/font` em `app/layout.tsx`:

- **Inter** (`font-sans`, padrão do `<body>`): todo o corpo de texto, tabelas, labels, formulários.
- **Space Grotesk** (`font-display`, com fallback para Inter): reservada para títulos de página e números grandes — por exemplo os valores de KPI no dashboard (`font-display text-2xl font-bold`). Usar com moderação; a maior parte da interface é `font-sans`.

## Raio e formas

Escala derivada de uma única variável (`--radius: 0.75rem`), não de valores soltos:

- `sm` (6px): elementos pequenos.
- `md` (10px): inputs, botões `sm`.
- `lg` (12px): cards, botões padrão — o raio "base" do sistema.
- `xl` (18px): superfícies grandes/destacadas.
- `full`: badges, avatares, dots de status.

## Componentes principais (`components/ui/*`)

- **Button** (`button.tsx`): variantes `default` (laranja, cor de ação — CTA principal), `secondary` (outline indigo), `outline`, `ghost`, `destructive`, `link`. Alturas: `sm` 36px, padrão 40px, `lg` 44–48px.
- **Badge** (`badge.tsx`): pill (`rounded-full`), fundo tintado a 10–15% de opacidade da cor semântica + texto na cor cheia — variantes `default/secondary/success/warning/destructive/info/outline`. É o padrão para comunicar status (situação da OS, conta a pagar, garantia).
- **Card** (`card.tsx`): `rounded-xl border bg-card shadow-sm`, com `CardHeader`/`CardTitle`/`CardContent`/`CardFooter`. Padding responsivo (`p-4` no mobile, `md:p-5` no desktop) — ao sobrescrever o padding de um `CardContent`, sempre inclua o par `md:` correspondente (ex.: `p-6 md:pt-6`), já que a classe `md:` própria do componente não é sobrescrita por uma classe sem prefixo.
- **Table**: tabelas shadcn (`Table`/`TableRow`/`TableCell`) no desktop; para listas que também precisam funcionar em telas pequenas, o padrão atual é uma segunda marcação em cards (`hidden md:block` na tabela + `md:hidden` na lista) — não um componente responsivo único.
- Ícones: `lucide-react`, usados de forma consistente ao lado de todo título de card e item de navegação (não é só decoração — reforça o que cada seção representa).

## Layout & Responsividade

- Casca do app (`app/(app)/layout.tsx`): sidebar fixa no desktop + navegação inferior fixa no mobile (`components/layout/mobile-bottom-nav.tsx`), com PWA habilitado (manifest, ícones).
- Sem grid rígido de 12 colunas — layouts usam `grid`/`flex` com breakpoints Tailwind padrão (`sm`/`md`/`lg`) ajustados por tela, não uma régua fixa de containers.
- Cobertura de responsividade é sólida mas desigual entre telas — páginas com listas grandes (OS, Clientes) tratam desktop/mobile explicitamente; páginas mais simples dependem menos de breakpoints dedicados.

## Estados vazios, carregamento e erro

- **Vazio**: mensagem curta e centralizada em `text-muted-foreground` (ex.: "Nenhuma ordem de serviço encontrada."). Hoje é só texto — ver oportunidade de melhoria no backlog de design do produto.
- **Carregamento**: `components/ui/skeleton.tsx`, usado via `loading.tsx` por rota, desenhado para imitar o layout real (grid de cards/tabela), não um spinner genérico.
- **Erro/404**: ainda não há `error.tsx`/`not-found.tsx` dedicados — pendente.
