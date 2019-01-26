import * as React from 'react';
import { ChildProps, Query } from 'react-apollo';
import gql from 'graphql-tag';
import EditBOView from './MUIEditView';
import { MOResponse, BOEditType } from './Types';

const MOQuery = gql`
query MOQuery($id: ID!) {
    MetaObject(id: $id) {
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
            name
            businessObjects {
              id
              name
            }
          }
          multiplicity
        }
    }
    allMetaRelations {
        id
        oppositeName
        oppositeRelation {
            id
            oppositeName
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
                    
                    if (error) { return <h1>ERROR</h1>; }             
                    
                    return (
                        <EditBOView 
                            newObject={this.props.newObject} 
                            metaobject={data as MOResponse} 
                            bizObject={this.props.bizObject}
                        />
                    );
                }}
            </Query>
        );
    }
}
