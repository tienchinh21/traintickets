"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CalendarClock,
  CalendarDays,
  MapPin,
  Search,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClientStations } from "@/lib/api/stations";
import { searchClientTrips } from "@/lib/api/trips";
import { useBookingStore } from "@/store/booking-store";

export function BookingSearchPanel() {
  const criteria = useBookingStore((state) => state.criteria);
  const setCriteria = useBookingStore((state) => state.setCriteria);
  const setSearchResults = useBookingStore((state) => state.setSearchResults);
  const stationsQuery = useQuery({
    queryKey: ["client-stations"],
    queryFn: () => getClientStations({ limit: 100 }),
    staleTime: 5 * 60_000,
  });
  const searchMutation = useMutation({
    mutationFn: searchClientTrips,
    onSuccess: (response) => {
      setSearchResults(response.data, response.meta);
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getSearchErrorMessage(error));
    },
  });

  const stations = stationsQuery.data?.data ?? [];

  function handleSearch() {
    if (!criteria.fromStationId || !criteria.toStationId) {
      toast.error("Vui lòng chọn ga đi và ga đến");
      return;
    }

    if (criteria.fromStationId === criteria.toStationId) {
      toast.error("Ga đi và ga đến phải khác nhau");
      return;
    }

    searchMutation.mutate(criteria);
  }

  return (
    <Card className="border-sky-100 bg-white shadow-[0_14px_34px_rgba(8,63,103,0.08)]">
      <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_160px_140px_150px_auto]">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            Điểm đi
          </span>
          <StationSelect
            disabled={stationsQuery.isLoading}
            onValueChange={(fromStationId) =>
              setCriteria({ ...criteria, fromStationId })
            }
            placeholder="Chọn ga đi"
            stations={stations}
            value={criteria.fromStationId}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            Điểm đến
          </span>
          <StationSelect
            disabled={stationsQuery.isLoading}
            onValueChange={(toStationId) =>
              setCriteria({ ...criteria, toStationId })
            }
            placeholder="Chọn ga đến"
            stations={stations}
            value={criteria.toStationId}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            Ngày đi
          </span>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              type="date"
              value={criteria.serviceDate}
              onChange={(event) =>
                setCriteria({ ...criteria, serviceDate: event.target.value })
              }
            />
          </div>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            Giờ đi
          </span>
          <div className="relative">
            <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              type="time"
              value={criteria.departureTime}
              onChange={(event) =>
                setCriteria({ ...criteria, departureTime: event.target.value })
              }
            />
          </div>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            Hành khách
          </span>
          <Select
            value={String(criteria.passengers)}
            onValueChange={(value) =>
              setCriteria({ ...criteria, passengers: Number(value) })
            }
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
          <Button
            className="h-9 w-full rounded-xl font-black md:w-auto"
            disabled={searchMutation.isPending}
            onClick={handleSearch}
          >
            <Search data-icon="inline-start" />
            {searchMutation.isPending ? "Đang tìm" : "Tìm kiếm"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StationSelect({
  disabled,
  onValueChange,
  placeholder,
  stations,
  value,
}: {
  disabled?: boolean;
  onValueChange: (value: string) => void;
  placeholder: string;
  stations: Array<{
    id: string;
    code: string;
    name: string;
    city: string | null;
  }>;
  value: string;
}) {
  const selectedStation = stations.find((s) => s.id === value);

  return (
    <Select disabled={disabled} value={value} onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}>
      <SelectTrigger className="h-9 w-full">
        <MapPin data-icon="inline-start" />
        <SelectValue placeholder={disabled ? "Đang tải ga" : placeholder}>
          {selectedStation ? `${selectedStation.name} (${selectedStation.code})` : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" className="max-h-72">
        <SelectGroup>
          {stations.map((station) => (
            <SelectItem key={station.id} value={station.id}>
              {station.name} ({station.code})
              {station.city ? ` - ${station.city}` : ""}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function getSearchErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; error?: { message?: string } }
      | undefined;
    return data?.error?.message ?? data?.message ?? "Không thể tìm chuyến";
  }

  return "Không thể tìm chuyến";
}
