"use client";

import { useEffect } from "react";

// Última linha de defesa: só é usado se o próprio RootLayout (app/layout.tsx)
// falhar ao renderizar. Por isso precisa definir <html>/<body> própria e não
// pode depender de globals.css, das fontes carregadas no layout ou do script
// de tema — qualquer um deles pode ser a causa da falha que caiu aqui.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f5fb",
          color: "#14162a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div
            style={{
              margin: "0 auto 20px",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#2542b8",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Algo deu muito errado</h1>
          <p style={{ fontSize: 14, color: "#6b6e85", margin: "0 0 20px", lineHeight: 1.5 }}>
            Não foi possível carregar o SIGO Oficina. Tente recarregar a página.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#e2793d",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
