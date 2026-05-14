"use client";

import { CalendarDays, MapPin, Search, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookingStore } from "@/store/booking-store";

export function BookingSearchPanel({ submitHref = "/tim-chuyen" }: { submitHref?: string }) {
  const router = useRouter();
  const criteria = useBookingStore((state) => state.criteria);
  const setCriteria = useBookingStore((state) => state.setCriteria);

  return (
    <Card className="border-sky-100 bg-white shadow-[0_14px_34px_rgba(8,63,103,0.08)]">
      <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_180px_150px_auto]">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Điểm đi</span>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={criteria.from}
              onChange={(event) => setCriteria({ ...criteria, from: event.target.value })}
            />
          </div>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Điểm đến</span>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={criteria.to}
              onChange={(event) => setCriteria({ ...criteria, to: event.target.value })}
            />
          </div>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Ngày đi</span>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              type="date"
              value={criteria.departDate}
              onChange={(event) => setCriteria({ ...criteria, departDate: event.target.value })}
            />
          </div>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Hành khách</span>
          <Select
            value={String(criteria.passengers)}
            onValueChange={(value) => setCriteria({ ...criteria, passengers: Number(value) })}
          >
            <SelectTrigger>
              <UsersRound data-icon="inline-start" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count} hành khách
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
        <div className="flex items-end">
          <Button className="h-9 w-full rounded-xl font-black md:w-auto" onClick={() => router.push(submitHref)}>
            <Search data-icon="inline-start" />
            Tìm kiếm
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
