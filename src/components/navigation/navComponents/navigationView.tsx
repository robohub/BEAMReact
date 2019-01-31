import * as React from 'react';

import BOListContainer from './boListContainer';
import BOInfoContainer from './boInfoContainer';
import BOGraphContainer from './boGraphContainer';

import { Grid, Paper } from '@material-ui/core';
// import { Grid, Paper, Cell } from 'react-md';

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
        if (this.state.selectedListBO !== id) {
            this.setState({ selectedListBO: id });
        }
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
/*                <Grid >
                <Cell size={2}>
                    <Paper>
                        <BOListContainer
                            selectedListBO={this.state.selectedListBO}
                            selectedBOchange={this.updateListBO}
                            selectedInfoBOchange={this.updateInfoBO}
                        />
                    </Paper>
                </Cell>
                <Cell size={10}>
                    <Paper>
                        <BOGraphContainer
                            selectedBO={this.state.selectedListBO}
                            updateInfoView={this.updateInfoBO}
                        />
                    </Paper>
                </Cell>
                <Cell size={12}>
                    <Paper>
                        <BOInfoContainer
                            selectedBO={this.state.selectedGraphBO}
                        />
                    </Paper>
                </Cell>
                </Grid>*/
        );
    }
}