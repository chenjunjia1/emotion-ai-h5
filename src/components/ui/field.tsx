import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-900">{label}</div>
      {children}
    </div>
  );
}
