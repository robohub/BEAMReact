import * as React from 'react';
import { gql, graphql } from 'react-apollo';

// import { ListGroup, ListGroupItem } from 'reactstrap';
import { List } from 'semantic-ui-react';

const objectsQuery = gql`
    query  {
        allMetaObjects {
            id
            name
        }
    }
`;
type BEAMObject = {
    id: string;
    name: string;
};
type Response = { 
    allMetaObjects: BEAMObject[];  // name must match as in query!!!v
};

const ObjectsList = graphql<Response>(objectsQuery, {});

export default ObjectsList(({ data: { loading, allMetaObjects, error } }) => { 
    if (loading) {
        return <div>Loading</div>;
    }
    if (error) {
        return <h1>ERROR</h1>;
    } 
    return (
    <div>
        <h3>Edit object </h3>
        <List>
            {allMetaObjects.map(obj =>
            <div key={obj.id}>
                <List.Item tag="button" action={true}>
                {obj.name}
                </List.Item>
            </div>
            )}
        </List>
    </div>);
});
