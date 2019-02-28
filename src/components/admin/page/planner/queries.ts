import gql from 'graphql-tag';

export const getConfigQuery = gql`
query allPlanConfigs {
    planConfigs {
        id
        uiMoPlan {
            id
            name
        }
        uiMoRelations {
            id
            oppositeName
            incomingObject {
                id
                name
            }
        }
    }
    metaObjects {
        id
        name
    }
}
`;

export const getUnmappedMOs = gql`
query unmappedMOs {
    metaObjects(where: { planConfig: null }) {
        id
        name
    }
}
`;

export const getItemRelations = gql`
query getItemRelations($moid: ID!) {
    metaRelations(
        where: {
            AND: [
                {oppositeObject: { id: $moid}},
                {multiplicity: One}
            ]
        }
    ) {
        id
        oppositeName
    		incomingObject {
                id
            name
        }
    }
}
`;

export const updateConfig  = gql`
mutation updatePlanConfig($id: ID, $planId: ID, $itemIds: [MetaRelationWhereUniqueInput!]) {
    upsertPlanConfig(
    where: {
			id: $id
    }
    create: {uiMoPlan: {connect: {id: $planId}}, uiMoRelations: {connect: $itemIds}},
    update: {uiMoPlan: {connect: {id: $planId}}, uiMoRelations: {set: $itemIds}}
  ) {
        id
        uiMoPlan {
            id
            name
        }
        uiMoRelations {
            id
            oppositeName
        }
  }
}
`;