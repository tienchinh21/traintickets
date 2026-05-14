import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { trainJourneys } from "@/data/mock-trains";
import { AppShell } from "./app-shell";
import { RouteTimeline } from "./route-timeline";
import { SeatMap } from "./seat-map";
import { TicketSummary } from "./ticket-summary";
import { TrainDetailPanel } from "./train-detail-panel";

export function TrainDetailPage({ trainId }: { trainId: string }) {
  const journey = trainJourneys.find((item) => item.id === trainId);

  if (!journey) {
    notFound();
  }

  const defaultFare = journey.fares.find((fare) => fare.remaining > 0) ?? journey.fares[0];

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              {journey.operator}
            </Badge>
            <h1 className="text-3xl font-bold tracking-normal">Chi tiết chuyến {journey.code}</h1>
            <p className="text-muted-foreground">
              {journey.from.name} đến {journey.to.name} · {journey.duration} · {journey.distance}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <RouteTimeline stops={journey.stops} />
          </div>
          <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <TrainDetailPanel journey={journey} />
            <SeatMap />
          </section>
        </div>
        <aside>
          <TicketSummary journey={journey} fare={defaultFare} />
        </aside>
      </section>
    </AppShell>
  );
}
