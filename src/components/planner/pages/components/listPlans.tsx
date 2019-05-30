import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { Typography, Divider, Table, TableHead, TableBody, TableRow, TableCell, Button } from '@material-ui/core';

import { PlanConfig, BoType } from './types';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../../shared/style';

interface Props extends WithStyles<typeof styles> {
    planConfigs: PlanConfig[];
    updateSelectedBO: (boId: string) => void;
}

class PlanListContainer extends React.PureComponent<Props> {
    state = {
        gotoPlanConfig: false
    };

    private selectedObjId = '';

    handleItemClick = (e: React.MouseEvent) => {
        if (this.selectedObjId !== e.currentTarget.id) {
            this.selectedObjId = e.currentTarget.id;
            this.props.updateSelectedBO(e.currentTarget.id);
        }
    }

    render() {
        const { planConfigs } = this.props;

        // tslint:disable-next-line:no-console
        console.log('LISTPLANS rendererar...');

        if (planConfigs.length > 0) {
            return (
                <div className={this.props.classes.root}>
                    <Typography variant="h6">Plans</Typography>
                    <Divider/>
                    <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Item Type</TableCell>
                                    <TableCell>Plan</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {planConfigs.map((plan: PlanConfig) => 
                                    plan.uiMoPlan.businessObjects.map((o: BoType) => 
                                        <TableRow key={o.id} onClick={this.handleItemClick} id={o.id} hover={true} >
                                            <TableCell style={{whiteSpace: 'normal', wordWrap: 'break-word'}}>
                                                <Typography variant="body1">{o.name}</Typography>
                                            </TableCell>
                                            <TableCell>{plan.uiMoPlan.name} </TableCell>
                                            <TableCell>{o.plan === null ? 'N' : 'Y'} </TableCell>
                                        </TableRow>
                                    )
                                )}

                            </TableBody>
                    </Table>
                </div>
            );
        } else {
            return (
                this.state.gotoPlanConfig ?
                    <Redirect to="/PlannerAdmin" />
                    :
                    (
                        <div>
                            <Typography variant="h5" className={this.props.classes.button}>No Plan configurations exists...</Typography>
                            <Button variant={'contained'} color={'primary'} className={this.props.classes.button} onClick={e => this.setState({gotoPlanConfig: true})}>  {/* TODO RH */}
                                Click here to define!
                            </Button>
                        </div>
                    )
            );
        }

    }
}

export default withStyles(styles)(PlanListContainer);