// src.zip/components/ManagerDashboard/ManagerDashboardClient.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Grid,
  Paper,
  Stack,
  Text,
  Title,
  Group,
  RingProgress,
  rem,
  Loader,
  Center,
  Container,
  Box,
  ThemeIcon,
  Divider,
  Tooltip,
  Badge,
} from "@mantine/core";
import {
  FaChartBar,
  FaClipboardList,
  FaHome,
  FaShippingFast,
  FaTools,
  FaUsers,
  FaExclamationCircle,
  FaClock,
} from "react-icons/fa";
import { useSupabase } from "@/hooks/useSupabase";
import { Tables } from "@/types/db";
import { useMemo } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// --- 1. Type Definitions ---
type SalesOrderRow = Pick<
  Tables<"sales_orders">,
  "id" | "stage" | "designer" | "created_at"
>;
type ServiceOrderRow = Pick<Tables<"service_orders">, "completed_at">;

// Relaxed type to handle potential array/object return from Supabase
type ProductionJobRow = {
  job_number: string;
  production_schedule:
    | Pick<
        Tables<"production_schedule">,
        "prod_id" | "assembly_completed_actual" | "ship_schedule"
      >
    | Pick<
        Tables<"production_schedule">,
        "prod_id" | "assembly_completed_actual" | "ship_schedule"
      >[]
    | null;
};

type UpcomingShipment = {
  job_number: string;
  ship_schedule: string;
  prod_id: number;
};

// --- 2. UI Components ---

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtext,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  subtext?: string;
}) => (
  <Paper p="md" shadow="sm" radius="md" withBorder style={{ height: "100%" }}>
    <Group justify="space-between" align="flex-start">
      <Stack gap={4}>
        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
          {title}
        </Text>
        <Text fw={700} size={rem(28)} style={{ color, lineHeight: 1 }}>
          {value}
        </Text>
        {subtext && (
          <Text size="xs" c="dimmed" mt={4}>
            {subtext}
          </Text>
        )}
      </Stack>
      <ThemeIcon
        size="lg"
        radius="md"
        variant="light"
        color={color}
        style={{ opacity: 0.8 }}
      >
        <Icon size={18} />
      </ThemeIcon>
    </Group>
  </Paper>
);

const SalesSpikeChart = ({
  data,
}: {
  data: { label: string; count: number }[];
}) => {
  const maxCount = Math.max(...data.map((d) => d.count || 0), 1);

  return (
    <Paper p="md" shadow="sm" radius="md" withBorder style={{ height: "100%" }}>
      <Group justify="space-between" mb="md">
        <Title order={5} c="dimmed">
          Monthly Sales Volume (12 Mo)
        </Title>
        <FaChartBar color="#4A00E0" />
      </Group>

      <Group
        align="flex-end"
        justify="space-between"
        style={{ height: rem(180), width: "100%" }}
        gap="xs"
      >
        {data.map((item) => {
          const count = item.count || 0;
          const heightPercent = (count / maxCount) * 100;

          return (
            <Stack
              key={item.label}
              gap={4}
              align="center"
              style={{ flex: 1, height: "100%" }}
              justify="flex-end"
            >
              <Tooltip label={`${count} Sales in ${item.label}`} withArrow>
                <Box
                  style={{
                    width: "80%",
                    height: `${heightPercent}%`,
                    backgroundColor: "#4A00E0",
                    borderRadius: "4px 4px 0 0",
                    opacity: count === 0 ? 0.1 : 0.8,
                    minHeight: rem(4),
                    transition: "height 0.3s ease",
                  }}
                />
              </Tooltip>
              <Text
                size="xs"
                c="dimmed"
                style={{ fontSize: "10px", whiteSpace: "nowrap" }}
              >
                {item.label.split(" ")[0]}
              </Text>
            </Stack>
          );
        })}
      </Group>
    </Paper>
  );
};

