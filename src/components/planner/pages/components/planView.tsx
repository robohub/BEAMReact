import * as React from 'react';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../../shared/style';

import { getPlan, } from './queries';
import { SelectedPlanBOType } from './types';
import { Query, ExecutionResult } from 'react-apollo';
import { PureQueryOptions } from 'apollo-client';

import Timeline from './timeline';

interface Props extends WithStyles<typeof styles> {
    tlContainerId: string;  // id for timeline - where rendered timeline will attach itself, used when using several timelines in same component
    selectedBO: SelectedPlanBOType;
    updateSelectedBO: (boId: string) => void;
    readonly: boolean;
    // tslint:disable-next-line:no-any
    getRefetchQueries?: () => ((result: ExecutionResult<Record<string, any>>) => (string | PureQueryOptions)[]) | (string | PureQueryOptions)[];
}

class PlanView extends React.Component<Props> {

    render() {
        
        if (this.props.selectedBO.id !== '' ) {
            return (
                <Query query={getPlan} variables={{boid: this.props.selectedBO.id}}>
                {({ data, loading, error }) => {
                    if (loading) {
                            return <div>Loading</div>;
                    }
                    if (error) { return <h1>{error.message}</h1>; }
                    
                    // tslint:disable-next-line:no-console
                    console.log('aaaaaaaaaaaaaaaaaa ---- PLANVIEW rendererar...' + this.props.selectedBO.id);
                    
                    return (
                        <Timeline
                            plans={data.plans}
                            tlContainerId={this.props.tlContainerId}
                            readonly={this.props.readonly}
                            selectedBO={this.props.selectedBO}
                            updateSelectedBO={this.props.updateSelectedBO}
                            getRefetchQueries={this.props.getRefetchQueries}
                        />
                    );            

                }}
                </Query>
            );
        }

        return (
            <div>Choose a plan from the list...</div>
        );

    }
}

export default withStyles(styles)(PlanView);