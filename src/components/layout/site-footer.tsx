import Link from "next/link";

const ICP = process.env.NEXT_PUBLIC_ICP_BEIAN?.trim();

/** 全站页脚：ICP 备案号（配置 NEXT_PUBLIC_ICP_BEIAN 后显示） */
export function SiteFooter() {
  if (!ICP) return null;

  const isUrl = /^https?:\/\//i.test(ICP);

  return (
    <footer className="px-4 pb-4 pt-2 text-center">
      {isUrl ? (
        <a
          href={ICP}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-slate-400 underline-offset-2 hover:text-slate-500 hover:underline"
        >
          ICP备案
        </a>
      ) : (
        <p className="text-[10px] text-slate-400">{ICP}</p>
      )}
      <p className="mt-1 text-[9px] text-slate-300">
        <Link href="/about" className="hover:text-slate-400">
          关于我们
        </Link>
        {" · "}
        <Link href="/agreement/privacy" className="hover:text-slate-400">
          隐私政策
        </Link>
      </p>
    </footer>
  );
}
