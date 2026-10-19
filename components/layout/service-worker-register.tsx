"use client";

import { useEffect } from "react";

// Registra o service worker assim que o app carrega, pra ele já estar
// pronto quando o usuário ativar as notificações em Configurações (e por
// ser pré-requisito do Web Push no PWA instalado no iOS/Android).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Falha ao registrar o service worker", error);
    });
  }, []);

  return null;
}
