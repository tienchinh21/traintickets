"use client";

import { Badge } from "@/components/ui/badge";
import { useBookingStore } from "@/store/booking-store";
import { TimChuyenJourneyCard } from "./tim-chuyen-journey-card";

export function TimChuyenResultsSection() {
  const results = useBookingStore((state) => state.searchResults);
  const meta = useBookingStore((state) => state.searchMeta);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-normal text-[#172033]">
            Chuyến khởi hành
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Kết quả được sắp xếp theo giờ khởi hành sớm nhất.
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary" variant="secondary">
          {meta?.total ?? 0} chuyến
        </Badge>
      </div>

      {results.length > 0 ? (
        <div className="flex flex-col gap-4">
          {results.map((journey) => (
            <TimChuyenJourneyCard journey={journey} key={journey.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-sky-200 bg-white p-6 text-sm font-medium text-slate-500">
          Chọn thông tin tìm kiếm để xem danh sách chuyến phù hợp.
        </div>
      )}
    </div>
  );
}
