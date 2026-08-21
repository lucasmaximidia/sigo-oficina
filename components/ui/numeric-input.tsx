"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

function sanitizeDecimal(raw: string) {
  let v = raw.replace(/[^\d.,]/g, "");
  let sepFound = false;
  v = v.replace(/[.,]/g, (m) => {
    if (sepFound) return "";
    sepFound = true;
    return m;
  });
  v = v.replace(/^0+(\d)/, "$1");
  return v;
}

function sanitizeInteger(raw: string) {
  return raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function numberToText(n: number | undefined | null, decimal: boolean) {
  if (!n) return "";
  return decimal ? String(n).replace(".", ",") : String(n);
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
 * Input numérico que corrige o comportamento padrão de <input type="number">:
 * ao focar com valor 0, seleciona tudo (evita "050" ao digitar por cima do zero);
 * ao apagar tudo o campo fica realmente vazio (não força o zero de volta).
 */
export function NumericInput({ value, defaultValue, onValueChange, decimal = true, ...props }: NumericInputProps) {
  const [text, setText] = React.useState(() => numberToText(value ?? defaultValue, decimal));
  const [prevValue, setPrevValue] = React.useState(value);

  if (value !== undefined && value !== prevValue) {
    setPrevValue(value);
    setText(numberToText(value, decimal));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const clean = decimal ? sanitizeDecimal(e.target.value) : sanitizeInteger(e.target.value);
    setText(clean);
    onValueChange?.(clean === "" ? 0 : parseFloat(clean.replace(",", ".")) || 0);
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode={decimal ? "decimal" : "numeric"}
      value={text}
      onChange={handleChange}
      onFocus={(e) => e.target.select()}
    />
  );
}
