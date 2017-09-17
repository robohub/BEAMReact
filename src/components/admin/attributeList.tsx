import * as React from 'react';
import { gql, graphql } from 'react-apollo';

// import { ListGroup, ListGroupItem } from 'reactstrap';
import { List } from 'semantic-ui-react';

const attrsQuery = gql`
    query  {
        allMetaAttributes {
            id
            name
        }
    }
`;
type BEAMAttr = {
    id: string;
    name: string;
};
type Response = { 
    allMetaAttributes: BEAMAttr[];  // name must match as in query!!!v
};

const AttributeList = graphql<Response>(attrsQuery, {});

export default AttributeList(({ data: { loading, allMetaAttributes, error } }) => { 
    if (loading) {
        return <div>Loading</div>;
    }
    if (error) {
        return <h1>ERROR</h1>;
    } 
    return (
    <div>
        <h3>Available attributes </h3>
        <List>
            {allMetaAttributes.map(obj =>
            <div key={obj.id}>
                <List.Item tag="button" action={true}>
                {obj.name}
                </List.Item>
            </div>
            )}
        </List>
    </div>);
});
