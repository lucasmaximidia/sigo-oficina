"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}
function intOuNull(fd: FormData, key: string) {
  const v = fd.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function revalidarCarrinhos() {
  revalidatePath("/locacao/carrinhos");
}

// ---------- Cadastro / token ----------

// Gera o device_token (usado no cadastro e ao regenerar) — não depende do
// default do banco porque um UPDATE não reaproveita o `default` da coluna.
function novoToken() {
  return crypto.randomUUID();
}

export async function cadastrarCarrinho(formData: FormData) {
  const supabase = await createClient();
  const numeroCarrinho = intOuNull(formData, "numero_carrinho");
  if (!numeroCarrinho || numeroCarrinho <= 0) throw new Error("Informe o número do carrinho");
  const veiculoId = str(formData, "veiculo_id");

  const { data, error } = await supabase
    .from("locacao_dispositivos")
    .insert({
      numero_carrinho: numeroCarrinho,
      veiculo_id: veiculoId && veiculoId !== "nenhum" ? veiculoId : null,
      device_token: novoToken(),
    })
    .select("numero_carrinho, device_token")
    .single();
  if (error) {
    throw new Error(
      error.message.includes("duplicate") || error.message.includes("unique")
        ? `Já existe um carrinho número ${numeroCarrinho}`
        : error.message
    );
  }
  revalidarCarrinhos();
  return { numeroCarrinho: data.numero_carrinho, deviceToken: data.device_token };
}

// Pro carrinho perdido/clonado: o token antigo para de funcionar na hora
// (nada mais valida contra ele).
export async function regenerarTokenCarrinho(dispositivoId: string) {
  const supabase = await createClient();
  const token = novoToken();
  const { data, error } = await supabase
    .from("locacao_dispositivos")
    .update({ device_token: token, updated_at: new Date().toISOString() })
    .eq("id", dispositivoId)
    .select("numero_carrinho, device_token")
    .single();
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
  return { numeroCarrinho: data.numero_carrinho, deviceToken: data.device_token };
}

export async function vincularVeiculoCarrinho(dispositivoId: string, veiculoId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locacao_dispositivos")
    .update({ veiculo_id: veiculoId, updated_at: new Date().toISOString() })
    .eq("id", dispositivoId);
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
}

// ---------- Configuração da frota ----------

export async function salvarConfigDispositivos(formData: FormData) {
  const supabase = await createClient();
  const minutos15 = intOuNull(formData, "minutos_cartao_15min");
  const minutos5 = intOuNull(formData, "minutos_cartao_5min");
  if (!minutos15 || !minutos5) throw new Error("Informe os minutos dos dois cartões");

  const { error } = await supabase
    .from("locacao_dispositivo_config")
    .update({
      minutos_cartao_15min: clamp(minutos15, 1, 60),
      minutos_cartao_5min: clamp(minutos5, 1, 60),
      firmware_versao_alvo: str(formData, "firmware_versao_alvo"),
      firmware_url: str(formData, "firmware_url"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
}

// Sobe o .bin pro bucket público "firmware" e já atualiza o link na
// configuração (e a versão-alvo, se informada) — sem precisar colar o link
// manualmente depois.
export async function enviarFirmware(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("arquivo");
  if (!(file instanceof File) || file.size === 0) throw new Error("Selecione o arquivo .bin");
  if (!file.name.toLowerCase().endsWith(".bin")) throw new Error("O arquivo precisa ser um .bin");

  const versao = str(formData, "firmware_versao_alvo");
  const caminho = versao ? `${versao.replace(/[^a-zA-Z0-9._-]/g, "_")}.bin` : `${crypto.randomUUID()}.bin`;

  const { error: uploadError } = await supabase.storage.from("firmware").upload(caminho, file, {
    contentType: "application/octet-stream",
    upsert: true,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage.from("firmware").getPublicUrl(caminho);

  const { error } = await supabase
    .from("locacao_dispositivo_config")
    .update({
      firmware_url: publicUrlData.publicUrl,
      ...(versao ? { firmware_versao_alvo: versao } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidarCarrinhos();
}
