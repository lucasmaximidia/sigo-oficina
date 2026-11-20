"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Upload, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { salvarConfigDispositivos, enviarFirmware } from "@/lib/locacao-dispositivos-actions";
import type { LocacaoDispositivoConfig } from "@/types";

export function ConfigDispositivosForm({ config }: { config: LocacaoDispositivoConfig }) {
  const [minutos15, setMinutos15] = useState(config.minutos_cartao_15min);
  const [minutos5, setMinutos5] = useState(config.minutos_cartao_5min);
  const [tempoMax, setTempoMax] = useState(config.tempo_max_min);
  const [livreMax, setLivreMax] = useState(config.livre_max_min);
  const [isPendingConfig, startTransitionConfig] = useTransition();
  const [isPendingFirmware, startTransitionFirmware] = useTransition();
  const firmwareFormRef = useRef<HTMLFormElement>(null);

  function handleSalvarConfig(formData: FormData) {
    startTransitionConfig(async () => {
      try {
        await salvarConfigDispositivos(formData);
        toast.success("Configuração salva");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar configuração");
      }
    });
  }

  function handleEnviarFirmware(formData: FormData) {
    startTransitionFirmware(async () => {
      try {
        await enviarFirmware(formData);
        toast.success("Firmware enviado");
        firmwareFormRef.current?.reset();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao enviar firmware");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/10 p-3 text-sm text-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-info" />
        <p>Os carrinhos recebem as mudanças em até 1 minuto, enquanto estiverem no Wi-Fi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração da frota</CardTitle>
          <CardDescription>Vale para todos os carrinhos.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form action={handleSalvarConfig} className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-sm font-semibold">Preços</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="preco_cartao_15min" className="mb-1.5 block">
                    Cartão &quot;15 MIN&quot; (R$)
                  </Label>
                  <NumericInput
                    id="preco_cartao_15min"
                    name="preco_cartao_15min"
                    defaultValue={config.preco_cartao_15min}
                  />
                </div>
                <div>
                  <Label htmlFor="preco_cartao_5min" className="mb-1.5 block">
                    Cartão &quot;5 MIN&quot; (R$)
                  </Label>
                  <NumericInput id="preco_cartao_5min" name="preco_cartao_5min" defaultValue={config.preco_cartao_5min} />
                </div>
                <div>
                  <Label htmlFor="preco_livre_hora" className="mb-1.5 block">
                    LIVRE por hora (R$)
                  </Label>
                  <NumericInput id="preco_livre_hora" name="preco_livre_hora" defaultValue={config.preco_livre_hora} />
                  <p className="mt-1 text-xs text-muted-foreground">Cobrado proporcional aos minutos rodados.</p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Tempos</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="minutos_cartao_15min" className="mb-1.5 block">
                    Minutos do cartão &quot;15 MIN&quot;
                  </Label>
                  <NumericInput
                    id="minutos_cartao_15min"
                    name="minutos_cartao_15min"
                    decimal={false}
                    value={minutos15}
                    onValueChange={(v) => setMinutos15(Math.min(60, Math.max(1, v)))}
                  />
                </div>
                <div>
                  <Label htmlFor="minutos_cartao_5min" className="mb-1.5 block">
                    Minutos do cartão &quot;5 MIN&quot;
                  </Label>
                  <NumericInput
                    id="minutos_cartao_5min"
                    name="minutos_cartao_5min"
                    decimal={false}
                    value={minutos5}
                    onValueChange={(v) => setMinutos5(Math.min(60, Math.max(1, v)))}
                  />
                </div>
                <div>
                  <Label htmlFor="tempo_max_min" className="mb-1.5 block">
                    Tempo máximo acumulado (min)
                  </Label>
                  <NumericInput
                    id="tempo_max_min"
                    name="tempo_max_min"
                    decimal={false}
                    value={tempoMax}
                    onValueChange={(v) => setTempoMax(Math.min(120, Math.max(10, v)))}
                  />
                </div>
                <div>
                  <Label htmlFor="livre_max_min" className="mb-1.5 block">
                    Limite do LIVRE (min)
                  </Label>
                  <NumericInput
                    id="livre_max_min"
                    name="livre_max_min"
                    decimal={false}
                    value={livreMax}
                    onValueChange={(v) => setLivreMax(Math.min(720, Math.max(10, v)))}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Bateria</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="bateria_minima" className="mb-1.5 block">
                    Mínima para liberar (V)
                  </Label>
                  <NumericInput id="bateria_minima" name="bateria_minima" defaultValue={config.bateria_minima} />
                </div>
                <div>
                  <Label htmlFor="bateria_aviso" className="mb-1.5 block">
                    Aviso no fim do tempo (V)
                  </Label>
                  <NumericInput id="bateria_aviso" name="bateria_aviso" defaultValue={config.bateria_aviso} />
                </div>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Chumbo 24V: mínima 22,0 e aviso 23,0. Testando na bancada: 0 (desligado).
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Firmware</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firmware_versao_alvo" className="mb-1.5 block">
                    Versão-alvo
                  </Label>
                  <Input
                    id="firmware_versao_alvo"
                    name="firmware_versao_alvo"
                    defaultValue={config.firmware_versao_alvo ?? ""}
                    placeholder="Ex.: 2.1.0"
                  />
                </div>
                <div>
                  <Label htmlFor="firmware_url" className="mb-1.5 block">
                    Link do .bin
                  </Label>
                  <Input
                    id="firmware_url"
                    name="firmware_url"
                    defaultValue={config.firmware_url ?? ""}
                    placeholder="Preenchido automaticamente ao enviar um .bin abaixo"
                  />
                </div>
              </div>
            </div>

            <div>
              <Button type="submit" disabled={isPendingConfig}>
                <Save className="size-4" />
                Salvar configuração
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enviar firmware (.bin)</CardTitle>
          <CardDescription>Sobe o arquivo pro bucket público e já preenche o link acima.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form ref={firmwareFormRef} action={handleEnviarFirmware} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="arquivo" className="mb-1.5 block">
                Arquivo .bin
              </Label>
              <Input id="arquivo" name="arquivo" type="file" accept=".bin" required />
            </div>
            <div className="flex-1">
              <Label htmlFor="versao_firmware_upload" className="mb-1.5 block">
                Versão (opcional)
              </Label>
              <Input id="versao_firmware_upload" name="firmware_versao_alvo" placeholder="Ex.: 2.1.0" />
            </div>
            <Button type="submit" disabled={isPendingFirmware}>
              <Upload className="size-4" />
              {isPendingFirmware ? "Enviando..." : "Enviar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
