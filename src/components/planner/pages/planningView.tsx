import * as React from 'react';
import { /*ChildProps, */ Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Grid, Paper, Button, Drawer } from '@material-ui/core';
import ListPlans from './components/listPlans';
import ListItems from './components/listItems';
import TimeLine from './components/timeLine';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../shared/style';
import { PlanConfig, SelectedPlanBOType } from './components/types';

export const getPlanBOs = gql`
query configuredPlanBos {
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
    selectedPlanBO: SelectedPlanBOType;
    drawerOpen: boolean;
}

interface Props extends WithStyles<typeof styles> {
}

class PlanningView extends React.Component<Props, State> {
    private planConfigs: PlanConfig[];

    constructor(props: Props) {
        super(props);
        this.state = ({selectedPlanBO: {id: '', name: '', metaObjectId: ''}, drawerOpen: false});
    }

    updateSelectedBO = (boId: string) => {
    
        function getCorrespondingMoAndBoName(boid: string, planConfigs: PlanConfig[]) {
            for (var i = 0; i < planConfigs.length; i++ ) {
                let pc = planConfigs[i];
                for (var j = 0; j <  pc.uiMoPlan.businessObjects.length; j++) {
                    if (pc.uiMoPlan.businessObjects[j].id === boid) {
                        return { mo: pc.uiMoPlan.id, boName: pc.uiMoPlan.businessObjects[j].name };
                    }
                }
            }
            return null;  // If BO is not a Plan Object
        }

        if (this.state.selectedPlanBO.id !== boId) {
            let boValues = getCorrespondingMoAndBoName(boId, this.planConfigs);
            if (boValues) {
                this.setState({
                    selectedPlanBO: {
                        id: boId,
                        metaObjectId: boValues.mo,
                        name: boValues.boName
                    }
                });  // Update if boId is meant to be a planning object!
            }
        }
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
                    if (error) { return <h1>{error.message}</h1>; }

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
                                            selectedBO={this.state.selectedPlanBO}
                                            updateSelectedBO={this.updateSelectedBO}
                                            readonly={false}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid item={true} xs={3}>
                                    <Paper className={classes.root}>
                                        <ListItems selectedMO={this.state.selectedPlanBO.metaObjectId}/>
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