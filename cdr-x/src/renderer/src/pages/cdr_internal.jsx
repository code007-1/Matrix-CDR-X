import { useEffect, useState } from "react";
import { sortButton } from "./column_filter";
import { DataTable } from "./datatable";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loading } from "../loading";

export function CDR_Internal() {
    const data = useSelector((state) => state.app_slice.internal_cdr);
    const loading = useSelector((state) => state.app_slice.loading_internal);

    const columns = [
        {
            accessorKey: "sno",
            header: ({ column }) => sortButton(column, "S. No."),
        },
        {
            accessorKey: "source",
            header: ({ column }) => sortButton(column, "Source"),
            name: "Source"
        },
        /*{
            accessorKey: "soruceipport",
            header: ({ column }) => sortButton(column, "Source IP"),
            name: "Source IP"
        },*/
        {
            accessorKey: "destination",
            header: ({ column }) => sortButton(column, "Destination"),
            name: "Destination"
        },
        /*{
            accessorKey: "destinationipport",
            header: ({ column }) => sortButton(column, "Destination IP"),
            name: "Destination IP"
        },*/
        {
            accessorKey: "date",
            header: ({ column }) => sortButton(column, "Date"),
            name: "Date"
        },
        {
            accessorKey: "time",
            header: ({ column }) => sortButton(column, "Time"),
            name: "Time"
        },
        {
            accessorKey: "answerduration",
            header: ({ column }) => sortButton(column, "Duration"),
            name: "Duration"
        },
        /*{
            accessorKey: "calltype",
            header: ({ column }) => filterButton(column, "Call Type", ["N", "C", "F"]),
            filterFn: (row, columnId, filterValue) => {
                return filterValue.some((element) => row.original[columnId].toLowerCase().includes(element.toLowerCase()))
            },
        },*/
    ]

    if (loading) { return (<Loading />); }

    /*    const child = <>
            <div className="text-xl font-bold py-2">
                Call Detail Records
            </div>
        </>;/////*/

    return (
        <div className="">
            <div className="mt-4">

                {data != null &&
                    (
                        <>
                            <div className="text-center mb-4 font-bold shadow-md p-2 text-xl">
                                Internal Call Details Records
                            </div>
                            <DataTable columns={columns} data={data} defaultSearchColumn="source" />
                            <div className="text-left">
                                CALL TYPE : N=Normal, C=Conference, F=Forward
                            </div>
                        </>)}

            </div>
        </div >
    );
}

//<pre>{JSON.stringify(data, null, 2)}</pre>