"use client";

import { ArrowRight, Clock3, Gauge, Luggage, TrainFront } from "lucide-react";
import Link from "next/link";

import { RouteTimeline } from "@/components/core/route-timeline";
import { StatusBadge } from "@/components/core/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { useBookingStore } from "@/store/booking-store";
import type { TrainJourney } from "@/types/train";

export function TimChuyenJourneyCard({ journey }: { journey: TrainJourney }) {
  const selectTrain = useBookingStore((state) => state.selectTrain);
  const selectedTrain = useBookingStore((state) => state.selectedTrain);
  const cheapestFare = journey.fares.reduce((lowest, fare) => (fare.price < lowest.price ? fare : lowest), journey.fares[0]);
  const isSelected = selectedTrain.id === journey.id;

  return (
    <Card
      className={
        isSelected
          ? "border-primary bg-white py-0 shadow-[0_18px_42px_rgba(37,99,235,0.16)] ring-2 ring-primary"
          : "border-sky-100 bg-white py-0 shadow-[0_14px_34px_rgba(8,63,103,0.08)]"
      }
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <TrainFront className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-[#172033]">{journey.code}</h3>
                  <Badge className="max-w-full truncate border-sky-100 bg-white text-[#172033]" variant="outline">
                    {journey.operator}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-500">{journey.distance}</p>
              </div>
            </div>
            <StatusBadge status={journey.status} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[150px_minmax(0,1fr)_150px] lg:items-center">
            <StationTime align="left" name={journey.from.name} platform={journey.from.platform} time={journey.from.time} />
            <div className="min-w-0">
              <div className="mx-auto flex max-w-[520px] flex-col items-center gap-2">
                <Badge className="bg-accent-cta text-[#083f67]" variant="secondary">
                  <Clock3 data-icon="inline-start" />
                  {journey.duration}
                </Badge>
                <div className="h-px w-full bg-sky-100" />
                <RouteTimeline compact stops={journey.stops} />
              </div>
            </div>
            <StationTime align="right" name={journey.to.name} platform={journey.to.platform} time={journey.to.time} />
          </div>

          <div className="grid gap-4 border-t border-sky-100 pt-4 lg:grid-cols-[minmax(0,1fr)_180px_170px] lg:items-end">
            <div className="flex min-w-0 flex-wrap gap-2">
              {journey.amenities.map((amenity) => (
                <Badge className="border-sky-100 bg-white text-[#172033]" key={amenity} variant="outline">
                  <Luggage data-icon="inline-start" />
                  {amenity}
                </Badge>
              ))}
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <Gauge className="size-4" />
                  Đúng giờ
                </span>
                <span className="font-black text-[#172033]">{journey.punctuality}%</span>
              </div>
              <Progress value={journey.punctuality} />
            </div>
            <div className="flex items-end justify-between gap-4 lg:flex-col lg:items-end">
              <div className="lg:text-right">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Từ</span>
                <div className="text-2xl font-black text-[#172033]">{formatCurrency(cheapestFare.price)}</div>
              </div>
              <Button
                className="h-10 rounded-xl px-4 font-black"
                disabled={journey.status === "sold-out"}
                nativeButton={false}
                onClick={() => selectTrain(journey)}
                render={<Link href={`/chuyen-tau/${journey.id}`} />}
              >
                Chi tiết
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StationTime({
  align,
  name,
  platform,
  time,
}: {
  align: "left" | "right";
  name: string;
  platform: string;
  time: string;
}) {
  return (
    <div className={align === "right" ? "text-left lg:text-right" : undefined}>
      <div className="text-4xl font-black leading-none tracking-normal text-[#0f172a]">{time}</div>
      <div className="mt-2 text-base font-black text-[#172033]">{name}</div>
      <div className="mt-1 text-sm font-medium text-slate-500">{platform}</div>
    </div>
  );
}
