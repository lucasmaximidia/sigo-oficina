"use client";

import { useSyncExternalStore } from "react";

const STORAGE_PREFIX = "sigo-collapsible-";
// Um único Set de listeners pra todo mundo que usa esse hook na página —
// cada chamador só se importa com a própria chave (lida de novo em
// getSnapshot quando notificado), então não precisa de um canal por
// instância. Mesmo padrão de components/layout/app-sidebar.tsx pro
// "encolher" do menu lateral.
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function lerAberto(id: string, defaultOpen: boolean) {
  try {
    const salvo = localStorage.getItem(STORAGE_PREFIX + id);
    return salvo === null ? defaultOpen : salvo === "1";
  } catch {
    return defaultOpen;
  }
}

function escreverAberto(id: string, aberto: boolean) {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, aberto ? "1" : "0");
  } catch {
    // modo privado etc — perde só a preferência, não quebra o toggle
  }
  listeners.forEach((callback) => callback());
}

/** Estado aberto/fechado lembrado por `id` (localStorage) entre visitas. */
export function useLembrarAberto(id: string, defaultOpen: boolean) {
  const aberto = useSyncExternalStore(
    subscribe,
    () => lerAberto(id, defaultOpen),
    () => defaultOpen
  );

  function alternar() {
    escreverAberto(id, !aberto);
  }

  return { aberto, alternar };
}
