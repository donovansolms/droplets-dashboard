// components/DropletStatsChart.tsx
import React from 'react';
import { useQuery } from '@apollo/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GET_STATS_HISTORY } from '../graphql/queries';

const DropletStatsChart: React.FC = () => {
    // Fetch the stats history data
    const { loading, error, data } = useQuery(GET_STATS_HISTORY);

    if (loading) return <p>Loading chart data...</p>;
    if (error) return <p>Error loading chart data: {error.message}</p>;

    // Format data for the chart
    const chartData = data.droplet_stats_history.map((entry: any) => ({
        date: new Date(entry.date_block).toLocaleDateString(), // Format date for display
        totalAddresses: entry.total_addresses,
        totalDroplets: entry.total_droplets,
    }));

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Droplet Stats Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="totalAddresses" stroke="#8884d8" name="Total Addresses" />
                    <Line type="monotone" dataKey="totalDroplets" stroke="#82ca9d" name="Total Droplets" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DropletStatsChart;
