import type { ReactNode } from "react";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 text-stone-800">
      <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-5">
        {children}
      </div>
    </div>
  );
}
