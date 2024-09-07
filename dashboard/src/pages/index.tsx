// pages/index.tsx
import LeaderboardTable from '@/components/leaderboard-table';
import { useQuery, gql } from '@apollo/client';
// import { useRouter } from 'next/router';
import DropletStatsChart from '@/components/droplet-stats-chart'; // Import the new chart component

const GET_STATS = gql`
  query StatsHistory {
    droplet_stats_history(limit: 1, order_by: { height: desc }) {
      total_addresses
      total_droplets
      date_block
      height
    }
  }
`;

const Dashboard = () => {
  const { loading, error, data } = useQuery(GET_STATS);
  // const router = useRouter();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Droplets Dashboard
        </h2>
      </div>

      {/* Add Droplet Stats Chart here */}
      <div className="bg-white py-24 sm:py-32">
        <DropletStatsChart />
      </div>

      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {data.droplet_stats_history.map(
            (droplet_stats_history: {
              total_addresses: number;
              total_droplets: number;
              date_block: string;
              height: number;
            }) => (
              <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-2">
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-600">Droplets</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    {formatNumberCompact(droplet_stats_history.total_droplets / 10 ** 6)}
                  </dd>
                </div>
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-600">Addresses</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    {droplet_stats_history.total_addresses}
                  </dd>
                </div>
              </dl>
            )
          )}
        </div>
      </div>
      <div>
        <h1>Droplet Leaderboard</h1>
        <LeaderboardTable />
      </div>
    </div>
  );
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Correctly specify the DateTimeFormatOptions types
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  return date.toLocaleDateString('en-GB', options);
}

function formatNumberCompact(number: number): string {
  if (number >= 1_000_000_000) {
    return (number / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (number >= 1_000_000) {
    return (number / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (number >= 1_000) {
    return (number / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return number.toString();
}

export default Dashboard;
