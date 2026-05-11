import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "./data";
import { Reveal } from "./reveal";

export function RouteSection() {
  const [featured, ...rest] = routes;

  return (
    <Reveal>
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1110px] px-5">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Được đặt nhiều</p>
              <h2 className="mt-2 text-[26px] font-bold tracking-normal text-[#303030]">Tuyến đường phổ biến</h2>
            </div>
            <Button variant="link" render={<Link href="/search" />}>
              Xem tất cả
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <Link className="group grid overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md md:grid-cols-[1.1fr_0.9fr]" href="/search">
              <div className="min-h-[310px] bg-cover bg-center transition group-hover:scale-[1.02]" style={{ backgroundImage: `url('${featured.image}')` }} />
              <div className="flex flex-col justify-between p-6">
                <div>
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-primary">TOP ROUTE</span>
                  <h3 className="mt-5 text-3xl font-bold leading-tight text-[#202020]">{featured.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Chặng có nhiều lượt tìm kiếm trong tuần, phù hợp cho lịch trình ngắn ngày.</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">
                    {featured.price} {featured.oldPrice ? <span className="ml-2 text-sm text-slate-400 line-through">{featured.oldPrice}</span> : null}
                  </p>
                  <span className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-bold text-white">Đặt vé</span>
                </div>
              </div>
            </Link>

            <div className="grid gap-4">
              {rest.map((route) => (
                <Link className="group grid grid-cols-[128px_1fr] overflow-hidden rounded-xl border bg-white shadow-sm transition hover:border-primary hover:shadow-md" href="/search" key={route.name}>
                  <div className="bg-cover bg-center transition group-hover:scale-105" style={{ backgroundImage: `url('${route.image}')` }} />
                  <div className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <h3 className="font-bold text-[#262626]">{route.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-primary">{route.price}</p>
                    </div>
                    <ArrowRight className="size-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary" />
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
