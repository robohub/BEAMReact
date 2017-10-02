// Apollo client library
import { createNetworkInterface, ApolloClient } from 'react-apollo';

// Create a new Apollo network interface, to point to our API server.
const APOLLO = {
  // uri: 'http://localhost:4000/',     // Local dgraph - ROB (starta server från dgraphql-master/example)
  uri: 'https://api.graph.cool/simple/v1/cj5s0jl17534v016007jclvnw',     // graphCool!
};
const networkInterface = createNetworkInterface({

  uri: APOLLO.uri,
});

export function createClient() {
  return new ApolloClient(
    Object.assign(
      {
      // reduxRootSelector: (state: ApolloStateSelector) => state.apollo,
        networkInterface,
        // dataIdFromObject: (object: any) => object.id
      }
    )
  );
}