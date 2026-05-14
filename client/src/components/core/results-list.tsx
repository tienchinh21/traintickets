"use client";

import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";
import { orderBy } from "lodash";

import { trainJourneys } from "@/data/mock-trains";
import { TrainResultCard } from "./train-result-card";

export function ResultsList() {
  const sortedJourneys = orderBy(trainJourneys, [(journey) => journey.status === "sold-out", "duration"], ["asc", "asc"]);

  return (
    <BoneyardSkeleton loading={false} name="train-results" className="flex flex-col gap-4">
      {sortedJourneys.map((journey) => (
        <TrainResultCard key={journey.id} journey={journey} />
      ))}
    </BoneyardSkeleton>
  );
}
