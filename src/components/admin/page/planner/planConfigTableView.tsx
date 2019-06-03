import * as React from 'react';
import { Query } from 'react-apollo';

import MappingStepper from './planMapper';
import MappingForm from './mapUIBOForm';

import { getConfigQuery, getItemRelations } from './queries';
import { PlanConfig } from './types';

import {  Button, Paper, IconButton, Snackbar, Grid, Divider, Chip, Typography, Dialog, DialogTitle, Fab } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../../shared/style';
import { Add } from '@material-ui/icons';

type State = {
    selectedPc: PlanConfig;
    stepperOpen: boolean;
    dialogOpen: boolean;
    snackbarOpen: boolean;
};

interface Props extends WithStyles<typeof styles> {
}

class PlannerView extends React.Component<Props, State> {
    private snackbarMessage = '';
    private planConfigs: PlanConfig[];

    constructor(props: Props) {
        super(props);
        this.state = {selectedPc: null, stepperOpen: false, snackbarOpen: false, dialogOpen: false};
    }

    openStepper = () => {
        this.setState(
            {
                selectedPc: null, 
                stepperOpen: true
            });
    }

    openDialog = (event: React.MouseEvent<HTMLElement>) => {
        this.setState(
            {
                selectedPc: this.planConfigs[event.currentTarget.id], 
                dialogOpen: true
            });
    }

    connectionsDialogClose = (saved: boolean, message: string) => {
        if (saved) {
            this.snackbarMessage = message;
            this.setState({snackbarOpen: true});
        } else if (message !== '') {
            this.snackbarMessage = message;
            this.setState({snackbarOpen: true});
        }
        this.setState({stepperOpen: false, dialogOpen: false});
    }

    cancelDialog = () => {
        this.setState({dialogOpen: false});
    }

    snackbarClose = () => {
        this.setState({snackbarOpen: false});
    }

    render() {
        return (
            <Query query={getConfigQuery}>
                {({ loading, data, error }) => {
                    if (loading) {
                        return <div>Loading</div>;
                    }
                    if (error) {
                        return <div>ERROR: {error}</div>;
                    }
                    const { classes } = this.props;
                    this.planConfigs = data.planConfigs;

                    return (
                        <div className={classes.root}>
                            <Fab size="small" color="primary" className={classes.button} disabled={this.state.dialogOpen} onClick={this.openStepper}>
                                <Add />
                            </Fab>
                            {this.state.stepperOpen ?
                                <Grid container={true}>
                                    <Grid item={true} xs={12} lg={9}>
                                        <MappingStepper
                                            onClose={this.connectionsDialogClose}
                                            planConfig={this.state.selectedPc}
                                        />
                                    </Grid>
                                </Grid>
                                :
                                null
                            }
                            <Paper style={{marginTop: 10}}>
                                <div className={classes.root}>
                                    <Typography variant="h6">Mapped Meta Objects</Typography>
                                </div>
                                <Divider style={{marginTop: 10, marginBottom: 10}}/>
                                {data.planConfigs.length === 0 ?
                                    <Typography variant="body1">No mappings done yet...</Typography>
                                    :
                                    data.planConfigs.map((pc: PlanConfig, index: string) =>
                                        <div key={pc.id} className={classes.root}>
                                            <Grid container={true}>
                                                <Grid item={true} xs={2}>
                                                    <Typography variant="h6">{pc.uiMoPlan.name}</Typography>
                                                    <Button 
                                                        id={index}
                                                        size="small"
                                                        onClick={this.openDialog} 
                                                        color={'primary'}
                                                        variant={'text'}
                                                    >
                                                        <EditIcon/>
                                                        Edit
                                                    </Button>
                                                </Grid>
                                                <Grid item={true} xs={10}>
                                                    {pc.uiMoRelations.length === 0 ?
                                                        'No relations defined'
                                                        :
                                                        pc.uiMoRelations.map(r  =>
                                                            <Chip key={r.id} label={r.oppositeName + ': ' + r.oppositeRelation.incomingObject.name} className={classes.button}/>
                                                        )
                                                    }
                                                </Grid>
                                            </Grid>        
                                            <Divider/>
                                        </div>
                                )}
                            </Paper>
                                <Dialog
                                    onClose={this.cancelDialog}
                                    aria-labelledby="simple-dialog-title"
                                    open={this.state.dialogOpen}
                                    fullWidth={true}
                                    maxWidth={'md'}  // 'lg'
                                >
                                    {this.state.selectedPc && this.state.dialogOpen ?
                                        <Query query={getItemRelations} variables={{moid: this.state.selectedPc.uiMoPlan.id}}>
                                            {(props) => {
                                                if (props.data.loading) {
                                                    return <div>Loading</div>;
                                                }
                                                if (props.data.error) {
                                                    return <h1>ERROR: {error}</h1>;
                                                }
                                                
                                                return (
                                                    <div>
                                                        <DialogTitle id="simple-dialog-title">Select plannable objects for: {this.state.selectedPc.uiMoPlan.name}</DialogTitle>
                                                        <Divider/>
                                                        {props.data.metaRelations ?
                                                            <MappingForm
                                                                open={this.state.dialogOpen}
                                                                onClose={this.connectionsDialogClose}
                                                                config={this.state.selectedPc}
                                                                availableMetaRelations={props.data.metaRelations}
                                                            />
                                                            :
                                                            null
                                                        }
                                                    </div>
                                                );
                                            }}
                                        </Query>
                                        :
                                        null
                                    }
                                </Dialog>
                            <Snackbar
                                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                                open={this.state.snackbarOpen}
                                autoHideDuration={6000}
                                onClose={this.snackbarClose}
                                ContentProps={{'aria-describedby': 'message-id'}}
                                message={<span id="message-id">{this.snackbarMessage}</span>}
                                action={[
                                    <IconButton key="close" aria-label="Close" color="inherit" /* className={classes.close} */ onClick={this.snackbarClose}>
                                        <CloseIcon/>
                                    </IconButton>,
                                ]}
                            />                            
                        </div>
                    );
                }}
            </Query>
        );
    }
}

export default withStyles(styles)(PlannerView);