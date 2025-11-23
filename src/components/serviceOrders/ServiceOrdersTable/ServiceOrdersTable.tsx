"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  PaginationState,
  getPaginationRowModel,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  FilterFn,
} from "@tanstack/react-table";
import {
  Table,
  TextInput,
  Group,
  Loader,
  Pagination,
  ScrollArea,
  Center,
  Text,
  Box,
  SimpleGrid,
  Accordion,
  Tooltip,
  ActionIcon,
  Button,
  rem,
  Flex,
} from "@mantine/core";
import {
  FaPencilAlt,
  FaPlus,
  FaSearch,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useSupabase } from "@/hooks/useSupabase";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

// Define a type for the Service Order data fetched from Supabase
// This might need to be adjusted based on the actual table structure and joins
type ServiceOrderRow = {
  service_order_id: number;
  service_order_number: string;
  job_id: number;
  due_date: string | null;
  installer_id: number | null;
  service_type: string | null;
  service_by: string | null;
  hours_estimated: number | null;
  date_entered: string;
  completed_at: string | null;
  // Joins
  jobs?: {
    job_number: string;
    sales_orders?: {
      shipping_street: string | null;
      shipping_city: string | null;
      shipping_province: string | null;
      shipping_zip: string | null;
      client?: {
        lastName: string;
      } | null;
    } | null;
  } | null;
  installers?: {
    company_name: string;
    first_name: string;
    last_name: string;
  } | null;
};

