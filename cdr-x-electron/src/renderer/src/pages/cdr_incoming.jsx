import { useEffect, useState } from "react";
import { sortButton } from "./column_filter";
import { DataTable } from "./datatable";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loading } from "../loading";

export function CDR_Incoming() {
    const data = useSelector((state) => state.app_slice.incoming_cdr);
    const loading = useSelector((state) => state.app_slice.loading_incoming);

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
        {
            accessorKey: "trunk",
            header: ({ column }) => sortButton(column, "Trunk"),
            name: "Trunk"
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
            header: ({ column }) => sortButton(column, "Answer Duration"),
            name: "Answer Duration"
        },
        {
            accessorKey: "holdduration",
            header: ({ column }) => sortButton(column, "Hold Duration"),
            name: "Hold Duration"
        },
        {
            accessorKey: "speechduration",
            header: ({ column }) => sortButton(column, "Speech Duration"),
            name: "Speech Duration"
        },
        /*{
            accessorKey: "calltype",
            header: ({ column }) => filterButton(column, "Call Type", ["N", "U", "I", "G", "T", "Q", "C", "F", "D", "DU"]),
            filterFn: (row, columnId, filterValue) => {
                return filterValue.some((element) => row.original[columnId].toLowerCase().includes(element.toLowerCase()))
            },
        }*/
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
                                Incoming Call Details Records
                            </div>
                            <DataTable columns={columns} data={data} defaultSearchColumn="source" />
                        </>)}
                <div className="text-left">
                    <div>
                        Trunk            : C=CO,  B=BRI,  P=T1E1,  E=E&M,  M=MOB,  V=SIP
                    </div>
                    <div>
                        Extension        : S=SLT,  D=DKP,  G=MAG,  I=SIP Extn,  R=Virtual Extn,  N=ISDN Extn
                    </div>
                    <div>
                        CALL TYPE        : N=Normal,  U=UnAnswered,  I=DISA,  G=Gateway,  T=Transfer,  Q=Qsig, C=Conference, F=Forward
                        D=Built-In Auto Attendant,  DU=Built-In Auto Attendant Unanswered
                    </div>
                </div>
            </div>
        </div >
    );
}

//<pre>{JSON.stringify(data, null, 2)}</pre>