"use client";

import { Bell, Headphones, Menu, ShieldCheck, Ticket, TrainFront } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Trang chủ", href: "/", activePaths: ["/"] },
  { label: "Tìm chuyến", href: "/tim-chuyen", activePaths: ["/tim-chuyen", "/chuyen-tau"] },
  { label: "Vé của tôi", href: "/tim-chuyen", activePaths: ["/ve-cua-toi"] },
  { label: "Hỗ trợ", href: "/tim-chuyen", activePaths: ["/ho-tro"] },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-sky-100 bg-white/95 shadow-[0_10px_30px_rgba(8,63,103,0.08)] backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between px-4 lg:px-0">
        <div className="flex items-center gap-3">
          <Link className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(37,99,235,0.22)]" href="/">
            <TrainFront className="size-5" />
          </Link>
          <div className="flex flex-col">
            <Link className="text-base font-black leading-none text-[#172033]" href="/">
              TrainTickets
            </Link>
            <span className="mt-1 text-xs font-semibold text-slate-500">Đặt vé tàu xe Việt Nam</span>
          </div>
        </div>
        <nav className="hidden items-center rounded-2xl border border-sky-100 bg-[#f7fcff] p-1 text-sm font-bold text-slate-600 shadow-inner md:flex">
          {navItems.map((item) => {
            const isActive = item.activePaths.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)));

            return (
              <Button
                className={
                  isActive
                    ? "h-9 w-[108px] rounded-xl bg-white px-4 text-primary shadow-sm hover:bg-white"
                    : "h-9 w-[108px] rounded-xl px-4 hover:bg-white hover:text-primary"
                }
                key={item.label}
                variant="ghost"
                nativeButton={false}
                render={<Link href={item.href} />}
              >
                {item.label}
              </Button>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {/* <div className="hidden items-center gap-2 rounded-full bg-accent-cta/25 px-3 py-2 text-xs font-black text-[#083f67] lg:flex">
            <ShieldCheck className="size-4" />
            Giữ chỗ an toàn
          </div> */}
          <Button className="relative size-10 rounded-xl border border-sky-100 bg-white text-primary shadow-sm hover:bg-[#f7fcff]" size="icon" variant="ghost" aria-label="Thông báo">
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[#ef555b]" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button className="size-10 rounded-xl border-sky-100 bg-white shadow-sm" size="icon" variant="outline" aria-label="Mở menu" />}>
              <Menu className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Ticket className="size-4 text-primary" />
                  Vé đã đặt
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShieldCheck className="size-4 text-primary" />
                  Phương thức thanh toán
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Headphones className="size-4 text-primary" />
                  Trung tâm hỗ trợ
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Avatar className="size-10 border-2 border-white shadow-[0_8px_18px_rgba(8,63,103,0.14)]">
            <AvatarFallback className="bg-primary text-sm font-black text-white">TC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
