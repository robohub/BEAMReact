import * as React from 'react';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../../shared/style';

import { getPlan, } from './queries';
import { SelectedPlanBOType } from './types';
import { Query } from 'react-apollo';
import { PureQueryOptions } from 'apollo-client';
import { TimeLine } from './timeLine';

interface Props extends WithStyles<typeof styles> {
    tlContainerId: string;  // id for timeline - where rendered timeline will attach itself, used when using several timelines in same component
    selectedBO: SelectedPlanBOType;
    updateSelectedBO: (boId: string) => void;
    readonly: boolean;
    getRefetchQueries?: (bo: SelectedPlanBOType) => PureQueryOptions[];
}

class PlanView extends React.Component<Props> {

    render() {

        // tslint:disable-next-line:no-console
        console.log('aaaaaaaaaaaaaaaaaa ---- PLANVIEW rendererar...' + this.props.selectedBO.id);

        if (this.props.selectedBO.id !== '' ) {
            return (
                <Query query={getPlan} variables={{boid: this.props.selectedBO.id}}>
                {({ data, loading, error }) => {
                    if (loading) { return <div>Loading</div>; }
                    if (error) { return <h1>{error.message}</h1>; }
                    
                    // tslint:disable-next-line:no-console
                    console.log('--QUERY ---- PLANVIEW: getPlan execute...' + this.props.selectedBO.id);
                    
                    return (
                        <TimeLine
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