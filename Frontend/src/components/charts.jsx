import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export function Charts({ data }) {
    if (!data || data.length === 0) {
        return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No data to visualize</div>
    }

    // Process data for Call Volume Trend
    const chartData = data.reduce((acc, curr) => {
        const date = curr.date; // assuming date format DD-MM-YYYY
        if (date) {
            if (!acc[date]) {
                acc[date] = { date, calls: 0 };
            }
            acc[date].calls += 1;
        }
        return acc;
    }, {});

    const sortedData = Object.values(chartData).sort((a, b) => {
        const [d1, m1, y1] = a.date.split('-');
        const [d2, m2, y2] = b.date.split('-');
        return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
    });

    return (
        <div className="w-full mt-4 space-y-8">
            <div className="bg-card rounded-lg border p-4 shadow-sm">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">Daily Call Volume</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortedData}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
