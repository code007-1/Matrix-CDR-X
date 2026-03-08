export default function Single_Info(name, data) {
    return (
        <div className="flex cursor-pointer text-center">
            <div className="shadow-md bg-background shadow-border rounded-tl-md rounded-bl-md p-2">
                {name}
            </div>
            <div className="bg-secondary font-bold shadow-md shadow-border rounded-tr-md rounded-br-md p-2">
                {data}
            </div>
        </div>
    );
};

export function Summary({ data, startContent }) {
    //console.log("data is ", data);
    const sums = {};
    sums["calls"] = data.length;
    sums["answerduration"] = (data.reduce((accumulator, currentObject) => { return accumulator + parseFloat(currentObject.answerduration); }, 0) / 60).toFixed(2);
    sums["averageduration"] = (sums["answerduration"] / (sums["calls"] || 1)).toFixed(2);

    return (
        <>
            <div className="flex justify-evenly items-center">
                {startContent}
                {Single_Info("Total Calls", sums["calls"])}
                {Single_Info("Total Duration", sums["answerduration"] + " Minutes")}
                {Single_Info("Average Duration", sums["averageduration"] + " Minutes")}
            </div>
        </>
    );
}