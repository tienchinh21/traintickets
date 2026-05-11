import { Badge } from "@/components/ui/badge";
import { AppShell } from "./app-shell";
import { BookingSearchPanel } from "./booking-search-panel";
import { ResultsList } from "./results-list";
import { TicketSummary } from "./ticket-summary";

export function SearchPage() {
  return (
    <AppShell>
      <section className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Available departures</h1>
          <p className="text-muted-foreground">Compare routes, duration, fares, and seat availability.</p>
        </div>
        <BookingSearchPanel />
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Ha Noi to Sai Gon</h2>
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
    </AppShell>
  );
}
