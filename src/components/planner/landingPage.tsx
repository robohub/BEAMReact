import * as React from 'react';
import PlanningView from './pages/plansOverview';
import { Typography, Paper, Fab,  } from '@material-ui/core';
import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../shared/style';
import { Add } from '@material-ui/icons';
import { getPlanBOs, getPlan, } from './pages/components/queries';
import { PureQueryOptions } from 'apollo-client';

// import SplitterLayout from 'react-splitter-layout';
// import 'react-splitter-layout/lib/index.css';

interface Props extends WithStyles<typeof styles> {
}

type State = {
    diagrams: {id: string, containerId: number}[];  // Array of open diagram ids and container id for Timeline
};

class LandingPageComp extends React.Component<Props, State> {
    state = {
        diagrams: new Array<{id: string, containerId: number}>()
    };

    private containerIdIndex = 0;  // Incremented when new diagram opens, used for container id

    addDiagram = () => {
        let newDiagrams = this.state.diagrams;
        newDiagrams.push({id: '', containerId: this.containerIdIndex++});
        this.setState({diagrams: newDiagrams});
    }

    closeDiagram = (containerId: number) => {
        let newDiagrams = this.state.diagrams;
        newDiagrams.forEach((diag, index) => {
            if (containerId === diag.containerId) {
                newDiagrams.splice(index, 1); // Remove reference from nestedGroups
                this.setState({diagrams: newDiagrams});
                return;
            }
        });
    }

    // Used by PlanningView to associate containerId with PlanId
    setPlanIdForDiagram = (containerId: number, planId: string) => {
        let newDiagrams = this.state.diagrams;
        newDiagrams.forEach((diag, index) => {
            if (containerId === diag.containerId) {
                newDiagrams[index].id = planId;
                this.setState({diagrams: newDiagrams});
                return;
            }
        });
    }

    getRefetchQueries = () => {
        let refetchQueries = [
            {
                query: getPlanBOs,
            },
/*
            {
                query: getItemBOs,
                variables: {moid: this.props.selectedBO.metaObjectId}
            }
        ];
*/

        // tslint:disable-next-line:no-any
        ] as PureQueryOptions[];
        this.state.diagrams.map(diag => {
            refetchQueries.push({query: getPlan, variables: {boid: diag.id}});
            /* refetchQueries.push({query: getConnectedItems, variables: {boid: diag.id}}); */
        });
        return refetchQueries;
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Typography variant="h6">Welcome to the Planner landing page!</Typography>
{/*                <SplitterLayout vertical={true}> */}
                    {this.state.diagrams.map(diag => 
                        <Paper key={diag.containerId}>
                            <PlanningView tlContainerId={diag.containerId} closeDiagram={this.closeDiagram} getRefetchQueries={this.getRefetchQueries} connectPlanId={this.setPlanIdForDiagram}/>
                        </Paper>
                    )}
{/*               </SplitterLayout> */}
                    <Fab size="small" color="primary" aria-label="Add" className={classes.button} onClick={this.addDiagram}>
                        <Add />
                    </Fab>
            </div>
        );
    }
}

export default withStyles(styles)(LandingPageComp);
