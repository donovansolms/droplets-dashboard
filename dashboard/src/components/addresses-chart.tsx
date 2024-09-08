// components/DropletStatsChart.tsx
import React from 'react';
import { useQuery } from '@apollo/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GET_STATS_HISTORY } from '../graphql/queries';
import { formatDate } from '@/lib/format-date';
import { formatNumberCompact } from '@/lib/format-number-compact';

const AddressesChart: React.FC = () => {
    const { loading, error, data } = useQuery(GET_STATS_HISTORY);

    if (loading) return <p>Loading chart data...</p>;
    if (error) return <p>Error loading chart data: {error.message}</p>;

    const chartData = data.droplet_stats_history.map((entry: any) => ({
        date: formatDate(entry.date_block),
        totalAddresses: entry.total_addresses,
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
                            border: '1px solid #4a476c',
                            borderRadius: '8px',
                            color: '#ffffff',
                            padding: '10px',
                        }}
                        itemStyle={{
                            color: '#8884d8',
                        }}
                        labelStyle={{
                            color: '#ffffff',
                            fontWeight: 'bold',
                        }} />
                    <Line type="linear" dataKey="totalAddresses" stroke="#8884d8" name="Total Addresses" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AddressesChart;
