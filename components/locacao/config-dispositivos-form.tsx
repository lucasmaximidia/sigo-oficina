"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Upload } from "lucide-react";
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
      <Card>
        <CardHeader>
          <CardTitle>Configuração da frota</CardTitle>
          <CardDescription>Vale para todos os carrinhos — lido no próximo heartbeat de cada um.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form action={handleSalvarConfig} className="flex flex-col gap-4">
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
            </div>
            <div>
              <Label htmlFor="firmware_versao_alvo" className="mb-1.5 block">
                Versão-alvo do firmware
              </Label>
              <Input
                id="firmware_versao_alvo"
                name="firmware_versao_alvo"
                defaultValue={config.firmware_versao_alvo ?? ""}
                placeholder="Ex.: 2.0.1"
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
              <Input id="versao_firmware_upload" name="firmware_versao_alvo" placeholder="Ex.: 2.0.1" />
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
