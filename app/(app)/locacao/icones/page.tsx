import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { IconeDialog } from "@/components/locacao/icone-dialog";
import { IconeCard } from "@/components/locacao/icone-card";

export const dynamic = "force-dynamic";

export default async function LocacaoIconesPage() {
  const supabase = await createClient();

  const [{ data: icones }, { data: veiculos }] = await Promise.all([
    supabase.from("locacao_icones").select("*").order("created_at", { ascending: true }),
    supabase.from("locacao_veiculos").select("foto_url"),
  ]);

  const usoPorUrl = new Map<string, number>();
  for (const v of veiculos ?? []) {
    if (!v.foto_url) continue;
    usoPorUrl.set(v.foto_url, (usoPorUrl.get(v.foto_url) ?? 0) + 1);
  }

  return (
    <div>
      <PageHeader
        title="Ícones"
        description="Ícones usados nos cards dos veículos — adicione novos quando chegar um modelo diferente"
        actions={<IconeDialog />}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {(icones ?? []).map((icone) => (
          <IconeCard key={icone.id} icone={icone} emUso={usoPorUrl.get(icone.arquivo_url) ?? 0} />
        ))}
        {(icones ?? []).length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">Nenhum ícone cadastrado ainda.</p>
            <IconeDialog />
          </div>
        )}
      </div>
    </div>
  );
}
