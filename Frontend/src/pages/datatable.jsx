import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
    getFilteredRowModel,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import DownloadPDF from "./downloadpdf";
import { useRef } from "react";


export function DataTable({ columns, data, defaultSearchColumn, pageCount, pagination, onPaginationChange, manualPagination = true, name = "CDR_Report" }) {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [type, setType] = useState(defaultSearchColumn);

    const filteredRows = useRef(data);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: onPaginationChange,
        manualPagination: manualPagination,
        pageCount: pageCount,
        state: {
            sorting,
            columnFilters,
            pagination
        },
    });

    const updateFilteredRows = () => {
        const rows = table.getFilteredRowModel().rows;
        filteredRows.current = rows.map(row => row.original);
    };

    const keys = [];
    table._getColumnDefs().forEach(element => keys.push(element.accessorKey));

    return (
        <div>

            <div className="flex mb-2">
                <div className="pr-2">
                    <Select onValueChange={(data) => setType(data)} defaultValue={defaultSearchColumn}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {columns.map((item) => (item.name != undefined && <SelectItem key={item.accessorKey} value={item.accessorKey}>{item.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="pr-2">
                    <Input
                        placeholder="Filter....."
                        value={(table.getColumn(type)?.getFilterValue()) ?? ""}
                        onChange={(event) => {
                            table.getColumn(type)?.setFilterValue(event.target.value)
                        }
                        }
                        className="max-w-sm"
                    />
                </div>
                <Button className="px-4 mr-2" onClick={(e) => {
                    console.log("aksjdk");
                    table.resetSorting();
                    table.resetColumnFilters();
                }
                }>Reset</Button>
                <Button onClick={(e) => { updateFilteredRows(); DownloadPDF({ keys: keys, data: filteredRows.current, type: name }) }}>Download as PDF</Button>
            </div>

            <div className="rounded-md border">
                <Table className="overflow-auto">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()

                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex">
                    <p className="mt-2 mr-2">
                        Page {table.getState().pagination.pageIndex + 1} of {" "} {table.getPageCount()}
                    </p>
                    <div>
                        <Input type="number" placeholder="custom page..." onChange={(e) => e.target.value - 1 < table.getPageCount() && table.setPageIndex(e.target.value - 1)} />
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
