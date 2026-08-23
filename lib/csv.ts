function escapeCsvValue(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const linhas = [headers, ...rows].map((linha) => linha.map(escapeCsvValue).join(","));
  // BOM no início faz o Excel reconhecer UTF-8 e exibir acentos corretamente.
  return "﻿" + linhas.join("\r\n");
}

export function csvResponse(csv: string, filename: string) {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
