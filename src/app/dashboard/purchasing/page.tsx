"use client";

import PurchasingTable from "@/components/Purchasing/PurchasingTable/PurchasingTable";
import ReadOnlyPurchasing from "@/components/Purchasing/ReadOnlyPurchasingTable/ReadOnlyPurchasingTable";
import { useUser } from "@clerk/nextjs";
import { Center, Loader } from "@mantine/core";

export default function PurchasingPage() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) {
    return (
      <Center h="100vh">
        <Loader color="violet" />
      </Center>
    );
  }

  const role = user?.publicMetadata?.role as string | undefined;

  const canEdit = role === "admin" || role === "scheduler";

  if (canEdit) {
    return <PurchasingTable />;
  }
  return <ReadOnlyPurchasing/>
}
