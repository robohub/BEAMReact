/// <reference path="./robtypings/reactHeadroom.d.ts" />
import './App.css';
import '../node_modules/vis/dist/vis.css';

import * as React from 'react';

import {
    Link,
    Route, 
    // Switch,
} from 'react-router-dom';

// import Hello from './containers/Hello';
import Example from './components/charting/chartsample';
import Diagram from './components/diagramming/diagram';
import Admin from './components/admin/page/AdminPage';
import Composer from './components/composer/page/ComposerPage';

// import Headroom from 'react-headroom';

import { Button, Grid, Cell, ListItem, FontIcon, NavigationDrawer, SelectionControl,
    DataTable, 
    TableHeader,
    TableBody,
    TableRow,
    TableColumn,
} from 'react-md';

import * as loremIpsum from 'lorem-ipsum';

// import { ArrayPage } from './components/simpleForm/simpleForm';   preserved just as example

const Home = () => (
    <div>
        <div className="md-divider-border md-divider-border--top md-divider-border--bottom">
            <Grid>
                <Cell size={4}>
                    <h5>Theme Examples</h5>
                    <Button raised={true}>Hello, World!</Button>
                    <Button flat={true} primary={true}>Done</Button>
                </Cell>
                <Cell size={4}>
                    <h5>Disabled Examples</h5>
                    <Button flat={true} >Disabled Button</Button>
                    <Button raised={true} disabled={true}>Disabled Button</Button>
                </Cell>
                <Cell size={4}>
                    <h5>Theme Swapped Examples</h5>
                    <Button raised={true} primary={true} swapTheming={true}>Hello</Button>
                    <Button raised={true} secondary={true} swapTheming={true}>World</Button>
                    <Button raised={true} primary={true}>Hello</Button>
                    <Button raised={true} secondary={true}>World</Button>
                </Cell>
                <SelectionControl
                        id="moCB"
                        name="cbox"
                        type="switch"
                        label="TEST"
                        defaultChecked={true}
                />
            </Grid>

            <DataTable baseId="simple-selectable-table" indeterminate={true}>
                <TableHeader>
                    <TableRow>
                        <TableColumn grow={true}>Lorem 1</TableColumn>
                        <TableColumn>Lorem 2</TableColumn>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow key={1}>
                        <TableColumn>{loremIpsum({ count: 5, units: 'words' })}</TableColumn>
                        <TableColumn>{loremIpsum({ count: 5, units: 'words' })}</TableColumn>
                    </TableRow>
                    <TableRow key={2}>
                        <TableColumn>{loremIpsum({ count: 25, units: 'words' })}</TableColumn>
                        <TableColumn>{loremIpsum({ count: 5, units: 'words' })}</TableColumn>
                    </TableRow>
                    <TableRow key={3}>
                        <TableColumn>{loremIpsum({ count: 15, units: 'words' })}</TableColumn>
                        <TableColumn>{loremIpsum({ count: 5, units: 'words' })}</TableColumn>
                    </TableRow>
                    <TableRow key={4}>
                        <TableColumn>{loremIpsum({ count: 5, units: 'words' })}</TableColumn>
                        <TableColumn>{loremIpsum({ count: 5, units: 'words' })}</TableColumn>
                    </TableRow>
                </TableBody>
            </DataTable> 
        </div>
    </div>
);

class App extends React.Component<{}> {
/*    
    state = { visible: false };

    showDrawer = () => {
        this.setState({ visible: true });
    }
    
    hideDrawer = () => {
        this.setState({ visible: false });
    }
    
    handleVisibility = (visible: boolean) => {
        this.setState({ visible });
    }
*/    
    render() {
        return (
            <NavigationDrawer
                toolbarTitle={'BEAM'}
                drawerTitle={'Main Menu'}
                mobileDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY_MINI}
                tabletDrawerType={NavigationDrawer.DrawerTypes.PERSISTENT_MINI}
                desktopDrawerType={NavigationDrawer.DrawerTypes.PERSISTENT_MINI}
                navItems={
                    [
                        <ListItem key={0} primaryText="Home" leftIcon={<FontIcon>home</FontIcon>} component={Link} to="/"/>,
                        <ListItem key={1} primaryText="Chart" leftIcon={<FontIcon>insert_chart</FontIcon>} component={Link} to="/Chart"/>,
                        <ListItem key={2} primaryText="Diagram Editor" leftIcon={<FontIcon>domain</FontIcon>} component={Link} to="/Diagram"/>,
                        <ListItem key={3} primaryText="Admin" leftIcon={<FontIcon>phonelink_setup</FontIcon>} component={Link} to="/Admin"/>,
                        <ListItem key={4} primaryText="Composer" leftIcon={<FontIcon>view_compact</FontIcon>} component={Link} to="/Composer"/>
                    
                    ]}
                /*contentId="main-demo-content"
                contentStyle={{minHeight: 'auto'}}
                    contentClassName="md-grid"*/
            >
                <Route exact={true} path="/" component={Home} />
                <Route exact={true} path="/Chart" component={Example} />
                <Route exact={true} path="/Diagram" component={Diagram} />
                <Route exact={true} path="/Admin" component={Admin} />
                <Route path="/Composer" component={Composer} />
            </NavigationDrawer>
        );
    }
}

export default App;
