export function LegalSection({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: string[];
}) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 text-sm font-bold text-orange-700">{title}</h2>
      <div className="space-y-2 text-sm leading-7 text-slate-600">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
    </section>
  );
}
