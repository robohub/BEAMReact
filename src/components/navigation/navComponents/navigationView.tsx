import * as React from 'react';

import BOListContainer from './boListContainer';
import BOInfoContainer from './boInfoContainer';
import BOGraphContainer from './boGraphContainer';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

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
            <Grid
                container={true}
                direction="row"
                justify="flex-start"
                alignItems="stretch"
            >
                <Grid
                    container={true}
                    direction="row"
                    justify="flex-start"
                >
                    <Grid item={true}>
                        <Paper>
                            <BOListContainer
                                selectedListBO={this.state.selectedListBO}
                                selectedBOchange={this.updateListBO}
                                selectedInfoBOchange={this.updateInfoBO}
                            />
                        </Paper>
                    </Grid>
                    <Grid item={true}>
                        <Paper>
                            <BOGraphContainer
                                selectedBO={this.state.selectedListBO}
                                updateInfoView={this.updateInfoBO}
                            />
                        </Paper>
                    </Grid>
                </Grid>
                <Grid item={true}>
                    <Paper>
                        <BOInfoContainer
                            selectedBO={this.state.selectedGraphBO}
                        />
                    </Paper>
                </Grid>
            </Grid>
        );
    }
}