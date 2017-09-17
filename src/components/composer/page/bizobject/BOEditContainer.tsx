import * as React from 'react';
import { gql, graphql, ChildProps } from 'react-apollo';
import EditBOView from './BOEditView';
import { MOResponse, BOEditType } from './../Types';

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
}
`;

type InputProps = {
    newObject: boolean;
    metaID: string;
    bizObject?: BOEditType;
};

class BOEditView extends React.Component<ChildProps<InputProps, MOResponse>> {

    render() {
        const { loading } = this.props.data;

        if (loading) { return <div>Loading</div>; }
       
        return (
            <EditBOView 
                newObject={this.props.newObject} /*metaID={this.props.metaID}*/ 
                metaobject={this.props.data} 
                bizObject={this.props.bizObject}
            />
        );
    }
}

export default graphql<MOResponse, InputProps>(MOQuery, {
    options: (props) => ({variables: { id: props.metaID } })})(BOEditView);
