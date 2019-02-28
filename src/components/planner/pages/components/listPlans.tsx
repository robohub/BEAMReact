import * as React from 'react';
import { ChildProps, Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Typography, Divider, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

export const getPlanBOs = gql`
query configuredPlanBos {
    planConfigs {
      id
      uiMoPlan {
        id
        name
        businessObjects {
          id
          name
          plan { id }
        }  
      }
    }
  }
`;

type BoType = {
    id: string
    name: string
    plan: { id: string }
};

interface Props {
    updateSelectedBO: (boId: string) => void;
}

export default class PlanListContainer extends React.Component<ChildProps<Props, Response>> {
    private selectedBO = '';

    handleItemClick = (e: React.MouseEvent) => {
        if (this.selectedBO !== e.currentTarget.id) {
            this.selectedBO = e.currentTarget.id;
            this.props.updateSelectedBO(e.currentTarget.id);
        }
    }

    render() {
        return (
            <Query query={getPlanBOs}>
                {({ data, loading, error }) => {
                    if (loading) { return <div>Loading</div>; }
                    if (error) { return <h1>ERROR</h1>; }             
                    if (data.planConfigs.length > 0) {
                        return (
                            <div>
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
                                            {data.planConfigs[0].uiMoPlan.businessObjects.map((o: BoType) => 
                                                <TableRow key={o.id} onClick={this.handleItemClick} id={o.id} hover={true} >
                                                    <TableCell style={{whiteSpace: 'normal', wordWrap: 'break-word'}}>
                                                        <Typography variant="body1">{o.name}</Typography>
                                                    </TableCell>
                                                    <TableCell>{data.planConfigs[0].uiMoPlan.name} </TableCell>
                                                    <TableCell>{o.plan === null ? 'N' : 'Y'} </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                </Table>
                            </div>
                        );
                    } else {
                        return <h1>Plan is not connected to any meta object...</h1>;
                    }
                }}
            </Query>
        );
    }
}
