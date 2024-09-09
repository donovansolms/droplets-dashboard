import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import DropletHistoryChart from '../../components/droplet-history-chart';
import { formatNumberCompact } from '@/lib/format-number-compact';
import { shortenAddress } from '@/lib/shorten-address';
import { GET_ADDRESS_DETAILS, GET_ADDRESS_HISTORY } from '@/graphql/queries';
import { formatDateLong } from '@/lib/format-date';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard-header';

const AddressDetailsPage = () => {
  const router = useRouter();
  const { address } = router.query;

  // Fetching address details
  const { loading: detailsLoading, error: detailsError, data: detailsData } = useQuery(GET_ADDRESS_DETAILS, {
    variables: { address },
  });

  // Fetching address history
  const { loading: historyLoading, error: historyError, data: historyData } = useQuery(GET_ADDRESS_HISTORY, {
    variables: { address },
  });

  if (detailsLoading || historyLoading) return <div className="text-center mt-5">Loading...</div>;
  if (detailsError) return <p>Error: {detailsError.message}</p>;
  if (historyError) return <p>Error: {historyError.message}</p>;

  const details = detailsData.droplet_leaderboard[0];

  // Calculate daily changes
  const calculateDailyChanges = (history: any[]) => {
    return history.map((entry: { droplets: number; id: number, date_block: string }, index: number) => {
      if (index === 0) return { ...entry, dailyChange: 0 }; // First entry has no previous day to compare

      const previousEntry = history[index - 1];
      const dailyChange = entry.droplets - previousEntry.droplets;

      return { ...entry, dailyChange };
    });
  };

  const historyWithChanges = calculateDailyChanges(historyData.droplet_address_history);
  historyWithChanges.reverse();

  return (

    <div className="max-w-7xl mx-auto p-4 mt-8 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Link href="/" className="flex items-center drop-green hover:drop-green-text">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="ml-2 drop-green hover:drop-green-text">Back to overview</span>
        </Link>
      </div>

      <DashboardHeader />

      <div className="backdrop-blur-3xl bg-white/10 rounded-lg max-w-7xl mx-auto p-4 mt-8 mb-8">
        <div className="container mx-auto pt-4 pr-2">
          <div className="backdrop-blur-3xl bg-white/10 rounded-lg text-2xl font-semibold p-3 text-center rounded mb-8 hidden md:block">
            {address}
            <div className="pt-2 text-xs font-medium text-white uppercase tracking-wider">Address</div>
          </div>
          <div className="backdrop-blur-3xl bg-white/10 rounded-lg text-2xl font-semibold p-3 text-center rounded mb-8 block md:hidden">
            {shortenAddress(address as string)}
            <div className="pt-2 text-xs font-medium text-white uppercase tracking-wider">Address</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full text-center">
              <h2 className="text-xl font-semibold mb-4">Rank</h2>
              <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl mb-8">
                  {details.position}
                </dd>
              </div>
            </div>

            <div className="p-0 w-full text-center">
              <h2 className="text-xl font-semibold mb-4">Droplets</h2>
              <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl mb-8">
                  {formatNumberCompact(details.droplets / 10 ** 6)}
                </dd>
              </div>
            </div>
          </div>

          <div className="p-5 w-full">
            <DropletHistoryChart address={address as string} />
          </div>

          <div className="p-4 w-full mt-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Daily Change</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Droplets</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {historyWithChanges.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatDateLong(entry.date_block)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatNumberCompact(entry.droplets / 10 ** 6)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${entry.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        +{formatNumberCompact(entry.dailyChange / 10 ** 6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressDetailsPage;
