import { AlertTriangle, CheckCircle2, CircleSlash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { TrainStatus } from "@/types/train";

const statusCopy: Record<TrainStatus, string> = {
  available: "Còn chỗ",
  limited: "Sắp hết",
  "sold-out": "Hết vé",
};

const statusIcon = {
  available: CheckCircle2,
  limited: AlertTriangle,
  "sold-out": CircleSlash2,
};

export function StatusBadge({ status }: { status: TrainStatus }) {
  const Icon = statusIcon[status];

  return (
    <Badge
      variant={status === "available" ? "default" : status === "limited" ? "secondary" : "outline"}
      className={status === "limited" ? "bg-warning-soft text-amber-900" : undefined}
    >
      <Icon data-icon="inline-start" />
      {statusCopy[status]}
    </Badge>
  );
}
