import gql from 'graphql-tag';

export const allBOQuery = gql`
query allBusinessObjects {
    businessObjects {
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
            oppositeRelation { id }
        }
    }
}
`;
/*
export const createBizObject = gql`
mutation CreateBO (
    $moid: ID!, 
    $name: String!, 
    $state: String!,
    $attrs: [BizAttributeCreateWithoutBusinessObjectInput!],
    $rels: [BizRelationCreateWithoutIncomingObjectInput!]   
) 
{
    createBusinessObject(data: {
        metaObject: { connect: { id: $moid}},
        name: $name,
        state: $state,
        bizAttributes: {create: $attrs},
        outgoingRelations: { create: $rels}}
    )
    {
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
            oppositeRelation { id }
        }
    }
}
`;
*/

export const upsertBO = gql`
mutation upsertBO(
    $boid: ID,
    $moid: ID,
    $name: String,
    $state: String,
    $attrs: [BizAttributeCreateWithoutBusinessObjectInput!],
    $rels: [BizRelationCreateWithoutIncomingObjectInput!]
  ) {
    upsertBusinessObject(
        where: {id: $boid}
        create: {
            metaObject: { connect: { id: $moid}},
            name: $name,
            state: $state,
            bizAttributes: {create: $attrs},
            outgoingRelations: { create: $rels}
        }
        update: {
            outgoingRelations: { create: $rels },
        }
    ) {
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
            oppositeRelation { id }
        }
    } 
}
`;

export const updateBizObject = gql`
mutation updateBO($id: ID!, $name: String) {
    updateBusinessObject(data: {name: $name}, where: {id: $id})
    {id}
}
`;

export const createBizRelation = gql`
mutation createBizRel($incomingId: ID!, $oppositeObjId: ID!, $metarelationId: ID!, $opprelId: ID!) {
    createBizRelation(data: {
        incomingObject: {connect: { id: $incomingId}}
        oppositeObject: {connect: {id:$oppositeObjId}}
        metaRelation: {connect: {id: $metarelationId}}
        oppositeRelation: {connect: {id: $opprelId}}}
    )
    {id}
}
`;

export const createBRWithoutOpprelation = gql`
mutation createBizRel($incomingId: ID!, $oppositeObjId: ID!, $metarelationId: ID!) {
    createBizRelation(data: {
        incomingObject: {connect: { id: $incomingId}}
        oppositeObject: {connect: {id:$oppositeObjId}}
        metaRelation: {connect: {id: $metarelationId}}}
    )
    {id}
}
`;

export const deleteBizObject = gql`
mutation deleteBO($id: ID!) {
    deleteBusinessObject(where: {id: $id}) 
    {id}
}
`;

export const deleteBizRelation = gql`
mutation removeBR($bizRelId: ID!)  {
    deleteBizRelation(where: {id: $bizRelId} )
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
    updateBizAttribute(data: {value: $value}, where: {id: $id})
    {id}
}
`;

export const updateBizRelation = gql`
mutation updateBRel($brid: ID!, $oppBoId: ID, $oppRelId: ID) {
    updateBizRelation(
      data: 
        { oppositeObject: { connect: {id: $oppBoId}} 
        	oppositeRelation: { connect: {id: $oppRelId}}}
      where:
      	{id: $brid}
    )
    {id}
}
`;

export const findBizRelation = gql`
query findBRel($metaid: ID!, $oppBoId: ID) {
	bizRelations(where: {
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

export const updateBRWithOppRel = gql`
mutation updateBRWithOppRel($id: ID!, $oppRelId: ID!) {
    updateBizRelation(data: {oppositeRelation: { connect: {id: $oppRelId}}}, where: {id: $id} ) {
        id
    }
}
`;