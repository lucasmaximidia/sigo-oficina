import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Rotas acessíveis sem login: a tela de login, o site institucional público
// (raiz + assets estáticos em /site), a consulta de garantia por telefone, a
// verificação pública de garantia, o contrato de locação completo (acessados
// pelo cliente via QR code), a renovação de aluguel por link (mandado pelo
// WhatsApp) e o PDF do contrato (baixado da própria página pública, depois
// de assinado) — nenhuma exige conta no sistema. A rota do PDF (/api/locacao)
// também é usada pela equipe logada; a função da rota decide o que cada um
// pode baixar, aqui só liberamos o acesso sem redirecionar pro login.
const ROTAS_PUBLICAS = [
  "/login",
  "/",
  "/site",
  "/garantias/verificar",
  "/garantias/consultar",
  "/locacao/contrato",
  "/locacao/renovar",
  "/api/locacao",
];

function isRotaPublica(pathname: string) {
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() revalida o token direto com o Supabase Auth (ao contrário de
  // getSession(), que só lê o cookie local) — é a forma segura de checar
  // login dentro do middleware.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isRotaPublica(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
