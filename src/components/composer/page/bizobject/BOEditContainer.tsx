import * as React from 'react';
import { ChildProps, Query } from 'react-apollo';
import gql from 'graphql-tag';
import EditBOView from './BOEditView';
import { MOResponse, BOEditType, AllMRResponse } from './Types';

const MOQuery = gql`
query MOQuery($id: ID!) {
    metaObject(where: {id: $id}) {
        id
        name
        attributes {
          id
          name
        }
    	outgoingRelations {
          id
          oppositeName
          oppositeObject {
            id
            name
            businessObjects {
              id
              name
            }
          }
          multiplicity
        }
    }
    metaRelations {
        id
        oppositeName
        oppositeRelation {
            id
            oppositeName
            multiplicity
        }
    }
}
`;

type InputProps = {
    newObject: boolean;
    metaID: string;
    bizObject?: BOEditType;
};

export default class BOEditView extends React.Component<ChildProps<InputProps, MOResponse>> {

    render() {
        let id = this.props.metaID;
        return (
            <Query query={MOQuery} variables={{ id: id}}>
                {({ data, loading, error }) => {
    
                    if (loading) { return <div>Loading</div>; }
                    
                    if (error) { return <div>ERROR: {error.message}</div>; }             
                    
                    return (
                        <EditBOView 
                            newObject={this.props.newObject} 
                            metaobject={data as MOResponse} 
                            bizObject={this.props.bizObject}
                            allMetaRels={data as AllMRResponse}
                        />
                    );
                }}
            </Query>
        );
    }
}
