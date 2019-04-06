import './App.css';

import '../node_modules/vis/dist/vis.css';

import * as React from 'react';
import { Link, Route, LinkProps } from 'react-router-dom';

import * as Globals from './components/shared/globals';

import PlannerAdmin from './components/admin/page/plannerConfigPage';
import Example from './components/charting/chartsample';
import Admin from './components/admin/page/AdminPage';
import Composer from './components/composer/page/ComposerPage';
import Navigation from './components/navigation/navigationPage';
import Planner from './components/planner/landingPage';
import Home from './components/home/homePage';
import { LoginForm } from './components/login/loginForm';

import PlannerIcon from '@material-ui/icons/ClearAllOutlined';
import SettingsIcon from '@material-ui/icons/Settings';
import MapIcon from '@material-ui/icons/Map';
import BubblesIcon from '@material-ui/icons/BubbleChartOutlined';
import ChartIcon from '@material-ui/icons/InsertChart';
import DiagramIcon from '@material-ui/icons/DeveloperBoardOutlined';
import LoginIcon from '@material-ui/icons/Face';

import classNames from 'classnames';

import Diagram from './components/diagramming/Rappid/rappid';

// import * as loremIpsum from 'lorem-ipsum';
import { Typography, WithStyles, createStyles, Theme, withStyles, Divider, Menu, MenuItem } from '@material-ui/core';

import gql from 'graphql-tag';

const getSystemSetupQuery = gql`
query getUserMapping {
    systemSetups {
      id
      systemUserMOMapping {
        id
      }
      systemUseridMAMapping {
        id
      }
    }
  }
`;

type SystemSetup = {
    id: string;
    systemUserMOMapping: {
        id: string;
    }
    systemUseridMAMapping: {
        id: string;
    }    
};

/*
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
        
        res = await fetch('https://api.trello.com/1/boards/' + data[1].id + '/lists?key={}&token={}');
        this.listor = await res.json();

        // tslint:disable-next-line:no-console
        console.log('Hämtade trello listor ', this.listor, 'för boardet: ' + data[1].name);

        this.listor.map(async lista => {
            // tslint:disable-next-line:max-line-length
            res = await fetch('https://api.trello.com/1/lists/' + lista.id + '/cards?key={}&token={}');
            lista.cards = await res.json();
            this.listCardCount++;
            if (this.listCardCount === this.listor.length) {
                this.setState({ trelloLoaded: true} );
           }
        });
    }

    componentDidMount() {
        this.fetchTrelloLists('https://api.trello.com/1/members/me/boards?key={}&token={}');
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
*/

import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
// import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import { AccountCircle, LinearScale } from '@material-ui/icons';
import { Query } from 'react-apollo';

const drawerWidth = 240;

export const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
    },
    grow: {
        flexGrow: 1,
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 20,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
});

interface Props extends WithStyles<typeof styles> {
}

const LoginLink: React.SFC<ListItemProps> = (props) => { return <Link to="/login" {...props as LinkProps} />; };
const HomeLink: React.SFC<ListItemProps> = (props) => { return <Link to="/home" {...props as LinkProps} />; };
const PlannerAdminLink: React.SFC<ListItemProps> = (props) => { return <Link to="/PlannerAdmin" {...props as LinkProps} />; };
const ChartLink: React.SFC<ListItemProps> = (props) => { return <Link to="/Chart" {...props as LinkProps} />; };
const DiagramLink: React.SFC<ListItemProps> = (props) => { return <Link to="/Diagram" {...props as LinkProps} />; };
const AdminLink: React.SFC<ListItemProps> = (props) => { return <Link to="/Admin" {...props as LinkProps} />; };
const ComposerLink: React.SFC<ListItemProps> = (props) => { return <Link to="/Composer" {...props as LinkProps} />; };
const NavigationLink: React.SFC<ListItemProps> = (props) => { return <Link to="/Navigation" {...props as LinkProps} />; };
const PlannerLink: React.SFC<ListItemProps> = (props) => { return <Link to="/Planner" {...props as LinkProps} />; };

class PersistentDrawerLeft extends React.Component<Props> {
  state = {
    open: false,
    anchorEl: null as HTMLElement,
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  }

  handleDrawerClose = () => {
    this.setState({ open: false });
  }

