// components/LeaderboardTable.tsx
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DROPLET_LEADERBOARD } from '../graphql/queries';

const LeaderboardTable = () => {
    // Pagination state
    const [limit] = useState(50); // Fixed limit
    const [offset, setOffset] = useState(0); // State for offset

    // Fetch data with pagination
    const { loading, error, data } = useQuery(GET_DROPLET_LEADERBOARD, {
        variables: { limit, offset, orderBy: { position: 'asc' } },
    });

    // Pagination handlers
    const handleNextPage = () => {
        setOffset(offset + limit);
    };

    const handlePreviousPage = () => {
        if (offset - limit >= 0) {
            setOffset(offset - limit);
        }
    };

    // Function to handle row click and open a new tab
    const handleRowClick = (address: string) => {
        window.open(`/address/${address}`, '_blank');
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Address</th>
                        <th>Droplets</th>
                    </tr>
                </thead>
                <tbody>
                    {data.droplet_leaderboard.map((entry: { address: string; droplets: number; position: number }) => (
                        <tr key={entry.address} onClick={() => handleRowClick(entry.address)} style={{ cursor: 'pointer' }}>
                            <td>{entry.position}</td>
                            <td>{entry.address}</td>
                            <td>{entry.droplets}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={handlePreviousPage} disabled={offset === 0}>
                    Previous
                </button>
                <button onClick={handleNextPage} disabled={data.droplet_leaderboard.length < limit}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default LeaderboardTable;
