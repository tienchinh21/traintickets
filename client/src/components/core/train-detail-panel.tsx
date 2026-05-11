"use client";

import { Armchair, BedDouble, ShieldCheck, TrainTrack } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/format";
import { useBookingStore } from "@/store/booking-store";
import type { FareOption, TrainJourney } from "@/types/train";
import { RouteTimeline } from "./route-timeline";

const fareIcon: Record<FareOption["seatClass"], typeof Armchair> = {
  "soft-seat": Armchair,
  "sleeper-4": BedDouble,
  "sleeper-6": BedDouble,
};

export function TrainDetailPanel({ journey }: { journey?: TrainJourney }) {
  const storeTrain = useBookingStore((state) => state.selectedTrain);
  const selectedFare = useBookingStore((state) => state.selectedFare);
  const selectFare = useBookingStore((state) => state.selectFare);
  const selectedTrain = journey ?? storeTrain;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrainTrack className="size-5 text-primary" />
          {selectedTrain.code} detail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fares">
          <TabsList>
            <TabsTrigger value="fares">Fares</TabsTrigger>
            <TabsTrigger value="route">Route</TabsTrigger>
          </TabsList>
          <TabsContent value="fares" className="mt-4">
            <div className="grid gap-3">
              {selectedTrain.fares.map((fare) => {
                const Icon = fareIcon[fare.seatClass];
                const isSelected = selectedFare.id === fare.id;

                return (
                  <button
                    className="flex items-center justify-between rounded-xl border bg-card p-3 text-left transition hover:bg-muted disabled:opacity-50 data-[selected=true]:border-primary data-[selected=true]:bg-primary-soft"
                    data-selected={isSelected}
                    disabled={fare.remaining === 0}
                    key={fare.id}
                    onClick={() => selectFare(fare)}
                    type="button"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="font-medium">{fare.label}</span>
                        <span className="text-xs text-muted-foreground">{fare.remaining} seats remaining</span>
                      </span>
                    </span>
                    <span className="font-semibold">{formatCurrency(fare.price)}</span>
                  </button>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="route" className="mt-4">
            <RouteTimeline stops={selectedTrain.stops} />
          </TabsContent>
        </Tabs>
        <div className="mt-4 rounded-xl bg-success-soft p-3 text-sm text-green-900">
          <ShieldCheck className="mr-2 inline size-4" />
          Ticket can be held for 15 minutes during checkout.
        </div>
      </CardContent>
    </Card>
  );
}
