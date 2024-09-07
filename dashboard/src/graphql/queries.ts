import { gql } from '@apollo/client';

export const GET_DROPLET_LEADERBOARD = gql`
  query GetDropletLeaderboard($limit: Int!, $offset: Int!, $orderBy: [droplet_leaderboard_order_by!]!) {
    droplet_leaderboard(limit: $limit, offset: $offset, order_by: $orderBy) {
      address
      droplets
      position
    }
  }
`;

export const GET_ADDRESS_HISTORY = gql`
  query GetAddressHistory($address: String!) {
    droplet_address_history(order_by: { height: asc }, where: { address: { _eq: $address } }) {
      id
      height
      droplets
      address
      date_block
    }
  }
`;

export const GET_STATS_HISTORY = gql`
  query StatsHistory {
    droplet_stats_history(order_by: { height: asc, total_addresses: asc, total_droplets: asc, date_block: asc }) {
      total_addresses
      total_droplets
      date_block
    }
  }
`;