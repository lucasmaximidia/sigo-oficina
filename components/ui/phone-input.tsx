"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatPhoneBR } from "@/lib/utils";

function PhoneInput({
  defaultValue,
  defaultDdd = "27",
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type" | "onChange" | "defaultValue" | "value"> & {
  defaultValue?: string;
  defaultDdd?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = React.useState(() =>
    formatPhoneBR(defaultValue || (defaultDdd ? `(${defaultDdd}) ` : ""))
  );

  return (
    <Input
      {...props}
      type="tel"
      inputMode="numeric"
      value={value}
      onChange={(e) => {
        const formatted = formatPhoneBR(e.target.value);
        setValue(formatted);
        onChange?.(formatted);
      }}
    />
  );
}

export { PhoneInput };
