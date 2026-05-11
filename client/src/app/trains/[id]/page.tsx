import { TrainDetailPage } from "@/components/core/train-detail-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <TrainDetailPage trainId={id} />;
}
