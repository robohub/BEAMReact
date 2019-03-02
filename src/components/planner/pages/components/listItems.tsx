import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Typography, Divider, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

export const getItemBOs = gql`
query itemBOsFromPlanMO($moid: ID!) {
    planConfigs(
      where: {uiMoPlan: {id: $moid}}
    ) {
        id
        uiMoRelations {
            id
            oppositeName
          	bizRelations {
              incomingObject {
                id name plannedIn { planBO { id name }}
              }
            }
            incomingObject {
                id name
            }
        }
  }
}
`;

type MoRelType = {
    name: string
    incomingObject: {
        name: string
    }
    bizRelations: {
        incomingObject: {
            id: string
            name: string
            plannedIn: {
                planBO: {
                    name: string
                }
            }
        }
    }[]
};

interface Props {
    selectedMO: string;
}

export default class ItemListContainer extends React.PureComponent<Props> {  // PureComponent implements shouldComponentUpdate: if props same => no update

/*    handleItemClick = (e: React.MouseEvent) => {
        this.props.selectedBOchange(e.currentTarget.id);
        this.props.selectedInfoBOchange(e.currentTarget.id);
    }
*/

    handleDragStart = (event: React.DragEvent<HTMLElement>,  data: {id: string, name: string}) => {
        event.dataTransfer.effectAllowed = 'move';
        var item = {
            id: data.id,
            type: 'range',
            content: data.name,
            bizobject: true    // To be able to differ to timeline-only objects
/*            start: new Date(),
            end : new Date(1000 * 3600 * 24 * 7 + (new Date()).valueOf())*/
        };
        event.dataTransfer.setData('text', JSON.stringify(item));
    }

    render() {
        return (
            this.props.selectedMO  ? (
                <Query query={getItemBOs} variables={{moid: this.props.selectedMO}}>
                    {({ data, loading, error }) => {
                        if (loading) { return <div>Loading</div>; }
                        if (error) { return <h1>ERROR</h1>; }
                        
                        if (data.planConfigs.length > 0) {
                            return (
                                <div>
                                    <Typography variant="h6">Items</Typography>
                                    <Divider/>
                                    <Table padding="dense">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Item Type</TableCell>
                                                    <TableCell>Planned</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.planConfigs[0].uiMoRelations.map((rel: MoRelType ) =>
                                                    rel.bizRelations.map(o => 
                                                        <TableRow
                                                            key={o.incomingObject.id}
                                                            /* onClick={this.handleItemClick} */
                                                            id={o.incomingObject.id}
                                                            hover={true}
                                                            draggable={true}
                                                            onDragStart={(e) => this.handleDragStart(e, {id: o.incomingObject.id, name: o.incomingObject.name})}
                                                        >
                                                            <TableCell style={{whiteSpace: 'normal', wordWrap: 'break-word'}}>
                                                                <Typography variant="body1">{o.incomingObject.name}</Typography>
                                                            </TableCell>
                                                            <TableCell>{rel.incomingObject.name} </TableCell>
                                                            <TableCell>{o.incomingObject.plannedIn ? o.incomingObject.plannedIn.planBO.name : '-Not planned-'}</TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                    </Table>
                                </div>
                            );
                        } else {
                            return <h1>No items connected to meta object...</h1>;   // TODO RH Correct message?
                        }
                    }}
                </Query>)
                :
                <Typography variant="h6">{this.props.selectedMO ? 'Selected Plan: ' + this.props.selectedMO : 'No Plan selected...'}</Typography>
        );
    }
}
