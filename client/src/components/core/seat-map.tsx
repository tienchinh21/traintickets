"use client";

import { cn } from "@/lib/utils";

const seats = Array.from({ length: 32 }, (_, index) => {
  const id = index + 1;
  const sold = [3, 7, 8, 14, 21, 27].includes(id);
  const selected = [11, 12].includes(id);
  return { id, sold, selected };
});

export function SeatMap() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Carriage 6</h3>
          <p className="text-sm text-muted-foreground">Sleeper cabin geometry</p>
        </div>
        <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium">2 selected</div>
      </div>
      <div className="grid grid-cols-4 gap-2 rounded-2xl bg-surface-subtle p-3">
        {seats.map((seat) => (
          <button
            aria-label={`Seat ${seat.id}`}
            className={cn(
              "h-10 rounded-lg border bg-card text-xs font-semibold transition",
              seat.selected && "border-primary bg-primary text-primary-foreground",
              seat.sold && "cursor-not-allowed border-border bg-muted text-muted-foreground line-through opacity-60",
              !seat.selected && !seat.sold && "hover:border-primary"
            )}
            disabled={seat.sold}
            key={seat.id}
            type="button"
          >
            {seat.id}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm border bg-card" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-primary" />
          Selected
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-muted" />
          Sold out
        </span>
      </div>
    </div>
  );
}
