import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_DROPLET_LEADERBOARD, GET_ADDRESS_POSITION, GET_ADDRESSES_IN_RANGE } from '../graphql/queries'; // Import your queries
import { formatNumberCompact } from '@/lib/format-number-compact';
import { shortenAddress } from '@/lib/shorten-address';

const LeaderboardTable = () => {
    const router = useRouter();
    const [limit] = useState(20); // Fixed limit for pagination
    const [offset, setOffset] = useState(0); // State for pagination offset
    const [searchTerm, setSearchTerm] = useState(''); // State for search input
    const [isSearching, setIsSearching] = useState(false); // State to control if we are in search mode

    // Fetch data with pagination (default view)
    const { loading, error, data } = useQuery(GET_DROPLET_LEADERBOARD, {
        variables: { limit, offset, orderBy: { position: 'asc' } },
        skip: isSearching, // Skip this query when searching
    });

    // Lazy query to get the position of the address
    const [getAddressPosition, { data: positionData, loading: positionLoading, error: positionError }] = useLazyQuery(GET_ADDRESS_POSITION);

    // Lazy query to get the addresses in a range
    const [getAddressesInRange, { data: rangeData, loading: rangeLoading, error: rangeError }] = useLazyQuery(GET_ADDRESSES_IN_RANGE);

    const handleRowClick = (address: string) => {
        router.push(`/address/${address}`);
    };

    const handleSearch = () => {
        if (searchTerm) {
            // First, get the position of the searched address
            getAddressPosition({ variables: { address: searchTerm } });
            setIsSearching(true); // Enable search mode
        } else {
            setIsSearching(false); // Reset to default mode
        }
    };

    const handleClearSearch = () => {
        setSearchTerm(''); // Clear search input
        setIsSearching(false); // Reset to default mode
        setOffset(0); // Reset pagination to the first page if needed
    };

    // Effect to fetch range data when position is available
    useEffect(() => {
        if (positionData && positionData.droplet_leaderboard.length > 0) {
            const position = positionData.droplet_leaderboard[0].position;
            const start = Math.max(0, position - 2); // Start 5 positions before
            const end = position + 2; // End 5 positions after

            // Fetch addresses in the range of 5 positions before and after
            getAddressesInRange({ variables: { start, end } });
        }
    }, [positionData, getAddressesInRange]);

    const handleNextPage = () => {
        setOffset(offset + limit);
    };

    const handlePreviousPage = () => {
        if (offset - limit >= 0) {
            setOffset(offset - limit);
        }
    };

    // Ensure that both data objects are defined before accessing their properties
    const leaderboardData =
        isSearching && rangeData && rangeData.droplet_leaderboard
            ? rangeData.droplet_leaderboard
            : data && data.droplet_leaderboard
                ? data.droplet_leaderboard
                : [];

    if (loading || positionLoading || rangeLoading) return <p>Loading...</p>;
    if (error || positionError || rangeError)
        return (
            <p>Error: {error?.message || positionError?.message || rangeError?.message}</p>
        );

    return (
        <div className="p-6 w-full mt-8">
            <div className='pb-4 mb-4'>
                <div className="float-right">
                    <input
                        type="text"
                        placeholder="Search address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded-l-md text-gray-500 focus:outline-none"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 drop-purple text-white rounded-r-md hover:drop-purple"
                    >
                        Search
                    </button>
                    {searchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className="px-4 py-2 ml-2 drop-red text-gray-400 hover:text-white rounded-md"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <h2 className="text-xl font-semibold mb-4 text-white">Leaderboard</h2>
            </div>
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
                            <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                                Droplets
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-drop-purple">
                        {leaderboardData.map((entry: { address: string; droplets: number; position: number }) => (
                            <tr
                                key={entry.address}
                                onClick={() => handleRowClick(entry.address)}
                                className={`hover:drop-green cursor-pointer rounded ${searchTerm && entry.address.toLowerCase() === searchTerm.toLowerCase() ? 'bg-green-500' : ''
                                    }`} // Apply conditional class
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{entry.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white hidden md:block">{entry.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white block md:hidden">{shortenAddress(entry.address)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">{formatNumberCompact(entry.droplets / 10 ** 6)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!isSearching && (
                <div className="flex justify-between mt-4">
                    <button
                        onClick={handlePreviousPage}
                        disabled={offset === 0}
                        className="px-4 py-2 drop-purple text-white rounded-md hover:drop-purple  disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={data && data.droplet_leaderboard.length < limit}
                        className="px-4 py-2 drop-purple text-white rounded-md hover:drop-purple disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeaderboardTable;
