import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import { FetchResult } from 'react-apollo';

import { client } from '../index';

const getBO = gql`
query($id: ID) {
    businessObject(
        where: {id: $id}
    ) {
        id
        outgoingRelations {
            id
            oppositeObject {
                id
            }
        }
    }
}
`;

const updateBizRels = gql`
mutation updateBoRels($boid: ID, $rels: [BizRelationCreateWithoutIncomingObjectInput!]) {
    updateBusinessObject(
        where: {id: $boid}
        data: {
            outgoingRelations: { create: $rels }
        }
    ) {
        id
        outgoingRelations {
            id
        }
    }
}
`;

const updatePlan = gql`
mutation updatePlan($planId: ID!, $planData: Json, $boId: ID, $itemBOs: [BusinessObjectWhereUniqueInput!]) {
    upsertPlan(
    where: {
        id: $planId
    }
    create: {
		planData: $planData, planBO: {connect: {id: $boId}}, itemBOs: {connect: $itemBOs}
    }
    update: {
		planData: $planData, planBO: {connect: {id: $boId}}, itemBOs: {set: $itemBOs}
    }
    ) {
        id
    }
}
`;

type getBOResponse = {
    id: string
    outgoingRelations: {
        id: string
        oppositeObject: {
            id: string
        }
    }[]
};

type updateBORelsResponse = {
    updateBusinessObject: {
        outgoingRelations: {
            id: string
        }[]
    }
};

/*
type bizRel = {
    id: string
    oppositeObject: {
        id: string
    }
};

function findDeletedBos(source: bizRel[], compare: {id: string}[]): {id: string}[] {
    var deleted = new Array<{id: string}>(0);
    source.forEach(el => {
        let sourceObj = { id: el.oppositeObject.id }; // Remove field bizRelId from object to compare correctly
        if (compare.findIndex(element => {
            let compObj = { metaRelationId: element.metaRelationId, oppositeObjectId: element.oppositeObjectId }; // Remove field bizRelId from object to compare correctly
            return JSON.stringify(sourceObj) === JSON.stringify(compObj); })
        === -1) {
            deleted.push(el);
        }
    });
    return deleted;
}
*/
export function updateBORelations(
    id: string,
    relatedObjs: {id: string, mrid: string}[],
    planId?: string,
    planData?: { items: {}[], groups: {}[] }
) {
    client.query({
        query: getBO,
        variables: {id: id}
    }).then(async (response: ApolloQueryResult<getBOResponse>) => {
        
        // 1. Create new relations
        
        var relations = new Array<{metaRelation: {connect: {id: string}}, oppositeObject: {connect: {id: string}}}>();
        relatedObjs.map((item: {id: string, mrid: string}) => {
            relations.push({metaRelation: {connect: {id: item.mrid}}, oppositeObject: {connect: {id: item.id}}});
        });

        await client.mutate({
            mutation: updateBizRels,
            variables: { 
                boid: id,
                rels: relations
            },
        }).then(async (resp: FetchResult<updateBORelsResponse>) => {
            // tslint:disable-next-line:no-console
            console.log('Respons från update bizrels' + resp.data.updateBusinessObject.outgoingRelations);
        }).catch(e => {
            alert('Error when updating biz relations: ' + e);
        });        

        // 2. Check if planId != null, update plandata if so...
        
        if (planId !== undefined && planId !== null) {
            var itemBOs = new Array<{id: string}>();  // Filter out Id
            relatedObjs.map((item: {id: string}) => {
                itemBOs.push({id: item.id});
            });

            client.mutate({
                mutation: updatePlan,
                // fetchPolicy: 'network-only',
                variables: { 
                    planId: planId,
                    planData: planData,
                    boId: id,
                    itemBOs: itemBOs
                }
            }).catch(e => {
                alert('Error when saving plan: ' + e);
            });        
        }
    }).catch (e =>
        alert('Error in function updateBORelations: ' + e)
    );
}
