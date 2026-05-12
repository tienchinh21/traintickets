import { ArrowRight, MapPin, TicketPercent } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "./data";
import { Reveal } from "./reveal";

export function RouteSection() {
  const [featured, ...rest] = routes;

  return (
    <Reveal>
      <section className="relative overflow-hidden bg-[#f7fcff] py-18">
        <div className="absolute left-[-8%] top-10 h-44 w-[34%] rounded-[32px] bg-[#9fe4ff]/28 blur-2xl" />
        <div className="absolute right-[-10%] bottom-12 h-52 w-[36%] rounded-[36px] bg-accent-cta/18 blur-2xl" />

        <div className="relative mx-auto max-w-[1110px] px-5">
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
                Được đặt nhiều
              </p>
              <h2 className="mt-3 text-[30px] font-black tracking-normal text-[#172033]">Tuyến đường phổ biến</h2>
            </div>
            <Button className="text-primary hover:text-primary-hover" variant="link" nativeButton={false} render={<Link href="/tim-chuyen" />}>
              Xem tất cả
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <Link
              className="group grid overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_18px_44px_rgba(8,63,103,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(8,63,103,0.18)] md:grid-cols-[1.08fr_0.92fr]"
              href="/tim-chuyen"
            >
              <div className="relative min-h-[330px] overflow-hidden bg-cover bg-center transition duration-500 group-hover:scale-[1.03]" style={{ backgroundImage: `url('${featured.image}')` }}>
                <div className="absolute inset-0 bg-[#083f67]/20" />
                <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-sm font-black text-[#083f67] shadow-md">
                  <MapPin className="size-4 text-primary" />
                  Tuyến nổi bật tuần này
                </div>
              </div>
              <div className="flex flex-col justify-between bg-[#f8fbff] p-7">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-cta px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#083f67]">
                    <TicketPercent className="size-3.5" />
                    Top route
                  </span>
                  <h3 className="mt-5 text-4xl font-black leading-tight text-[#172033]">{featured.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Chặng có nhiều lượt tìm kiếm trong tuần, phù hợp cho lịch trình ngắn ngày.</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-primary">
                    {featured.price} {featured.oldPrice ? <span className="ml-2 text-base font-bold text-slate-400 line-through">{featured.oldPrice}</span> : null}
                  </p>
                  <span className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-[0_8px_0_#083f67] transition group-hover:bg-primary-hover">
                    Đặt vé
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>

            <div className="grid gap-4">
              {rest.map((route) => (
                <Link
                  className="group grid grid-cols-[150px_1fr] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_12px_28px_rgba(8,63,103,0.1)] transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_36px_rgba(8,63,103,0.16)]"
                  href="/tim-chuyen"
                  key={route.name}
                >
                  <div className="relative overflow-hidden bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${route.image}')` }}>
                    <div className="absolute inset-0 bg-primary/5" />
                  </div>
                  <div className="flex items-center justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black text-[#172033]">{route.name}</h3>
                      <p className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-black text-primary">{route.price}</p>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f0f7ff] text-primary transition group-hover:translate-x-1 group-hover:bg-primary group-hover:text-white">
                      <ArrowRight className="size-5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
