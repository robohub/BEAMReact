// import './css/bootstrap.css';    // v4 theme!

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
// import { enthusiasm } from './reducers/index';
// import { StoreState } from './types/index';
import { reducer as formReducer } from 'redux-form';

// Apollo Provider. This HOC will 'wrap' our React component chain
// and handle injecting data down to any listening component
import { ApolloProvider } from 'react-apollo';
import { createClient } from './utils/apollo';

import App from './App';

// Create a new browser Apollo client
export const client = createClient();

const rootReducer = combineReducers({
  // enthusiasm
  form: formReducer
});

const store = createStore(rootReducer);

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
