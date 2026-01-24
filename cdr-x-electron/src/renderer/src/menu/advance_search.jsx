import { ArrowDown, ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Form, FormItem, FormField, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { DataTable } from "../pages/datatable";
import { filterButton, sortButton } from "../pages/column_filter";

export function AdvanceSearch() {
    const incoming = useSelector((state) => state.app_slice.incoming_cdr);
    const internal = useSelector((state) => state.app_slice.internal_cdr);
    const outgoing = useSelector((state) => state.app_slice.outgoing_cdr);

    const [open, setOpen] = useState();

    const [selectedTypesBool, setSelectedTypesBool] = useState({ "Internal": true, "Incoming": true, "Outgoing": true });
    const [filtered_data, setFilteredData] = useState([]);

    const form = useForm({ defaultValues: { "type": { "Internal": true, "Incoming": true, "Outgoing": true } } });
    //form.setValue("type", { "Internal": true, "Incoming": true, "Outgoing": true });

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

    function onSubmit(filters) {

        const data = [];
        const startdate = new Date(filters.startdate);
        const enddate = new Date(filters.enddate);
        //type, source, destination, trunk, startdate, enddate

        if (filters.type["Internal"] === true) {
            internal.forEach(element => {
                const dateString = element["date"];
                const [d, m, y] = dateString.split('-');
                const date = new Date(y, m - 1, d);

                if (element["source"] === filters.source && date >= startdate && date <= enddate)
                    data.push(element);
            });
        }

        if (filters.type["Incoming"] === true) {
            incoming.forEach(element => {
                const dateString = element["date"];
                const [d, m, y] = dateString.split('-');
                const date = new Date(y, m - 1, d);
                if (element["source"] === filters.source && date >= startdate && date <= enddate)
                    data.push(element);
            });
        }
        if (filters.type["Outgoing"] === true) {
            outgoing.forEach(element => {
                const dateString = element["date"];
                const [d, m, y] = dateString.split('-');
                const date = new Date(y, m - 1, d);
                if (element["source"] === filters.source && date >= startdate && date <= enddate)
                    data.push(element);
            });
        }
        setFilteredData(data);
        console.log("askdjljsad", data, filtered_data);
    }
    // show trunk when selected incoming or outgoing
    return (
        <>
            <Dialog open={open} onOpenChange={(e) => { setOpen(e); setFilteredData([]); }}>
                <DialogTrigger asChild>
                    <Button size="sm" variant="ghost">Advance Search</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-fit">
                    {filtered_data.length > 0 ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>Advance Search Result</DialogTitle>
                                <DialogDescription>
                                    May be Apply Some Filters
                                </DialogDescription>
                            </DialogHeader>
                            <div className="w-[1000px] h-[400px] overflow-y-auto">
                                <DataTable columns={columns} data={filtered_data} defaultSearchColumn="source" />
                            </div>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>Advance Search</DialogTitle>
                                <DialogDescription>
                                    May be Apply Some Filters
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="type" className="text-right">Call Type</Label>
                                                        <FormControl>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent">
                                                                        <span>Type</span>
                                                                        <ArrowDown className="ml-2 h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="start">
                                                                    {["Internal", "Incoming", "Outgoing"].map((element) => (
                                                                        <DropdownMenuCheckboxItem key={element}
                                                                            checked={selectedTypesBool[element]}
                                                                            onCheckedChange={(e) => {
                                                                                const a = { ...selectedTypesBool, [element]: e };
                                                                                setSelectedTypesBool(a);
                                                                            }}
                                                                        >
                                                                            {element}
                                                                        </DropdownMenuCheckboxItem>
                                                                    )
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </FormControl>
                                                        <FormMessage className="col-start-2 col-span-3" />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="source"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="extension" className="text-right">Source</Label>
                                                        <FormControl>
                                                            <Input id="text" className="col-span-3" {...field} />
                                                        </FormControl>
                                                        <FormMessage className="col-start-2 col-span-3" />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="startdate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="startdate" className="text-right">Start Date</Label>
                                                        <FormControl>
                                                            <Input type="date" id="startdate" className="col-span-3" {...field} />
                                                        </FormControl>
                                                        <FormMessage className="col-start-2 col-span-3" />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="enddate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="enddate" className="text-right">End Date</Label>
                                                        <FormControl>
                                                            <Input type="date" id="enddate" className="col-span-3" {...field} />
                                                        </FormControl>
                                                        <FormMessage className="col-start-2 col-span-3" />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <Button type="submit">Search</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </div>
                        </>
                    )}

                </DialogContent>
            </Dialog >
        </>
    );
}