import { Paper, Text, Grid } from "@mantine/core";
import { FaCheck } from "react-icons/fa";
import { Tables } from "@/types/db";

interface CabinetSpecsProps {
  cabinet: Tables<"cabinets"> | null | undefined;
}

export default function CabinetSpecs({ cabinet }: CabinetSpecsProps) {
  if (!cabinet) {
    return (
      <Paper p="md" radius="md" withBorder bg="gray.0">
        <Text c="dimmed" size="sm" fs="italic">
          No cabinet specifications available.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" shadow="sm" style={{ background: "#f5f5f5" }}>
      <Text fw={600} mb="sm" c="#4A00E0">
        Cabinet Details
      </Text>

      <Grid>
        {/* Left Column: Standard Text Details */}
        <Grid.Col span={8}>
          <StackSpacing>
            <SpecRow label="Box" value={cabinet.box} />
            <SpecRow label="Color" value={cabinet.color} />
            <SpecRow label="Finish" value={cabinet.finish} />
            <SpecRow label="Species" value={cabinet.species} />
            <SpecRow label="Interior" value={cabinet.interior} />
            <SpecRow label="Door Style" value={cabinet.door_style} />
            <SpecRow
              label="Top Drawer Front"
              value={cabinet.top_drawer_front}
            />
            <SpecRow label="Drawer Box" value={cabinet.drawer_box} />
          </StackSpacing>
        </Grid.Col>

        {/* Right Column: Booleans & Grouped Specs */}
        <Grid.Col span={4}>
          <StackSpacing>
            {/* Glass Group */}
            <div>
              <BooleanRow label="Glass" value={cabinet.glass} />
              {cabinet.glass && (
                <SpecRow label="Glass Type" value={cabinet.glass_type} />
              )}
            </div>

            {/* Parts Only Group */}
            <div>
              <BooleanRow
                label="Doors Parts Only"
                value={cabinet.doors_parts_only}
              />
              {cabinet.doors_parts_only && (
                <SpecRow label="Piece Count" value={cabinet.piece_count} />
              )}
            </div>

            <BooleanRow
              label="Handles Selected"
              value={cabinet.handles_selected}
            />
            <BooleanRow
              label="Handles Supplied"
              value={cabinet.handles_supplied}
            />
            <BooleanRow
              label="Hinge Soft Close"
              value={cabinet.hinge_soft_close}
            />
          </StackSpacing>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

// --- Helper Components ---

const SpecRow = ({ label, value }: { label: string; value: string | null }) => (
  <Text size="sm" lh={1.4}>
    <strong>{label}:</strong> {value || "—"}
  </Text>
);

const BooleanRow = ({
  label,
  value,
}: {
  label: string;
  value: boolean | null;
}) => (
  <Text
    size="sm"
    lh={1.4}
    style={{ display: "flex", alignItems: "center", gap: 6 }}
  >
    <strong>{label}:</strong>
    {value && <FaCheck color="#8e2de2" size={12} />}
  </Text>
);

const StackSpacing = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    {children}
  </div>
);
