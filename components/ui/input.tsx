import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, onChange, ...props }: React.ComponentProps<"input">) {
  const autoUppercase = type === undefined || type === "text";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (autoUppercase) {
      const input = e.target;
      const { selectionStart, selectionEnd } = input;
      input.value = input.value.toUpperCase();
      if (selectionStart !== null && selectionEnd !== null) {
        input.setSelectionRange(selectionStart, selectionEnd);
      }
    }
    onChange?.(e);
  }

  return (
    <input
      type={type}
      data-slot="input"
      onChange={handleChange}
      className={cn(
        "flex h-11 md:h-10 w-full rounded-[0.75rem] border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/70",
        autoUppercase && "uppercase placeholder:normal-case",
        "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
