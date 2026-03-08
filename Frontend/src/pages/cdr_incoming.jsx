import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Summary } from "./summary";
import { filterButton, sortButton } from "./column_filter";
import { DataTable } from "./datatable";
import { useDispatch, useSelector } from "react-redux";
import { Loading } from "../loading";
import { api } from "../modules/api";
import { set_incoming_cdr, append_incoming_cdr, set_incoming_loading } from "../modules/contexts/slice";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Charts } from "@/components/charts";

import { useSearchParams } from "react-router-dom";

export function CDR_Incoming() {
    const [searchParams] = useSearchParams();
    const ip = searchParams.get("ip") || "ALL";

    const data = useSelector((state) => state.app_slice.incoming_cdr[ip] || []);
    const total = useSelector((state) => state.app_slice.incoming_total);
    const loading = useSelector((state) => state.app_slice.incoming_loading);
    const dispatch = useDispatch();

    const [pageIndex, setPageIndex] = useState(1);
    const loadSize = 1000;

    const [clientPagination, setClientPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const fetchData = async (page) => {
        dispatch(set_incoming_loading(true));
        try {
            const response = await api.get('/load_data', {
                params: {
                    type: "incoming",
                    page: page,
                    pageSize: loadSize,
                    device_ip: ip === 'ALL' ? undefined : ip
                }
            });
            if (page === 1) {
                dispatch(set_incoming_cdr({ data: response.data.data, total: response.data.total, ip }));
            } else {
                dispatch(append_incoming_cdr({ data: response.data.data, total: response.data.total, ip }));
            }
        } catch (error) {
            console.error("Error loading incoming CDRs:", error);
        } finally {
            dispatch(set_incoming_loading(false));
        }
    };

    useEffect(() => {
        if (data.length == 0) {
            fetchData(1);
        }
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
            cell: ({ row }) => {
                const val = row.getValue("date");
                if (!val) return "";
                const date = new Date(val);
                return isNaN(date.getTime()) ? val : date.toLocaleDateString("en-GB").split("/").join("-");
            }
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
        {
            accessorKey: "callcategory",
            header: "Call Category",
            //header: ({ column }) => filterButton(column, "Call Category", ["INC", "OUT", "INT", "EXT", "MOB", "SIP", "GATEWAY", "TRANSFER", "CONFERENCE", "FORWARD", "AA", "AAU", "QSIG", "DISA", "UNANSWERED", "UNKNOWN"]),
            name: "Call Category"
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
                        <CardTitle>Incoming Call Details Records</CardTitle>
                        <CardDescription>
                            Records of all incoming calls to the organization. Showing {data.length} of {total} records.
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
                                    name="Incoming Call Records"
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
                        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-3">
                            <div>
                                <span className="font-semibold">Trunk:</span> C=CO, B=BRI, P=T1E1, E=E&M, M=MOB, V=SIP
                            </div>
                            <div>
                                <span className="font-semibold">Extension:</span> S=SLT, D=DKP, G=MAG, I=SIP Extn, R=Virtual Extn, N=ISDN Extn
                            </div>
                            <div>
                                <span className="font-semibold">Call Type:</span> N=Normal, U=UnAnswered, I=DISA, G=Gateway, T=Transfer, Q=Qsig, C=Conference, F=Forward, D=Built-In Auto Attendant, DU=Built-In AA Unanswered
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}