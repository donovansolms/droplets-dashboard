// components/DropletStatsChart.tsx
import React from 'react';
import { useQuery } from '@apollo/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GET_STATS_HISTORY } from '../graphql/queries';
import { formatNumberCompact } from '@/lib/format-number-compact';
import { formatDate } from '@/lib/format-date';

const DropletsChart: React.FC = () => {
    const { loading, error, data } = useQuery(GET_STATS_HISTORY);

    if (loading) return <p>Loading chart data...</p>;
    if (error) return <p>Error loading chart data: {error.message}</p>;

    const chartData = data.droplet_stats_history.map((entry: any) => ({
        date: formatDate(entry.date_block),
        totalDroplets: entry.total_droplets / 10 ** 6,
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
                            border: '1px solid #3a4a40',
                            borderRadius: '8px',
                            color: '#ffffff',
                            padding: '10px',
                        }}
                        itemStyle={{
                            color: '#82ca9d',
                        }}
                        labelStyle={{
                            color: '#ffffff',
                            fontWeight: 'bold',
                        }} />
                    <Line type="linear" dataKey="totalDroplets" stroke="#82ca9d" name="Total Droplets" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DropletsChart;
