"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

export function OsInfoAccordion({ sections, defaultOpen }: { sections: AccordionSection[]; defaultOpen: string }) {
  const [openId, setOpenId] = useState(defaultOpen);

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => {
        const isOpen = section.id === openId;
        return (
          <div key={section.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? "" : section.id)}
              className="flex w-full items-center justify-between gap-2 p-4 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {section.icon}
                {section.title}
              </span>
              <ChevronDown
                className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
              />
            </button>
            {isOpen && <div className="border-t border-border p-4">{section.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
