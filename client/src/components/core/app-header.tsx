"use client";

import { AxiosError } from "axios";
import { Bell, Headphones, LogOut, Menu, ShieldCheck, Ticket, TrainFront, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
  { label: "Trang chủ", href: "/", activePaths: ["/"] },
  { label: "Tìm chuyến", href: "/tim-chuyen", activePaths: ["/tim-chuyen", "/chuyen-tau"] },
  { label: "Vé của tôi", href: "/tim-chuyen", activePaths: ["/ve-cua-toi"] },
  { label: "Hỗ trợ", href: "/tim-chuyen", activePaths: ["/ho-tro"] },
];

export function AppHeader() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const register = useAuthStore((state) => state.register);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);

  const isAuthenticated = status === "authenticated" && Boolean(user);
  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setSubmitting(true);

    try {
      if (authMode === "login") {
        await login({
          identifier: String(formData.get("identifier") ?? "").trim(),
          password: String(formData.get("password") ?? ""),
        });
        toast.success("Đăng nhập thành công");
      } else {
        const contact = String(formData.get("contact") ?? "").trim();
        await register({
          fullName: String(formData.get("fullName") ?? "").trim(),
          password: String(formData.get("password") ?? ""),
          ...(contact.includes("@") ? { email: contact } : { phone: contact }),
        });
        toast.success("Đăng ký thành công");
      }

      setAuthOpen(false);
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      toast.success("Đăng xuất thành công");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  }

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
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button className="size-10 rounded-xl border-sky-100 bg-white shadow-sm" size="icon" variant="outline" aria-label="Tài khoản" />}>
                <UserRound className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                  <div className="px-2 py-1.5">
                    <p className="truncate text-sm font-black text-[#172033]">{user?.fullName}</p>
                    <p className="truncate text-xs font-medium text-slate-500">{user?.email ?? user?.phone}</p>
                  </div>
                  <DropdownMenuItem>
                    <Ticket className="size-4 text-primary" />
                    Vé đã đặt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} variant="destructive">
                    <LogOut className="size-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="h-10 rounded-xl px-4 font-black" disabled={status === "loading"} onClick={() => setAuthOpen(true)}>
              Đăng nhập
            </Button>
          )}
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
        </div>
      </div>
      <Sheet open={authOpen} onOpenChange={setAuthOpen}>
        <SheetContent className="w-full max-w-[420px] p-0" side="right">
          <SheetHeader className="border-b border-sky-100 p-5">
            <SheetTitle className="text-xl font-black text-[#172033]">Tài khoản khách hàng</SheetTitle>
            <SheetDescription>Đăng nhập hoặc tạo tài khoản để quản lý vé đã đặt.</SheetDescription>
          </SheetHeader>
          <div className="p-5">
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "login" | "register")}>
              <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl bg-sky-50">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <AuthForm mode="login" onSubmit={handleAuthSubmit} submitting={submitting} />
              </TabsContent>
              <TabsContent value="register">
                <AuthForm mode="register" onSubmit={handleAuthSubmit} submitting={submitting} />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function AuthForm({
  mode,
  onSubmit,
  submitting,
}: {
  mode: "login" | "register";
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
}) {
  return (
    <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
      {mode === "register" ? (
        <label className="flex flex-col gap-2 text-sm font-bold text-[#172033]">
          Họ tên
          <Input className="h-11" name="fullName" placeholder="Nguyễn Văn A" required />
        </label>
      ) : null}
      <label className="flex flex-col gap-2 text-sm font-bold text-[#172033]">
        {mode === "login" ? "Email hoặc số điện thoại" : "Email hoặc số điện thoại"}
        <Input className="h-11" name={mode === "login" ? "identifier" : "contact"} placeholder="customer@example.com" required />
      </label>
      <label className="flex flex-col gap-2 text-sm font-bold text-[#172033]">
        Mật khẩu
        <Input className="h-11" minLength={6} name="password" placeholder="Tối thiểu 6 ký tự" required type="password" />
      </label>
      <Button className="mt-1 h-11 rounded-xl font-black" disabled={submitting} type="submit">
        {submitting ? "Đang xử lý" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
      </Button>
    </form>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; error?: { message?: string } } | undefined;
    return data?.error?.message ?? data?.message ?? "Không thể xử lý yêu cầu";
  }

  return "Không thể xử lý yêu cầu";
}
