"use client";

import EditSale from "@/components/Sales/EditSale/EditSale";
import { useParams } from "next/navigation";

export default function EditSalePage() {
  const params = useParams();
  console.log("Params in EditSalePage:", params);
  const salesOrderId = Number(params.id);

  return <EditSale salesOrderId={salesOrderId} />;
}
