"use client";

import DataTable from "@/components/data-table";
import DataTableColumnHeader from "@/components/data-table-column-header";
import { tableSchema } from "@/schemas/project";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface AssayTableProps {
  headers: string[];
  rows: string[][];
}

const AssayTable = ({ headers, rows }: AssayTableProps) => {
  const records = useMemo(
    () =>
      rows.map((row) => {
        const data: Record<string, string> = {};
        for (const [index, header] of headers.entries()) {
          data[header] = row[index];
        }
        return data;
      }),
    [rows, headers],
  );

  const columns: ColumnDef<Record<string, string>>[] = useMemo(
    () =>
      headers.map((header, index) => ({
        id: index.toString(),
        accessorKey: header,
        meta: { label: header },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={header} />
        ),
        cell: ({ getValue }) => (
          <div className="px-4">{String(getValue())}</div>
        ),
      })),
    [headers],
  );

  if (tableSchema.safeParse({ headers }).error) {
    return null;
  }

  return <DataTable columns={columns} data={records} />;
};

export default AssayTable;
