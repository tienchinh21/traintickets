import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="mx-auto flex h-[58px] w-full max-w-[1110px] items-center justify-between px-5">
      <Link className="text-xl font-bold text-primary" href="/">
        TrainTickets
      </Link>
      <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-500 md:flex">
        <Link className="border-b-2 border-primary py-[19px] text-primary" href="/">
          Trang chủ
        </Link>
        <Link href="/search">My Orders</Link>
        <Link href="/search">Support</Link>
      </nav>
      <div className="flex items-center gap-3">
        <Button className="h-8 text-primary" variant="ghost" render={<Link href="/search" />}>
          Login
        </Button>
        <Button className="h-9 px-5" render={<Link href="/search" />}>
          Sign Up
        </Button>
      </div>
    </header>
  );
}
