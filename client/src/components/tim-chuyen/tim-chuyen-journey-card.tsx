"use client";

import { ArrowRight, Clock3, MapPinned, TrainFront } from "lucide-react";
import Link from "next/link";

import { RouteTimeline } from "@/components/core/route-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ClientTripSearchItem, StationStop } from "@/types/train";

export function TimChuyenJourneyCard({
  journey,
}: {
  journey: ClientTripSearchItem;
}) {
  const duration = formatDuration(journey.durationMinutes);
  const timelineStops: StationStop[] = journey.stops.map((stop) => ({
    name: stop.name,
    code: stop.code,
    time: formatTime(stop.scheduledDepartureAt ?? stop.scheduledArrivalAt),
    active:
      stop.stationId === journey.from.stationId ||
      stop.stationId === journey.to.stationId,
  }));

  return (
    <Card className="border-sky-100 bg-white py-0 shadow-[0_14px_34px_rgba(8,63,103,0.08)]">
      <CardContent className="p-5">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <TrainFront className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-[#172033]">
                    {journey.code}
                  </h3>
                  <Badge
                    className="max-w-full truncate border-sky-100 bg-white text-[#172033]"
                    variant="outline"
                  >
                    {journey.train.name}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {journey.route.name}
                </p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary" variant="secondary">
              {journey.status}
            </Badge>
          </div>

          <div className="grid gap-5 lg:grid-cols-[150px_minmax(0,1fr)_150px] lg:items-center">
            <StationTime
              align="left"
              name={journey.from.name}
              time={formatTime(journey.from.scheduledDepartureAt)}
            />
            <div className="min-w-0">
              <div className="mx-auto flex max-w-[520px] flex-col items-center gap-2">
                <Badge
                  className="bg-accent-cta text-[#083f67]"
                  variant="secondary"
                >
                  <Clock3 data-icon="inline-start" />
                  {duration}
                </Badge>
                <div className="h-px w-full bg-sky-100" />
                <RouteTimeline compact stops={timelineStops} />
              </div>
            </div>
            <StationTime
              align="right"
              name={journey.to.name}
              time={formatTime(journey.to.scheduledArrivalAt)}
            />
          </div>

          <div className="flex flex-col gap-4 border-t border-sky-100 pt-4 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 flex-wrap gap-2">
              <Badge
                className="border-sky-100 bg-white text-[#172033]"
                variant="outline"
              >
                <MapPinned data-icon="inline-start" />
                {journey.distanceKm} km
              </Badge>
              <Badge
                className="border-sky-100 bg-white text-[#172033]"
                variant="outline"
              >
                Chưa có giá vé
              </Badge>
            </div>
            <Button
              className="h-10 rounded-xl px-4 font-black"
              nativeButton={false}
              render={<Link href={`/chuyen-tau/${journey.id}`} />}
            >
              Chi tiết
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StationTime({
  align,
  name,
  time,
}: {
  align: "left" | "right";
  name: string;
  time: string;
}) {
  return (
    <div className={align === "right" ? "text-left lg:text-right" : undefined}>
      <div className="text-4xl font-black leading-none tracking-normal text-[#0f172a]">
        {time}
      </div>
      <div className="mt-2 text-base font-black text-[#172033]">{name}</div>
    </div>
  );
}

function formatTime(value: string | null) {
  if (!value) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function formatDuration(minutes: number | null) {
  if (minutes === null) {
    return "Chưa rõ";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} phút`;
  }

  return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}m`;
}
