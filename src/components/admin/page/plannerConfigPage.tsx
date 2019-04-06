import * as React from 'react';
import PlanConfigView from './planner/planConfigTableView';
import { UserMgmtView } from './user/userMgmtView';
import { Tabs, Tab, withStyles, WithStyles, createStyles, Theme, AppBar, Typography } from '@material-ui/core';
import { AccountCircle, ClearAllOutlined, LibraryBooksOutlined } from '@material-ui/icons';

const styles = ({ palette }: Theme) => createStyles({
    root: {
        flexGrow: 1,
        backgroundColor: palette.background.paper,
      },
});

interface Props extends WithStyles<typeof styles> {}

class PlannerConfig extends React.Component<Props> {

    state = { tabval: 0 };

    handleTabChange = (e: React.ChangeEvent, value: number) => {
        this.setState( {tabval: value});
    }

    render() {  
        return (
            <div className={this.props.classes.root}>
                <AppBar position="static">
                    <Tabs value={this.state.tabval} onChange={this.handleTabChange}>
                        <Tab label="User Mgmt" icon={<AccountCircle />}/>
                        <Tab label="Planner setup" icon={<ClearAllOutlined />}/>
                        <Tab label="Templating" icon={<LibraryBooksOutlined />}/>
                    </Tabs>
                </AppBar>
                {this.state.tabval === 0 && 
                    <Typography component="div" style={{ padding: 8 * 2 }}>
                        <UserMgmtView/>
                    </Typography>
                }
                {this.state.tabval === 1 && 
                    <Typography component="div" style={{ padding: 8 * 2 }}>
                        <PlanConfigView/>
                    </Typography>
                }
                {this.state.tabval === 2 && 
                    <Typography component="div" style={{ padding: 8 * 2 }}>
                        TEMPLATE CONFIG
                    </Typography>
                }
                </div>
        );
    }
}

export default withStyles(styles)(PlannerConfig);