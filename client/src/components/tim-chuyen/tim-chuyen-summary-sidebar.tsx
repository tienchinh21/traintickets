"use client";

import { Info, TicketCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingStore } from "@/store/booking-store";

export function TimChuyenSummarySidebar() {
  const criteria = useBookingStore((state) => state.criteria);
  const meta = useBookingStore((state) => state.searchMeta);

  return (
    <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
      <Card className="border-sky-100 bg-white shadow-[0_14px_34px_rgba(8,63,103,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black text-[#172033]">
            <TicketCheck className="size-5 text-primary" />
            Tóm tắt tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="rounded-xl border border-dashed border-sky-200 bg-[#f8fcff] p-4 text-slate-600">
            <div className="font-black text-[#172033]">
              {meta?.total ?? 0} chuyến phù hợp
            </div>
            <div className="mt-1">
              Ngày {criteria.serviceDate} từ {criteria.departureTime}
            </div>
            <div className="mt-1">{criteria.passengers} hành khách</div>
          </div>
          <div className="flex gap-2 rounded-xl bg-primary/5 p-3 text-slate-600">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Giá vé và tình trạng ghế sẽ hiển thị sau khi BE có module fare và
              seat availability.
            </span>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
