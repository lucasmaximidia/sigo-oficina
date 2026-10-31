"use client";

import { useEffect } from "react";

// O iOS Safari não encolhe a layout viewport quando o teclado abre (o meta
// "interactive-widget=resizes-content" do app/layout.tsx não é respeitado
// lá) — então um diálogo/sheet ancorado com bottom-0 fica colado atrás do
// teclado, escondendo justamente o campo em que a pessoa está digitando.
// Aqui acompanhamos a visualViewport (que o navegador encolhe de verdade) e
// expomos a diferença como --keyboard-inset, pra esses componentes subirem
// acima do teclado em vez de ficarem atrás dele.
export function KeyboardInsetWatcher() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      const inset = window.innerHeight - vv!.height - vv!.offsetTop;
      document.documentElement.style.setProperty("--keyboard-inset", `${Math.max(0, Math.round(inset))}px`);
    }

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return null;
}
