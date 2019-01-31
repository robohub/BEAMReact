import * as React from 'react';

import { ChildProps, Query } from 'react-apollo';
import gql from 'graphql-tag';

import BOGraphView from './boGraphView';

const getBO = gql`
query getBO($id: ID) {
    BusinessObject(id: $id)
    {
        id
        name
        outgoingRelations {
            oppositeObject {
                id
                name
                outgoingRelations {
                    oppositeObject {
                        id
                    }
                }
            }
        }
    }
}
`;

interface BoItem {
    id: string;
    name: string;
    outgoingRelations: {
        oppositeObject: {
            id: string;
            name: string;
            outgoingRelations: {
                oppositeObject: {
                    id: string;
                }
            }[]        
        }
    }[];
}

interface Response {
    BusinessObject: BoItem;
}

interface Props {
    selectedBO: string;
    updateInfoView: (id: string) => void;
}

export default class BOGraphContainer extends React.Component<ChildProps<Props, Response>> {

    render() {  
        let id = this.props.selectedBO;
        return (
            <Query query={getBO} variables={{id: id}}>
                {({ data, loading, error }) => {
    
                    if (loading) { return <div>Loading</div>; }
                    
                    if (error) { return <h1>ERROR</h1>; }             
    
                    return (
                        <BOGraphView selectedListBO={data.BusinessObject} selectedBOchange={this.props.updateInfoView}/>
                    );
                }}
            </Query>
        );
    }
}  