import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({
  className,
  onChange,
  preserveCase = false,
  ...props
}: React.ComponentProps<"textarea"> & { preserveCase?: boolean }) {
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (!preserveCase) {
      const textarea = e.target;
      const { selectionStart, selectionEnd } = textarea;
      textarea.value = textarea.value.toUpperCase();
      if (selectionStart !== null && selectionEnd !== null) {
        textarea.setSelectionRange(selectionStart, selectionEnd);
      }
    }
    onChange?.(e);
  }

  return (
    <textarea
      data-slot="textarea"
      onChange={handleChange}
      className={cn(
        "flex min-h-20 w-full rounded-[0.75rem] border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/70",
        !preserveCase && "uppercase placeholder:normal-case",
        "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