  handleMenu = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: null });
  }

  render() {
        const { classes } = this.props;
        const { open, anchorEl } = this.state;
        const menuOpen = Boolean(anchorEl);

        return (
            <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={classNames(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar disableGutters={!open}>
                    <IconButton
                        color="inherit"
                        aria-label="Open drawer"
                        onClick={this.handleDrawerOpen}
                        className={classNames(classes.menuButton, menuOpen && classes.hide)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit" className={classes.grow}>
                        BEAM
                    </Typography>
                        <div>
                            <IconButton
                                aria-owns={menuOpen ? 'menu-appbar' : undefined}
                                aria-haspopup="true"
                                onClick={this.handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={menuOpen}
                                onClose={this.handleClose}
                            >
                                <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                                <MenuItem onClick={this.handleClose}>My account</MenuItem>
                                <Divider/>
                                <MenuItem onClick={this.handleClose}>Logout</MenuItem>
                            </Menu>
                        </div>
                </Toolbar>
            </AppBar>
                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    anchor="left"
                    open={open}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <div className={classes.drawerHeader}>
                        <IconButton onClick={this.handleDrawerClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <Divider />
                        <List>
                        <ListItem button={true} key={5} component={LoginLink}>
                                <ListItemIcon>{<LoginIcon/>}</ListItemIcon>
                                <ListItemText primary={'Login'} />
                            </ListItem>
                            <ListItem button={true} key={10} component={HomeLink}>
                                <ListItemIcon>{<HomeIcon/>}</ListItemIcon>
                                <ListItemText primary={'Home'} />
                            </ListItem>
                            <ListItem button={true} key={20} component={PlannerAdminLink}>
                                <ListItemIcon>{<SettingsIcon/>}</ListItemIcon>
                                <ListItemText primary={'Planner Admin'} />
                            </ListItem>
                            <ListItem button={true} key={30} component={ChartLink}>
                                <ListItemIcon>{<ChartIcon/>}</ListItemIcon>
                                <ListItemText primary={'Chart'} />
                            </ListItem>
                            <ListItem button={true} key={40} component={DiagramLink}>
                                <ListItemIcon>{<DiagramIcon/>}</ListItemIcon>
                                <ListItemText primary={'Diagram'} />
                            </ListItem>
                            <ListItem button={true} key={50} component={AdminLink}>
                                <ListItemIcon>{<MapIcon/>}</ListItemIcon>
                                <ListItemText primary={'Meta Objects'} />
                            </ListItem>
                            <ListItem button={true} key={60} component={ComposerLink}>
                                <ListItemIcon>{<BubblesIcon/>}</ListItemIcon>
                                <ListItemText primary={'Business Objects'} />
                            </ListItem>
                            <ListItem button={true} key={70} component={NavigationLink}>
                                <ListItemIcon>{<LinearScale/>}</ListItemIcon>
                                <ListItemText primary={'Navigation'} />
                            </ListItem>
                            <ListItem button={true} key={80} component={PlannerLink}>
                                <ListItemIcon>{<PlannerIcon/>}</ListItemIcon>
                                <ListItemText primary={'Planner'} />
                            </ListItem>                    
                        </List>
                </Drawer>
                <main
                    className={classNames(classes.content, {
                        [classes.contentShift]: open,
                    })}
                >
                    <div className={classes.drawerHeader}/>

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
                                Globals.SystemConfigVars.SYSTEMUSER_METAOBJECT_MAPPING = systemSetups[0].systemUserMOMapping.id;
                                Globals.SystemConfigVars.SYSTEMUSER_USERID_MA_MAPPING = systemSetups[0].systemUseridMAMapping.id;
                            }

                            return (
                                <div>
                                    <Route exact={true} path="/login" component={LoginForm} />
                                    <Route exact={true} path="/" component={Home} />
                                    <Route exact={true} path="/Home" component={Home} />
                                    <Route exact={true} path="/PlannerAdmin" component={PlannerAdmin} />
                                    <Route exact={true} path="/Chart" component={Example} />
                                    <Route exact={true} path="/Diagram" component={Diagram} />
                                    <Route exact={true} path="/Admin" component={Admin} />
                                    <Route path="/Composer" component={Composer} />
                                    <Route path="/Navigation" component={Navigation} />
                                    <Route path="/Planner" component={Planner} />
                                </div>
                            );
                        }}
                    </Query>
                </main>
            </div>
        );
    }
}

const MainMenu = withStyles(styles)(PersistentDrawerLeft);

class App extends React.Component<{}> {
    
    render() {
        return (
            <MainMenu/>
        );
    }
}

export default App;