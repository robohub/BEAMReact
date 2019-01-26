import * as React from 'react';
import { ChildProps, Query } from 'react-apollo';
import gql from 'graphql-tag';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Typography, Divider } from '@material-ui/core';

const allBOQuery = gql`
query allBusinessObjects {
    allBusinessObjects {
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
    allBusinessObjects: BoItem[];
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
                            <Typography variant="title">Business Objects</Typography>
                            <Divider/>
                            <List component="nav">
                                {data.allBusinessObjects.map((o: BoItem) => 
                                    <ListItem button={true} key={o.id} onClick={this.handleItemClick} id={o.id}>
                                        <ListItemText primary={o.metaObject.name + ' ' + o.name} />
                                    </ListItem>
                                )}
                            </List>
                        </div>
                    );
                }}
            </Query>
        );
    }
}
