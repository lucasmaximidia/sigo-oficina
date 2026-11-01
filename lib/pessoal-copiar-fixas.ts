import { createServiceClient } from "@/lib/supabase/service";
import { mesAtualStr, somarMeses } from "@/lib/pessoal-datas";

// Repete sozinho, todo mês, os lançamentos de cartão marcados como "conta
// fixa" (assinatura, seguro, mensalidade) — sem precisar clicar em "Copiar
// do mês anterior" toda vez. Só insere o que ainda não existe no mês atual,
// então chamar isso toda vez que a página de Pessoal carrega não duplica
// nada. Mesma ideia de reforço de lib/notificacoes-diarias.ts e
// lib/locacao-atraso.ts — por isso usa o cliente de service role, já que
// também pode rodar fora de uma sessão de usuário.
export async function copiarFixasCartaoMesAtual() {
  const supabase = createServiceClient();
  const mesAtual = mesAtualStr();
  const mesAnterior = somarMeses(mesAtual, -1);

  const { data: fixasAnteriores } = await supabase
    .from("pessoal_cartao_lancamentos")
    .select("cartao_id, categoria, descricao, valor_previsto")
    .eq("mes", mesAnterior)
    .eq("eh_fixa", true)
    .is("deletado_em", null);

  if (!fixasAnteriores || fixasAnteriores.length === 0) return;

  const { data: existentesNoMes } = await supabase
    .from("pessoal_cartao_lancamentos")
    .select("cartao_id, descricao")
    .eq("mes", mesAtual)
    .is("deletado_em", null);

  const jaExiste = new Set((existentesNoMes ?? []).map((l) => `${l.cartao_id}::${l.descricao}`));
  const faltando = fixasAnteriores.filter((f) => !jaExiste.has(`${f.cartao_id}::${f.descricao}`));
  if (faltando.length === 0) return;

  await supabase.from("pessoal_cartao_lancamentos").insert(
    faltando.map((f) => ({
      cartao_id: f.cartao_id,
      mes: mesAtual,
      categoria: f.categoria,
      descricao: f.descricao,
      valor_previsto: f.valor_previsto,
      eh_fixa: true,
    }))
  );
}
