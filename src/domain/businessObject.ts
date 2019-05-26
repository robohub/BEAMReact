import gql from 'graphql-tag';

import { client } from '../index';

import { RelatedBOType, RelatedBAType } from './utils/boUtils';
import { removeBusinessObjectsFromCache } from '../utils/apolloExtensions';
import { ExecutionResult, FetchResult } from 'react-apollo';
import { RefetchQueryDescription } from 'apollo-client/core/watchQueryOptions';
import { PureQueryOptions } from 'apollo-client';

export const upsertBO = gql`
mutation upsertBO(
  $boId: ID, 
  $boName: String!, 
  $metaObjectId: ID, 
  $metaAttributes: [RelatedBAInput!],
  $newRels: [RelatedBOInput!],
  $deleteRels: [RelatedBOInput!]
) {
    saveUpdateBusinessObject (
      data: {
        boId: $boId,
        name: $boName,
        moId: $metaObjectId,
        attributes: $metaAttributes,
        newRelations: $newRels,
        deleteRelations: $deleteRels
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
            oppositeRelation {
                id
            }  
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
/*
type getBOResponse = {
    id: string
    name: string
    
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
*/
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

export const updateSaveBO =  async (
    bizObjectId: string,            // If === '' --> create, otherwise update
    boName: string,                 // Create only for now RH TODO
    metaObjectId: string,           // Create
    newAttrs: RelatedBAType[],      // Create and update
    newRels: RelatedBOType[],       // Create and update
    saveFinished: () => void,
    // refetchQueries: ((result: ExecutionResult) => RefetchQueryDescription) | RefetchQueryDescription
    refetchQueries: PureQueryOptions[]
    ) => {
       
    // tslint:disable-next-line:no-console
    console.log('A. Enters updateSaveBO,.....');
       
    await client.mutate({     // RH TODO, check when this should be executed!!!
        mutation: upsertBO,

        variables: {
            boId: bizObjectId,
            boName: boName,
            metaObjectId: metaObjectId,
            metaAttributes: newAttrs,
            newRels: newRels,
            deleteRels: [],               // RH TODO
        },
        update: async (cache, mutationResult ) => {
            if (bizObjectId === '') {
                removeBusinessObjectsFromCache(cache);   // RH TODO Behövs detta om jag gör client.query med 'network-only' på refetch-frågorna?

                // tslint:disable-next-line:no-console
                console.log('BA. Saved BO, clearing cache.....');
            }

            // tslint:disable-next-line:no-console
            console.log('BB. BO sparad och cache fixad.....');
        },
        refetchQueries: refetchQueries,   // --> synkproblem i GUI, null-pointers...?
    });
/*    
    if (refetchQueries) {
        // tslint:disable-next-line:no-any
        let refetchPromises = new Array<Promise<any>>();
        refetchQueries.map(async (q: PureQueryOptions) => {
            if (q.variables) {
                refetchPromises.push(client.query({
                // await client.query({
                    query: q.query,
                    variables: q.variables,
                    fetchPolicy: 'network-only'
                }));
                // tslint:disable-next-line:no-console
                console.log('+++++++ Refetch query: with variables');

            } else {
                refetchPromises.push(client.query({
                // await client.query({
                    query: q.query,
                    fetchPolicy: 'network-only'
                }));
                // tslint:disable-next-line:no-console
                console.log('+++++++ Refetch query');
            }
        });
        await Promise.all(refetchPromises);
    }
    // tslint:disable-next-line:no-console
    console.log('C. Exits updateSaveBO,.....');
*/
    saveFinished();

};

export async function updateBORelations(
    boId: string,
    boName: string,
    relatedObjs: RelatedBOType[],
    saveFinished: () => void,
    refetchQueries: ((result: ExecutionResult) => RefetchQueryDescription) | RefetchQueryDescription,
    planId?: string,
    planData?: { items: {}[], groups: {}[] },
) {
    // updateSaveBO(boId, boName, '', [], relatedObjs, saveFinished, refetchQueries);
    await updateSaveBO(boId, boName, '', [], relatedObjs, saveFinished, []);

    // Check if planId != null, update plandata if so...
  
    if (planId !== undefined && planId !== null) {
        var itemBOs = new Array<{id: string}>();  // Filter out Id
        relatedObjs.map(item => {
            itemBOs.push({id: item.boId});
        });

        let result = await client.mutate({
            mutation: updatePlan,
            variables: { 
                planId: planId,
                planData: planData,
                boId: boId,
                itemBOs: itemBOs
            },
            // update: // Update cache....
            refetchQueries: refetchQueries
        }).catch(e => {
            alert('Error when saving plan: ' + e + '\nWill try again!!!');
            client.mutate({
                mutation: updatePlan,
                variables: { 
                    planId: planId,
                    planData: planData,
                    boId: boId,
                    itemBOs: itemBOs
                },
                // update: // Update cache....
                refetchQueries: refetchQueries
            });
        }) as FetchResult<{upsertPlan: { id: string}}>;
        return result.data.upsertPlan.id;
    }
    return '';
}
