import { useEffect, useState } from "react";
import { sortButton } from "./column_filter";
import { DataTable } from "./datatable";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loading } from "../loading";


export function CDR_Outgoing() {
    const data = useSelector((state) => state.app_slice.outgoing_cdr);
    const loading = useSelector((state) => state.app_slice.loading_outgoing);

    /*const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const type = queryParams.get('type');*/

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
            accessorKey: "trunk",
            header: ({ column }) => sortButton(column, "Trunk"),
            name: "Trunk"
        },
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
            header: ({ column }) => filterButton(column, "Call Type", ["C", "R", "D", "I", "U"]),
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
                                Outgoing Call Details Records
                            </div>
                            <DataTable columns={columns} data={data} defaultSearchColumn="source" />
                            <div className="text-left">
                                <div>
                                    Trunk            : C=CO,  B=BRI,  P=T1E1,  E=E&M,  M=MOB,  V=SIP
                                </div>
                                <div>
                                    Extension        : S=SLT,  D=DKP,  G=MAG,  I=SIP Extn,  R=Virtual Extn,  N=ISDN Extn
                                </div>
                                <div>
                                    CALL TYPE        : O=DISA,  A=Auto Redial,  E=External Forwarded,  G=Gateway,  T=Transfer, C=Conference
                                </div>
                                <div>
                                    MATURITY         : C=CPD,  R=Reversal,  D=Delay,  I=Connect,  U=Unanswered
                                </div>
                            </div>
                        </>)}
            </div>
        </div >
    );
}

//<pre>{JSON.stringify(data, null, 2)}</pre>

/*export let loadedData;
// src/FileInput.js
import React from 'react';
import * as XLSX from 'xlsx';

export let loadedData = null;

function FileInput() {
    const [data, setData] = React.useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet);

            setData(sheetData);
            loadedData = sheetData;
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <input type="file" onChange={handleFileUpload} />
            {data && (
                <div>
                    <h2>Imported Data:</h2>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default FileInput;

<div>
                <input type="file" onChange={handleFileUpload} />
                {data && (
                    <div>
                        <h2>Imported Data:</h2>
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                )}
            </div>

/*import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export async function ExcelReader() {
    const response = await fetch('../../../cdr/cdr.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    console.log("array buffer is : ", arrayBuffer);
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    console.log("loded excel data", jsonData);
    return jsonData;
};*/



/*import { readFile } from 'fs';

function FileInput() {

    const loadedData = readFile('yourfile.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data);
        return data;
    });
    return loadedData;
}

export default FileInput;*/