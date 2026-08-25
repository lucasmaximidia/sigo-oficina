"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

function sanitizeInteger(raw: string) {
  return raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function centsToText(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function numberToCents(n: number | undefined | null) {
  if (!n) return 0;
  return Math.round(n * 100);
}

export interface NumericInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  /** Se falso, aceita apenas números inteiros (sem separador decimal). Padrão: true. */
  decimal?: boolean;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

/**
 * Input numérico que corrige o comportamento padrão de <input type="number">.
 * No modo decimal (padrão), usa máscara de moeda: os dígitos digitados
 * preenchem da direita para a esquerda (como em caixa eletrônico), então a
 * vírgula decimal já aparece durante a digitação ("3" -> "0,03" -> "0,30" ->
 * "3,00"), em vez de só ser corrigida depois de pronto.
 */
export function NumericInput({ value, defaultValue, onValueChange, decimal = true, ...props }: NumericInputProps) {
  const [intText, setIntText] = React.useState(() =>
    !decimal && (value ?? defaultValue) ? String(value ?? defaultValue) : ""
  );
  const [cents, setCents] = React.useState(() => (decimal ? numberToCents(value ?? defaultValue) : 0));
  const [prevValue, setPrevValue] = React.useState(value);

  if (value !== undefined && value !== prevValue) {
    setPrevValue(value);
    if (decimal) setCents(numberToCents(value));
    else setIntText(value ? String(value) : "");
  }

  function handleChangeDecimal(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    const next = digits === "" ? 0 : parseInt(digits, 10);
    setCents(next);
    onValueChange?.(next / 100);
  }

  function handleChangeInteger(e: React.ChangeEvent<HTMLInputElement>) {
    const clean = sanitizeInteger(e.target.value);
    setIntText(clean);
    onValueChange?.(clean === "" ? 0 : parseInt(clean, 10) || 0);
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode={decimal ? "decimal" : "numeric"}
      value={decimal ? centsToText(cents) : intText}
      onChange={decimal ? handleChangeDecimal : handleChangeInteger}
      onFocus={(e) => e.target.select()}
    />
  );
}
