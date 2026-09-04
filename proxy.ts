import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas, exceto:
     * - _next/static, _next/image (assets do Next.js)
     * - arquivos estáticos (ícones, manifesto, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|apple-icon|icon|manifest.webmanifest).*)",
  ],
};
