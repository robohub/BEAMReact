import * as React from 'react';
import { Grid, Divider, TextField, WithStyles, withStyles, Stepper, Step, StepLabel, Button } from '@material-ui/core';
import { MuiDownShiftComboBox } from '../../../shared/muiDownshift';
import { WidgetEdit } from './widgetEdit';
import { stepperStyles } from '../../../shared/style';
import { ArrowRight } from '@material-ui/icons';
import { Widget } from './types';

type State = {
    newWidgetName: string;
    newWidgetType: string;
    activeStep: number
    skipped: Set<number>;
    save: boolean;
};

interface Props extends WithStyles<typeof stepperStyles> {
    onSave: (widget: Widget) => void;
    onCancel: () => void;
}

class WidgetStepperComp extends React.Component<Props, State> {
    state = {
        newWidgetName: '', newWidgetType: '', activeStep: 0, skipped: new Set(),
        save: false
    };

    private steps = ['Define new Widget', 'Edit new Widget'];

    private typeOptions = [
        {label: 'Plan', value: 'Plan'},
        {label: 'HTML', value: 'HTML'},
        {label: 'Diagram', value: 'Diagram'},
        {label: 'Explorer', value: 'Explorer'},
    ];

    onSave = (widget: Widget) => {   // Called by child component with their state, add own state
        this.setState({save: false});
        widget.name = this.state.newWidgetName;
        widget.type = this.state.newWidgetType;
        this.props.onSave(widget);
    }

    onSelectTypeChange = (value: string) => {
        this.setState({newWidgetType: value});
    }

    handleInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        this.setState({newWidgetName: event.target.value});
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
/*
    handleBack = () => {
        this.setState(state => ({
            activeStep: state.activeStep - 1,
        }));
    }
*/
    handleReset = () => {
        this.setState({
            activeStep: 0,
        });
    }

    isStepSkipped(step: number) {
        return this.state.skipped.has(step);
    }

    getStepContent(step: number) {
        switch (step) {
            case 0:
                return (
                    <Grid container={true}>
                        <Grid item={true} xs={6}>
                                <div className={this.props.classes.root}>
                                    <TextField
                                        className={this.props.classes.textField}
                                        value={this.state.newWidgetName}
                                        label="Widget Name"
                                        placeholder="Name"
                                        onChange={this.handleInput}
                                    />
                                    <MuiDownShiftComboBox
                                        value={this.state.newWidgetType}
                                        label="Widget Type"
                                        placeholder="Type/select template..."
                                        options={this.typeOptions}
                                        onChange={this.onSelectTypeChange}
                                    />
                                </div>
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <WidgetEdit
                        wid={null}
                        type={this.state.newWidgetType}
                        name={this.state.newWidgetName}
                        save={this.state.save}
                        onSave={this.onSave}

                    />
                );
            default:
                return 'Unknown step';
        }
    }

    render() {
        const { classes } = this.props;
        const { activeStep } = this.state;
        
        // tslint:disable-next-line:no-console
        console.log('###### WidgetStepper RENDERAR ....');

        return (
            <div className={classes.stepper}>
                <Stepper activeStep={activeStep}>
                    {this.steps.map((label, index) => {
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
{/*                        <Button
                            disabled={activeStep === 0}
                            onClick={this.handleBack}
                            className={classes.button}
                        >
                            <ArrowLeft/>Back
</Button> */}
                        {activeStep === this.steps.length - 1 ?
                            <div>
                                <Button
                                    color="primary"
                                    onClick={e => this.setState({save: true})}   // Trigger child component to save their state
                                    className={classes.button}
                                >
                                    Save
                                </Button>
                                <Button
                                    color="default"
                                    onClick={this.props.onCancel}   // Trigger child component to save their state
                                    className={classes.button}
                                >
                                    Cancel
                                </Button>
                            </div>
                            :
                            <div>
                                <Button
                                    color="default"
                                    onClick={this.props.onCancel}   // Trigger child component to save their state
                                    className={classes.button}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={!this.state.newWidgetName || !this.state.newWidgetType}
                                    color="primary"
                                    onClick={this.handleNext}
                                    className={classes.button}
                                >
                                    Next<ArrowRight/>
                                </Button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
export const WidgetStepper = withStyles(stepperStyles)(WidgetStepperComp);