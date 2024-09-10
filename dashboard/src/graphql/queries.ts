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


export const GET_STATS = gql`
  query StatsHistory {
    droplet_stats_history(limit: 1, order_by: { height: desc }) {
      total_addresses
      total_droplets
      date_block
      height
    }
  }
`;

export const GET_DATOM_STATS = gql`
  query dAtomHistory {
    drop_atom_history(limit: 1, order_by: { height: desc }) {
      total_atom
      date_block
      height
    }
  }
`;

export const GET_ADDRESS_DETAILS = gql`
  query GetAddressDetails($address: String!) {
    droplet_leaderboard(where: { address: { _eq: $address } }) {
      address
      droplets
      position
    }
  }
`;

export const GET_ADDRESS_POSITION = gql`
  query GetAddressDetails($address: String!) {
    droplet_leaderboard(where: { address: { _eq: $address } }) {
      address
      droplets
      position
    }
  }
`;


export const GET_ADDRESSES_IN_RANGE = gql`
  query GetAddressesInRange($start: Int!, $end: Int!) {
    droplet_leaderboard(where: { position: { _gte: $start, _lte: $end } }, order_by: { position: asc }) {
      address
      position
      droplets
    }
  }
`;

// Define the new query using gql
export const GET_ATOM_HISTORY = gql`
  query GetAtomHistory {
    drop_atom_history(order_by: { height: asc }) {
      date_block
      total_atom
    }
  }
`;
