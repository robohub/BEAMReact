import * as React from 'react';
import { /*ChildProps, */ Query } from 'react-apollo';

import { Paper, Drawer, Grid, IconButton } from '@material-ui/core';
import ListPlans from './components/listPlans';
import ListItems from './components/listItems';
import PlanView from './components/planView';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../shared/style';
import { PlanConfig, SelectedPlanBOType } from './components/types';
import { getPlanBOs } from './components/queries';
import { ChevronRight, ChevronLeft, Menu, Close } from '@material-ui/icons';
import { PureQueryOptions } from 'apollo-client';

interface State {
    selectedPlanBO: SelectedPlanBOType;
    drawerOpen: boolean;
    itemsListOpen: boolean;
}

interface Props extends WithStyles<typeof styles> {
    tlContainerId: number;  // id for timeline - propagated to TimeLine component
    closeDiagram: (id: number) => void;
    connectPlanId: (containerId: number, planId: string, planMOId: String) => void;  // Call this to associate opened PlanId with container Id in parent component

    // tslint:disable-next-line:no-any
    getRefetchQueries?: (bo: SelectedPlanBOType) => PureQueryOptions[];
}

class PlanningView extends React.Component<Props, State> {
    private planConfigs: PlanConfig[];

    constructor(props: Props) {
        super(props);
        this.state = ({selectedPlanBO: {id: '', name: '', metaObjectId: ''}, drawerOpen: false, itemsListOpen: false});
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
                this.props.connectPlanId(this.props.tlContainerId, boId, boValues.mo);
            }
        }
    }

    toggleDrawer = (open: boolean) => () => {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        });
    }

    toggleItemsList = () => {
        this.setState({itemsListOpen: !this.state.itemsListOpen});
    }

    render() {
        const { classes } = this.props;
        
        // tslint:disable-next-line:no-console
        console.log('PLANSOVERVIEW rendererar...');

        return (
            <Query query={getPlanBOs}>
                {({ data, loading, error }) => {
                    if (loading) { return <div>Loading</div>; }
                    if (error) { return <h1>{error.message}</h1>; }

                    this.planConfigs = data.planConfigs;

                    // tslint:disable-next-line:no-console
                    console.log('--- QUERY ---- PLANSOVERVIEV: execute...');

                    return (
                        <div className={classes.root} style={{backgroundColor: 'rgba(240, 240, 240, 1.0)'}}>
                            <IconButton color="primary" onClick={this.toggleDrawer(true)}>
                                <Menu/>
                            </IconButton>
                            <IconButton color="primary" onClick={this.toggleItemsList}>
                                {this.state.itemsListOpen ? <ChevronLeft/> : <ChevronRight/>}
                            </IconButton>
                            <IconButton color="primary" onClick={e => this.props.closeDiagram(this.props.tlContainerId)}>
                                <Close/>
                            </IconButton>

                            <Drawer anchor={'left'} open={this.state.drawerOpen} onClose={this.toggleDrawer(false)}>
                                <ListPlans planConfigs={data.planConfigs} updateSelectedBO={this.updateSelectedBO}/>
                            </Drawer>

                            <Grid container={true} spacing={1}>
                                {this.state.itemsListOpen ?
                                    <Grid item={true} xs={12} md={5} lg={3}>
                                        <Paper className={classes.root}>
                                            <ListItems selectedMO={this.state.selectedPlanBO.metaObjectId}/>
                                        </Paper>
                                    </Grid>
                                    :
                                    null
                                }
                                {this.state.itemsListOpen ?
                                    <Grid item={true} xs={12} md={7} lg={9}>
                                        <Paper className={classes.root}>
                                            <PlanView
                                                tlContainerId={'timeline' + this.props.tlContainerId}
                                                selectedBO={this.state.selectedPlanBO}
                                                updateSelectedBO={this.updateSelectedBO}
                                                readonly={false}
                                                getRefetchQueries={this.props.getRefetchQueries}
                                            />
                                        </Paper>
                                    </Grid>
                                    :
                                    <Grid item={true} xs={12}>
                                        <Paper className={classes.root}>
                                            <PlanView
                                                tlContainerId={'timeline' + this.props.tlContainerId}
                                                selectedBO={this.state.selectedPlanBO}
                                                updateSelectedBO={this.updateSelectedBO}
                                                readonly={false}
                                                getRefetchQueries={this.props.getRefetchQueries}
                                            />
                                        </Paper>
                                    </Grid>
                                }
                            </Grid>
                        </div>
                    );
                }}
            </Query>
        );
    }
}

export default withStyles(styles)(PlanningView);