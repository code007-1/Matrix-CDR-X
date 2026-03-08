import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Summary } from "./summary";
import { sortButton } from "./column_filter";
import { DataTable } from "./datatable";
import { useDispatch, useSelector } from "react-redux";
import { Loading } from "../loading";
import { api } from "../modules/api";
import { set_outgoing_cdr, append_outgoing_cdr, set_outgoing_loading } from "../modules/contexts/slice";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Charts } from "@/components/charts";


import { useSearchParams } from "react-router-dom";


export function CDR_Outgoing() {
    const [searchParams] = useSearchParams();
    const ip = searchParams.get("ip") || "ALL";

    const data = useSelector((state) => state.app_slice.outgoing_cdr[ip] || []);
    const total = useSelector((state) => state.app_slice.outgoing_total);
    const loading = useSelector((state) => state.app_slice.outgoing_loading);
    const dispatch = useDispatch();

    const [pageIndex, setPageIndex] = useState(1);
    const loadSize = 1000;

    const [clientPagination, setClientPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const fetchData = async (page) => {
        dispatch(set_outgoing_loading(true));
        try {
            const response = await api.get('/load_data', {
                params: {
                    type: "outgoing",
                    page: page,
                    pageSize: loadSize,
                    device_ip: ip === 'ALL' ? undefined : ip
                }
            });
            if (page === 1) {
                dispatch(set_outgoing_cdr({ data: response.data.data, total: response.data.total, ip }));
            } else {
                dispatch(append_outgoing_cdr({ data: response.data.data, total: response.data.total, ip }));
            }
        } catch (error) {
            console.error("Error loading outgoing CDRs:", error);
        } finally {
            dispatch(set_outgoing_loading(false));
        }
    };

    useEffect(() => {
        if (data.length === 0)
            fetchData(1);
    }, [ip]);

    const handleLoadMore = () => {
        const nextPage = pageIndex + 1;
        setPageIndex(nextPage);
        fetchData(nextPage);
    };

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
        {
            accessorKey: "destination",
            header: ({ column }) => sortButton(column, "Destination"),
            name: "Destination"
        },
        {
            accessorKey: "date",
            header: ({ column }) => sortButton(column, "Date"),
            name: "Date",
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
    ]

    if (loading && pageIndex === 1) { return (<Loading />); }

    const loadMoreButton = data.length < total ? (
        <Button onClick={handleLoadMore} disabled={loading} size="sm">
            {loading ? "Loading..." : "Load More"}
        </Button>
    ) : null;

    return (
        <div className="space-y-4">
            {data != null && (
                <Card>
                    <CardHeader>
                        <CardTitle>Outgoing Call Details Records</CardTitle>
                        <CardDescription>
                            Records of all outgoing calls from the organization. Showing {data.length} of {total} records.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="data" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="data">Data Table</TabsTrigger>
                                <TabsTrigger value="charts">Visualizations</TabsTrigger>
                            </TabsList>
                            <TabsContent value="data">
                                <div className="mb-6">
                                    <Summary data={data} startContent={loadMoreButton} />
                                </div>
                                <DataTable
                                    columns={columns}
                                    data={data}
                                    defaultSearchColumn="source"
                                    pagination={clientPagination}
                                    onPaginationChange={setClientPagination}
                                    manualPagination={false}
                                    name="Outgoing Call Records"
                                />
                            </TabsContent>
                            <TabsContent value="charts">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Visualization</CardTitle>
                                        <CardDescription>Visual insights of the loaded data</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Charts data={data} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <span className="font-semibold">Trunk:</span> C=CO, B=BRI, P=T1E1, E=E&M, M=MOB, V=SIP
                            </div>
                            <div>
                                <span className="font-semibold">Extension:</span> S=SLT, D=DKP, G=MAG, I=SIP Extn, R=Virtual Extn, N=ISDN Extn
                            </div>
                            <div>
                                <span className="font-semibold">Call Type:</span> O=DISA, A=Auto Redial, E=External Forwarded, G=Gateway, T=Transfer, C=Conference
                            </div>
                            <div>
                                <span className="font-semibold">Maturity:</span> C=CPD, R=Reversal, D=Delay, I=Connect, U=Unanswered
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
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