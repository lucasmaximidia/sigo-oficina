// Leitura do XML da NF-e (nota fiscal eletrônica) para pré-preencher a
// Entrada de Mercadoria. O XML é o documento fiscal oficial (o PDF/DANFE é só
// uma representação impressa dele), com campos padronizados pela SEFAZ — dá
// pra ler os valores diretamente, sem heurística ou IA.

export interface NfeItemExtraido {
  codigo: string | null;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export interface NfeExtraida {
  numeroNf: string | null;
  dataNf: string | null;
  valorTotal: number | null;
  fornecedorNome: string | null;
  fornecedorCnpj: string | null;
  itens: NfeItemExtraido[];
}

export function parseNfeXml(xmlText: string): NfeExtraida | null {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) return null;

  const infNFe = doc.getElementsByTagName("infNFe")[0];
  if (!infNFe) return null;

  const campo = (tag: string, root: Element) => root.getElementsByTagName(tag)[0]?.textContent?.trim() || null;

  const ide = infNFe.getElementsByTagName("ide")[0];
  const emit = infNFe.getElementsByTagName("emit")[0];
  const icmsTot = infNFe.getElementsByTagName("ICMSTot")[0];

  const numeroNf = ide ? campo("nNF", ide) : null;
  const dataEmissao = ide ? (campo("dhEmi", ide) ?? campo("dEmi", ide)) : null;
  const dataNf = dataEmissao ? dataEmissao.slice(0, 10) : null;
  const valorTotalStr = icmsTot ? campo("vNF", icmsTot) : null;
  const valorTotal = valorTotalStr ? Number(valorTotalStr) : null;
  const fornecedorNome = emit ? campo("xNome", emit) : null;
  const fornecedorCnpjRaw = emit ? campo("CNPJ", emit) : null;
  const fornecedorCnpj = fornecedorCnpjRaw ? fornecedorCnpjRaw.replace(/\D/g, "") : null;

  const itens: NfeItemExtraido[] = Array.from(infNFe.getElementsByTagName("det")).flatMap((det) => {
    const prod = det.getElementsByTagName("prod")[0];
    if (!prod) return [];

    const codigo = campo("cProd", prod);
    const descricao = campo("xProd", prod) ?? "ITEM SEM DESCRIÇÃO";
    const qComStr = campo("qCom", prod);
    const vProdStr = campo("vProd", prod);
    const vUnComStr = campo("vUnCom", prod);

    const quantidade = Math.max(1, Math.round(Number(qComStr) || 1));
    const valorUnitario =
      vProdStr && quantidade > 0
        ? Math.round((Number(vProdStr) / quantidade) * 100) / 100
        : Math.round((Number(vUnComStr) || 0) * 100) / 100;

    return [{ codigo: codigo?.toUpperCase() ?? null, descricao: descricao.toUpperCase(), quantidade, valorUnitario }];
  });

  return { numeroNf, dataNf, valorTotal, fornecedorNome, fornecedorCnpj, itens };
}
