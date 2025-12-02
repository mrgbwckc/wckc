"use client";

import {
  Table as ReactTable,
  flexRender,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  Pagination,
  ScrollArea,
  Center,
  Text,
  Box,
  Accordion,
  Button,
  rem,
  Group,
  ThemeIcon,
  Stack,
  Title,
  Loader,
} from "@mantine/core";
import {
  FaPlus,
  FaSearch,
  FaSort,
  FaSortDown,
  FaSortUp,
} from "react-icons/fa";

interface DataTableProps<TData> {
  table: ReactTable<TData>;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;

  // Header Actions
  onCreate?: () => void;
  createLabel?: string;

  // Filters Slot
  filterContent?: React.ReactNode;

  // Extra content (Status pills)
  extraContent?: React.ReactNode;

  // Loading/Error
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;

  // Row Click
  onRowClick?: (row: Row<TData>) => void;

  // Sidebar offset (default 250)
  sidebarWidth?: number;
}

export function DataTable<TData>({
  table,
  title,
  subtitle,
  icon,
  onCreate,
  createLabel = "New",
  filterContent,
  extraContent,
  isLoading,
  isError,
  errorMessage,
  onRowClick,
  sidebarWidth = 250,
}: DataTableProps<TData>) {

  if (isLoading) {
    return (
      <Center className="py-10" style={{ height: "calc(100vh - 45px)" }}>
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center className="py-10" style={{ height: "calc(100vh - 45px)" }}>
        <Text c="red">Error: {errorMessage || "An error occurred"}</Text>
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
      <Group mb="md" justify="space-between">
        <Group>
          <ThemeIcon
            size={50}
            radius="md"
            variant="gradient"
            gradient={{ from: "#8E2DE2", to: "#4A00E0", deg: 135 }}
          >
            {icon}
          </ThemeIcon>
          <Stack gap={0}>
            <Title order={2} style={{ color: "#343a40" }}>
              {title}
            </Title>
            {subtitle && (
              <Text size="sm" c="dimmed">
                {subtitle}
              </Text>
            )}
          </Stack>
        </Group>

        {onCreate && (
          <Button
            size="md"
            onClick={onCreate}
            leftSection={<FaPlus size={14} />}
            style={{
              background: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
              color: "white",
              border: "none",
              whiteSpace: "nowrap",
            }}
          >
            {createLabel}
          </Button>
        )}
      </Group>

      {filterContent && (
        <Box
          style={{
            marginBottom: rem(12),
            borderRadius: rem(8),
            width: "100%",
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
                {filterContent}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>
      )}

      {extraContent}

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
        <Table striped highlightOnHover stickyHeader withColumnBorders layout="fixed">
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

                      <span style={{ display: "inline-block", marginLeft: "4px" }}>
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
             {table.getRowModel().rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={table.getAllColumns().length}>
                  <Center py="xl">
                    <Text c="dimmed">
                      No records found.
                    </Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
            table.getRowModel().rows.map((row) => (
              <Table.Tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}
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
            ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: rem(sidebarWidth),
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
