/// <reference path="./robtypings/reactHeadroom.d.ts" />
import './App.css';
import '../node_modules/vis/dist/vis.css';

import * as React from 'react';

import {
  // Link,
  Route,
  // Switch,
} from 'react-router-dom';

// import Hello from './containers/Hello';
import Example from './components/charting/chartsample';
import Diagram from './components/diagramming/diagram';
import Admin from './components/admin/page/AdminPage';
import Composer from './components/composer/page/ComposerPage';
import MenuExampleHeader from './components/menus/semanticui';

import Headroom from 'react-headroom';

import { ArrayPage } from './components/simpleForm/simpleForm';

const Home = () => (
  <div>
    <h1>You&apos;re on the home page - click another link above</h1>
  </div>
);

type State = {
  isOpen: boolean;
};

class App extends React.Component<{}, State> {

  constructor() {
    super();

    this.state = {
      isOpen: false
    };
  }
  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <div>
        <Headroom>
          <MenuExampleHeader/>
        </Headroom>

        <Route exact={true} path="/" component={Home} />
        <Route exact={true} path="/Chart" component={Example} />
        <Route exact={true} path="/Diagram" component={Diagram} />
        <Route exact={true} path="/Admin" component={Admin} />
        <Route path="/Composer" component={Composer} />
        
        <ArrayPage />
      </div>
    );
  }
}

export default App;
