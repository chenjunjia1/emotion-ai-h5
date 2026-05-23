import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

export function SelectField({
  value,
  onChange,
  options,
  labeledOptions,
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  labeledOptions?: SelectOption[];
}) {
  const items: SelectOption[] =
    labeledOptions ??
    (options ?? []).map((o) => ({
      value: o,
      label: o,
    }));

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100",
        theme.border
      )}
    >
      {items.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
