import * as React from 'react';
import PlanConfigView from './planner/planConfigTableView';
import { UserMgmtView } from './user/userMgmtView';
import { BoMappingTemplateView } from './template/boMappingTemplateView';
import { TemplateConfigView } from './template/templateConfigView';
import { Tabs, Tab, withStyles, WithStyles, createStyles, Theme, AppBar, Typography } from '@material-ui/core';
import { AccountCircle, ClearAllOutlined, LibraryBooksOutlined, SwapHoriz, FeaturedPlayListOutlined } from '@material-ui/icons';

import HTMLEditorView from './editor/editor';

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
                        <Tab label="Template definition" icon={<LibraryBooksOutlined />}/>
                        <Tab label="User templates" icon={<SwapHoriz />}/>
                        <Tab label="Planner setup" icon={<ClearAllOutlined />}/>
                        <Tab label="HTML Editor" icon={<FeaturedPlayListOutlined />}/>
                    </Tabs>
                </AppBar>
                {this.state.tabval === 0 && 
                    <Typography component="div" style={{ padding: 8 * 2 }}>
                        <UserMgmtView/>
                    </Typography>
                }
                {this.state.tabval === 1 && 
                    <Typography component="div" style={{ padding: 8 * 2 }}>
                        <TemplateConfigView/>
                    </Typography>
                }
                {this.state.tabval === 2 && 
                    <Typography component="div" style={{ padding: 8 * 2 }}>
                        <BoMappingTemplateView/>
                    </Typography>
                }
                {this.state.tabval === 3 && 
                    <Typography component="div" style={{ padding: 8 * 2 }}>
                        <PlanConfigView/>
                    </Typography>
                }
                {this.state.tabval === 4 && 
                    <Typography component="div" style={{ padding: 8 * 2 }}>
                        <HTMLEditorView/>
                    </Typography>
                }
                </div>
        );
    }
}

export default withStyles(styles)(PlannerConfig);