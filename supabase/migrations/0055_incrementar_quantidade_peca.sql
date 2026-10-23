-- ========== Incremento atômico de estoque ==========
-- Toda vez que o estoque de uma peça mudava por delta (entrada, venda no
-- PDV, item de OS), o código fazia leitura-então-escrita em JS: SELECT
-- quantidade, soma/subtrai em memória, UPDATE. Duas operações quase
-- simultâneas na mesma peça perdiam uma das atualizações — sem nenhum erro
-- aparecer, o estoque só ficava errado silenciosamente. Esta função faz o
-- incremento (ou decremento, com delta negativo) direto no banco, numa
-- única instrução atômica, e trava o resultado em zero no mínimo (nunca
-- deixa a quantidade negativa).
create or replace function public.incrementar_quantidade_peca(p_peca_id uuid, p_delta integer)
returns void
language sql
as $$
  update public.pecas set quantidade = greatest(0, quantidade + p_delta) where id = p_peca_id;
$$;

grant execute on function public.incrementar_quantidade_peca(uuid, integer) to authenticated;
