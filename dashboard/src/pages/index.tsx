import LeaderboardTable from '@/components/leaderboard-table';
import { useQuery, gql } from '@apollo/client';
import DropletsChart from '@/components/droplets-chart';
import AddressesChart from '@/components/addresses-chart';
import { formatNumberCompact } from '@/lib/format-number-compact';
import { formatDateWithTime } from '@/lib/format-date';
import { GET_STATS } from '@/graphql/queries';
import DashboardHeader from '@/components/dashboard-header';

const Dashboard = () => {
  const { loading, error, data } = useQuery(GET_STATS);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="max-w-7xl mx-auto p-4 mt-8 mb-8">
      <DashboardHeader />
      <div className="backdrop-blur-3xl bg-white/10 rounded-lg max-w-7xl mx-auto p-4 mt-8 mb-8">
        <div className="container mx-auto pt-4 pr-2">
          {data.droplet_stats_history.map(
            (droplet_stats_history: {
              total_addresses: number;
              total_droplets: number;
              date_block: string;
              height: number;
            }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-0 w-full text-center">
                  <h2 className="text-xl font-semibold mb-4">Droplets</h2>
                  <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl mb-8">
                      {formatNumberCompact(droplet_stats_history.total_droplets / 10 ** 6)}
                    </dd>
                  </div>
                  <DropletsChart />
                </div>

                <div className="w-full text-center">
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
        {data.droplet_stats_history.map(
          (droplet_stats_history: {
            total_addresses: number;
            total_droplets: number;
            date_block: string;
            height: number;
          }) => (
            <div className="text-center text-white opacity-30">
              <p>
                Droplets last updated on {formatDateWithTime(droplet_stats_history.date_block)}
              </p>
              <p>
                Addresses not eligible for the airdrop have been removed from this dashboard
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
