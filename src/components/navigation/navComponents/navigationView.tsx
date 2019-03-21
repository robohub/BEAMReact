import * as React from 'react';

import BOListContainer from './boListContainer';
import BOInfoContainer from './boInfoContainer';
import BOGraphContainer from './boGraphContainer';

import { Grid, Paper } from '@material-ui/core';

interface Props {
    defaultBO: string;
}

interface State {
    selectedListBO: string;
    selectedGraphBO: string;
}

export default class NavigationView extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = { selectedListBO: props.defaultBO, selectedGraphBO: props.defaultBO };
    }

    updateListBO = (id: string) => {
        this.setState({ selectedListBO: id });
    }

    updateInfoBO = (id: string) => {
        this.setState({ selectedGraphBO: id });
    }

    render() {
        return (
            <Grid container={true} >
                <Grid item={true} xs={2}>
                    <Paper>
                        <BOListContainer
                            selectedListBO={this.state.selectedListBO}
                            selectedBOchange={this.updateListBO}
                            selectedInfoBOchange={this.updateInfoBO}
                        />
                    </Paper>
                    <Paper>
                        <BOInfoContainer
                            selectedBO={this.state.selectedGraphBO}
                        />
                    </Paper>
                    
                </Grid>

                <Grid item={true} xs={10} >
                    <Paper >
                        <BOGraphContainer
                            selectedBO={this.state.selectedListBO}
                            updateInfoView={this.updateInfoBO}
                        />
                    </Paper>
                </Grid>
        </Grid>
        );
    }
}