import * as React from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Typography } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import { Widget } from './types';

const getWidgetsQuery = gql`
query getWidgets {
  widgets {
    id
    type
    name
  }
}
`;

interface Props {
    isCreating: boolean;
}

type State = {
    isEditing: boolean;
    editingWidget: Widget;
};

export class WidgetList extends React.Component<Props, State> {
    state = {
        editingWidget: {id: '', type: '', name: '', model: '', boid: ''},
        isEditing: false
    };

    deleteWidget = (id: string) => {
        // tslint:disable-next-line:no-console
        console.log(id);  // RH TO BE IMPLEMENTED
    }

    editWidget = (id: string, type: string) => {
        this.setState({isEditing: true, editingWidget: {id: id, type: type}});
    }

    render() {
        // tslint:disable-next-line:no-console
        console.log('-- RENDER WidgetList ----');

        return (
            <Table style={{tableLayout: 'fixed'}}>
            <TableHead>
                <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <Query query={getWidgetsQuery}>
                {({ loading, data, error}) => {
                    if (loading) {
                        return <TableRow><TableCell>Loading</TableCell></TableRow>;
                    }
                    if (error) {
                        return <TableRow><TableCell>Error: {error.message}</TableCell></TableRow>;
                    }
                    // tslint:disable-next-line:no-console
                    console.log('-- WidgetList QUERY ---');

                    let widgets = data.widgets as {id: string, type: string, name: string}[];

                    return (
                        widgets.length ?
                            widgets.map(widget =>
                                <div  key={widget.id}>
                                    <TableRow>
                                        <TableCell>
                                            <Button onClick={() => this.deleteWidget(widget.id)} color={'secondary'}><Delete/></Button>
                                            <Button onClick={() => this.editWidget(widget.id, widget.type)} color={'primary'} disabled={this.state.isEditing || this.props.isCreating}><Edit/></Button>
                                        </TableCell>
                                        <TableCell><Typography variant="subtitle2">{widget.type}</Typography></TableCell>
                                        <TableCell>
                                            {widget.name}
                                        </TableCell>
                                    </TableRow>
                                </div>                                
                            )
                            :
                            <TableRow>
                                <TableCell>
                                    No widgets defined...
                                </TableCell>
                            </TableRow>
                    );
                }}
                </Query>
            </TableBody>
            </Table>
        );
    }
}