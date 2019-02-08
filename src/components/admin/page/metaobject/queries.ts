import gql from 'graphql-tag';

export const allMetaObjectsQuery = gql`
query allMetaObjects {
    allMetaObjects {
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
    allMetaAttributes {
        id
        name
        type
    }
}
`;

export const createMetaObj = gql`
mutation createMO(
    $name: String!,
    $attrs: [MetaObjectattributesMetaAttribute!],
    $rels: [MetaObjectoutgoingRelationsMetaRelation!]) {
        
        createMetaObject(name: $name, attributes: $attrs, outgoingRelations: $rels) {
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
mutation updateMOAttrs($id: ID!, $attrs: [ID!]) {
    updateMetaObject(id: $id, attributesIds: $attrs) {
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

        createMetaRelation(
            incomingObjectId: $incomingid
            oppositeObjectId: $oppositeId,
            oppositeName: $oppName,
            multiplicity: $multiplicity,
            oppositeRelationId: $opprelid)
            {
                id
            }
    }
`;
            
export const deleteMetaRel = gql`
mutation removeMR($mrid: ID!)  {
    deleteMetaRelation(id: $mrid )
    {id}
}
`;

export const findBizObjsWithMetaRelation = gql`
query bizObjsWithMetaRelation($maid: ID!) {
    allBusinessObjects( filter: {
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

            /*
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
            */