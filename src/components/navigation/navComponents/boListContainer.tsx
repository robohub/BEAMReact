import * as React from 'react';
import { ChildProps, Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Typography, Table, TableHead, TableBody, TableRow, TableCell, TextField } from '@material-ui/core';

import { Search } from '@material-ui/icons';

const searchBOQuery = gql`
query allBOs($moSearchStr: String, $boSearchStr: String){
  businessObjects(
    where: {
      AND: [
          {metaObject: {name_starts_with: $moSearchStr}},
          {name_starts_with: $boSearchStr}
      ]
    }
    orderBy: name_ASC
  ) {
    id
    name
    createdAt
    metaObject {
      id
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
    selectedBOchange?: (id: string) => void;
    selectedInfoBOchange?: (id: string) => void;
}

export default class BOListContainer extends React.Component<ChildProps<Props, Response>> {
    state = {
        searchBOString: '',
        searchMOString: ''
    };

    private selectedBO = '';

    handleItemClick = (id: string) => {
        if (this.selectedBO !== id) {
            this.selectedBO = id;
            if (this.props.selectedInfoBOchange) { this.props.selectedBOchange(id); }
            if (this.props.selectedInfoBOchange) { this.props.selectedInfoBOchange(id); }
        }
    }

    handleMOInput = (val: string) => {
        this.setState({searchMOString: val});
    }

    handleBOInput = (val: string) => {
        this.setState({searchBOString: val});
    }

    onDragStart = (ev: React.DragEvent<HTMLElement>, id: string, name: string) => {
        ev.dataTransfer.setData('id', id);
        ev.dataTransfer.setData('name', name);
        ev.dataTransfer.setData('svg', 'assets/icons/diagram-1.svg');
        var img = new Image();
        img.src = 'assets/icons/diagram-1.svg';
        img.width = 30;
        img.height = 30;

        ev.dataTransfer.setDragImage(img, 15, 15);
    }

    render() {
        return (
            <div>
                <Table padding="dense">
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography variant="h6">Type</Typography></TableCell>
                            <TableCell><Typography variant="h6">Object Name</Typography></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Search/>
                                <TextField
                                    value={this.state.searchMOString}
                                    // className={this.props.classes.textField}
                                    id="search"
                                    onChange={event => this.handleMOInput(event.target.value)}
                                    placeholder={'Search...'}
                                />
                            </TableCell>
                            <TableCell>
                                <Search/>
                                <TextField
                                    value={this.state.searchBOString}
                                    // className={this.props.classes.textField}
                                    id="search"
                                    onChange={event => this.handleBOInput(event.target.value)}
                                    placeholder={'Search...'}
                                />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <Query query={searchBOQuery} variables={{moSearchStr: this.state.searchMOString, boSearchStr: this.state.searchBOString}}>
                        {({ data, loading, error }) => {
                            if (loading) {
                                return <TableRow><TableCell>Loading</TableCell></TableRow>;
                            }
                            if (error) {
                                return <TableRow><TableCell>Error: {error.message}</TableCell></TableRow>;
                            }
                    
                            return (
                                data.businessObjects.length ?
                                    data.businessObjects.map((o: BoItem) => 
                                        <TableRow key={o.id} onClick={e => this.handleItemClick(o.id)} hover={true} >
                                            <TableCell>
                                                <img src="assets/icons/diagram-1.svg" style={{ width: 30, height: 30}}/>
                                                {o.metaObject.name}
                                            </TableCell>
                                            <TableCell
                                                style={{whiteSpace: 'normal', wordWrap: 'break-word'}}
                                                draggable={true}
                                                onDragStart={(e: React.DragEvent<HTMLTableHeaderCellElement>) => this.onDragStart(e, o.id, o.name)}
                                            >
                                                <Typography variant="body1">{o.name}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )
                                    :
                                    <TableRow><TableCell>No Business Objects defined...</TableCell></TableRow>
                            );
                        }}
                        </Query>
                    </TableBody>
                </Table>
            </div>

        );
    }
}
