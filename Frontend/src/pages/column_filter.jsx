import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const sortButton = (column, name, width) => {
    return (
        <Button
            variant="ghost" className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {name}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    )
}

export const filterButton = (column, name, types) => {
    const [selectedTypesBool, setSelectedTypesBool] = useState(types.reduce((t, key) => ({ ...t, [key]: true }), {}));

    return (
        <div className="flex items-center space-x-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent">
                        <span>{name}</span>
                        <ArrowDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {types.map((element) => (
                        <DropdownMenuCheckboxItem key={element}
                            checked={selectedTypesBool[element]}
                            onCheckedChange={(e) => {
                                const a = { ...selectedTypesBool, [element]: e };
                                console.log("filter button", element, e, a);
                                setSelectedTypesBool(a);
                                const b = [];
                                for (const key in a)
                                    a[key] && b.push(key);
                                column.setFilterValue(b);
                            }}
                        >
                            {element}
                        </DropdownMenuCheckboxItem>
                    )
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div >
    )
}