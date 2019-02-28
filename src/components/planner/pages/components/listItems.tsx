import * as React from 'react';
import { ChildProps, Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Typography, Divider, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

export const getItemBOs = gql`
query configuredItemBos {
    planConfigs {
      id
      uiMoItem {
        id
        name
        businessObjects {
          id
          name
        }  
      }
    }
  }
`;

type BoType = {
    id: string
    name: string
};

interface Props {
}

export default class ItemListContainer extends React.Component<ChildProps<Props, Response>> {
/*
    handleItemClick = (e: React.MouseEvent) => {
        this.props.selectedBOchange(e.currentTarget.id);
        this.props.selectedInfoBOchange(e.currentTarget.id);
    }
*/

    handleDragStart = (event: React.DragEvent<HTMLElement>,  data: {id: string, name: string}) => {
        // event.dataTransfer.effectAllowed = 'move';
        var item = {
            id: data.id,
            type: 'range',
            content: data.name,
/*            start: new Date(),
            end : new Date(1000 * 3600 * 24 * 7 + (new Date()).valueOf())*/
        };
        event.dataTransfer.setData('text', JSON.stringify(item));
    }

    render() {
        return (
            <Query query={getItemBOs}>
                {({ data, loading, error }) => {
                    if (loading) { return <div>Loading</div>; }
                    if (error) { return <h1>ERROR</h1>; }             
                    if (data.planConfigs.length > 0 && data.planConfigs[0].uiMoItem.length > 0) {
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
                                            {data.planConfigs[0].uiMoItem[0].businessObjects.map((o: BoType) => 
                                                <TableRow
                                                    key={o.id}
                                                    /* onClick={this.handleItemClick} */
                                                    id={o.id}
                                                    hover={true}
                                                    draggable={true}
                                                    onDragStart={(e) => this.handleDragStart(e, {id: o.id, name: o.name})}
                                                >
                                                    <TableCell style={{whiteSpace: 'normal', wordWrap: 'break-word'}}>
                                                        <Typography variant="body1">{o.name}</Typography>
                                                    </TableCell>
                                                    <TableCell>{data.planConfigs[0].uiMoItem[0].name} </TableCell>
                                                    <TableCell>N</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                </Table>
                            </div>
                        );
                    } else {
                        return <h1>Item is not connected to any meta object...</h1>;
                    }
                }}
            </Query>
        );
    }
}
