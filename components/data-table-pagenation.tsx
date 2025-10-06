"use client";

import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

const DataTablePagination = <TData,>({
  table,
}: DataTablePaginationProps<TData>) => {
  const t = useTranslations("project");

  return (
    <div className="flex justify-between px-2">
      <div className="text-muted-foreground text-sm">
        {t("rows", {
          count: table.getFilteredRowModel().rows.length,
        })}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[80px] items-center justify-center text-sm">
          {t("page", { index: table.getState().pagination.pageIndex + 1 })}
        </div>
        <div className="flex items-center space-x-2.5">
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{t("go_to_prev_page")}</span>
            <Icons.chevronLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{t("go_to_next_page")}</span>
            <Icons.chevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTablePagination;
