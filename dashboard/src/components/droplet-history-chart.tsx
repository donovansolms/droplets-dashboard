import React from 'react';
import { useQuery } from '@apollo/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GET_ADDRESS_HISTORY } from '../graphql/queries';

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
        date: new Date(entry.date_block).toLocaleDateString(), // Format date for display
        droplets: entry.droplets,
    }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="droplets" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default DropletHistoryChart;
