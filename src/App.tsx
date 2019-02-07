import './App.css';

// RAPPID CSS - se index.html
/*
import './vendor/rappid.css';
import './css/style.css';
import './css/style.dark.css';
import './css/style.material.css';
import './css/style.modern.css';
*/
import '../node_modules/vis/dist/vis.css';

import * as React from 'react';

import {
    Link,
    Route, 
    // Switch,
} from 'react-router-dom';

import Example from './components/charting/chartsample';
import Admin from './components/admin/page/AdminPage';
import Composer from './components/composer/page/ComposerPage';
import Navigation from './components/navigation/navigationPage';
import NavLink from '@material-ui/icons/Navigation';

import Diagram from './components/diagramming/Rappid/rappid';

import { Button, Grid, Cell, ListItem, FontIcon, NavigationDrawer, SelectionControl,
    DataTable, 
    TableHeader,
    TableBody,
    TableRow,
    TableColumn,
    Card, CardTitle, CardText
} from 'react-md';

import * as loremIpsum from 'lorem-ipsum';
import { Typography } from '@material-ui/core';

type TrelloBoardType = { name: string, url: string };
type TrelloCardType = { name: string, desc: string, id: string };
type TrelloListType = { name: string, id: string, cards: TrelloCardType[] };

type State = { trelloLoaded: boolean};

class TrelloView extends React.Component<{}, State> {
    private selectedBoard: TrelloBoardType;
    private listor: TrelloListType[];
    private listCardCount = 0;

    constructor(props: {}) {
        super(props);
        this.state = { trelloLoaded: false };
    }
    async fetchTrelloLists(endpoint: string) {
        let res = await fetch(endpoint);
        let data = await res.json();
        
        // tslint:disable-next-line:no-console
        console.log('Hämtade trello boards ', data, data[1].url);

        this.selectedBoard = data[1];
        
        res = await fetch('https://api.trello.com/1/boards/' + data[1].id + '/lists?key=d7c07e3cc113f52311febcf783969005&token=bb26a9833433022ec2407a9184ddcfac828309d183fe6ad488526405b0024d39');
        this.listor = await res.json();

        // tslint:disable-next-line:no-console
        console.log('Hämtade trello listor ', this.listor, 'för boardet: ' + data[1].name);

        this.listor.map(async lista => {
            // tslint:disable-next-line:max-line-length
            res = await fetch('https://api.trello.com/1/lists/' + lista.id + '/cards?key=d7c07e3cc113f52311febcf783969005&token=bb26a9833433022ec2407a9184ddcfac828309d183fe6ad488526405b0024d39');
            lista.cards = await res.json();
            this.listCardCount++;
            if (this.listCardCount === this.listor.length) {
                this.setState({ trelloLoaded: true} );
           }
        });
    }

    componentDidMount() {
        this.fetchTrelloLists('https://api.trello.com/1/members/me/boards?key=d7c07e3cc113f52311febcf783969005&token=bb26a9833433022ec2407a9184ddcfac828309d183fe6ad488526405b0024d39');
    }
    
    render() {
        return (
            this.state.trelloLoaded ? (
                <div>
                    <div>
                        <Typography variant="h4">Board Name: <a href={this.selectedBoard.url}>{this.selectedBoard.name}</a></Typography>
                    </div>
                    <Grid>
                        {this.listor.map(lista => (
                            <Cell size={2} key={lista.id} >
                                <Card  className="md-block-centered">
                                    <CardTitle title={lista.name} subtitle={lista.id} />
                                    <CardText>
                                        {lista.cards.map(kort => (
                                                <div key={kort.id}>
                                                    <Card className="md-block-centered">
                                                        <CardTitle subtitle={kort.name} title="" />
                                                        <CardText>
                                                            {kort.desc}
                                                        </CardText>
                                                    </Card>
                                                    {'-'}
                                                </div>
                                        ))}                       
                                    </CardText>
                                </Card>
                            </Cell>
                        ))}
                    </Grid>
                </div>
            )    
            :
            'Loading Trello board...'
        );
    }
}

class Home extends React.Component {
    
    render() {
        return (
            <div>
               <div className="md-divider-border md-divider-border--top md-divider-border--bottom">
                    <TrelloView/>
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
    }
}

class App extends React.Component<{}> {
    
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
                        <ListItem key={1} primaryText="Chart & Timeplan" leftIcon={<FontIcon>insert_chart</FontIcon>} component={Link} to="/Chart"/>,
                        <ListItem key={2} primaryText="Diagram Editor" leftIcon={<FontIcon>domain</FontIcon>} component={Link} to="/Diagram"/>,
                        <ListItem key={3} primaryText="Admin" leftIcon={<FontIcon>phonelink_setup</FontIcon>} component={Link} to="/Admin"/>,
                        <ListItem key={4} primaryText="Composer" leftIcon={<FontIcon>view_compact</FontIcon>} component={Link} to="/Composer"/>,
                        <ListItem key={5} primaryText="Navigation" leftIcon={<NavLink/>} component={Link} to="/Navigation"/>
                    ]}
            >
                <Route exact={true} path="/" component={Home} />
                <Route exact={true} path="/Chart" component={Example} />
                <Route exact={true} path="/Diagram" component={Diagram} />
                <Route exact={true} path="/Admin" component={Admin} />
                <Route path="/Composer" component={Composer} />
                <Route path="/Navigation" component={Navigation} />
            </NavigationDrawer>
        );
    }
}

export default App;
