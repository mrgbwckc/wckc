"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  getPaginationRowModel,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  FilterFn,
} from "@tanstack/react-table";
import {
  TextInput,
  Group,
  SimpleGrid,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import {
  FaPencilAlt,
  FaUsers,
} from "react-icons/fa";
import { Tables } from "@/types/db";
import { useDisclosure } from "@mantine/hooks";
import EditClient from "../EditClient/EditClient";
import AddClient from "../AddClient/AddClient";
import { useSupabase } from "@/hooks/useSupabase";
import dayjs from "dayjs";
import { DataTable } from "@/components/Shared/DataTable/DataTable";

export default function ClientsTable() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 17,
  });
  const { supabase, isAuthenticated } = useSupabase();
  const [editModalOpened, { open: editModalOpen, close: editModalClose }] =
    useDisclosure(false);
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);
  const [selectedClient, setSelectedClient] = useState<Tables<"client"> | null>(
    null
  );
  const multiColumnFilter: FilterFn<Tables<"client">> = (
    row,
    columnId,
    filterValue
  ) => {
    const filterText = String(filterValue).toLowerCase();
    const phone1 = String(row.original.phone1 ?? "").toLowerCase();
    const phone2 = String(row.original.phone2 ?? "").toLowerCase();
    const email1 = String(row.original.email1 ?? "").toLowerCase();
    const email2 = String(row.original.email2 ?? "").toLowerCase();

    if (columnId === "phone1") {
      return phone1.includes(filterText) || phone2.includes(filterText);
    }

    if (columnId === "email1") {
      return email1.includes(filterText) || email2.includes(filterText);
    }
    const val = String(row.getValue(columnId) ?? "").toLowerCase();
    return val.includes(filterText);
  };

  const {
    data: clients,
    isLoading: loading,
    isError,
    error,
  } = useQuery<Tables<"client">[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data: clients, error: dbError } = await supabase
        .from("client")
        .select("*")
        .order("createdAt", { ascending: false });

      if (dbError) {
        console.error("Supabase query error:", dbError);
        throw new Error(dbError.message || "Failed to fetch clients");
      }
      return clients;
    },
    enabled: isAuthenticated,
    placeholderData: (previousData) => previousData,
  });

  const columnHelper = createColumnHelper<Tables<"client">>();
  const columns = [
    columnHelper.accessor("id", {
      header: "Client #",
      size: 100,
      minSize: 30,
    }),
    columnHelper.accessor("lastName", {
      header: "Client Name",
      size: 220,
      minSize: 100,
    }),
    columnHelper.accessor("street", {
      header: "Street",
      size: 150,
      minSize: 100,
    }),
    columnHelper.accessor("city", { header: "City", size: 150, minSize: 80 }),
    columnHelper.accessor("province", {
      header: "Province",
      size: 80,
      minSize: 70,
    }),
    columnHelper.accessor("zip", {
      header: "Zip Code",
      size: 150,
      minSize: 80,
    }),
    columnHelper.accessor("phone1", {
      header: "Phone 1",
      size: 100,
      minSize: 90,
      filterFn: multiColumnFilter,
    }),
    columnHelper.accessor("phone2", {
      header: "Phone 2",
      size: 100,
      minSize: 90,
    }),
    columnHelper.accessor("email1", {
      header: "Email 1",
      size: 250,
      minSize: 120,
      filterFn: multiColumnFilter,
    }),
    columnHelper.accessor("email2", {
      header: "Email 2",
      size: 250,
      minSize: 120,
    }),
    columnHelper.accessor("designer", {
      header: "Created By",
      size: 120,
      minSize: 90,
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      size: 130,
      minSize: 100,
      cell: (info) => {
        const date = info.getValue<string>();
        return date ? dayjs(date).format("YYYY-MM-DD") : "—";
      },
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 80,
      minSize: 80,
      cell: (info) => (
        <Group justify="center">
          <Tooltip label="Edit Client">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedClient(info.row.original);
                editModalOpen();
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
    data: clients ?? [],
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

  return (
    <>
      <DataTable
        table={table}
        title="Clients"
        subtitle="Track clients"
        icon={<FaUsers size={26} />}
        onCreate={openAddModal}
        createLabel="New Client"
        isLoading={shouldShowLoader}
        isError={isError}
        errorMessage={error?.message}
        sidebarWidth={250}
        filterContent={
          <SimpleGrid cols={{ base: 1, sm: 3, md: 5 }} mt="sm" spacing="sm">
            <TextInput
              placeholder="Client Name..."
              onChange={(e) =>
                table.getColumn("lastName")?.setFilterValue(e.target.value)
              }
            />
            <TextInput
              placeholder="Designer..."
              onChange={(e) =>
                table.getColumn("designer")?.setFilterValue(e.target.value)
              }
            />
            <TextInput
              placeholder="City..."
              onChange={(e) =>
                table.getColumn("city")?.setFilterValue(e.target.value)
              }
            />
            <TextInput
              placeholder="Phone..."
              onChange={(e) =>
                table.getColumn("phone1")?.setFilterValue(e.target.value)
              }
            />
            <TextInput
              placeholder="Email..."
              onChange={(e) =>
                table.getColumn("email1")?.setFilterValue(e.target.value)
              }
            />
          </SimpleGrid>
        }
      />
      {selectedClient && (
        <EditClient
          opened={editModalOpened}
          onClose={editModalClose}
          client={selectedClient}
        />
      )}
      <AddClient opened={addModalOpened} onClose={closeAddModal} />
    </>
  );
}
