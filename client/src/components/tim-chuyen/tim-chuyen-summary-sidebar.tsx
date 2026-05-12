import { TicketSummary } from "@/components/core/ticket-summary";

export function TimChuyenSummarySidebar() {
  return (
    <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
      <TicketSummary />
    </aside>
  );
}
