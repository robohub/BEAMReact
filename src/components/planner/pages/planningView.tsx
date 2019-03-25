import * as React from 'react';
import { /*ChildProps, */ Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Grid, Paper, Button, Drawer } from '@material-ui/core';
import ListPlans from './components/listPlans';
import ListItems from './components/listItems';
import TimeLine from './components/timeLine';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../shared/style';
import { PlanConfig } from './components/types';

export const getPlanBOs = gql`
query configuredPlanBos {
    id
    planConfigs {
      id
      uiMoPlan {
        id
        name
        businessObjects {
          id
          name
          plan { id }
        }  
      }
    }
}
`;

interface State {
    selectedBO: string;
    selectedBoName: string;
    selectedMO: string;
    drawerOpen: boolean;
}

interface Props extends WithStyles<typeof styles> {
}

class PlanningView extends React.Component<Props, State> {
    private planConfigs: PlanConfig[];

    constructor(props: Props) {
        super(props);
        this.state = ({selectedBO: null, selectedBoName: null, selectedMO: null, drawerOpen: false});
    }

    updateSelectedBO = (boId: string) => {

        if (this.state.selectedBO !== boId) {
            let boValues = this.getCorrespondingMoAndBoName(boId);
            if (boValues) {
                this.setState({
                    selectedBO: boId,
                    selectedMO: boValues.mo,
                    selectedBoName: boValues.boName
                });  // Update if boId is meant to be a planning object!
            }
        }
    }

    getCorrespondingMoAndBoName = (boId: string) => {
        for (var i = 0; i < this.planConfigs.length; i++ ) {
            let pc = this.planConfigs[i];
            for (var j = 0; j <  pc.uiMoPlan.businessObjects.length; j++) {
                if (pc.uiMoPlan.businessObjects[j].id === boId) {
                    return { mo: pc.uiMoPlan.id, boName: pc.uiMoPlan.businessObjects[j].name };
                }
            }
        }
        return null;  // If BO is not a Plan Object
    }

    toggleDrawer = (open: boolean) => () => {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        });
    }

    render() {
        const { classes } = this.props;

        return (
            <Query query={getPlanBOs}>
                {({ data, loading, error }) => {
                    if (loading) { return <div>Loading</div>; }
                    if (error) { return <h1>ERROR</h1>; }

                    this.planConfigs = data.planConfigs;

                    return (
                        <div className={classes.root}>
                            <Button
                                variant={'contained'}
                                color={'primary'}
                                onClick={this.toggleDrawer(true)}
                                className={classes.button}
                                disabled={this.state.drawerOpen}
                            >
                                Select a Plan
                            </Button>
                            <Drawer anchor={'left'} open={this.state.drawerOpen} onClose={this.toggleDrawer(false)}>
                                <ListPlans planConfigs={data.planConfigs} updateSelectedBO={this.updateSelectedBO}/>
                            </Drawer>
                            <Grid container={true} spacing={8}>
                                <Grid item={true} xs={9}>
                                    <Paper className={classes.root}>
                                        <TimeLine
                                            selectedBO={this.state.selectedBO}
                                            updateSelectedBO={this.updateSelectedBO}
                                            selectedBoName={this.state.selectedBoName}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item={true} xs={3}>
                                    <Paper className={classes.root}>
                                        <ListItems selectedMO={this.state.selectedMO}/>
                                    </Paper>
                                </Grid>                

                            </Grid>
                        </div>
                    );
                }}
            </Query>
        );
    }
}

export default withStyles(styles)(PlanningView);