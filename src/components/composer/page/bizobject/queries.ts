import gql from 'graphql-tag';

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
mutation createBizRel($incoming: ID!, $oppositeObj: ID!, $metarelation: ID!, $oppRelId: ID) {
    createBizRelation(
        incomingObjectId: $incoming
        oppositeObjectId: $oppositeObj
        metaRelationId: $metarelation
        oppositeRelationId: $oppRelId
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

export const updateBizRelation = gql`
mutation updateBRel($brid: ID!, $oppBoId: ID, $oppRelId: ID) {
    updateBizRelation(
        id: $brid
        oppositeObjectId: $oppBoId
        oppositeRelationId: $oppRelId
    )
    {id}
}
`;

export const findBizRelation = gql`
query findBRel($metaid: ID!, $oppBoId: ID) {
	allBizRelations(filter: {
        metaRelation: { id: $metaid },
        incomingObject: { id: $oppBoId }}
    )
    {
        id
        oppositeRelation {
            id
        }
    }
}
`;