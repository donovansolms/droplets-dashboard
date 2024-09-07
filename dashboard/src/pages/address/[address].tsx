// pages/address/[address].tsx
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import DropletHistoryChart from '../../components/droplet-history-chart';

const GET_ADDRESS_DETAILS = gql`
  query GetAddressDetails($address: String!) {
    droplet_leaderboard(where: { address: { _eq: $address } }) {
      address
      droplets
      position
    }
  }
`;

const AddressDetailsPage = () => {
    const router = useRouter();
    const { address } = router.query; // Get the dynamic address from the route

    // Fetch the data for this specific address
    const { loading, error, data } = useQuery(GET_ADDRESS_DETAILS, {
        variables: { address },
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const details = data.droplet_leaderboard[0];

    return (
        <div>
            <h1>Details for Address: {address}</h1>
            <p>Position: {details.position}</p>
            <p>Droplets: {details.droplets}</p>

            {/* Render the DropletHistoryChart component for the address */}
            <DropletHistoryChart address={address as string} />
        </div>
    );
};

export default AddressDetailsPage;
