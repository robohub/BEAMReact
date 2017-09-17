import * as React from 'react';
import { gql, graphql } from 'react-apollo';
import { List } from 'semantic-ui-react';

// import { ListGroup, ListGroupItem } from 'reactstrap';

/* RH: hur få in id som parameter!?*/
const objectDetailQuery = gql`
    query  {
        MetaObject(id: "cj60j748guxya0161d85kpi5y") {   
            id
            name
            attributes {
                id
                name
            }
        }
    }
`;
type Attribute = {
    id: string;
    name: string;
};
type BEAMObject = {
    id: string;
    name: string;
    attributes: Attribute[];
};

type Response = { 
    MetaObject: BEAMObject;
};

const ObjectsList = graphql<Response>(objectDetailQuery, {});

export default ObjectsList(({ data: { loading, MetaObject, error } }) => { 
    if (loading) {
        return <div>Loading</div>;
    }
    if (error) {
        return <h1>ERROR</h1>;
    } 
    return (
    <div>
        <h3>Choose attributes for object: {MetaObject.name}</h3>
        <List>
            {MetaObject.attributes.map(attr =>
            <div key={attr.id}>
                <List.Item tag="button" action={true}>
                    {attr.name}
                </List.Item>
            </div>
            )}
        </List>
    </div>);
});
