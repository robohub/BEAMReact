// Apollo client library
// OLD import { createNetworkInterface, ApolloClient } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

// Create a new Apollo network interface, to point to our API server.
const APOLLO = {
  // uri: 'http://localhost:4000/',     // Local dgraph - ROB (starta server frÃ¥n dgraphql-master/example)
  // uri: 'https://api.graph.cool/simple/v1/cj5s0jl17534v016007jclvnw',     // graphCool!
  // uri: 'http://localhost:4466',     // Local PRISMA server!
  uri: 'https://eu1.prisma.sh/robohub-c21015/BEAM/dev'  // Prisma Cloud server!
};

export function createClient() {
  return new ApolloClient({
    link: createHttpLink({ uri: APOLLO.uri }),
    cache: new InMemoryCache(),

  });
}