// pages/index.tsx
import LeaderboardTable from '@/components/leaderboard-table';
import { useQuery, gql } from '@apollo/client';
// import { useRouter } from 'next/router';
import DropletsChart from '@/components/droplets-chart';
import AddressesChart from '@/components/addresses-chart';
import { formatNumberCompact } from '@/lib/format-number-compact';

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
    <div className="max-w-7xl mx-auto p-4 mt-8 mb-8">
      <h1 className="text-3xl font-semibold mb-4">The Unofficial Droplets Dashboard</h1>
      <p className="text-gray-400">
        The information on this dashboard is collected from the public Droplets contract on Neutron and automatically updated shortly
        after the daily distribution. Feedback and requests can be sent to <a href="https://twitter.com/donovansolms" target='blank' className="drop-green">@donovansolms</a>
      </p>
      <div className="backdrop-blur-3xl bg-white/10 rounded-lg max-w-7xl mx-auto p-4 mt-8 mb-8">
        <div className="container mx-auto p-4">
          {data.droplet_stats_history.map(
            (droplet_stats_history: {
              total_addresses: number;
              total_droplets: number;
              date_block: string;
              height: number;
            }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 w-full text-center">
                  <h2 className="text-xl font-semibold mb-4">Droplets</h2>
                  <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl mb-8">
                      {formatNumberCompact(droplet_stats_history.total_droplets / 10 ** 6)}
                    </dd>
                  </div>
                  <DropletsChart />
                </div>

                <div className="p-6 w-full text-center">
                  <h2 className="text-xl font-semibold mb-4">Addresses</h2>
                  <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl mb-8">
                      {droplet_stats_history.total_addresses}
                    </dd>
                  </div>
                  <AddressesChart />
                </div>
              </div>

            )
          )}
        </div>
        <LeaderboardTable />
      </div>
    </div>
  );
};





export default Dashboard;
