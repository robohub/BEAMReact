import * as React from 'react';

import { Typography, Divider, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

        businessObjects {
import { PlanConfig, BoType } from './types';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from '../../../shared/style';

interface Props extends WithStyles<typeof styles> {
    planConfigs: PlanConfig[];
    updateSelectedBO: (boId: string) => void;
}

class PlanListContainer extends React.PureComponent<Props> {
    private selectedObjId = '';

    handleItemClick = (e: React.MouseEvent) => {
        if (this.selectedObjId !== e.currentTarget.id) {
            this.selectedObjId = e.currentTarget.id;
            this.props.updateSelectedBO(e.currentTarget.id);
        }
    }

    render() {
        const { planConfigs } = this.props;

        if (planConfigs.length > 0) {
            return (
                <div className={this.props.classes.root}>
                    <Typography variant="h6">Plans</Typography>
                    <Divider/>
                    <Table padding="dense">
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
            return <h1>Plan is not connected to any meta object...</h1>;
        }

    }
}

export default withStyles(styles)(PlanListContainer);