"use client";

import { Clock3, Gauge, Luggage, TrainFront } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { useBookingStore } from "@/store/booking-store";
import type { TrainJourney } from "@/types/train";
import { RouteTimeline } from "./route-timeline";
import { StatusBadge } from "./status-badge";

export function TrainResultCard({ journey }: { journey: TrainJourney }) {
  const selectTrain = useBookingStore((state) => state.selectTrain);
  const selectedTrain = useBookingStore((state) => state.selectedTrain);
  const cheapestFare = journey.fares.reduce((lowest, fare) => (fare.price < lowest.price ? fare : lowest), journey.fares[0]);
  const isSelected = selectedTrain.id === journey.id;

  return (
    <Card className={isSelected ? "ring-2 ring-primary" : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <TrainFront className="size-4" />
          </span>
          {journey.code}
          <Badge variant="outline">{journey.operator}</Badge>
        </CardTitle>
        <CardAction>
          <StatusBadge status={journey.status} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-semibold">{journey.from.time}</span>
            <span className="font-medium">{journey.from.name}</span>
            <span className="text-sm text-muted-foreground">{journey.from.platform}</span>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-center">
            <Badge variant="secondary">
              <Clock3 data-icon="inline-start" />
              {journey.duration}
            </Badge>
            <div className="h-px w-full min-w-28 bg-border md:w-36" />
            <span className="text-xs text-muted-foreground">{journey.distance}</span>
          </div>
          <div className="flex flex-col gap-1 md:text-right">
            <span className="text-3xl font-semibold">{journey.to.time}</span>
            <span className="font-medium">{journey.to.name}</span>
            <span className="text-sm text-muted-foreground">{journey.to.platform}</span>
          </div>
        </div>
        <RouteTimeline compact stops={journey.stops} />
        <Separator />
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
          <div className="flex flex-wrap gap-2">
            {journey.amenities.map((amenity) => (
              <Badge key={amenity} variant="outline">
                <Luggage data-icon="inline-start" />
                {amenity}
              </Badge>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Gauge className="size-4" />
                On-time
              </span>
              <span className="font-medium">{journey.punctuality}%</span>
            </div>
            <Progress value={journey.punctuality} />
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <span className="text-sm text-muted-foreground">From</span>
            <span className="text-xl font-semibold">{formatCurrency(cheapestFare.price)}</span>
            <Button
              disabled={journey.status === "sold-out"}
              onClick={() => selectTrain(journey)}
              render={<Link href={`/trains/${journey.id}`} />}
            >
              View detail
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
