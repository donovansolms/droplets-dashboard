import React from 'react';
import { useQuery } from '@apollo/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GET_ADDRESS_HISTORY } from '../graphql/queries';
import { formatNumberCompact } from '@/lib/format-number-compact';
import { formatDate } from '@/lib/format-date';

interface DropletHistoryChartProps {
    address: string;
}

const DropletHistoryChart: React.FC<DropletHistoryChartProps> = ({ address }) => {
    // Fetch the droplet history data for the given address
    const { loading, error, data } = useQuery(GET_ADDRESS_HISTORY, {
        variables: { address },
    });

    if (loading) return <p>Loading chart data...</p>;
    if (error) return <p>Error loading chart data: {error.message}</p>;

    const historyData = data.droplet_address_history.map((entry: any) => ({
        date: formatDate(entry.date_block),
        droplets: entry.droplets / 10 ** 6,
    }));

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historyData}>
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
                <Line type="monotone" dataKey="droplets" stroke="#82ca9d" name="Total Droplets" dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default DropletHistoryChart;