export default function ServiceOrdersTable() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 17,
  });
  const { supabase, isAuthenticated } = useSupabase();
  const router = useRouter();

  const {
    data: serviceOrders,
    isLoading: loading,
    isError,
    error,
  } = useQuery<ServiceOrderRow[]>({
    queryKey: ["service_orders_list"],
    queryFn: async () => {
      const { data, error: dbError } = await supabase
        .from("service_orders")
        .select(
          `
          *,
          jobs (
            job_number,
            sales_orders (
              shipping_street,
              shipping_city,
              shipping_province,
              shipping_zip,
              client (
                lastName
              )
            )
          ),
          installers (company_name, first_name, last_name)
        `
        )
        .order("date_entered", { ascending: false });

      if (dbError) {
        console.error("Supabase query error:", dbError);
        throw new Error(dbError.message || "Failed to fetch service orders");
      }
      return data as unknown as ServiceOrderRow[];
    },
    enabled: isAuthenticated,
    placeholderData: (previousData) => previousData,
  });

  const columnHelper = createColumnHelper<ServiceOrderRow>();
  const columns = [
    columnHelper.accessor("service_order_number", {
      header: "SO #",
      size: 120,
      minSize: 100,
    }),
    columnHelper.accessor("jobs.job_number", {
      header: "Job #",
      size: 120,
      minSize: 100,
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor("jobs.sales_orders.client.lastName", {
      header: "Client Name",
      size: 150,
      minSize: 100,
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor(
      (row) => {
        const so = row.jobs?.sales_orders;
        if (!so) return "—";
        const parts = [
          so.shipping_street,
          so.shipping_city,
          so.shipping_province,
          so.shipping_zip,
        ].filter(Boolean);
        return parts.join(", ");
      },
      {
        id: "site_address",
        header: "Site Address",
        size: 250,
        minSize: 150,
        cell: (info) => (
          <Tooltip label={info.getValue()}>
            <Text truncate>{info.getValue()}</Text>
          </Tooltip>
        ),
      }
    ),
    columnHelper.accessor("date_entered", {
      header: "Date Entered",
      size: 130,
      minSize: 100,
      cell: (info) => {
        const date = info.getValue();
        return date ? dayjs(date).format("YYYY-MM-DD") : "—";
      },
    }),
    columnHelper.accessor("due_date", {
      header: "Date Due",
      size: 130,
      minSize: 100,
      cell: (info) => {
        const date = info.getValue();
        return date ? dayjs(date).format("YYYY-MM-DD") : "—";
      },
    }),
    columnHelper.accessor("completed_at", {
      header: "Completion",
      size: 160,
      minSize: 120,
      cell: (info) => {
        const date = info.getValue();
        if (date) {
          return (
            <Group gap={5}>
              <FaCheckCircle color="green" />
              <Text size="sm">
                {" "}
                Completed on {dayjs(date).format("YYYY-MM-DD")}
              </Text>
            </Group>
          );
        }
        return (
          <Group gap={5}>
            <FaTimesCircle color="red" />
            <Text size="sm" c="dimmed">
              Not Completed
            </Text>
          </Group>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 80,
      minSize: 80,
      cell: (info) => (
        <Group justify="center">
          <Tooltip label="Edit Service Order">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to edit page or open modal (placeholder for now)
                console.log("Edit", info.row.original);
              }}
            >
              <FaPencilAlt size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    }),
  ];

  const table = useReactTable({
    data: serviceOrders ?? [],
    columns,
    state: {
      columnFilters,
      pagination,
    },
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const shouldShowLoader = useMemo(
    () => !isAuthenticated || loading,
    [isAuthenticated, loading]
  );

  if (shouldShowLoader) {
    return (
      <Center className="py-10">
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center className="py-10">
        <Text c="red">Error fetching service orders: {error.message}</Text>
      </Center>
    );
  }

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        padding: rem(20),
        height: "calc(100vh - 45px)",
      }}
    >
      <Flex align="center" justify="space-between" mb="md">
        {/* Accordion takes all remaining width */}
        <Box
          style={{
            flex: 1,
            marginRight: 12,
            borderRadius: rem(8),
          }}
        >
          <Accordion variant="contained" radius="md" transitionDuration={300}>
            <Accordion.Item value="search-filters">
              <Accordion.Control
                icon={<FaSearch size={16} />}
                styles={{
                  label: {
                    padding: 7,
                  },
                }}
              >
                Search Filters
              </Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid
                  cols={{ base: 1, sm: 3, md: 5 }}
                  mt="sm"
                  spacing="sm"
                >
                  <TextInput
                    placeholder="SO #..."
                    onChange={(e) =>
                      table
                        .getColumn("service_order_number")
                        ?.setFilterValue(e.target.value)
                    }
                  />
                  <TextInput
                    placeholder="Job #..."
                    onChange={(e) =>
                      table
                        .getColumn("jobs_job_number")
                        ?.setFilterValue(e.target.value)
                    }
                  />
                  <TextInput
                    placeholder="Client Name..."
                    onChange={(e) =>
                      table
                        .getColumn("jobs_sales_orders_client_lastName")
                        ?.setFilterValue(e.target.value)
                    }
                  />
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>

        {/* Button stays on the right */}
        <Button
          size="md"
          onClick={() => router.push("/dashboard/serviceorders/new")}
          leftSection={<FaPlus size={14} />}
          style={{
            background: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
            color: "white",
            border: "none",
            whiteSpace: "nowrap",
          }}
        >
          New Service Order
        </Button>
      </Flex>

      <ScrollArea
        style={{
          flex: 1,
          minHeight: 0,
          padding: rem(10),
        }}
        styles={{
          thumb: {
            background: "linear-gradient(135deg, #8E2DE2, #4A00E0)",
          },
        }}
        type="hover"
      >
        <Table striped highlightOnHover withColumnBorders layout="fixed">
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const resizeHandler = header.getResizeHandler();
                  return (
                    <Table.Th
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        position: "relative",
                        width: header.getSize(),
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                      <span className="inline-block ml-1">
                        {header.column.getIsSorted() === "asc" && <FaSortUp />}
                        {header.column.getIsSorted() === "desc" && (
                          <FaSortDown />
                        )}
                        {!header.column.getIsSorted() && (
                          <FaSort opacity={0.1} />
                        )}
                      </span>
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            resizeHandler(e);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            resizeHandler(e);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`resizer ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`}
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            height: "100%",
                            width: "5px",
                            background: header.column.getIsResizing()
                              ? "blue"
                              : "transparent",
                            cursor: "col-resize",
                            userSelect: "none",
                            touchAction: "none",
                          }}
                        />
                      )}
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr
                key={row.id}
                onClick={() =>
                  router.push(
                    `/dashboard/serviceorders/${row.original.service_order_id}`
                  )
                }
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: rem(250),
          right: 0,
          padding: "1rem 0",
          background: "white",
          borderTop: "1px solid #eee",
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pagination
          hideWithOnePage
          withEdges
          color="#4A00E0"
          total={table.getPageCount()}
          value={table.getState().pagination.pageIndex + 1}
          onChange={(page) => table.setPageIndex(page - 1)}
        />
      </Box>
    </Box>
  );
}
