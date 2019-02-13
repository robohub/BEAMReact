import * as React from 'react';
import { ChildProps, Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Typography, Divider, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

const allBOQuery = gql`
query allBusinessObjects {
    businessObjects {
        id
        name
        metaObject {
            name
        }
    }
}
`;

interface BoItem {
    id: string;
    name: string;
    metaObject: {
        name: string
    };
}

interface Response {
    businessObjects: BoItem[];
}

interface Props {
    selectedListBO: string;
    selectedBOchange: (id: string) => void;
    selectedInfoBOchange: (id: string) => void;
}

export default class BOListContainer extends React.Component<ChildProps<Props, Response>> {

    handleItemClick = (e: React.MouseEvent) => {
        this.props.selectedBOchange(e.currentTarget.id);
        this.props.selectedInfoBOchange(e.currentTarget.id);
    }

    render() {
        return (
            <Query query={allBOQuery}>
                {({ data, loading, error }) => {
                    if (loading) { return <div>Loading</div>; }
                    if (error) { return <h1>ERROR</h1>; }             
                    
                    return (
                        <div>
                            <Divider/>
                            <Table padding="dense">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><Typography variant="h6">Type</Typography></TableCell>
                                            <TableCell><Typography variant="h6">Object Name</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.businessObjects.map((o: BoItem) => 
                                            <TableRow key={o.id} onClick={this.handleItemClick} id={o.id} hover={true} >
                                                <TableCell>{o.metaObject.name} </TableCell>
                                                <TableCell style={{whiteSpace: 'normal', wordWrap: 'break-word'}}>
                                                    <Typography variant="subheading">{o.name}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                            </Table>
                        </div>
                    );
                }}
            </Query>
        );
    }
}
