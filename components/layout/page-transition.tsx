"use client";

import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="h-full animate-in fade-in duration-200">
      {children}
    </div>
  );
}
