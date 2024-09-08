// components/LeaderboardTable.tsx
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DROPLET_LEADERBOARD } from '../graphql/queries';
import { formatNumberCompact } from '@/lib/format-number-compact';

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
        // <div>
        //     <table>
        //         <thead>
        //             <tr>
        //                 <th>Position</th>
        //                 <th>Address</th>
        //                 <th>Droplets</th>
        //             </tr>
        //         </thead>
        //         <tbody>
        //             {data.droplet_leaderboard.map((entry: { address: string; droplets: number; position: number }) => (
        //                 <tr key={entry.address} onClick={() => handleRowClick(entry.address)} style={{ cursor: 'pointer' }}>
        //                     <td>{entry.position}</td>
        //                     <td>{entry.address}</td>
        //                     <td>{entry.droplets}</td>
        //                 </tr>
        //             ))}
        //         </tbody>
        //     </table>
        //     <div className="pagination">
        //         <button onClick={handlePreviousPage} disabled={offset === 0}>
        //             Previous
        //         </button>
        //         <button onClick={handleNextPage} disabled={data.droplet_leaderboard.length < limit}>
        //             Next
        //         </button>
        //     </div>
        // </div>

        <div className="p-6 w-full mt-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Leaderboard</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Droplets
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.droplet_leaderboard.map((entry: { address: string; droplets: number; position: number }) => (
                            <tr
                                key={entry.address}
                                onClick={() => handleRowClick(entry.address)}
                                className="hover:bg-gray-700 cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{entry.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{entry.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatNumberCompact(entry.droplets / 10 ** 6)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between mt-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={offset === 0}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={data.droplet_leaderboard.length < limit}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default LeaderboardTable;
