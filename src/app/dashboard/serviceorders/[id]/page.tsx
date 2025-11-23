import EditServiceOrder from "@/components/serviceOrders/EditServiceOrder/EditServiceOrder";

export default async function EditServiceOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditServiceOrder serviceOrderId={id} />;
}
