import * as React from 'react';
import { Query } from 'react-apollo';

import { Typography, Divider, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';
import { getItemBOs } from './queries';
/*
type MoRelType = {
    id: string;
    oppositeName: string

    bizRelations: {
        oppositeObject: {
            id: string
            name: string
            plannedIn: {
                planBO: {
                    name: string
                }
            }
        }
        incomingObject: { name: string }
    }[]
};
*/

type MoRelType = {
    id: string
    oppositeName: string

    oppositeObject: {
        // id: string
        // name: string
        businessObjects: {
          id: string
          name: string
          plannedIn: {
            id: string
            planBO: {
                id: string
                name: string
              }
          }
        }[]
    }
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

    handleDragStart = (event: React.DragEvent<HTMLElement>,  data: {id: string, name: string, mrid: string}) => {
        event.dataTransfer.effectAllowed = 'move';
        var item = {
            id: data.id,
            type: 'range',
            content: data.name,
            bizobject: true,    // To be able to differ to timeline-only objects
            mrid: data.mrid
/*            start: new Date(),
            end : new Date(1000 * 3600 * 24 * 7 + (new Date()).valueOf())*/
        };
        event.dataTransfer.setData('text', JSON.stringify(item));
    }

    render() {
        // tslint:disable-next-line:no-console
        console.log('LISTITEMS rendererar...');

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
                                                    <TableCell>Relation</TableCell>
                                                    <TableCell>Connected</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.planConfigs[0].uiMoRelations.map((rel: MoRelType ) =>
                                                    rel.oppositeObject.businessObjects.map(o =>
                                                        <TableRow
                                                            key={o.id}
                                                            /* onClick={this.handleItemClick} */
                                                            // id={o.oppositeObject.id}
                                                            hover={true}
                                                            draggable={true}
                                                            onDragStart={
                                                                (e) => this.handleDragStart(
                                                                    e,
                                                                    {
                                                                        id: o.id,
                                                                        name: o.name,
                                                                        mrid: rel.id
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            <TableCell style={{whiteSpace: 'normal', wordWrap: 'break-word'}}>
                                                                <Typography variant="body1">{o.name}</Typography>
                                                            </TableCell>
                                                            <TableCell>{rel.oppositeName} </TableCell>
                                                            <TableCell>{o.plannedIn ? o.plannedIn.planBO.name : '-Not planned-'}</TableCell>
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
