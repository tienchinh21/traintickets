import { AppShell } from "@/components/core/app-shell";
import { BookingSearchPanel } from "@/components/core/booking-search-panel";
import { TimChuyenResultsSection } from "./tim-chuyen-results-section";
import { TimChuyenSummarySidebar } from "./tim-chuyen-summary-sidebar";

export function TimChuyenPage() {
  return (
    <AppShell>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Tìm chuyến</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-[#172033]">Hà Nội đến Sài Gòn</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">So sánh giờ chạy, tiện ích, giá vé và tình trạng chỗ.</p>
          </div>
          <div className="w-fit rounded-full bg-accent-cta/25 px-4 py-2 text-sm font-black text-[#083f67]">
            3 chuyến phù hợp
          </div>
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
