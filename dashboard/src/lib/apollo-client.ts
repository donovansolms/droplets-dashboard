import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    uri: 'https://api.dropletsdash.xyz/v1/graphql',
    cache: new InMemoryCache(),
});

export default client;
