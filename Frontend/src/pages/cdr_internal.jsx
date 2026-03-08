import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Summary } from "./summary";
import { sortButton } from "./column_filter";
import { DataTable } from "./datatable";
import { useDispatch, useSelector } from "react-redux";
import { Loading } from "../loading";
import { api } from "../modules/api";
import { set_internal_cdr, append_internal_cdr, set_internal_loading } from "../modules/contexts/slice";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Charts } from "@/components/charts";

import { useSearchParams } from "react-router-dom";

export function CDR_Internal() {
    const [searchParams] = useSearchParams();
    const ip = searchParams.get("ip") || "ALL";

    const data = useSelector((state) => state.app_slice.internal_cdr[ip] || []);
    const total = useSelector((state) => state.app_slice.internal_total);
    const loading = useSelector((state) => state.app_slice.internal_loading);
    const dispatch = useDispatch();

    // Used for API parameters
    const [pageIndex, setPageIndex] = useState(1);
    const loadSize = 1000;

    // Used for DataTable client-side pagination
    const [clientPagination, setClientPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const fetchData = async (page) => {
        dispatch(set_internal_loading(true));
        try {
            const response = await api.get('/load_data', {
                params: {
                    type: "internal",
                    page: page,
                    pageSize: loadSize,
                    device_ip: ip === 'ALL' ? undefined : ip
                }
            });
            if (page === 1) {
                dispatch(set_internal_cdr({ data: response.data.data, total: response.data.total, ip }));
            } else {
                dispatch(append_internal_cdr({ data: response.data.data, total: response.data.total, ip }));
            }
        } catch (error) {
            console.error("Error loading internal CDRs:", error);
        } finally {
            dispatch(set_internal_loading(false));
        }
    };

    // Initial load
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
            accessorKey: "destination",
            header: ({ column }) => sortButton(column, "Destination"),
            name: "Destination"
        },
        {
            accessorKey: "date",
            header: ({ column }) => sortButton(column, "Date"),
            name: "Date",
            // cell: ({ row }) => {
            //     const val = row.getValue("date");
            //     if (!val) return "";
            //     const date = new Date(val);
            //     return isNaN(date.getTime()) ? val : date.toLocaleDateString("en-GB").split("/").join("-");
            // }
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
                        <CardTitle>Internal Call Details Records</CardTitle>
                        <CardDescription>
                            Records of all Internal calls within the PBX network. Showing {data.length} of {total} records.
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
                                    name="Internal Call Records"
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
                        <div className="mt-4 text-xs text-muted-foreground">
                            <span className="font-semibold">Call Type Legend:</span> N=Normal, C=Conference, F=Forward
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}