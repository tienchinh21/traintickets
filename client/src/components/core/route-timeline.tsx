import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StationStop } from "@/types/train";

export function RouteTimeline({ stops, compact = false }: { stops: StationStop[]; compact?: boolean }) {
  return (
    <div className={cn("flex", compact ? "items-center gap-2" : "flex-col gap-3")}>
      {stops.map((stop, index) => {
        const isLast = index === stops.length - 1;

        return (
          <div
            className={cn(
              "relative flex gap-3",
              compact ? "min-w-24 flex-col items-center text-center" : "items-start"
            )}
            key={stop.code}
          >
            {!compact && !isLast ? (
              <span className="absolute left-2.5 top-6 h-[calc(100%+0.75rem)] w-px bg-border" />
            ) : null}
            <span
              className={cn(
                "z-10 flex size-5 shrink-0 items-center justify-center rounded-full border bg-card",
                stop.active ? "border-primary bg-primary text-primary-foreground" : "border-border"
              )}
            >
              {stop.active ? <MapPin className="size-3" /> : <span className="size-2 rounded-full bg-muted-foreground/50" />}
            </span>
            <div className={cn("min-w-0", compact ? "flex flex-col gap-1" : "flex flex-col gap-0.5")}>
              <div className="text-sm font-semibold">{stop.name}</div>
              <div className="text-xs text-muted-foreground">
                {stop.code} · {stop.time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
