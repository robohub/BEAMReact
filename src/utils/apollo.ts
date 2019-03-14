// Apollo client library
// OLD import { createNetworkInterface, ApolloClient } from 'react-apollo';
import { ApolloClient, /*FetchPolicy, ErrorPolicy*/ } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

// Create a new Apollo network interface, to point to our API server.
const APOLLO = {
  // uri: 'http://localhost:4000/',     // Local dgraph - ROB (starta server frÃ¥n dgraphql-master/example)
  // uri: 'https://api.graph.cool/simple/v1/cj5s0jl17534v016007jclvnw',     // graphCool!
  // uri: 'http://localhost:4466',     // Local PRISMA server!
  uri: 'https://eu1.prisma.sh/robohub-c21015/BEAM/dev'  // Prisma Cloud server!
};

// https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher
// import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
// import introspectionQueryResultData from './fragmentTypes.json';
/*const test = {
    '__schema': {
        'types': [
            {
                'kind': 'INTERFACE',
                'name': 'Node',
                'possibleTypes': [
                    {
                        'name': 'BizAttribute'
                    },
                    {
                        'name': 'BizRelation'
                    },
                    {
                        'name': 'BusinessObject'
                    },
                    {
                        'name': 'File'
                    },
                    {
                        'name': 'MetaAttribute'
                    },
                    {
                        'name': 'MetaObject'
                    },
                    {
                        'name': 'MetaRelation'
                    },
                    {
                        'name': 'Plan'
                    },
                    {
                        'name': 'PlanConfig'
                    },
                    {
                        'name': 'SMTransition'
                    },
                    {
                        'name': 'StateMachineSchema'
                    }
                ]
            }
        ]
    }
};*/
/*
const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: {
        __schema: {
            types: [], // no types provided
        },
    },
});
*/
/// This should be run after schema is updated...to get rid of errors when doing readFragment on difficult queries, just uncomment, the comment again!
/*
Kör denna query i Playground, plocka sedan ut alla types där possibletypes != null och lägg i fragmentTypes.json...
{
  __schema{
    types {
      kind
      name
      possibleTypes {
        name
      }
    }
  }
}
*/

export function createClient() {
  return new ApolloClient({
    link: createHttpLink({ uri: APOLLO.uri }),
    cache: new InMemoryCache({ /*fragmentMatcher*/ }),
    // defaultOptions: defaultOptions
  });
}
