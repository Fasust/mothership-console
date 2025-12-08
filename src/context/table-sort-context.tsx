import React, { createContext, useContext, useState } from "react";

type SortDirection = "asc" | "desc" | null;

interface TableSortContextType {
  sortState: { columnKey: string | null; direction: SortDirection };
  setSort: (columnKey: string, direction: SortDirection) => void;
  getSort: (columnKey: string) => SortDirection;
}

const TableSortContext = createContext<TableSortContextType | undefined>(
  undefined
);

export function TableSortProvider({ children }: { children: React.ReactNode }) {
  const [sortState, setSortState] = useState<{
    columnKey: string | null;
    direction: SortDirection;
  }>({
    columnKey: null,
    direction: null,
  });

  const setSort = (columnKey: string, direction: SortDirection) => {
    setSortState({
      columnKey: direction === null ? null : columnKey,
      direction,
    });
  };

  const getSort = (columnKey: string) =>
    sortState.columnKey === columnKey ? sortState.direction : null;

  return (
    <TableSortContext.Provider value={{ sortState, setSort, getSort }}>
      {children}
    </TableSortContext.Provider>
  );
}

export function useTableSort() {
  const context = useContext(TableSortContext);
  if (context === undefined) {
    throw new Error("useTableSort must be used within a TableSortProvider");
  }
  return context;
}
