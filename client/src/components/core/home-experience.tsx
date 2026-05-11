import { ShieldCheck, SlidersHorizontal, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AppHeader } from "./app-header";
import { BookingSearchPanel } from "./booking-search-panel";
import { ResultsList } from "./results-list";
import { SeatMap } from "./seat-map";
import { TicketSummary } from "./ticket-summary";
import { TrainDetailPanel } from "./train-detail-panel";

const metrics = [
  { label: "Routes monitored", value: "18", icon: SlidersHorizontal },
  { label: "Hold window", value: "15m", icon: TimerReset },
  { label: "Verified payment", value: "PCI", icon: ShieldCheck },
];

export function HomeExperience() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 lg:px-0">
        <section className="flex flex-col gap-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="flex max-w-2xl flex-col gap-3">
              <Badge variant="secondary" className="w-fit">
                Premium railway booking
              </Badge>
              <h1 className="text-3xl font-bold tracking-normal md:text-4xl">Find the right Vietnam train ticket faster.</h1>
              <p className="text-muted-foreground">
                Dense search, route clarity, cabin selection, and checkout summary based on the Stitch premium design system.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <Card key={metric.label} size="sm">
                    <CardContent className="flex min-w-28 flex-col gap-2 p-3">
                      <Icon className="size-4 text-primary" />
                      <span className="text-lg font-semibold">{metric.value}</span>
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          <BookingSearchPanel />
        </section>
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Available departures</h2>
                <p className="text-sm text-muted-foreground">Sorted by availability and route duration.</p>
              </div>
              <Badge variant="outline">3 trains</Badge>
            </div>
            <ResultsList />
          </div>
          <aside className="flex flex-col gap-4">
            <TicketSummary />
          </aside>
        </section>
        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <TrainDetailPanel />
          <SeatMap />
        </section>
      </main>
    </div>
  );
}
