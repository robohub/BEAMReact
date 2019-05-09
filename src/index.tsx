
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';

// Apollo Provider. This HOC will 'wrap' our React component chain
// and handle injecting data down to any listening component
import { ApolloProvider, Query } from 'react-apollo';
import { createClient } from './utils/apollo';
import * as WebFontLoader from 'webfontloader'; 

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';

import App from './App';
import * as Globals from './components/shared/globals';

import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';

const getSystemSetupQuery = gql`
query getUserMapping {
  systemSetups {
    id
    systemUserMOMapping { id }
    systemUseridMAMapping { id }
    templateConfig {
      id
      moObject { id }
      moRelation { id }
      defaultTemplate { id }
      userRelatedMRId
    }
  }
}
`;

const createSystemSetupMutation = gql`
mutation createSystemSetup {
  createSystemSetup (data: {templateConfig: {create: {defaultTemplate: null}}}) {
    id
    systemUserMOMapping { id }
    systemUseridMAMapping { id }
    templateConfig {
      id
      moObject { id }
      moRelation { id }
      defaultTemplate { id }
      userRelatedMRId
    }  }
}
`;

type SystemSetup = {
    id: string;
    systemUserMOMapping: { id: string; }
    systemUseridMAMapping: { id: string; }
    templateConfig: {
      id: string;
      moObject: { id: string; }
      moRelation: { id: string; }
      defaultTemplate: { id: string; }
      userRelatedMRId: string
    }  
};

const getTemplateMapping = gql`
query getTemplateMapping{
    templateMappings{
        id
        template { id name }
        businessObject { id }
    }
}
`;

export type MappingType = {
    template: { id: string, name: string }
    businessObject: { id: string }
};

// Create a new browser Apollo client
export const client = createClient();

WebFontLoader.load({
    google: {
        // families: ['Droid Sans', 'Droid Serif']
        families: ['Roboto:300,400,500'],
        // families: ['Noto:300,400,500,600,700', 'Material Icons'],
    },
});

const theme = createMuiTheme({
    palette: {
        primary: { main: blue[500] },
    },
    typography: { useNextVariants: true },  // RH TODO: ?
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <Query query={getSystemSetupQuery}>
          {({ loading, data, error }) => {
              if (loading) {
                  return <div>Loading System Setup...</div>;
              }
              if (error) {
                  return <div>ERROR: {error.message}</div>;
              }

              let systemSetups: SystemSetup[] = data.systemSetups;
              if (systemSetups.length) {
                  
                  Globals.SystemConfigVars.SYSTEM_SETUP_ID = systemSetups[0].id;
                  
                  if (systemSetups[0].systemUserMOMapping) {
                      Globals.SystemConfigVars.SYSTEMUSER_METAOBJECT_MAPPING = systemSetups[0].systemUserMOMapping.id;
                  }
                  if (systemSetups[0].systemUseridMAMapping) {
                      Globals.SystemConfigVars.SYSTEMUSER_USERID_MA_MAPPING = systemSetups[0].systemUseridMAMapping.id;
                  }

                  if (systemSetups[0].templateConfig.moObject) {
                    Globals.SystemConfigVars.TEMPLATE_CONFIG_METAOBJECT = systemSetups[0].templateConfig.moObject.id;
                  }
                  if (systemSetups[0].templateConfig.moRelation) {
                      Globals.SystemConfigVars.TEMPLATE_CONFIG_MORELATION = systemSetups[0].templateConfig.moRelation.id;
                  }
                  Globals.SystemConfigVars.USER_RELATED_METARELATION = systemSetups[0].templateConfig.userRelatedMRId;
                  if (systemSetups[0].templateConfig.defaultTemplate) {
                      Globals.SystemConfigVars.DEFAULT_USER_TEMPLATE = systemSetups[0].templateConfig.defaultTemplate.id;
                  }

                  client.query({
                      query: getTemplateMapping
                  }).then(result => {
                      let mappings = result as ApolloQueryResult<{templateMappings: MappingType[]}>;
                      mappings.data.templateMappings.forEach(mapping => {
                          Globals.SystemConfigVars.USER_TEMPLATE_MAP.set(mapping.businessObject.id, {id: mapping.template.id, name: mapping.template.name});
                      });
                  });
              } else {
                // RH TODO: skapa ny tom SystemSetup!
                client.mutate({
                    mutation: createSystemSetupMutation
                }).then(res => {
                    let newSetup: SystemSetup = res.data.createSystemSetup;
                    Globals.SystemConfigVars.SYSTEM_SETUP_ID = newSetup.id;
                    // Update cache
                    const setups: {systemSetups: SystemSetup[]} = client.readQuery({query: getSystemSetupQuery});
                    setups.systemSetups.push(newSetup);
                    client.writeQuery({ query: getSystemSetupQuery, data: setups});
                });
              }

              return (
                <App />
              );

        }}
        </Query>
      </MuiThemeProvider>
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();
