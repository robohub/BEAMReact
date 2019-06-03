import * as React from 'react';
import { Fab, Grid, withStyles, WithStyles, Paper } from '@material-ui/core';
import { Add } from '@material-ui/icons';

import { styles } from '../../../shared/style';
import { WidgetStepper } from './widgetStepper';
import { client } from '../../../..';
import gql from 'graphql-tag';
import { Widget } from './types';

const saveHTMLWidgetMutation = gql`
mutation saveHMTLWidget($type: WidgetType!, $name: String!, $model: String) {
    createWidget(
        data: {type: $type, name: $name, text: $model}
    ) {
        id
    }
}
`;

interface Props extends WithStyles<typeof styles> {
    setCreating: (creating: boolean) => void;
}

type State = {
    stepperOpen: boolean;
    widget: Widget
};

class CreateWidgetComp extends React.Component<Props, State> {
    
    constructor(props: Props) {
        super(props);
        this.state = {
            stepperOpen: false,
            widget: {id: '', type: '', name: '', model: 'Start editing...', boid: ''}
        };
      }

    saveWidget = async (widget: Widget) => {

        // tslint:disable-next-line:no-console
        console.log('Saving.......');

        this.setState({stepperOpen: false});
        if (widget.type === 'HTML') {
            await client.mutate({
                mutation: saveHTMLWidgetMutation,
                variables: {
                    type: widget.type,
                    name: widget.name,
                    model: widget.model,
                    // boid: widget.boid,
                },
                update: () => {
                    // Update cache
                },
                // refetch: widgetList, Homepage query, ...
            });
        }

        // tslint:disable-next-line:no-console
        console.log('Saved.......');
    }

    onEditCancel = () => {
        this.closeStepper();
    }

    openStepper = () => {
        this.setState({stepperOpen: true});
        this.props.setCreating(true);
    }

    closeStepper = () => {
        this.setState({stepperOpen: false});
        this.props.setCreating(false);
    }

    render() {
        const { classes } = this.props;

        // tslint:disable-next-line:no-console
        console.log('#### CreateWidget RENDERAR ....');

        return (
/*            <WidgetContext.Provider value={{state: this.state, updateModel: this.updateModel}}> */
            <div>
                <Fab size="small" color="primary" aria-label="Add" className={classes.button} onClick={this.openStepper} disabled={this.state.stepperOpen}>
                    <Add />
                </Fab>
                {this.state.stepperOpen ?
                    <Paper className={classes.root}>
                    <Grid container={true}>
                        <Grid item={true} xs={12}>
                                <WidgetStepper
                                    onSave={this.saveWidget}
                                    onCancel={this.onEditCancel}
                                />
                        </Grid>
                    </Grid>
                    </Paper>
                    :
                    null
                }
            </div>

/*            </WidgetContext.Provider> */
        );
    }
}
export const CreateWidget = withStyles(styles)(CreateWidgetComp);