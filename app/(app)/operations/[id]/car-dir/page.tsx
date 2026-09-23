import { OperationDetail } from "@/features/operations/operation-detail";
import { requireSession } from "@/lib/auth";

export default async function OperationCarDirPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  return <OperationDetail companyId={session.companyId} id={id} tab="car-dir" />;
}

