export function RouteLoading({ label = "加载中…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF7AAE] border-t-transparent" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
