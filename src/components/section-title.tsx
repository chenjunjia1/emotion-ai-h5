import { theme } from "@/lib/theme";

export function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-3">
      {eyebrow && (
        <div className={`mb-1 text-xs font-bold ${theme.textActive}`}>{eyebrow}</div>
      )}
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {desc && <p className="mt-1.5 text-sm leading-6 text-slate-500">{desc}</p>}
    </div>
  );
}