// --- 3. Main Component with Logic ---
export default function ManagerDashboardClient() {
  const { supabase, isAuthenticated } = useSupabase();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["manager-dashboard-data"],
    enabled: isAuthenticated,
    queryFn: async () => {
      // Fetch everything in parallel
      const [salesRes, serviceRes, prodRes] = await Promise.all([
        supabase.from("sales_orders").select("id, stage, designer, created_at"),

        supabase.from("service_orders").select("completed_at"),

        // Fetch jobs that have a production schedule linked
        supabase
          .from("jobs")
          .select(
            "job_number, production_schedule(prod_id, assembly_completed_actual, ship_schedule)"
          )
          .not("prod_id", "is", null),
      ]);

      if (salesRes.error) throw salesRes.error;
      if (serviceRes.error) throw serviceRes.error;
      if (prodRes.error) throw prodRes.error;

      return {
        sales: salesRes.data as SalesOrderRow[],
        service: serviceRes.data as ServiceOrderRow[],
        production: prodRes.data as unknown as ProductionJobRow[],
      };
    },
  });

  // --- PROCESSING LOGIC ---
  const metrics = useMemo(() => {
    if (!data) return null;

    let totalQuotes = 0;
    let totalSold = 0;
    let totalUncompleteJobs = 0;
    const designerCounts: Record<string, number> = {};
    const monthlyCounts: Record<string, number> = {};
    const upcomingShippings: UpcomingShipment[] = [];

    const today = dayjs().startOf("day");
    const oneYearAgo = today.subtract(11, "month").startOf("month");

    // Initialize 12 buckets
    const chartData: { key: string; label: string; count: number }[] = [];
    let loopDate = oneYearAgo.clone();
    for (let i = 0; i < 12; i++) {
      const key = loopDate.format("YYYY-MM");
      monthlyCounts[key] = 0;
      chartData.push({ key, label: loopDate.format("MMM YY"), count: 0 });
      loopDate = loopDate.add(1, "month");
    }

    // 1. Process Sales
    data.sales.forEach((order) => {
      if (order.stage === "QUOTE") totalQuotes++;
      if (order.stage === "SOLD") {
        totalSold++;
        const designer = order.designer || "Unknown";
        designerCounts[designer] = (designerCounts[designer] || 0) + 1;

        if (order.created_at) {
          const cDate = dayjs(order.created_at);
          if (cDate.isSameOrAfter(oneYearAgo)) {
            const mKey = cDate.format("YYYY-MM");
            if (monthlyCounts[mKey] !== undefined) monthlyCounts[mKey]++;
          }
        }
      }
    });

    const finalChartData = chartData.map((d) => ({
      ...d,
      count: monthlyCounts[d.key] || 0,
    }));

    // 2. Process Production
    data.production.forEach((row) => {
      // Handle potential array return from 1:N relationship
      const rawSchedule = row.production_schedule;
      const schedule = Array.isArray(rawSchedule)
        ? rawSchedule[0]
        : rawSchedule;

      if (!schedule) return;

      // Incomplete = Assembly NOT completed
      if (!schedule.assembly_completed_actual) {
        totalUncompleteJobs++;
      }

      // Upcoming Shipments (Today or Future)
      if (schedule.ship_schedule) {
        const shipDate = dayjs(schedule.ship_schedule);
        if (shipDate.isSameOrAfter(today)) {
          upcomingShippings.push({
            job_number: row.job_number,
            ship_schedule: schedule.ship_schedule,
            prod_id: schedule.prod_id,
          });
        }
      }
    });

    // 3. Service Orders
    const openServiceOrders = data.service.filter(
      (so) => !so.completed_at
    ).length;

    // Sort & Slice
    const topDesigners = Object.entries(designerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const nextShipments = upcomingShippings
      .sort((a, b) => dayjs(a.ship_schedule).diff(dayjs(b.ship_schedule)))
      .slice(0, 5);

    return {
      totalQuotes,
      totalSold,
      openServiceOrders,
      totalUncompleteJobs,
      totalJobsInProduction: data.production.length,
      topDesigners,
      upcomingShippings: nextShipments,
      monthlyChartData: finalChartData,
    };
  }, [data]);

  if (isLoading)
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  if (isError || !metrics)
    return (
      <Center h="100vh">
        <Text c="red">Error loading data.</Text>
      </Center>
    );

  // Calculate Rate
  const totalJobs = metrics.totalJobsInProduction;
  const unfinished = metrics.totalUncompleteJobs;
  const finished = totalJobs - unfinished;
  const completionRate =
    totalJobs > 0 ? Math.round((finished / totalJobs) * 100) : 0;

  return (
    <Container size="100%" p="lg">
      <Stack gap="xl">
        <Group justify="space-between">
          <Group>
            <ThemeIcon
              size={48}
              radius="md"
              variant="gradient"
              gradient={{ from: "#8E2DE2", to: "#4A00E0", deg: 135 }}
            >
              <FaUsers size={24} />
            </ThemeIcon>
            <Stack gap={0}>
              <Title order={2} style={{ color: "#2C2E33" }}>
                Manager Dashboard
              </Title>
              <Text size="sm" c="dimmed">
                Operational Overview
              </Text>
            </Stack>
          </Group>
          <Text size="xs" c="dimmed" fs="italic">
            Last Updated: {dayjs().format("MMM D, HH:mm")}
          </Text>
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Active Quotes"
              value={metrics.totalQuotes}
              icon={FaUsers}
              color="blue"
              subtext="Potential Jobs"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Sold Jobs"
              value={metrics.totalSold}
              icon={FaHome}
              color="teal"
              subtext="Converted Orders"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Incomplete Jobs"
              value={metrics.totalUncompleteJobs}
              icon={FaClipboardList}
              color="orange"
              subtext="In Production"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Open Service"
              value={metrics.openServiceOrders}
              icon={FaTools}
              color="red"
              subtext="Pending Resolution"
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper
              p="md"
              shadow="sm"
              radius="md"
              withBorder
              style={{ height: "100%" }}
            >
              <Title order={5} mb="lg" c="dimmed">
                Shop Floor Throughput
              </Title>
              <Center h={180}>
                <RingProgress
                  size={160}
                  thickness={16}
                  roundCaps
                  label={
                    <Text size="xs" ta="center" c="dimmed" fw={700}>
                      {completionRate}%<br />
                      Complete
                    </Text>
                  }
                  sections={[
                    {
                      value: completionRate,
                      color: "teal",
                      tooltip: `${finished} Jobs Finished`,
                    },
                    {
                      value: 100 - completionRate,
                      color: "orange",
                      tooltip: `${unfinished} Jobs Incomplete`,
                    },
                  ]}
                />
              </Center>
              <Group justify="center" mt="md" gap="xl">
                <Group gap={4}>
                  <Box
                    w={8}
                    h={8}
                    bg="orange"
                    style={{ borderRadius: "50%" }}
                  />
                  <Text size="xs">{unfinished} Incomplete</Text>
                </Group>
                <Group gap={4}>
                  <Box w={8} h={8} bg="teal" style={{ borderRadius: "50%" }} />
                  <Text size="xs">{finished} Finished</Text>
                </Group>
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <SalesSpikeChart data={metrics.monthlyChartData} />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" shadow="sm" radius="md" withBorder>
              <Title order={5} mb="md" c="dimmed">
                Top Designers (by Sales Count)
              </Title>
              <Stack gap="sm">
                {metrics.topDesigners.map((d, index) => (
                  <Group key={d.name} justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon
                        variant="light"
                        color="gray"
                        size="sm"
                        radius="xl"
                      >
                        {index + 1}
                      </ThemeIcon>
                      <Text size="sm" fw={500}>
                        {d.name}
                      </Text>
                    </Group>
                    <Badge variant="light" color="blue">
                      {d.count} Sales
                    </Badge>
                  </Group>
                ))}
                {metrics.topDesigners.length === 0 && (
                  <Text c="dimmed" fs="italic">
                    No data.
                  </Text>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" shadow="sm" radius="md" withBorder>
              <Title order={5} mb="md" c="dimmed">
                Next Scheduled Shipments
              </Title>
              <Stack gap="xs">
                {metrics.upcomingShippings.length > 0 ? (
                  metrics.upcomingShippings.map((job, idx) => (
                    <Paper
                      key={idx}
                      withBorder
                      p="xs"
                      bg="var(--mantine-color-gray-0)"
                    >
                      <Group justify="space-between">
                        <Group gap="xs">
                          <FaClock color="gray" size={12} />
                          <Text size="sm" fw={600}>
                            {dayjs(job.ship_schedule).format("ddd, MMM D")}
                          </Text>
                        </Group>
                        <Text size="sm" c="blue" fw={700}>
                          Job #{job.job_number}
                        </Text>
                      </Group>
                    </Paper>
                  ))
                ) : (
                  <Group justify="center" p="lg" gap="xs">
                    <FaExclamationCircle color="gray" />
                    <Text c="dimmed" size="sm">
                      No future shipments found.
                    </Text>
                  </Group>
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
