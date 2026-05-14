import type { ReactNode } from "react";

import { AppHeader } from "./app-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 lg:px-0">{children}</main>
    </div>
  );
}
