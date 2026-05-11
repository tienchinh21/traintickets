import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { promoSections } from "./data";
import { Reveal } from "./reveal";

export function PromoSections() {
  return (
    <Reveal>
      <section className="border-y bg-[#f7f8fa] py-16">
        <div className="mx-auto max-w-[1110px] px-5">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Khuyến mãi</p>
              <h2 className="mt-2 text-[26px] font-bold tracking-normal text-[#303030]">Ưu đãi đang mở</h2>
            </div>
            <Button variant="link" render={<Link href="/search" />}>
              Xem tất cả
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>

          <div className="flex flex-col gap-10">
            {promoSections.map((section) => (
              <div key={section.title}>
                <div className="mb-4 flex items-baseline justify-between">
                  <h3 className="text-xl font-bold text-[#404040]">{section.title}</h3>
                  <p className="hidden text-sm text-slate-500 md:block">{section.subtitle}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {section.items.map((item) => (
                    <PromoCard item={item} key={item.title} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function PromoCard({ item }: { item: { title: string; label: string; value: string; tone: string } }) {
  return (
    <Link className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:border-primary hover:shadow-md" href="/search">
      <div className="relative h-[150px] border-b bg-[#f2f6fb]">
        <div className="absolute left-5 top-5 rounded bg-white px-3 py-1 text-xs font-bold text-primary shadow-sm">{item.label}</div>
        <div className="absolute left-5 top-16 text-3xl font-black text-[#1f5edc]">{item.value}</div>
        <div className="absolute bottom-5 right-5 flex size-16 items-center justify-center rounded-2xl bg-white text-sm font-black text-primary shadow-sm ring-1 ring-slate-200">
          BUS
        </div>
      </div>
      <div className="min-h-[92px] p-5">
        <h4 className="text-base font-bold leading-snug text-[#222]">{item.title}</h4>
        <span className="mt-3 inline-flex items-center text-xs font-bold text-primary">
          Xem chi tiết <ArrowRight className="ml-1 size-3 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
