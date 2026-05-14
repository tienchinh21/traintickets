"use client";

import { CreditCard, TicketCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { useBookingStore } from "@/store/booking-store";
import type { FareOption, TrainJourney } from "@/types/train";

export function TicketSummary({ journey, fare }: { journey?: TrainJourney; fare?: FareOption }) {
  const storeTrain = useBookingStore((state) => state.selectedTrain);
  const storeFare = useBookingStore((state) => state.selectedFare);
  const criteria = useBookingStore((state) => state.criteria);
  const selectedTrain = journey ?? storeTrain;
  const selectedFare = fare ?? storeFare;
  const subtotal = selectedFare.price * criteria.passengers;
  const serviceFee = 42000 * criteria.passengers;
  const total = subtotal + serviceFee;

  return (
    <Card className="border-sky-100 bg-white shadow-[0_14px_34px_rgba(8,63,103,0.08)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black text-[#172033]">
          <TicketCheck className="size-5 text-primary" />
          Tóm tắt vé
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-2xl border border-dashed border-sky-200 bg-[#f8fcff] p-4">
          <div className="flex justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold">{selectedTrain.from.time}</div>
              <div className="text-sm text-muted-foreground">{selectedTrain.from.code}</div>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              <div>{selectedTrain.code}</div>
              <div>{selectedTrain.duration}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{selectedTrain.to.time}</div>
              <div className="text-sm text-muted-foreground">{selectedTrain.to.code}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{selectedFare.label}</span>
            <span>{formatCurrency(selectedFare.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hành khách</span>
            <span>x{criteria.passengers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phí dịch vụ</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-black">Tổng cộng</span>
          <span className="text-2xl font-semibold">{formatCurrency(total)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full rounded-xl bg-accent-cta font-black text-accent-cta-foreground hover:bg-accent-cta/90" variant="secondary">
          <CreditCard data-icon="inline-start" />
          Tiếp tục thanh toán
        </Button>
      </CardFooter>
    </Card>
  );
}
