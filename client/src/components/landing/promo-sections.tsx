import { ArrowRight, BadgePercent, Gift, WalletCards } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { promoSections } from "./data";
import { Reveal } from "./reveal";

export function PromoSections() {
  return (
    <Reveal>
      <section className="relative overflow-hidden border-y border-sky-100 bg-[#eff9ff] py-18">
        <div className="absolute left-[-8%] top-16 h-56 w-[34%] rounded-[36px] bg-primary/10 blur-2xl" />
        <div className="absolute right-[-10%] bottom-10 h-64 w-[36%] rounded-[40px] bg-accent-cta/20 blur-2xl" />

        <div className="relative mx-auto max-w-[1110px] px-5">
          <div className="mb-9 flex items-end justify-between gap-5">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-accent-cta px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#083f67]">
                <BadgePercent className="size-4" />
                Khuyến mãi
              </p>
              <h2 className="mt-3 text-[30px] font-black tracking-normal text-[#172033]">Ưu đãi đang mở</h2>
            </div>
            <Button className="text-primary hover:text-primary-hover" variant="link" nativeButton={false} render={<Link href="/tim-chuyen" />}>
              Xem tất cả
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>

          <div className="flex flex-col gap-10">
            {promoSections.map((section) => (
              <div key={section.title}>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h3 className="text-xl font-black text-[#172033]">{section.title}</h3>
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
  const toneClass = getPromoTone(item.tone);

  return (
    <Link className="group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_14px_34px_rgba(8,63,103,0.1)] transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_44px_rgba(8,63,103,0.16)]" href="/tim-chuyen">
      <div className={`relative h-[158px] overflow-hidden border-b border-white/50 ${toneClass}`}>
        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute left-5 top-5 rounded-full bg-white/92 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#083f67] shadow-sm">
          {item.label}
        </div>
        <div className="absolute left-5 top-16 text-5xl font-black leading-none text-white [text-shadow:4px_4px_0_rgba(8,63,103,0.24)]">{item.value}</div>
        <div className="absolute bottom-5 right-5 flex size-16 items-center justify-center rounded-2xl bg-white/95 text-primary shadow-[0_12px_24px_rgba(8,63,103,0.2)] ring-2 ring-white/70">
          {item.tone === "green" || item.tone === "pink" ? <WalletCards className="size-7" /> : <Gift className="size-7" />}
        </div>
      </div>
      <div className="min-h-[104px] p-5">
        <h4 className="text-base font-black leading-snug text-[#172033]">{item.title}</h4>
        <span className="mt-4 inline-flex items-center text-xs font-black uppercase tracking-[0.08em] text-primary">
          Xem chi tiết <ArrowRight className="ml-1 size-3 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function getPromoTone(tone: string) {
  switch (tone) {
    case "red":
      return "bg-[#ef555b]";
    case "green":
      return "bg-[#16a34a]";
    case "pink":
      return "bg-[#db2777]";
    case "orange":
      return "bg-[#f97316]";
    case "purple":
      return "bg-[#2563eb]";
    default:
      return "bg-primary";
  }
}
