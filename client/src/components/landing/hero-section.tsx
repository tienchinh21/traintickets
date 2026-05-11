"use client";

import { BusFront, CalendarDays, CarFront, MapPin, Plane, Plus, Repeat2, TrainFront } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { benefits } from "./data";

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  const heroTextY = useTransform(scrollYProgress, [0, 0.25], [0, -70]);
  const heroBgY = useTransform(scrollYProgress, [0, 0.25], [0, 45]);

  return (
    <section className="relative h-[650px] overflow-hidden border-y bg-[#bfefff]">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,#ffffff_0,#b9edff_38%,#6fd0ff_100%)]"
        style={{ y: heroBgY }}
      />
      <div className="absolute left-0 top-0 h-full w-[32%] bg-[radial-gradient(circle_at_30%_55%,#fff7b8_0,#fcd34d_12%,transparent_30%)] opacity-80" />
      <div className="absolute right-0 bottom-0 h-full w-[38%] bg-[radial-gradient(circle_at_75%_65%,#fff7b8_0,#facc15_10%,transparent_32%)] opacity-80" />

      <motion.div
        className="absolute inset-x-0 top-7 z-0 text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ y: heroTextY }}
      >
        <motion.div
          className="inline-flex rotate-[-3deg] items-center rounded-xl bg-white px-8 py-2 text-xl font-black text-primary shadow-md"
          animate={{ rotate: [-3, -1.5, -3], y: [0, -4, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        >
          THỨ 3 · 12h đến 14h
        </motion.div>
        <div className="mx-auto mt-3 w-fit rounded-xl bg-primary px-10 py-2 text-2xl font-black text-white shadow-lg">
          NGÀY SĂN HẠ GIÁ VÉ
        </div>
        <div className="mt-2 text-3xl font-black text-orange-500 [text-shadow:2px_2px_0_#fff]">HẠ ĐẸP ĐẾN 50%</div>
      </motion.div>

      <FloatingTag className="left-[18%] top-[170px]" text="20%" />
      <FloatingTag className="right-[16%] top-[160px]" delay={0.8} text="50%" />
      <FloatingTag className="right-[9%] top-[250px]" delay={1.4} text="-30k" />
      <RoadLayer />
      <AnimatedBus />

      <div className="absolute left-12 bottom-16 hidden w-52 rounded-3xl bg-white/70 p-4 shadow-xl lg:block">
        <div className="h-40 rounded-2xl bg-gradient-to-br from-yellow-300 to-orange-400" />
      </div>
      <div className="absolute right-20 bottom-20 hidden size-36 rounded-[2rem] bg-gradient-to-br from-primary to-sky-400 shadow-xl lg:block" />

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-[1110px] px-5 pt-[220px]"
        initial={{ opacity: 0, y: 34, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.18, duration: 0.62, ease: "easeOut" }}
      >
        <SearchCard />
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-[5] bg-[#083f67]/88 pb-5 pt-2 text-white">
        <div className="mx-auto grid max-w-[760px] grid-cols-4 gap-6 px-5">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div className="flex items-center gap-3" key={benefit.title}>
                <Icon className="size-5 text-accent-cta" />
                <span className="text-sm font-semibold">{benefit.title}</span>
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
    <Card className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-[0_18px_42px_rgba(15,23,42,0.18)]">
      <CardHeader className="border-b px-0 py-0">
        <div className="grid h-[72px] grid-cols-[1.18fr_1.05fr_1fr_1fr_1fr] items-stretch">
          <button className="flex items-center gap-3 px-6 text-[16px] font-semibold text-[#404040]" type="button">
            <span className="relative flex h-7 w-11 items-center rounded-full bg-[#34c759] p-1">
              <span className="ml-auto size-5 rounded-full bg-white shadow-sm" />
            </span>
            Địa chỉ mới
          </button>
          <button className="relative flex items-center justify-center gap-3 border-b-[3px] border-primary text-[18px] font-bold text-primary" type="button">
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
          <Button className="h-[64px] rounded-lg bg-accent-cta text-[20px] font-bold text-[#201a00] hover:bg-accent-cta/90" render={<Link href="/search" />}>
            Tìm kiếm
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TransportTab({ discount, icon: Icon, label }: { discount: string; icon: typeof Plane; label: string }) {
  return (
    <button className="relative flex items-center justify-center gap-3 text-[18px] font-semibold text-[#424242]" type="button">
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
      className={`absolute z-[1] rounded-lg bg-white/85 px-3 py-1.5 text-sm font-black text-primary shadow-md ${className}`}
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
      className="bus-drive absolute bottom-[92px] left-[-280px] z-[6] hidden md:block"
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
    <div className="absolute inset-x-0 bottom-[46px] z-[3] hidden h-[92px] overflow-hidden md:block" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-[66px] bg-[#9aa7b3]" />
      <div className="absolute inset-x-0 bottom-[54px] h-[13px] bg-[#c7d0d8]" />
      <div className="absolute inset-x-0 bottom-[39px] h-px bg-white/45" />
      <div className="road-markers absolute inset-x-0 bottom-[27px] h-[4px]" />
    </div>
  );
}
