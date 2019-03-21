
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';

// Apollo Provider. This HOC will 'wrap' our React component chain
// and handle injecting data down to any listening component
import { ApolloProvider } from 'react-apollo';
import { createClient } from './utils/apollo';
import * as WebFontLoader from 'webfontloader'; 

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';

import App from './App';

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
        <App />
      </MuiThemeProvider>
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();
