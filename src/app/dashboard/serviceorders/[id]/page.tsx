"use client";

import EditServiceOrder from "@/components/serviceOrders/EditServiceOrder/EditServiceOrder";
import ReadOnlyServiceOrder from "@/components/serviceOrders/ReadOnlyServiceOrder/ReadOnlyServiceOrder";
import { useUser } from "@clerk/nextjs";
import { Center, Loader } from "@mantine/core";
import { useParams } from "next/navigation";

export default function ServiceOrderPage() {
  const params = useParams();
  const { user, isLoaded } = useUser();
  const serviceOrderId = String(params.id);

  if (!isLoaded) {
    return (
      <Center h="100vh">
        <Loader color="violet" />
      </Center>
    );
  }

  const role = user?.publicMetadata?.role as string | undefined;

  const canEdit = role === "admin" || role === "designer";

  if (canEdit) {
    return <EditServiceOrder serviceOrderId={serviceOrderId} />;
  }

  return <ReadOnlyServiceOrder serviceOrderId={serviceOrderId} />;
}
