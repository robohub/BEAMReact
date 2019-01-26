// REACT-MD
// import '../node_modules/react-md/dist/react-md.blue_grey-red.min.css';
import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { reducer as formReducer } from 'redux-form';

// Apollo Provider. This HOC will 'wrap' our React component chain
// and handle injecting data down to any listening component
import { ApolloProvider } from 'react-apollo';
import { createClient } from './utils/apollo';
import * as WebFontLoader from 'webfontloader';

import App from './App';

// Create a new browser Apollo client
export const client = createClient();

const rootReducer = combineReducers({
  // enthusiasm
  form: formReducer
});

const store = createStore(rootReducer);

WebFontLoader.load({
  google: {
    // families: ['Droid Sans', 'Droid Serif']
    families: ['Roboto:300,400,500,700', 'Material Icons'],
    // families: ['Noto:300,400,500,600,700', 'Material Icons'],
  },
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </ApolloProvider>,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();
