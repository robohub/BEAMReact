import * as React from 'react';
import PlansOverview from './pages/plansOverview';
import { Typography, Paper, Fab,  } from '@material-ui/core';
import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../shared/style';
import { Add } from '@material-ui/icons';
import { getPlanBOs, getPlan, getItemBOs,  } from './pages/components/queries';
import { PureQueryOptions } from 'apollo-client';
import { SelectedPlanBOType } from './pages/components/types';

// import SplitterLayout from 'react-splitter-layout';
// import 'react-splitter-layout/lib/index.css';

interface Props extends WithStyles<typeof styles> {
}

type State = {
    plans: {id: string, containerId: number, moId: string}[];  // Array of meta data per opened plan
};

class LandingPageComp extends React.Component<Props, State> {
    state = {
        plans: new Array<{id: string, containerId: number, moId: string}>()
    };

    private containerIdIndex = 0;  // Incremented when new diagram opens, used for container id

    addPlan = () => {
        let newPlan = this.state.plans;
        newPlan.push({id: '', containerId: this.containerIdIndex++, moId: ''});
        this.setState({plans: newPlan});
    }

    closePlan = (containerId: number) => {
        let newPlans = this.state.plans;
        newPlans.forEach((diag, index) => {
            if (containerId === diag.containerId) {
                newPlans.splice(index, 1); // Remove reference from nestedGroups
                this.setState({plans: newPlans});
                return;
            }
        });
    }

    // Used by PlansOverview to associate containerId with PlanId and PlanMO (to get ItemBOs)
    setPlanIdForPlan = (containerId: number, planId: string, planMOid: string) => {
        let newPlans = this.state.plans;

        newPlans.forEach((diag, index) => {
            if (containerId === diag.containerId) {
                newPlans[index].id = planId;
                newPlans[index].moId = planMOid;
                this.setState({plans: newPlans});
                return;
            }
        });
    }

    // Called when saving a plan
    getRefetchQueries = (planInfo: SelectedPlanBOType) => {
        let refetchQueries = [
            {
                query: getPlanBOs,
            },
        ] as PureQueryOptions[];

        let addedGetItemBOs = new Array<string>();
        let addedGetPlans = new Array<string>();
        this.state.plans.map(plan => {
            if (plan.moId === planInfo.metaObjectId) {  // Only refetch plans of same meta object type
                if (!addedGetPlans.find(item => item === plan.id)) {   // Only refetch ONE getPlan for each id
                    refetchQueries.push({query: getPlan, variables: {boid: plan.id}});
                    addedGetPlans.push(plan.id);
                }
                if (!addedGetItemBOs.find(item => item === plan.moId)) {  // Only refetch ONE getIemBOs for meta object type
                    refetchQueries.push({query: getItemBOs, variables: {moid: plan.moId}});
                    addedGetItemBOs.push(plan.moId);
                }
            }
        });
        return refetchQueries;
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Typography variant="h6">Welcome to the Planner landing page!</Typography>
{/*                <SplitterLayout vertical={true}> */}
                    {this.state.plans.map(plan => 
                        <Paper key={plan.containerId}>
                            <PlansOverview tlContainerId={plan.containerId} closeDiagram={this.closePlan} getRefetchQueries={this.getRefetchQueries} connectPlanId={this.setPlanIdForPlan}/>
                        </Paper>
                    )}
{/*               </SplitterLayout> */}
                    <Fab size="small" color="primary" aria-label="Add" className={classes.button} onClick={this.addPlan}>
                        <Add />
                    </Fab>
            </div>
        );
    }
}

export default withStyles(styles)(LandingPageComp);
