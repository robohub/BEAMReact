import * as React from 'react';
import { Grid, Paper } from '@material-ui/core';
import ListPlans from './components/listPlans';
import ListItems from './components/listItems';
import TimeLine from './components/timeLine';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { createStyles, Theme } from '@material-ui/core/styles';

export const styles = ({ mixins, spacing }: Theme) => createStyles({
    root: {
        ...mixins.gutters(),
        paddingTop: spacing.unit,
        paddingBottom: spacing.unit,

    },
});

interface State {
    selectedBO: string;
}

interface Props extends WithStyles<typeof styles> {
}

class PlanningView extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = ({selectedBO: null});
    }

    updateSelectedBO = (boId: string) => {
        if (this.state.selectedBO !== boId) {
            this.setState({selectedBO: boId});
        }
    }

    render() {
        const { classes } = this.props;
        
        return (
            <div>
                <Grid container={true} className={classes.root} spacing={8}>
                    <Grid item={true} xs={3}/>
                    <Grid item={true} xs={3}>
                        <Paper className={classes.root}>
                            <ListPlans updateSelectedBO={this.updateSelectedBO}/>
                        </Paper>
                    </Grid>
                </Grid>
                <Grid container={true} className={classes.root} spacing={8}>
                    <Grid item={true} xs={3}>
                        <Paper className={classes.root}>
                            <ListItems/>
                        </Paper>
                    </Grid>                
                    <Grid item={true} xs={9}>
                        <Paper className={classes.root}>
                            <TimeLine selectedBO={this.state.selectedBO}/>
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(PlanningView);