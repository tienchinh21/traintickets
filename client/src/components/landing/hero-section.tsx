"use client";

import { BadgePercent, BusFront, CalendarDays, CarFront, MapPin, Plane, Plus, Repeat2, Sparkles, TrainFront } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { benefits } from "./data";

const benefitDescriptions = ["Giữ ghế ngay sau khi đặt", "Luôn có người hỗ trợ", "Deal mới mỗi tuần", "Thẻ, ví và chuyển khoản"];

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  const heroTextY = useTransform(scrollYProgress, [0, 0.25], [0, -70]);
  const heroBgY = useTransform(scrollYProgress, [0, 0.25], [0, 45]);

  return (
    <section className="relative h-[690px] overflow-hidden border-y bg-[#9fe4ff]">
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(180deg,#effcff_0%,#9fe4ff_42%,#5fc4ff_100%)]"
        style={{ y: heroBgY }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.72)_0_18%,transparent_18%_34%,rgba(255,255,255,0.34)_34%_42%,transparent_42%)]" />
      <div className="absolute left-[-8%] top-10 h-64 w-[46%] -skew-x-12 rounded-[38px] bg-[#fff3a3]/65 blur-[1px]" />
      <div className="absolute right-[-10%] top-24 h-72 w-[44%] skew-x-12 rounded-[38px] bg-[#ffcf4a]/55 blur-[1px]" />
      <SkylineLayer />

      <motion.div
        className="absolute inset-x-0 top-9 z-[2] px-5 text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ y: heroTextY }}
      >
        <motion.div
          className="inline-flex rotate-[-3deg] items-center gap-2 rounded-xl border-2 border-white bg-[#083f67] px-6 py-2 text-base font-black uppercase tracking-[0.18em] text-accent-cta shadow-[0_14px_30px_rgba(8,63,103,0.25)]"
          animate={{ rotate: [-3, -1.5, -3], y: [0, -4, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="size-5" />
          THỨ 3 · 12h đến 14h
        </motion.div>
        <div className="mx-auto mt-4 flex w-fit items-end gap-4 rounded-[22px] border-4 border-white bg-primary px-8 py-3 text-white shadow-[0_20px_0_#083f67,0_32px_50px_rgba(8,63,103,0.24)]">
          <div className="text-left">
            <div className="text-2xl font-black leading-none md:text-4xl">NGÀY SĂN</div>
            <div className="text-2xl font-black leading-none text-accent-cta md:text-4xl">HẠ GIÁ VÉ</div>
          </div>
          <div className="flex items-start text-[58px] font-black leading-[0.86] text-white [text-shadow:4px_4px_0_#ef555b] md:text-[86px]">
            50<span className="mt-2 text-3xl md:text-5xl">%</span>
          </div>
        </div>
        <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-white/92 px-5 py-2 text-sm font-extrabold text-[#083f67] shadow-md">
          <BadgePercent className="size-5 text-[#ef555b]" />
          Flash deal cho tuyến xe khách, tàu hỏa và máy bay
        </div>
      </motion.div>

      <FloatingTag className="left-[13%] top-[210px]" text="-20%" />
      <FloatingTag className="right-[14%] top-[205px]" delay={0.8} text="-50%" />
      <FloatingTag className="right-[8%] top-[310px]" delay={1.4} text="-30k" />
      <RoadLayer />
      <AnimatedBus />

      <div className="absolute left-12 bottom-[138px] z-[2] hidden w-56 rotate-[-4deg] rounded-2xl border-2 border-white bg-white/86 p-4 shadow-[0_20px_38px_rgba(8,63,103,0.22)] lg:block">
        <div className="rounded-xl bg-[#ef555b] px-4 py-3 text-white">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-white/75">Deal giờ vàng</div>
          <div className="mt-2 text-3xl font-black">12:00</div>
        </div>
        <div className="mt-3 h-3 rounded-full bg-slate-200" />
        <div className="mt-2 h-3 w-3/4 rounded-full bg-slate-200" />
      </div>
      <div className="absolute right-20 bottom-[142px] z-[2] hidden w-48 rotate-6 rounded-2xl border-2 border-white bg-[#083f67] p-4 text-white shadow-[0_20px_38px_rgba(8,63,103,0.24)] lg:block">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-accent-cta">Voucher</div>
        <div className="mt-3 text-4xl font-black">-30k</div>
        <div className="mt-3 h-2 rounded-full bg-white/20" />
      </div>

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-[1110px] px-5 pt-[330px]"
        initial={{ opacity: 0, y: 34, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.18, duration: 0.62, ease: "easeOut" }}
      >
        <SearchCard />
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-[5] border-t-2 border-accent-cta/80 bg-[linear-gradient(90deg,#0f6ba8_0%,#2563eb_48%,#083f67_100%)] px-5 py-4 text-white shadow-[0_-16px_34px_rgba(8,63,103,0.2)]">
        <div className="mx-auto grid max-w-[980px] grid-cols-2 gap-3 md:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-white/[0.13] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_24px_rgba(8,63,103,0.12)] transition hover:-translate-y-0.5 hover:bg-white/[0.18]"
                key={benefit.title}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-[0_8px_18px_rgba(255,255,255,0.18)] ring-2 ring-accent-cta/70">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black leading-tight">{benefit.title}</span>
                  <span className="mt-1 block text-xs font-semibold leading-tight text-white/72">{benefitDescriptions[index]}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SearchCard() {
  return (
    <Card className="w-full overflow-hidden rounded-2xl border-2 border-white bg-white/96 py-0 shadow-[0_26px_60px_rgba(8,63,103,0.28)] backdrop-blur">
      <CardHeader className="border-b px-0 py-0">
        <div className="grid h-[72px] grid-cols-[1.18fr_1.05fr_1fr_1fr_1fr] items-stretch">
          <button className="flex items-center gap-3 bg-[#f8fbff] px-6 text-[16px] font-semibold text-[#404040]" type="button">
            <span className="relative flex h-7 w-11 items-center rounded-full bg-[#34c759] p-1 shadow-inner">
              <span className="ml-auto size-5 rounded-full bg-white shadow-sm" />
            </span>
            Địa chỉ mới
          </button>
          <button className="relative flex items-center justify-center gap-3 border-b-[4px] border-accent-cta bg-primary text-[18px] font-bold text-white" type="button">
            <BusFront className="size-6" />
            Xe khách
          </button>
          <TransportTab discount="-30k" icon={Plane} label="Máy bay" />
          <TransportTab discount="-25%" icon={TrainFront} label="Tàu hỏa" />
          <TransportTab discount="Mới" icon={CarFront} label="Thuê xe" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_150px]">
          <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white md:grid-cols-[1fr_1fr_0.92fr_0.95fr]">
            <BusSearchSegment icon={MapPin} label="Nơi xuất phát" value="Hà Nội" marker="origin" />
            <div className="relative border-t border-slate-200 md:border-l md:border-t-0">
              <button
                className="absolute -left-4 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-50 text-slate-600 shadow-sm md:flex"
                type="button"
                aria-label="Đổi điểm đi và điểm đến"
              >
                <Repeat2 className="size-4" />
              </button>
              <BusSearchSegment icon={MapPin} label="Nơi đến" value="Hà Nội" marker="destination" />
            </div>
            <div className="border-t border-slate-200 md:border-l md:border-t-0">
              <BusSearchSegment icon={CalendarDays} label="Ngày đi" value="T3, 12/05/2026" />
            </div>
            <button className="flex items-center gap-4 border-t border-slate-200 px-5 text-left text-primary md:border-l md:border-t-0" type="button">
              <Plus className="size-5" />
              <span className="text-[16px] font-bold leading-tight">Thêm ngày về</span>
            </button>
          </div>
          <Button
            className="h-[64px] rounded-lg bg-accent-cta text-[20px] font-black text-[#201a00] shadow-[0_8px_0_#d99b00] hover:bg-accent-cta/90"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/tim-chuyen" />}
          >
            Tìm kiếm
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TransportTab({ discount, icon: Icon, label }: { discount: string; icon: typeof Plane; label: string }) {
  return (
    <button className="relative flex cursor-pointer items-center justify-center gap-3 text-[18px] font-semibold text-[#424242]" type="button">
      <span className="absolute top-2 rounded-full bg-[#ef555b] px-2 py-0.5 text-xs font-bold text-white">{discount}</span>
      <Icon className="mt-4 size-6" />
      <span className="mt-4">{label}</span>
    </button>
  );
}

function BusSearchSegment({
  icon: Icon,
  label,
  value,
  marker,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  marker?: "origin" | "destination";
}) {
  return (
    <button className="flex h-[64px] items-center gap-4 px-5 text-left" type="button">
      <span
        className={
          marker === "origin"
            ? "flex size-7 items-center justify-center rounded-full bg-primary text-white"
            : marker === "destination"
              ? "flex size-7 items-center justify-center rounded-full bg-[#ef555b] text-white"
              : "text-primary"
        }
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-none text-slate-400">{label}</span>
        <span className="mt-1.5 block truncate text-[16px] font-bold text-[#171717]">{value}</span>
      </span>
    </button>
  );
}

function FloatingTag({ text, className, delay = 0 }: { text: string; className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute z-[3] border-2 border-dashed border-[#083f67]/30 bg-white/90 px-4 py-2 text-lg font-black text-[#ef555b] shadow-[0_12px_24px_rgba(8,63,103,0.2)] ${className}`}
      animate={{ y: [0, -12, 0], rotate: [-4, 5, -4] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {text}
    </motion.div>
  );
}

function AnimatedBus() {
  return (
    <div
      className="bus-drive absolute bottom-[124px] left-[-280px] z-[6] hidden md:block"
      aria-hidden="true"
    >
      <div className="relative h-[92px] w-[240px]">
        <div
          className="relative z-10 h-[78px] w-[228px] rounded-[18px] bg-primary shadow-[0_16px_24px_rgba(8,63,103,0.25)]"
        >
          <div className="absolute left-5 top-4 h-6 w-9 rounded bg-white/85" />
          <div className="absolute left-18 top-4 h-6 w-9 rounded bg-white/85" />
          <div className="absolute left-[116px] top-4 h-6 w-9 rounded bg-white/85" />
          <div className="absolute right-4 top-4 h-6 w-8 rounded bg-accent-cta" />
          <div className="absolute -right-5 bottom-0 h-12 w-10 rounded-r-2xl bg-primary" />
          <div className="absolute bottom-[-10px] left-10 size-8 rounded-full border-[7px] border-slate-900 bg-white" />
          <div className="absolute bottom-[-10px] right-10 size-8 rounded-full border-[7px] border-slate-900 bg-white" />
        </div>
        <div className="absolute bottom-1 left-8 h-3 w-44 rounded-full bg-[#083f67]/25 blur-md" />
      </div>
    </div>
  );
}

function RoadLayer() {
  return (
    <div className="absolute inset-x-0 bottom-[104px] z-[3] hidden h-[100px] overflow-hidden md:block" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-[66px] bg-[#9aa7b3]" />
      <div className="absolute inset-x-0 bottom-[54px] h-[13px] bg-[#c7d0d8]" />
      <div className="absolute inset-x-0 bottom-[39px] h-px bg-white/45" />
      <div className="road-markers absolute inset-x-0 bottom-[27px] h-[4px]" />
    </div>
  );
}

function SkylineLayer() {
  return (
    <div className="absolute inset-x-0 bottom-[150px] z-[1] hidden h-32 opacity-55 md:block" aria-hidden="true">
      <div className="absolute bottom-0 left-[6%] h-20 w-16 rounded-t-xl bg-[#1d7fbc]/45" />
      <div className="absolute bottom-0 left-[14%] h-28 w-24 rounded-t-2xl bg-[#0f6ba8]/45" />
      <div className="absolute bottom-0 left-[25%] h-16 w-28 rounded-t-xl bg-[#1d7fbc]/40" />
      <div className="absolute bottom-0 right-[26%] h-24 w-24 rounded-t-2xl bg-[#0f6ba8]/42" />
      <div className="absolute bottom-0 right-[14%] h-32 w-20 rounded-t-xl bg-[#1d7fbc]/45" />
      <div className="absolute bottom-0 right-[5%] h-20 w-28 rounded-t-2xl bg-[#0f6ba8]/38" />
    </div>
  );
}
