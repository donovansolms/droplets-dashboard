import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    uri: 'http://private-server:8080/v1/graphql',
    cache: new InMemoryCache(),
});

export default client;
