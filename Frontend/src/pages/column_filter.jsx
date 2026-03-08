import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const sortButton = (column, name, width) => {
    return (
        <Button
            variant="ghost" className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {name}
            {column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />}
        </Button>
    )
}

export const filterButton = (column, name, types) => {
    // Read current state from the table column filter instead of local React state
    const filterValue = column.getFilterValue();

    // If undefined, no filter has been set yet, meaning everything is default "checked"
    const isChecked = (element) => {
        if (filterValue === undefined) return true;
        return filterValue.includes(element);
    };

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
                        <DropdownMenuCheckboxItem
                            key={element}
                            checked={isChecked(element)}
                            onCheckedChange={(e) => {
                                // Default all types if filter conceptually hasn't been set yet
                                let currentFilter = filterValue === undefined ? [...types] : [...filterValue];
                                let newFilter;

                                if (e) {
                                    // Add to selected types if checked
                                    newFilter = [...currentFilter, element];
                                } else {
                                    // Remove from selected types if unchecked
                                    newFilter = currentFilter.filter(t => t !== element);
                                }

                                // If everything is selected again, clear the filter to optimize logic and UI state
                                if (newFilter.length === types.length) {
                                    column.setFilterValue(undefined);
                                } else {
                                    column.setFilterValue(newFilter);
                                }
                            }}
                        >
                            {element}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}