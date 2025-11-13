"use client";

import { useEffect, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import type { Client } from "@prisma/client";

import {
  Table,
  TextInput,
  Group,
  Loader,
  Pagination,
  ScrollArea,
  Center,
} from "@mantine/core";

import { FaSearch } from "react-icons/fa";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function ClientsTable() {
  const [data, setData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/Clients/getAllClients");
        const clients = await res.json();
        setData(clients);
      } catch (err) {
        console.error("Failed to fetch clients", err);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  const columnHelper = createColumnHelper<Client>();

  const columns = [
    columnHelper.accessor("lastName", { header: "Client Name" }),
    columnHelper.accessor("designer", { header: "Designer" }),
    columnHelper.accessor("city", { header: "City" }),
    columnHelper.accessor("province", { header: "Province" }),
    columnHelper.accessor("phone1", { header: "Phone 1" }),
    columnHelper.accessor("phone2", { header: "Phone 2" }),
    columnHelper.accessor("email1", { header: "Email 1" }),
    columnHelper.accessor("email2", { header: "Email 2" }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => new Date(info.getValue<string>()).toLocaleDateString(),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <Center className="py-10">
        <Loader />
      </Center>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <TextInput
        placeholder="Search clients..."
        leftSection={<FaSearch size={14} />}
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      <ScrollArea>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}

                    <span className="inline-block ml-1">
                      {header.column.getIsSorted() === "asc" && <FaSortUp />}
                      {header.column.getIsSorted() === "desc" && <FaSortDown />}
                      {!header.column.getIsSorted() && <FaSort opacity={0.1} />}
                    </span>
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>

          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      <Group justify="center">
        <Pagination
          hideWithOnePage
          total={table.getPageCount()}
          value={table.getState().pagination.pageIndex + 1}
          onChange={(page) => table.setPageIndex(page - 1)}
        />
      </Group>
    </div>
  );
}
