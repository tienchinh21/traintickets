import { orderBy } from "lodash";

import { Badge } from "@/components/ui/badge";
import { trainJourneys } from "@/data/mock-trains";
import { TimChuyenJourneyCard } from "./tim-chuyen-journey-card";

export function TimChuyenResultsSection() {
  const sortedJourneys = orderBy(trainJourneys, [(journey) => journey.status === "sold-out", "duration"], ["asc", "asc"]);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-normal text-[#172033]">Chuyến khởi hành</h2>
          <p className="text-sm font-medium text-slate-500">Sắp xếp theo tình trạng chỗ và thời lượng di chuyển.</p>
        </div>
        <Badge className="bg-primary/10 text-primary" variant="secondary">
          {sortedJourneys.length} chuyến
        </Badge>
      </div>

      <div className="flex flex-col gap-4">
        {sortedJourneys.map((journey) => (
          <TimChuyenJourneyCard journey={journey} key={journey.id} />
        ))}
      </div>
    </div>
  );
}
