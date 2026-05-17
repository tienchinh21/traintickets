import { AppShell } from "@/components/core/app-shell";
import { BookingSearchPanel } from "@/components/core/booking-search-panel";
import { TimChuyenResultsSection } from "./tim-chuyen-results-section";
import { TimChuyenSummarySidebar } from "./tim-chuyen-summary-sidebar";

export function TimChuyenPage() {
  return (
    <AppShell>
      <section className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            Tìm chuyến
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-[#172033]">
            Chọn chuyến tàu
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Chọn ga đi, ga đến, ngày và giờ khởi hành để tìm chuyến phù hợp.
          </p>
        </div>
        <BookingSearchPanel />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <TimChuyenResultsSection />
        <TimChuyenSummarySidebar />
      </section>
    </AppShell>
  );
}
