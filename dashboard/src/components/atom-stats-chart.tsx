import React from 'react';
import { useQuery } from '@apollo/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '@/lib/format-date';
import { formatNumberCompact } from '@/lib/format-number-compact';
import { GET_ATOM_HISTORY } from '@/graphql/queries';


const AtomStatsChart: React.FC = () => {
    const { loading, error, data } = useQuery(GET_ATOM_HISTORY);

    if (loading) return <p>Loading chart data...</p>;
    if (error) return <p>Error loading chart data: {error.message}</p>;

    const chartData = data.drop_atom_history.map((entry: any) => ({
        date: formatDate(entry.date_block),
        totalAtom: entry.total_atom / 10 ** 6,
    }));

    return (
        <div>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={formatNumberCompact} />
                    <Tooltip
                        formatter={(value: number) => formatNumberCompact(value)}
                        contentStyle={{
                            backgroundColor: '#2b2b2b',
                            border: '1px solid #25564b',
                            borderRadius: '8px',
                            color: '#ffffff',
                            padding: '10px',
                        }}
                        itemStyle={{
                            color: '#6ec9b5',
                        }}
                        labelStyle={{
                            color: '#ffffff',
                            fontWeight: 'bold',
                        }} />
                    <Line type="linear" dataKey="totalAtom" stroke="#6ec9b5" name="Total dATOM" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AtomStatsChart;
