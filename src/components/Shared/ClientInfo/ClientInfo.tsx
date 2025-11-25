import { Paper, Text, Stack } from "@mantine/core";
import { FaUser } from "react-icons/fa";
import { Tables } from "@/types/db";

interface ClientInfoProps {
  client: Partial<Tables<"client">> | null | undefined;
  shipping: Partial<Tables<"sales_orders">> | null | undefined;
}

export default function ClientInfo({ client, shipping }: ClientInfoProps) {
  const formattedAddress = [
    shipping?.shipping_street,
    shipping?.shipping_city,
    shipping?.shipping_province,
    shipping?.shipping_zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Paper p="md" radius="md" shadow="sm" style={{ background: "#f5f5f5" }}>
      <Text
        fw={600}
        size="lg"
        mb="md"
        c="#4A00E0"
        style={{ display: "flex", alignItems: "center" }}
      >
        <FaUser style={{ marginRight: 8 }} /> Client Details
      </Text>
      <Stack gap={3}>
        <InfoRow label="Client" value={client?.lastName} />
        <InfoRow label="Phone 1" value={client?.phone1} />
        <InfoRow label="Phone 2" value={client?.phone2} />
        <InfoRow label="Email 1" value={client?.email1} />
        <InfoRow label="Email 2" value={client?.email2} />
        <InfoRow label="Address" value={formattedAddress} />
      </Stack>
    </Paper>
  );
}

// --- Helper Component ---
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <Text size="sm">
    <strong>{label}:</strong> {value || "—"}
  </Text>
);
