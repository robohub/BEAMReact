import gql from 'graphql-tag';

export const allMetaObjectsQuery = gql`
query allMetaObjects {
    metaObjects {
        id
        name
        attributes {
            id
            name
            type
        }
        outgoingRelations {
            id
            oppositeName
            oppositeObject {
                id
                name
            }
            oppositeRelation {
                id
            }
            multiplicity
        }
    }
    metaAttributes {
        id
        name
        type
    }
}
`;

export const createMetaObj = gql`
mutation createMO(
    $name: String!,
    $attrs: MetaAttributeCreateManyWithoutObjectsInput,
    $rels: MetaRelationCreateManyWithoutIncomingObjectInput) {
        
        createMetaObject(data: {name: $name, attributes: $attrs, outgoingRelations: $rels}) {
            id
            name
            attributes {
                id
            }
            outgoingRelations {
                id
            }
        }
    }
`;
    
export const updateMOAttributes = gql`
mutation updateMOAttrs($id: ID!, $attrs: [MetaAttributeWhereUniqueInput!]) {
    updateMetaObject(data: {attributes: {set: $attrs}}, where: {id: $id} ) {
        id
    }
}
`;

export const createMRWithoutOppRelation = gql`
mutation createMR(
    $incomingid: ID!, 
    $oppositeId: ID!,
    $oppName: String!,
    $multiplicity: MultiplicityType!) {

        createMetaRelation(data: {
            incomingObject: { connect: { id: $incomingid }},
            oppositeObject: { connect: { id: $oppositeId }},
            oppositeName: $oppName,
            multiplicity: $multiplicity}
        )
            {
                id
            }
    }
`;

export const createMetaRelation = gql`
mutation createMR(
    $incomingid: ID!, 
    $oppositeId: ID!,
    $oppName: String!,
    $multiplicity: MultiplicityType!,
    $opprelid: ID) {

        createMetaRelation(data: {
            incomingObject: { connect: { id: $incomingid }},
            oppositeObject: { connect: { id: $oppositeId }},
            oppositeName: $oppName,
            multiplicity: $multiplicity,
            oppositeRelation: { connect: { id: $opprelid }}}
        )
            {
                id
            }
    }
`;
            
export const deleteMetaRel = gql`
mutation removeMR($mrid: ID!)  {
    deleteMetaRelation(where: {id: $mrid })
    {id}
}
`;

export const findBizObjsWithMetaAttribute = gql`
query bizObjsWithMetaRelation($maid: ID!) {
    businessObjects( where: {
        bizAttributes_some: {
            metaAttribute: {
                id: $maid
            }
        }
    })
    {
        id
    	name
    }
}
`;

export const updateMRWithOppRel = gql`
mutation updateMRWithOppRel($id: ID!, $oppositeId: ID!) {
    updateMetaRelation(data: {oppositeRelation: { connect: {id: $oppositeId}}}, where: {id: $id} ) {
        id
    }
}
`;
