"use client";

import { CalendarDays, MapPin, Search, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBookingStore } from "@/store/booking-store";

export function BookingSearchPanel({ submitHref = "/search" }: { submitHref?: string }) {
  const router = useRouter();
  const criteria = useBookingStore((state) => state.criteria);
  const setCriteria = useBookingStore((state) => state.setCriteria);

  return (
    <Card className="shadow-sm">
      <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_180px_150px_auto]">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">From</span>
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
          <span className="text-xs font-medium text-muted-foreground">To</span>
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
          <span className="text-xs font-medium text-muted-foreground">Depart</span>
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
          <span className="text-xs font-medium text-muted-foreground">Passengers</span>
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
                    {count} passenger{count > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
        <div className="flex items-end">
          <Button className="h-9 w-full md:w-auto" onClick={() => router.push(submitHref)}>
            <Search data-icon="inline-start" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
