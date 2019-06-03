import * as React from 'react';

import MappingForm from './mapUIBOForm';
import { PlanConfig } from './types';
import { Query } from 'react-apollo';
import { getUnmappedMOs, getItemRelations } from './queries';
import { Stepper, Step, StepLabel, Button, Grid, Select, MenuItem, FormControl, FormHelperText, Divider, InputLabel, Input, Paper } from '@material-ui/core';
import RightArrowIcon from '@material-ui/icons/KeyboardArrowRight';
import LeftArrowIcon from '@material-ui/icons/KeyboardArrowLeft';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { stepperStyles } from '../../../shared/style';

interface SProps extends WithStyles<typeof stepperStyles> {
    planObjects: {id: string, name: string}[];
    onClose: (saved: boolean, message: string) => void;
}

interface SState {
    activeStep: number;
    skipped: Set<number>;
    selectedPlanMO: string;
}

class MyStepper extends React.Component<SProps, SState> {
    state = {
        activeStep: 0,
        skipped: new Set(),
        selectedPlanMO: ''
    };
    
    private submitMyForm: (e: React.FormEvent<HTMLFormElement>) => void = null;

    handleSubmitMyForm = (e: React.SyntheticEvent<HTMLElement>) => {
        if (this.submitMyForm) {
            this.submitMyForm(e as React.FormEvent<HTMLFormElement>);
        }
    }

    bindSubmitForm = (submitForm: () => void) => {
        this.submitMyForm = submitForm;
    }

    handleNext = () => {
        const { activeStep } = this.state;
        let { skipped } = this.state;
        if (this.isStepSkipped(activeStep)) {
            skipped = new Set(skipped.values());
            skipped.delete(activeStep);
        }
        this.setState({
            activeStep: activeStep + 1,
            skipped,
        });
    }

    handleBack = () => {
        this.setState(state => ({
            activeStep: state.activeStep - 1,
        }));
    }

    handleReset = () => {
        this.setState({
            activeStep: 0,
        });
    }

    isStepSkipped(step: number) {
        return this.state.skipped.has(step);
    }

    handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({ selectedPlanMO: event.target.value });
    }
    
    getStepContent(step: number) {
        switch (step) {
            case 0:
                return (
                    <Grid container={true} className={this.props.classes.root}>
                        <Grid item={true} xs={3}>
                            <FormControl>
                                <InputLabel htmlFor="input" className={this.props.classes.select}>Meta Object</InputLabel>
                                <Select 
                                    className={this.props.classes.select}
                                    value={this.state.selectedPlanMO}
                                    onChange={this.handleChange}
                                    input={<Input name="MetaObject" id="input"/>}
                                >
                                    {this.props.planObjects.map(opt => (
                                        <MenuItem key={opt.id} value={opt.id}>
                                            {opt.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText className={this.props.classes.select}>
                                    {this.state.selectedPlanMO === '' ?
                                        'Please select a meta object to be mapped as a Plan'
                                        :
                                        '                                  '
                                    }
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <div>
                        Selected Plan Object: {this.state.selectedPlanMO}
                        <Divider/>
                        <Query query={getItemRelations} variables={{moid: this.state.selectedPlanMO}}>
                            {({ loading, data, error }) => {
                                if (loading) {
                                    return <div>Loading</div>;
                                }
                                if (error) {
                                    return <h1>ERROR: {error}</h1>;
                                }
                                return (
                                    <MappingForm
                                        open={this.state.selectedPlanMO !== ''}
                                        onClose={this.props.onClose}
                                        planMO={this.state.selectedPlanMO}
                                        availableMetaRelations={data.metaRelations}
                                        bindSubmitForm={this.bindSubmitForm}
                                    />
                                );
                            }}
                        </Query>
                    </div>
                );
            default:
                return 'Unknown step';
        }
    }

    render() {
                    
        const { classes } = this.props;
        const steps = ['Select unmapped Meta Object', 'Select Item Objects'];
        const { activeStep } = this.state;

        return (
            <div className={classes.stepper}>
                <Stepper activeStep={activeStep}>
                    {steps.map((label, index) => {
                        return (
                            <Step key={label} completed={this.isStepSkipped(index)}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                <div>
                    {this.getStepContent(activeStep)}
                    <Divider className={classes.button}/>
                    <div>
                        <Button
                            disabled={activeStep === 0}
                            onClick={this.handleBack}
                            className={classes.button}
                        >
                            <LeftArrowIcon/>Back
                        </Button>
                        {activeStep === steps.length - 1 ?
                            <Button
                                disabled={this.state.selectedPlanMO === ''}
                                color="primary"
                                onClick={this.handleSubmitMyForm}
                                className={classes.button}
                            >
                                Save
                            </Button>
                            :
                            <Button
                                disabled={this.state.selectedPlanMO === ''}
                                color="primary"
                                onClick={this.handleNext}
                                className={classes.button}
                            >
                                Next<RightArrowIcon/>
                            </Button>                                
                        }
                    </div>
                </div>
            </div>
        );
    }
}
const AStepper = withStyles(stepperStyles)(MyStepper);

interface Props extends WithStyles<typeof stepperStyles> {    onClose: (saved: boolean, message: string) => void;
    planConfig: PlanConfig;
}

interface State {
    formOpen: boolean;
}

class PlanMapperStepper extends React.Component<Props, State> {
    state = {formOpen: false};

    onClose = () => {
        this.setState({formOpen: false});
    }

    render() {
        return (
            <Query query={getUnmappedMOs}>
                {({ loading, data, error }) => {
                    if (loading) {
                        return <div>Loading</div>;
                    }
                    if (error) {
                        return <h1>ERROR: {error}</h1>;
                    }
                    
                    return (
                        <div>
                            {!this.props.planConfig ?  // Edit existing mapping
                                <Paper className={this.props.classes.root}>
                                    <AStepper  // Create new mapping
                                        planObjects={data.metaObjects}
                                        onClose={this.props.onClose}
                                    />
                                </Paper>
                                :
                                ''
                            }
                        </div>
                    );
                }}
            </Query>
        );
    }
}

export default withStyles(stepperStyles)(PlanMapperStepper);
