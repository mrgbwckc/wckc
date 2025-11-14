"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  PaginationState,
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
} from "@mantine/core";
import { FaSearch, FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { ClientSchema } from "@/zod/client.schema";
import z from "zod";
export type Client = z.infer<typeof ClientSchema>;

export default function ClientsTable() {
  const [globalFilter, setGlobalFilter] = useState("");

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 40,
  });

  const {
    data: queryData,
    isLoading: loading,
    isError,
    error,
  } = useQuery<{ data: Client[]; rowCount: number }>({
    queryKey: ["clients", pagination],
    queryFn: async () => {
      const params = new URLSearchParams({
        pageIndex: String(pagination.pageIndex),
        pageSize: String(pagination.pageSize),
      });

      const res = await fetch(
        `/api/Clients/getAllClients?${params.toString()}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch clients");
      }
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });

  const clients = queryData?.data ?? [];
  const totalRowCount = queryData?.rowCount ?? 0;

  const columnHelper = createColumnHelper<Client>();
  const columns = [
    columnHelper.accessor("lastName", { header: "Client Name", size: 220 }),
    columnHelper.accessor("designer", { header: "Designer", size: 80 }),
    columnHelper.accessor("city", { header: "City", size: 150 }),
    columnHelper.accessor("province", { header: "Province", size: 80 }),
    columnHelper.accessor("phone1", { header: "Phone 1", size: 100 }),
    columnHelper.accessor("phone2", { header: "Phone 2", size: 100 }),
    columnHelper.accessor("email1", { header: "Email 1", size: 250 }),
    columnHelper.accessor("email2", { header: "Email 2", size: 250 }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      size: 130,
      cell: (info) => new Date(info.getValue<string>()).toLocaleDateString(),
    }),
  ];

  const table = useReactTable({
    data: clients,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    manualPagination: true,
    rowCount: totalRowCount,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <Center className="py-10">
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center className="py-10">
        <Text c="red">Error fetching clients: {error.message}</Text>
      </Center>
    );
  }

  return (
    <Box>
      <TextInput
        placeholder="Search clients (on this page)..."
        leftSection={<FaSearch size={14} />}
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      <ScrollArea mt="md">
        <Table striped highlightOnHover withColumnBorders layout="fixed">
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // Get the resize handler once
                  const resizeHandler = header.getResizeHandler();

                  return (
                    <Table.Th
                      key={header.id}
                      colSpan={header.colSpan}
                      // Apply sort click handler to the entire cell
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
              <Table.Tr key={row.id}>
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

      <Group justify="center" mt="md">
        <Pagination
          hideWithOnePage
          total={table.getPageCount()}
          value={pagination.pageIndex + 1}
          onChange={(page) => table.setPageIndex(page - 1)}
        />
      </Group>
    </Box>
  );
}
