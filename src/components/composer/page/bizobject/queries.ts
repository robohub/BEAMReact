import { gql } from 'react-apollo';

export const allBOQuery = gql`
query allBusinessObjects {
    allBusinessObjects {
        id
        name
        state
        metaObject {
            id
            name
        }
        bizAttributes {
            id
            metaAttribute
            {
                id
                name
            }
            value
        }
        outgoingRelations {
            id
            oppositeObject {
                id
                name
            }
            metaRelation {
                id
                multiplicity
                oppositeName
                oppositeRelation {
                    id
                }
            }
        }
    }
}
`;

export const updateBizObject = gql`
mutation updateBO($id: ID!, $name: String) {
    updateBusinessObject(
        id: $id
        name: $name
    )
    {id}
}
`;

export const createBizRelation = gql`
mutation createBizRel($incoming: ID!, $oppositeObj: ID!, $metarelation: ID!) {
    createBizRelation(
        incomingObjectId: $incoming
        oppositeObjectId: $oppositeObj
        metaRelationId: $metarelation
    )
    {id}
}
`;

export const deleteBizObject = gql`
mutation deleteBO($id: ID!) {
    deleteBusinessObject(id: $id) 
    {id}
}
`;

export const deleteBizRelation = gql`
mutation removeBR($bizRelId: ID!)  {
    deleteBizRelation(id: $bizRelId )
    {id}
}
`;

export const deleteBizAttr = gql`
mutation removeBA($bizAttrId: ID!)  {
    deleteBizAttribute(id: $bizAttrId )
    {id}
}
`;

export const updateBizAttribute = gql`
mutation updateBA($id: ID!, $value: String) {
    updateBizAttribute(
        id: $id
        value: $value
    )
    {id}
}
`;
